import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";

import ConsultReservation from "@components/employee/consult/ConsultReservation";
import ConsultManage from "@components/employee/consult/ConsultManage";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";

export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            
            {/* 상담 */}
            <Route path="/employee/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />
            <Route path="/employee/consult/manage" element={<Employee><ConsultManage /></Employee>} />

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}