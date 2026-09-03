import { Route, Routes } from "react-router-dom";

import EmployeeHome from "@components/EmployeeHome";
import MemberHome from "@components/MemberHome";

import EmployeeLogin from "@components/employee/EmployeeLogin";
import EmployeeRegister from "@components/employee/EmployeeRegister";
import EmployeeRegisterSuccess from "@components/employee/EmployeeRegisterSuccess";
import EmployeeRegisterFail from "@components/employee/EmployeeRegisterFail";
import EmployeePassword from "@components/employee/EmployeePassword";

import MemberJoin from "@components/member/MemberJoin";
import MemberJoinSuccess from "@components/member/MemberJoinSuccess";
import MemberJoinFail from "@components/member/MemberJoinFail";

import ConsultReservation from "@components/employee/consult/ConsultReservation";
import ConsultManage from "@components/employee/consult/ConsultManage";
import ConsultChat from "@components/employee/consult/ConsultChat";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";
import Member from "@guard/Member";

import AcademyManage from "@components/employee/academy/AcademyManage";
import TutorManage from "@components/employee/tutor/TutorManage";
import TutorList from "@components/employee/tutor/TutorList";

import AcademyInfo from "@components/academy/AcademyInfo";
import AcademyTutorList from "@components/academy/AcademyTutorList";
import AcademyTutorDetail from "@components/academy/AcademyTutorDetail";

import AssignmentList from "@components/assignment/AssignmentList";
import AssignmentManage from "@components/assignment/AssignmentManage";
import AssignmentDetail from "@components/assignment/AssignmentDetail";

import StudentAssignmentList from "@components/student/assignment/StudentAssignmentList";
import StudentAssignmentDetail from "@components/student/assignment/StudentAssignmentDetail";
import StudentAssignmentManage from "@components/student/assignment/StudentAssignmentManage";
import ParentAssignmentDetail from "@components/student/assignment/ParentAssignmentDetail";


export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />
            
            {/* 직원 등록(원장, 데스크) */}
            <Route path="/employee/register" element={<EmployeeRegister/>}/>
            <Route path="/employee/registerSuccess" element={<EmployeeRegisterSuccess/>}/>
            <Route path="/employee/registerFail" element={<EmployeeRegisterFail/>}/>
            <Route path="/employee/password" element={<EmployeePassword/>}/>
            
            {/* 회원 가입(학생, 학부모) */}
            <Route path="/member/join" element={<MemberJoin/>}/>
            <Route path="/member/joinSuccess" element={<MemberJoinSuccess/>}/>
            <Route path="/member/joinFail" element={<MemberJoinFail/>}/>

            {/* 직원 홈페이지(대시보드) */}
            <Route path="/employeeHome" element={<Employee><EmployeeHome/></Employee>} />

            {/* 멤버 홈페이지(대시보드) */}
            <Route path="/" element={<Member><MemberHome/></Member>} />

            {/* 상담 */}
            <Route path="/employee/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />
            <Route path="/employee/consult/manage" element={<Employee><ConsultManage /></Employee>} />
            <Route path="/employee/consult/chat" element={<Employee><ConsultChat/></Employee>} />

            {/* 외부화면 정보 관리(직원 로그인 완료 되면 employee 추가해야함) */}
            <Route path="/employee/academy" element={<AcademyManage/>}/>
            <Route path="/employee/tutor" element={<TutorList/>} />
            <Route path="/employee/tutor/add" element={<TutorManage />} />
            <Route path="/employee/tutor/:tutorNo" element={<TutorManage />} />

            {/* 과제(관리) */}
            <Route path="/employee/assignment" element={<AssignmentList />} />
            <Route path="/employee/assignment/add" element={<AssignmentManage />} />
            <Route path="/employee/assignment/:assignmentNo" element={<AssignmentDetail />} />
            <Route path="/employee/assignment/:assignmentNo/edit" element={<AssignmentManage />} />
            <Route path="/employee/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />}/>

            {/* 비로그인 학원정보 */}
            <Route path="/academy" element={<AcademyInfo />} />
            <Route path="/academy/tutor" element={<AcademyTutorList />} />
            <Route path="/academy/tutor/:tutorNo" element={<AcademyTutorDetail />} />

            {/* 학생 과제 */}
            <Route path="/student/assignment" element={<StudentAssignmentList />}/>
            <Route path="/student/assignment/:assignmentNo/submit" element={<StudentAssignmentManage />}/>
            <Route path="/student/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />}/>

            {/* 학부모 : 자녀 과제 상세 */}
            <Route path="/parent/assignment/:assignmentNo" element={<ParentAssignmentDetail />}/>

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}