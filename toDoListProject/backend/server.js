const express = require('express')
const app = express()
const cors = require('cors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const dotoenv = require('dotenv')
dotoenv.config()
const { sign, verify } = require('jsonwebtoken')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // <= Accept credentials (cookies) sent by the client
}))

app.listen(8080, (err) => {
    console.log('server listening on 8080')
})

let db = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: '1234',
        database: 'taskManager'
    }
});
function getCredentials(accessToken) {
    return new Promise(async (resolve, reject) => {
        verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject({
                    ok: false,
                    'error': 'JWT failed verification'
                })
            } else {
                resolve({
                    ok: true,
                    'userid': decoded.userid,
                    'email': decoded.email,
                })
            }
        });
    })
}

async function authenticateToken(req, res, next) {
    const accessToken = req.cookies['access-token']
    try {
        const credentials = await getCredentials(accessToken)
        if (credentials.ok) {
            next()
        } else {
            res.status(401).send(credentials)
        }
    } catch (e) {
        res.status(401).send({
            'ok': false,
            'message': 'User not authenticated'
        })
    }
}

app.post('/signup', async (req, res) => {
    const users = await db.select('*').from('users').where('email', req.body.email); // check if email is already in use
    const newBody = JSON.parse(JSON.stringify(req.body))
    if (!users.length > 0) {
        bcrypt.hash(newBody.password, 10, async function (err, hash) { //hashs password with 10 salt rounds
            newBody.password = hash
            await db('users').insert(newBody)
            if (err) {
                res.status(400).send({
                    'ok': false,
                    'message': 'Failed to add User'
                })
            }
            else {
                res.status(201).send({ //201 means successfully created
                    'ok': true,
                    'message': 'User successfully signed up'
                })
            }
        })
    } else {
        res.status(409).send({//409 means conflict with current state of server
            'ok': true,
            'message': 'Email is already associated with an account'
        })
    }
})

app.post('/login', async (req, res) => {
    const users = await db.select('*').from('users').where('email', req.body.email); // check if email is in the database
    if (users.length > 0) {
        bcrypt.compare(req.body.password, users[0].password, async function (error, responce) {
            if (error) {
                res.status(400).send({
                    'ok': false,
                    'error': err.message
                })
            }

            else if (responce) {
                const payload = {
                    "email": users[0].email,
                    "userid": users[0].userid
                }
                const acessToken = sign(payload, process.env.JWT_SECRET)
                res.cookie('access-token', acessToken, {
                    maxAge: 60 * 60 * 24 * 7 * 1000,
                    sameSite: false,
                })
                res.status(200).send({
                    'ok': true,
                    'message': 'User successfully logged in'
                });
            }
            else {
                return res.send({
                    'ok': false,
                    'error': 'Passwords do not match'
                });
            }
        }
        )
    } else {
        return res.status(401).send({
            'ok': false,
            'error': 'User not Found'
        });
    }
})

app.get('/validate', async function (req, res) {
    const credentials = await getCredentials(req.cookies['access-token'])
    if (credentials.ok) {
        res.status(200).send(credentials)
    } else {
        res.status(401).send(credentials)
    }

})
app.get('/lists', authenticateToken, async function (req, res) {
    const credentials = await getCredentials(req.cookies['access-token'])
    const lists = await db
        .select('listname')
        .from('lists')
        .where({ 'userid': credentials.userid })

    return res.status(200).send({
        ok: true,
        'lists': lists.map(function (obj) {
            return obj.listname
        })
    })
})

app.post('/lists', authenticateToken, async function (req, res) {
    const credentials = await getCredentials(req.cookies['access-token'])

    try {
        //   Check if the list name is already in use
        const curList = await db
            .select('*')
            .from('lists')
            .where({ listname: req.body.name })
            .andWhere({ userid: credentials.userid })

        if (curList.length > 0) {
            return res.status(400).send({
                ok: false,
                message: 'List name is already in use.',
            });
        }

        //   Start a transaction
        await db.transaction(async (trx) => {
            // Insert the new list
            const listId = await trx('lists').insert({
                listname: req.body.name,
                userid: credentials.userid,
                createdat: new Date().toISOString().slice(0, 19),
            }).returning('listid')

            // Prepare task data
            const tasksList = req.body.tasklist.map((item) => {
                return {
                    taskname: item,
                    listid: listId[0].listid, // Note: listId is an array, we take the first element
                };
            });

            // Insert tasks
            await trx('tasks').insert(tasksList);
        });

        res.status(200).send({
            ok: true,
            message: 'List and tasks added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            ok: false,
            message: 'An error occurred while adding the list and tasks.',
        });
    }

});

app.get('/list/:name', authenticateToken, async function (req, res) {

    const credentials = await getCredentials(req.cookies['access-token'])

    await db.transaction(async (trx) => {
        const existingList = await trx
            .select('taskid', 'taskname')
            .from('lists')
            .where({ listname: req.params.name })
            .andWhere({ userid: credentials.userid })

        if (existingList.length < 0) {
            return res.status(400).send({
                ok: false,
                message: 'List name does not exist.',
            })
        }
        const tasks = await trx
            .select('*')
            .from('tasks')
            .where({ "listid": existingList[0].listid })
        return res.status(200).send({
            ok: true,
            'tasks': tasks,
        });
    });
})
app.delete('/task/:id', authenticateToken, async (req, res) => {
    const credentials = await getCredentials(req.cookies['access-token'])

})


