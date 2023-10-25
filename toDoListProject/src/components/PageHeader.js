import { Link } from 'react-router-dom';
import { useEffect } from "react"

export default function PageHeader({ props, setter }) {

    function logout() {
        document.cookie = 'access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        setter({})
    }

    function isEmpty(obj) {
        if (obj) {
            return Object.keys(obj).length === 0;
        } else {
            return false;
        }

    }

    useEffect(() => {
        if (document.cookie.includes('access-token')) {
            const validateUrl = new URL('/validate', 'http://localhost:8080')

            fetch(validateUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            })
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setter({
                            'userid': data.userid,
                            'email': data.email,
                        })
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    console.log("server is down!!")
                });
        }
    }, [])



    return (
        <header>
            <div>
                <Link to="/"><h2>The Worlds Greatest Task Manager</h2></Link>
                <nav style={{ "display": isEmpty(props.userInfo) ? "" : "none" }} className="userHandler">
                    <Link to='/login' >Login</Link>
                    <Link to='/signup'>Sign Up</Link>
                </nav>
                <div style={{ "display": isEmpty(props.userInfo) ? "none" : "" }} className='userDash'>
                    <p>{props.email}</p>
                    <button onClick={() => logout()}>logout</button>
                </div>
            </div>
        </header>
    );
}
