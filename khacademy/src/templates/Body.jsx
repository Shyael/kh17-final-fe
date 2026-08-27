import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";

import AcademyManage from "@components/employee/academy/AcademyManage";
import TutorManage from "@components/employee/tutor/TutorManage";
import TutorList from "@components/employee/tutor/TutorList";

import AcademyInfo from "@components/academy/AcademyInfo";
import AcademyTutorList from "@components/academy/AcademyTutorList";
import AcademyTutorDetail from "@components/academy/AcademyTutorDetail";

export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />

            {/* 외부화면 정보 관리(직원 로그인 완료 되면 employee 추가해야함) */}
            <Route path="/employee/academy" element={<AcademyManage/>}/>
            <Route path="/employee/tutor" element={<TutorList/>} />
            <Route path="/employee/tutor/add" element={<TutorManage />} />
            <Route path="/employee/tutor/:tutorNo" element={<TutorManage />} />

            {/* 비로그인 학원정보 */}
            <Route path="/academy" element={<AcademyInfo />} />
            <Route path="/academy/tutor" element={<AcademyTutorList />} />
            <Route path="/academy/tutor/:tutorNo" element={<AcademyTutorDetail />} />

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}