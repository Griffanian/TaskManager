import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

export default function TaskManager({ props }) {
    const [taskInput, setTaskInput] = useState('')
    const [taskList, setTaskList] = useState([])

    let { listname } = useParams()

    useEffect(() => {
        const listNameUrl = new URL(`list/${listname}`, 'http://localhost:8080')

        fetch(listNameUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",

        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setTaskList(data.tasks)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                console.log("server is down!!")
            });
    }, [])

    function addTask() {
        if (taskInput.length > 0) {
            const newTaskList = [...taskList, taskInput]
            setTaskInput('')
            setTaskList(newTaskList)
        } else {
            alert("Tasks cannot be empty")
        }
    }

    function handleInputKeydown(event) {
        if (event.key === "Enter") {
            addTask()
        }
    }

    function removeTask(task) {
        const newTaskList = taskList.filter(item => item !== task)
        setTaskList(newTaskList)
    }



    function saveList() {
        const listUrl = new URL('lists/', 'http://localhost:8080')

        fetch(listUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": listname,
                "userid": props.userid,
                "tasklist": taskList,
            }),
            credentials: "include",

        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    // setLogInResult(data.message)
                    setTimeout(() => { //waits 2 seconds before sending back to home page
                        // navigate("/")
                        // window.location.reload();
                    }, 2000);
                } else {
                    // setLogInResult(data.error)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                console.log("server is down!!")
            });
    }
    return (
        <>
            <div className='taskInputBox'>
                <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={handleInputKeydown}></input>
                <button onClick={() => addTask()}>+</button>
            </div>
            <div className="currentTasks">
                {
                    taskList.map(item => {
                        return (
                            <div onClick={() => removeTask(item.taskname)} key={item.taskname}>{item.taskname}</div>
                        )
                    })
                }
            </div>
            <button onClick={() => saveList()}>Save list</button>
        </>
    )
}