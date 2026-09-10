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

import ContractAdd from "@components/contract/admin/ContractAdd";
import ContractEditBeforeSigned from "@components/contract/admin/ContractEditBeforeSigned";
import ContractSign from "@components/contract/ContractSign";
import ContractDetail from "@components/contract/admin/ContractDetail";
import ContractHistory from "@components/contract/ContractHistory";
import ContractExtend from "@components/contract/admin/ContractExtend";
import ContractChangeCondition from "@components/contract/admin/ContractChangeCondition";
import ContractList from "@components/contract/admin/ContractList";
import EmployeeContractDetail from "@components/contract/EmployeeContractDetail";


import AdminPayrollList from "@components/payroll/admin/AdminPayrollList";
import AdminPayrollMain from "@components/payroll/admin/AdminPayrollMain";
import AdminPayrollDetail from "@components/payroll/admin/AdminPayrollDetail";
import AdminPayrollCalculate from "@components/payroll/admin/AdminPayrollCalculate";

import EmployeePayrollList from "@components/payroll/EmployeePayrollList";
import EmployeePayrollDetail from "@components/payroll/EmployeePayrollDetail";
import AdminPayrollMonthly from "@components/payroll/admin/AdminPayrollMonthly";

import ExamManageList from "@components/employee/exam/ExamManageList";
import ExamManage from "@components/employee/exam/ExamManage";
import ExamResult from "@components/employee/exam/ExamResult";

import ExamStudentList from "@components/student/exam/ExamStudentList";
import ExamStudentDetail from "@components/student/exam/ExamStudentDetail";
import ExamStudentAttempt from "@components/student/exam/ExamStudentAttempt";
import ExamStudentResult from "@components/student/exam/ExamStudentResult";


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
            <Route path="/employee/myInfo" element={<Employee><EmployeeMyInfo /></Employee>} />

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
            <Route path="/student/myInfo" element={<Member><StudentMyInfo /></Member>} />
            {/* 학부모 */}
            <Route path="/Parent/myInfo" element={<Member><ParentMyInfo /></Member>} />
            {/* 학부모 학생 */}
            <Route path="/member/join" element={<MemberJoin />} />
            <Route path="/member/joinSuccess" element={<MemberJoinSuccess />} />
            <Route path="/member/joinFail" element={<MemberJoinFail />} />
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation /></Employee>} />

            {/* 학생 */}
            <Route path="/student/list" element={<Employee><StudentList /></Employee>} />
            <Route path="/student/detail/:studentNo" element={<Employee><StudentDetail /></Employee>} />

            {/* 수납 */}
            <Route path="/payment/list" element={<Employee><PaymentList /></Employee>} />
            <Route path="/payment/discount" element={<Employee><DiscountList /></Employee>} />
            <Route path="/payment/detail/:paymentNo" element={<Employee><PaymentDetail /></Employee>} />

            {/* 직원 홈페이지(대시보드) */}
            <Route path="/employeeHome" element={<Employee><EmployeeHome /></Employee>} />

            {/* 멤버 홈페이지(대시보드) */}
            <Route path="/" element={<Member><MemberHome /></Member>} />

            {/* 상담 */}
            <Route path="/employee/consult/reservation" element={<Employee><ConsultReservation /></Employee>} />
            <Route path="/employee/consult/manage" element={<Employee><ConsultManage /></Employee>} />
            <Route path="/employee/consult/chat" element={<Employee><ConsultChat /></Employee>} />

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
            <Route path="/employee/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />} />

            {/* 비로그인 학원정보 */}
            <Route path="/academy" element={<AcademyInfo />} />
            <Route path="/academy/tutor" element={<AcademyTutorList />} />
            <Route path="/academy/tutor/:tutorNo" element={<AcademyTutorDetail />} />

            {/* 학생 과제 */}
            <Route path="/student/assignment" element={<StudentAssignmentList />} />
            <Route path="/student/assignment/:assignmentNo/submit" element={<StudentAssignmentManage />} />
            <Route path="/student/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />} />

            {/* 학부모 : 자녀 과제 상세 */}
            <Route path="/parent/assignment/:assignmentNo" element={<ParentAssignmentDetail />} />

            {/* 시험(관리) */}
            <Route path="/employee/exam" element={<ExamManageList />}/>
            <Route path="/employee/exam/add" element={<ExamManage />}/>
            <Route path="/employee/exam/:examNo" element={<ExamManage />}/>
            <Route path="/employee/exam/:examNo/result" element={<ExamResult />}/>
            <Route path="/employee/exam/:examNo/result/:attemptNo" element={<ExamStudentResult />}/>

            {/* 학생 시험 */}
            <Route path="/student/exam" element={<ExamStudentList />}/>
            <Route path="/student/exam/:examNo" element={<ExamStudentDetail />}/>
            <Route path="/student/exam/:examNo/attempt/:attemptNo" element={<ExamStudentAttempt />}/>
            <Route path="/student/exam/result/:attemptNo" element={<ExamStudentResult />}/>

            {/* fallback route */}

            <Route path="*" element={<NotFound />} />

            {/* 계약관련 */}
            <Route path="/admin/contract/add/:employeeNo" element={<ContractAdd />} />
            <Route path="/admin/contract/before/:contractNo" element={<ContractEditBeforeSigned />} />
            <Route path="/employee/contract/sign/:contractNo" element={<ContractSign />} />
            <Route path="/admin/contract/detail/:contractNo" element={<ContractDetail />} />
            <Route path="/employee/contract/history/:employeeNo" element={<ContractHistory />} />
            <Route path="/admin/contract/extend/:contractNo" element={<ContractExtend />} />
            <Route path="/admin/contract/changeCondition/:contractNo" element={<ContractChangeCondition />} />
            <Route path="/admin/contract/list" element={<ContractList/>}/>
            <Route path="/employee/contract/detail/:contractNo" element={<EmployeeContractDetail/>}/>
            {/* 근태관련 */}
            <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
            {/* 관리자 전용 근태 */}
            <Route path="/admin/attendance/" element={<AdminAttendance />} />


            {/* 급여 관련 관리자 기능 */}
            <Route path="/admin/payroll" element={<AdminPayrollMain />}/>
            <Route path="/admin/payroll/:employeeNo" element={<AdminPayrollList/>}/>
            <Route path="/admin/payroll/:employeeNo/:payrollYear/:payrollMonth" element={<AdminPayrollDetail/>}/>
            <Route path="/admin/payroll/:employeeNo/calculate/:payrollYear/:payrollMonth" element={<AdminPayrollCalculate/>}/>
            <Route path="/admin/payroll/monthly/:payrollYear/:payrollMonth" element={<AdminPayrollMonthly/>}/>
        
            {/* 급여 관련 직원 기능 */}
            <Route path="/employee/payroll" element={<EmployeePayrollList/>}/>
            <Route path="/employye/payroll/:payrollYear/:payrollMonth" element={<EmployeePayrollDetail/>}/>
        </Routes>



    )
}