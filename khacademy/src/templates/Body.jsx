import { Navigate, Route, Routes } from "react-router-dom";
import { useAtomValue } from "jotai";
import { isLoginState } from "@utils/storage";

import EmployeeHome from "@components/EmployeeHome";
import MemberHome from "@components/MemberHome";

import AccountFind from "@components/account/AccountFind";
import EmployeeLogin from "@components/employee/EmployeeLogin";
import EmployeeRegister from "@components/employee/EmployeeRegister";
import EmployeeRegisterSuccess from "@components/employee/EmployeeRegisterSuccess";
import EmployeeRegisterFail from "@components/employee/EmployeeRegisterFail";
import EmployeePassword from "@components/employee/EmployeePassword";
import EmployeeMyInfo from "@components/employee/EmployeeMyInfo";

import MemberLogin from "@components/member/MemberLogin";
import MemberJoin from "@components/member/MemberJoin";
import MemberJoinSuccess from "@components/member/MemberJoinSuccess";
import MemberJoinFail from "@components/member/MemberJoinFail";

import ConsultReservation from "@components/employee/consult/ConsultReservation";
import ConsultManage from "@components/employee/consult/ConsultManage";
import ConsultChat from "@components/employee/consult/ConsultChat";

import AdminEmployeeList from "@components/admin/employee/AdminEmployeeList";
import AdminEmployeeDetail from "@components/admin/employee/AdminEmployeeDetail";

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

import StudentMyInfo from "@components/student/StudentMyInfo";

import ParentMyInfo from "@components/parent/ParentMyInfo";

import StudentList from "@components/student/StudentList";
import StudentDetail from "@components/student/StudentDetail";
import PaymentList from "@components/payment/PaymentList";
import DiscountList from "@components/payment/DiscountList";
import PaymentDetail from '@components/payment/PaymentDetail';

import EmployeeAttendance from "@components/employeeAttendance/EmployeeAttendance";
import AdminAttendance from "@components/attendance/admin/AdminAttendance";

import ContractAdd from "@components/contract/ContractAdd";
import ContractEditBeforeSigned from "@components/contract/ContractEditBeforeSigned";
import ContractSign from "@components/contract/ContractSign";
import ContractDetail from "@components/contract/ContractDetail";
import ContractHistory from "@components/contract/ContractHistory";
import ContractExtend from "@components/contract/ContractExtend";
import ContractChangeCondition from "@components/contract/ContractChangeCondition";

import CourseCreate from "@components/course/CourseCreate";
import CourseList from "@components/course/CourseList";
import CourseDetail from "@components/course/CourseDetail";

export default function Body() {

    const isLogin = useAtomValue(isLoginState);

    return (
        <Routes>
            {/* 계정 - 아이디 비밀번호 찾기 */}
            <Route path="/account/find" element={<AccountFind />} />

            {/* 직원 로그인 */}
            <Route
                path="/employee/login"
                element={
                    isLogin
                        ? <Navigate to="/employeeHome" replace />
                        : <EmployeeLogin />
                }
            />
            {/* 관리자(원장, 데스크) */}
            <Route path="/admin/employee/list" element={<AdminEmployeeList />} />
            <Route path="/admin/employee/detail/:employeeNo" element={<AdminEmployeeDetail />} />

            {/* 직원(원장, 데스크) */}
            <Route path="/employee/register" element={<EmployeeRegister />} />
            <Route path="/employee/registerSuccess" element={<EmployeeRegisterSuccess />} />
            <Route path="/employee/registerFail" element={<EmployeeRegisterFail />} />
            
            {/* 직원(원장, 데스크, 강사) */}
            <Route path="/employee/password" element={<EmployeePassword />} />
            <Route path="/employee/myInfo"element={<Employee><EmployeeMyInfo /></Employee>}/>
            
            {/* 회원 가입(학생, 학부모) */}
            <Route 
                path="/member/login" 
                element={
                    isLogin
                    ? <Navigate to="/memberHome" replace />
                    : <MemberLogin />
                } 
            />
            {/* 학생 */}
            <Route path="/student/myInfo"element={<Member><StudentMyInfo /></Member>}/>
            {/* 학부모 */}
            <Route path="/Parent/myInfo"element={<Member><ParentMyInfo /></Member>}/>
            {/* 학부모 학생 */}
            <Route path="/member/join" element={<MemberJoin />} />
            <Route path="/member/joinSuccess" element={<MemberJoinSuccess />} />
            <Route path="/member/joinFail" element={<MemberJoinFail />} />

            {/* 학생 */}
            <Route path="/student/list" element={<Employee><StudentList/></Employee>} />
            <Route path="/student/detail/:studentNo" element={<Employee><StudentDetail/></Employee>} />

            {/* 수납 */}
            <Route path="/payment/list" element={<Employee><PaymentList/></Employee>} />
            <Route path="/payment/discount" element={<Employee><DiscountList/></Employee>} />
            <Route path="/payment/detail/:paymentNo" element={<Employee><PaymentDetail /></Employee>} />

            {/* 직원 홈페이지(대시보드) */}
            <Route path="/employeeHome" element={<Employee><EmployeeHome /></Employee>} />

            {/* 멤버 홈페이지(대시보드) */}
            <Route path="/" element={<Member><MemberHome /></Member>} />

            {/* 상담 */}
            <Route path="/employee/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />
            <Route path="/employee/consult/manage" element={<Employee><ConsultManage /></Employee>} />
            <Route path="/employee/consult/chat" element={<Employee><ConsultChat/></Employee>} />

            {/* 외부화면 정보 관리(직원 로그인 완료 되면 employee 추가해야함) */}
            <Route path="/employee/academy" element={<AcademyManage />} />
            <Route path="/employee/tutor" element={<TutorList />} />
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

            {/* 계약관련 */}
            <Route path="/employee/contract/add/:employeeNo" element={<ContractAdd/>}/>
            <Route path="/employee/contract/before/:contractNo" element={<ContractEditBeforeSigned/>}/>
            <Route path="/employee/contract/sign/:contractNo" element={<ContractSign/>}/>
            <Route path="/employee/contract/detail/:contractNo" element={<ContractDetail/>}/>
            <Route path="/employee/contract/history/:employeeNo" element={<ContractHistory/>}/>
            <Route path="/employee/contract/extend/:contractNo" element={<ContractExtend/>}/>
            <Route path="/employee/contract/changeCondition/:contractNo" element={<ContractChangeCondition/>}/>
            
            {/* 강좌관련 */}
            <Route path="/employee/course/create" element={<CourseCreate/>}/>
            <Route path="/employee/course/list" element={<CourseList/>}/>
            <Route path="/employee/course/detail/:courseNo" element={<CourseDetail/>}/>
               
            {/* 근태관련 */}
            <Route path="/employeeAttendance" element={<EmployeeAttendance/>}/>
            {/* 관리자 전용 근태 */}
            <Route path="/admin/attendance/" element={<AdminAttendance/>}/>
            
        </Routes>   

            
  
    )
}