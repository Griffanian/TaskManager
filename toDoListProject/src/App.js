import PageHeader from "./components/PageHeader";
import TaskManager from "./components/TaskManger";
import SignUp from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import './App.scss';

function App() {

  const [userInfo, setUserInfo] = useState({})

  return (
    <div className="App">
      <PageHeader props={userInfo} setter={setUserInfo} />
      <div className='mainBody'>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/lists/:listname" element={<TaskManager props={userInfo} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
