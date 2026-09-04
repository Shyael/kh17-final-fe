import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";
import EmployeeRegister from "@components/employee/EmployeeRegister";
import EmployeeRegisterSuccess from "@components/employee/EmployeeRegisterSuccess";
import EmployeeRegisterFail from "@components/employee/EmployeeRegisterFail";
import EmployeePassword from "@components/employee/EmployeePassword";

import MemberJoin from "@components/member/MemberJoin";
import MemberJoinSuccess from "@components/member/MemberJoinSuccess";
import MemberJoinFail from "@components/member/MemberJoinFail";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";
import StudentList from "@components/student/StudentList";
import StudentDetail from "@components/student/StudentDetail";
import PaymentList from "@components/payment/PaymentList";
import DiscountList from "@components/payment/DiscountList";
import PaymentDetail from '@components/payment/PaymentDetail';

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
            
            {/* 회원 가입(학생, 학부모) */}
            <Route path="/member/join" element={<MemberJoin/>}/>
            <Route path="/member/joinSuccess" element={<MemberJoinSuccess/>}/>
            <Route path="/member/joinFail" element={<MemberJoinFail/>}/>
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />

            {/* 학생 */}
            <Route path="/student/list" element={<Employee><StudentList/></Employee>} />
            <Route path="/student/detail/:studentNo" element={<Employee><StudentDetail/></Employee>} />

            {/* 수납 */}
            <Route path="/payment/list" element={<Employee><PaymentList/></Employee>} />
            <Route path="/payment/discount" element={<Employee><DiscountList/></Employee>} />
            <Route path="/payment/detail/:paymentNo" element={<Employee><PaymentDetail /></Employee>} />


            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}