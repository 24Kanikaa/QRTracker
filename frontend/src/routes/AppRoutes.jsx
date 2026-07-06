import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/admin/Dashboard";

import Students from "../pages/admin/Students";

import Desks from "../pages/admin/Desks";

import Settings from "../pages/admin/Settings";

import Home from "../pages/student/Home";

import Journey from "../pages/student/Journey";

import Success from "../pages/student/Success";

function AppRoutes(){

    return(

        <Routes>

            <Route path="/" element={<Login/>}/>

            <Route path="/admin" element={<Dashboard/>}/>

            <Route path="/admin/students" element={<Students/>}/>

            <Route path="/admin/desks" element={<Desks/>}/>

            <Route path="/admin/settings" element={<Settings/>}/>

            <Route path="/student" element={<Home/>}/>

            <Route path="/journey" element={<Journey/>}/>

            <Route path="/completed" element={<Success/>}/>

        </Routes>

    );

}

export default AppRoutes;