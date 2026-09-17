import { Navigate, Route, Routes } from "react-router-dom";
import { useAtomValue } from "jotai";
import { isLoginState } from "@utils/storage";

import EmployeeDashboard from "@components/EmployeeDashBoard";
import MemberDashboard from "@components/MemberDashboard";

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

import PrivateChat from "@components/employee/chat/PrivateChat";

import EmployeeSearch from "@components/employee/EmployeeSearch";
import EmployeeSearchDetail from "@components/employee/EmployeeSearchDetail";
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
import StudentList from "@components/student/StudentList";
import StudentDetail from "@components/student/StudentDetail";
import StudentAttendanceList from "@components/student/StudentAttendanceList";
import StudentScoreResult from "@components/student/score/StudentScoreResult";

import ParentMyInfo from "@components/parent/ParentMyInfo";
import ParentList from "@components/parent/ParentList";
import ParentDetail from "@components/parent/ParentDetail";
import ParentPaymentList from "@components/payment/ParentPaymentList";

import PaymentList from "@components/payment/PaymentList";
import DiscountList from "@components/payment/DiscountList";
import PaymentDetail from "@components/payment/PaymentDetail";
import PaymentSuccess from "@components/payment/PaymentSuccess";

import EmployeeAttendance from "@components/employeeAttendance/EmployeeAttendance";
import AdminAttendance from "@components/attendance/admin/AdminAttendance";
import KioskAttendance from "@components/attendance/admin/KioskAttendance";
import EmployeeAttendanceList from "@components/attendance/employee/EmployeeAttendanceList";

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

import ExamManageList from "@components/employee/exam/ExamManageList";
import ExamManage from "@components/employee/exam/ExamManage";
import ExamResult from "@components/employee/exam/ExamResult";

import ExamStudentList from "@components/student/exam/ExamStudentList";
import ExamStudentDetail from "@components/student/exam/ExamStudentDetail";
import ExamStudentAttempt from "@components/student/exam/ExamStudentAttempt";
import ExamStudentResult from "@components/student/exam/ExamStudentResult";
import ScoreManagement from "@components/score/ScoreManagement";

import EmployeeTimetable from "@components/employee/timetable/EmployeeTimetable";
import CourseCreate from "@components/course/CourseCreate";
import CourseList from "@components/course/CourseList";
import CourseDetail from "@components/course/CourseDetail";

export default function Body() {
    const isLogin = useAtomValue(isLoginState);

    return (
        <Routes>
            {/* 비로그인 및 학원 정보 */}
            <Route path="/academy" element={<AcademyInfo />} />
            <Route path="/academy/tutor" element={<AcademyTutorList />} />
            <Route path="/academy/tutor/:tutorNo" element={<AcademyTutorDetail />} />
            <Route path="/account/find" element={<AccountFind />} />

            {/* 직원 인증 및 계정 관리 */}
            <Route
                path="/employee/login"
                element={
                    isLogin
                        ? <Navigate to="/employeeHome" replace />
                        : <EmployeeLogin />
                }
            />
            <Route path="/employee/register" element={<EmployeeRegister />} />
            <Route path="/employee/registerSuccess" element={<EmployeeRegisterSuccess />} />
            <Route path="/employee/registerFail" element={<EmployeeRegisterFail />} />
            <Route path="/employee/password" element={<EmployeePassword />} />
            <Route path="/employee/myInfo" element={<Employee><EmployeeMyInfo /></Employee>} />

            {/* 직원 대시보드 */}
            <Route path="/employeeDashboard" element={<Employee><EmployeeDashboard /></Employee>} />

            {/* 직원 - 검색 및 인사 상세 */}
            <Route path="/employee/search" element={<EmployeeSearch />} />
            <Route path="/employee/search/detail/:employeeNo" element={<EmployeeSearchDetail />} />
            <Route path="/admin/employee/detail/:employeeNo" element={<AdminEmployeeDetail />} />

            {/* 직원 - 학원 및 강사 관리 */}
            <Route path="/employee/academy" element={<AcademyManage />} />
            <Route path="/employee/tutor" element={<TutorList />} />
            <Route path="/employee/tutor/add" element={<TutorManage />} />
            <Route path="/employee/tutor/:tutorNo" element={<TutorManage />} />

            {/* 직원 - 강좌 및 시간표 */}
            <Route path="/employee/course/create" element={<CourseCreate />} />
            <Route path="/employee/course/list" element={<CourseList />} />
            <Route path="/employee/course/detail/:courseNo" element={<CourseDetail />} />
            <Route path="/employee/timetable" element={<EmployeeTimetable />} />

            {/* 직원 - 과제 관리 */}
            <Route path="/employee/assignment" element={<AssignmentList />} />
            <Route path="/employee/assignment/add" element={<AssignmentManage />} />
            <Route path="/employee/assignment/:assignmentNo" element={<AssignmentDetail />} />
            <Route path="/employee/assignment/:assignmentNo/edit" element={<AssignmentManage />} />
            <Route path="/employee/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />} />

            {/* 직원 - 시험 관리 */}
            <Route path="/employee/exam" element={<ExamManageList />} />
            <Route path="/employee/exam/add" element={<ExamManage />} />
            <Route path="/employee/exam/:examNo" element={<ExamManage />} />
            <Route path="/employee/exam/:examNo/result" element={<ExamResult />} />
            <Route path="/employee/exam/:examNo/result/:attemptNo" element={<ExamStudentResult />} />

            {/* 직원 - 성적, 수납, 상담 */}
            <Route path="/score" element={<Employee><ScoreManagement /></Employee>} />
            <Route path="/payment/list" element={<Employee><PaymentList /></Employee>} />
            <Route path="/payment/discount" element={<Employee><DiscountList /></Employee>} />
            <Route path="/payment/detail/:paymentNo" element={<Employee><PaymentDetail /></Employee>} />
            <Route path="/employee/consult/reservation" element={<Employee><ConsultReservation /></Employee>} />
            <Route path="/employee/consult/manage" element={<Employee><ConsultManage /></Employee>} />
            <Route path="/employee/consult/chat" element={<Employee><ConsultChat /></Employee>} />

            <Route path="/employee/chat/" element={<PrivateChat />} />

            {/* 직원 - 학생 및 학부모 관리 */}
            <Route path="/student/list" element={<Employee><StudentList /></Employee>} />
            <Route path="/student/detail/:studentNo" element={<Employee><StudentDetail /></Employee>} />
            <Route path="/employee/parent/list" element={<ParentList />} />
            <Route path="/employee/parent/detail/:parentNo" element={<ParentDetail />} />

            {/* 직원 및 키오스크 근태 */}
            <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
            <Route path="/employee/attendance" element={<EmployeeAttendanceList />} />
            <Route path="/employee/kiosk" element={<KioskAttendance />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />

            {/* 계약 관리 (관리자 / 직원) */}
            <Route path="/admin/contract/list" element={<ContractList />} />
            <Route path="/admin/contract/add/:employeeNo" element={<ContractAdd />} />
            <Route path="/admin/contract/before/:contractNo" element={<ContractEditBeforeSigned />} />
            <Route path="/admin/contract/detail/:contractNo" element={<ContractDetail />} />
            <Route path="/admin/contract/extend/:contractNo" element={<ContractExtend />} />
            <Route path="/admin/contract/changeCondition/:contractNo" element={<ContractChangeCondition />} />
            <Route path="/employee/contract/sign/:contractNo" element={<ContractSign />} />
            <Route path="/employee/contract/detail/:contractNo" element={<EmployeeContractDetail />} />
            <Route path="/employee/contract/history/:employeeNo" element={<ContractHistory />} />

            {/* 급여 관리 (관리자 / 직원) */}
            <Route path="/admin/payroll" element={<AdminPayrollMain />} />
            <Route path="/admin/payroll/:employeeNo" element={<AdminPayrollList />} />
            <Route path="/admin/payroll/:employeeNo/:payrollYear/:payrollMonth" element={<AdminPayrollDetail />} />
            <Route path="/admin/payroll/:employeeNo/calculate/:payrollYear/:payrollMonth" element={<AdminPayrollCalculate />} />
            <Route path="/employee/payroll" element={<EmployeePayrollList />} />
            <Route path="/employee/payroll/:employeeNo/:payrollYear/:payrollMonth" element={<EmployeePayrollDetail />} />

            {/* 멤버(학생/학부모) 메인 및 인증 */}
            <Route path="/" element={<Member><MemberDashboard /></Member>} />
            <Route
                path="/member/login"
                element={
                    isLogin
                        ? <Navigate to="/memberHome" replace />
                        : <MemberLogin />
                }
            />
            <Route path="/member/join" element={<MemberJoin />} />
            <Route path="/member/joinSuccess" element={<MemberJoinSuccess />} />
            <Route path="/member/joinFail" element={<MemberJoinFail />} />

            {/* 학생 기능 */}
            <Route path="/student/myInfo" element={<Member><StudentMyInfo /></Member>} />
            <Route path="/student/attendance/list" element={<StudentAttendanceList />} />
            <Route path="/student/attendance/list/:courseNo" element={<StudentAttendanceList />} />
            <Route path="/student/assignment" element={<StudentAssignmentList />} />
            <Route path="/student/assignment/:assignmentNo/submit" element={<StudentAssignmentManage />} />
            <Route path="/student/assignment/:assignmentNo/submit/:submitNo" element={<StudentAssignmentDetail />} />
            <Route path="/student/exam" element={<ExamStudentList />} />
            <Route path="/student/exam/:examNo" element={<ExamStudentDetail />} />
            <Route path="/student/exam/:examNo/attempt/:attemptNo" element={<ExamStudentAttempt />} />
            <Route path="/student/exam/result/:attemptNo" element={<ExamStudentResult />} />
            <Route path="/student/score" element={<StudentScoreResult />} />

            {/* 학부모 기능 */}
            <Route path="/parent/myInfo" element={<Member><ParentMyInfo /></Member>} />
            <Route path="/parent/attendance/list" element={<StudentAttendanceList />} />
            <Route path="/parent/attendance/list/:courseNo" element={<StudentAttendanceList />} />
            <Route path="/parent/assignment/:assignmentNo" element={<ParentAssignmentDetail />} />
            <Route path="/parent/exam/result/:attemptNo" element={<ExamStudentResult />} />
            <Route path="/parent/score" element={<StudentScoreResult />} />
            <Route path="/parent/payment/list" element={<ParentPaymentList />} />
            <Route path="/parent/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<div>결제를 취소하셨습니다.</div>} />
            <Route path="/payment/fail" element={<div>결제에 실패했습니다.</div>} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}