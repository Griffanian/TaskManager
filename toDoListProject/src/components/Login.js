import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [loginResult, setLogInResult] = useState('')

    const navigate = useNavigate();

    function handleSubmit(event){
        event.preventDefault()
        const logInUrl = new URL('/login','http://localhost:8080')

        fetch(logInUrl,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                "email":email.toLowerCase(),
                "password":password,
            }),
            credentials:"include",
            
        })
        .then(res=>res.json())
        .then(data=>{
            if (data.ok) {
                setLogInResult(data.message)
                setTimeout(() => { //waits 2 seconds before sending back to home page
                    navigate("/")
                    window.location.reload();
                }, 2000);
            } else {
                setLogInResult(data.error)
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            console.log("server is down!!")   
            });
    }

    return(
        <div className="userInfoContainer">
            <div className="userInfoHeader">
                <h1>Log in</h1>
            </div>
            <form className="userInfoForm" onSubmit={(e)=>handleSubmit(e)}>
                <label>Email</label>
                <input type="text" name="email" placeholder='Email' required
                autoComplete="email" onChange={(e) => setEmail(e.target.value)}/>
                <label>Password</label>
                <input type="password" name="password" placeholder="Password" required 
                autoComplete="current-password" onChange={(e) => setPassword(e.target.value)}/>
                <p>{loginResult}</p>
                <input type="submit" disabled={email === '' || password === ''} value='Submit' name="submit"></input>
            </form>
            
        </div>
    )
}