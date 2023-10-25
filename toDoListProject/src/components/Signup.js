import { useState,useEffect } from "react"

import { useNavigate } from "react-router-dom"

export default function SignUp(){
    const [email,setEmail] = useState('')
    const [emailResult,setEmailResult] = useState('')
    const [password,setPassword] = useState('')
    const [passwordChecks,setPasswordChecks] = useState({
        "lowercase": false,
        "uppercase": false,
        "number": false,
        "8char": false
    })
    const [signUpResult,setSignUpResult] = useState('')

    const navigate = useNavigate();
   
    useEffect(()=>{
        passwordChecker()
    },[password])

    useEffect(()=>{
        if (signUpResult === 'User successfully signed up'){
            
        }
    },[signUpResult])

    function passwordChecker(){
        setPasswordChecks({
            "containsText":password?true:false,
            "lowercase": /[a-z]/.test(password)?true:false,
            "uppercase": /[A-Z]/.test(password)?true:false,
            "number": /[0-9]/.test(password)?true:false,
            "length":password.length >= 8?true:false})
    }

    function handleSubmit(event){
        event.preventDefault()
        const newEmailValidity = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) //test if email matches the form __@__.__
        if (!newEmailValidity){
            setEmailResult('Please enter a valid email')
        } else{
            setEmailResult('')
            const signUpUrl = new URL('/signup','http://localhost:8080')
            fetch(signUpUrl,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    "email":email.toLocaleLowerCase(),
                    "password":password,
                    "date_joined": new Date().toISOString().slice(0,10)
                })
            })
            .then(res=>res.json())
            .then(data=>{
                if (data.ok) {
                    setSignUpResult(data.message)

                    setTimeout(() => { //waits 2 seconds before sending back to home page
                        navigate("/")
                    }, 2000);
                }else{
                    setSignUpResult(data.error)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                console.log("server is down!!")   
              });
        }
    }

    return(
        <div className="userInfoContainer">
            <div className="userInfoHeader">
                <h1>Sign Up</h1>
                <p>It's quick and easy.</p>
            </div>
            <form className="userInfoForm" onSubmit={(e)=>handleSubmit(e)}>
                <label>Email<input type="text" name="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}/></label>
                <p className="emailResult">{emailResult}</p>
                <label>Password<input type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/></label>
                <div style={{'display':!Object.values(passwordChecks).includes(false)?"none":""}}  className="message">
                    <h3>Password must contain the following:</h3>
                    <p className={passwordChecks.lowercase?"valid":"invalid" }>A <b>lowercase</b> letter</p>
                    <p className={passwordChecks.uppercase?"valid":"invalid"}>A <b>capital (uppercase)</b> letter</p>
                    <p className={passwordChecks.number?"valid":"invalid"}>A <b>number</b></p>
                    <p className={passwordChecks.length?"valid":"invalid"}>Minimum <b>8 characters</b></p>
                </div>
                <p className="userInfoResult">{signUpResult}</p>
            <input type="submit" disabled={Object.values(passwordChecks).includes(false)}  value='Submit' name="submit"></input>
            </form>
        </div>
    )
}