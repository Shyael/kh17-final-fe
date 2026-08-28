import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";
import EmployeeRegister from "@components/employee/EmployeeRegister";
import EmployeeRegisterSuccess from "@components/employee/EmployeeRegisterSuccess";
import EmployeeRegisterFail from "@components/employee/EmployeeRegisterFail";
import EmployeePassword from "@components/employee/EmployeePassword";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";

export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            {/* 직원 등록(원장, 데스크) */}
            <Route path="/employee/register" element={<EmployeeRegister/>}/>
            <Route path="/employee/registerSuccess" element={<EmployeeRegisterSuccess/>}/>
            <Route path="/employee/registerFail" element={<EmployeeRegisterFail/>}/>
            <Route path="/employee/password" element={<EmployeePassword/>}/>
            
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />


            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}