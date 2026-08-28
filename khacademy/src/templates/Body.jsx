import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";
import StudentList from "@components/student/StudentList";
import StudentDetail from "@components/student/StudentDetail";

export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />

            {/* 학생 */}
            <Route path="/student/list" element={<Employee><StudentList/></Employee>} />
            <Route path="/student/detail" element={<Employee><StudentDetail/></Employee>} />

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}