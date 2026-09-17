import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Nav, Row, Table } from "react-bootstrap";
import {
    FaPen,
    FaClipboardCheck,
    FaArrowRight,
    FaClock,
    FaChalkboardUser,
    FaFileInvoiceDollar // 미납 요약용 아이콘 추가
} from "react-icons/fa6";
import { useAtomValue } from "jotai";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";
import { loginUserState, isAdminState, isDeskState } from "@utils/storage";
import { assignmentDdayLabel, examDdayLabel } from "@utils/dday";
import AdminDashBoard from "@components/AdminDashBoard";
import DeskDashboard from "@components/DeskDashboard";

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const loginUser = useAtomValue(loginUserState);
    const isAdmin = useAtomValue(isAdminState);
    const isDesk = useAtomValue(isDeskState);

    // 대시보드 요약 정보
    const [dashboard, setDashboard] = useState(null);

    // 강좌 상태 탭 필터 ('ALL', 'RUNNING', 'WAITING', 'FINISHED')
    const [courseTab, setCourseTab] = useState("ALL");

    // 대시보드 조회
    const loadDashboard = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/dashboard");
            setDashboard(response.data);
        } catch (err) {
            console.error("대시보드 조회 실패", err);
            toast.error("대시보드 정보를 불러오지 못했습니다.");
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // 세션 상태 배지
    const renderSessionStatusBadge = (status) => {
        switch (status) {
            case "진행중":
                return <Badge bg="success">진행중</Badge>;
            case "종료":
                return <Badge bg="secondary">종료</Badge>;
            case "취소":
                return <Badge bg="danger">휴강</Badge>;
            default:
                return <Badge bg="light" text="dark" className="border">대기</Badge>;
        }
    };

    // 상태별 개수 집계
    const courseCounts = useMemo(() => {
        const list = dashboard?.courses ?? [];
        return {
            all: list.length,
            running: list.filter((c) => c.sessionStatus === "진행중").length,
            waiting: list.filter((c) => !c.sessionStatus || c.sessionStatus === "취소").length,
            finished: list.filter((c) => c.sessionStatus === "종료").length,
        };
    }, [dashboard?.courses]);

    // 탭 선택에 따른 강좌 목록 필터링
    const filteredCourses = useMemo(() => {
        const list = dashboard?.courses ?? [];
        if (courseTab === "RUNNING") {
            return list.filter((c) => c.sessionStatus === "진행중");
        }
        if (courseTab === "WAITING") {
            return list.filter((c) => !c.sessionStatus || c.sessionStatus === "취소");
        }
        if (courseTab === "FINISHED") {
            return list.filter((c) => c.sessionStatus === "종료");
        }
        return list; // 'ALL'
    }, [dashboard?.courses, courseTab]);

    // 장기 미납(이번 달 제외) 데이터 필터링 및 정렬
    const oldestUnpaidList = useMemo(() => {
        const list = dashboard?.payments ?? []; // 백엔드 데이터에 맞게 키(payments) 수정 필요
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`; 

        return list
            // 미납(부분납 포함)이면서 이번 달이 아닌 내역만 필터링
            .filter(p => 
                // (p.paymentStatus === "미납" || p.paymentStatus === "부분납") && 
                p.paymentMonth !== currentMonthStr
            )
            // 월(Month) 기준 오름차순 정렬 (가장 오래된 건부터)
            .sort((a, b) => a.paymentMonth.localeCompare(b.paymentMonth)); 
    }, [dashboard?.payments]);

    return (
        <>
            <Jumbotron
                title={`${loginUser?.accountName ?? "직원"}님, 안녕하세요`}
                content="오늘의 수업 일정과 진행 중인 업무를 확인해보세요."
            />

            {!dashboard ? (
                <p className="text-center text-muted py-5">
                    대시보드 정보를 불러오는 중입니다...
                </p>
            ) : (
                <>
                    {/* 원장 전용 대시보드 */}
                    {isAdmin && <AdminDashBoard dashboard={dashboard} />}

                    {/* 데스크 대시보드 */}
                    {isDesk && <DeskDashboard dashboard={dashboard} />}

                    <Row className="g-3 mt-1">
                        {/* =========================
                            오늘의 수업 일정 (상태별 탭 적용)
                           ========================= */}
                        {dashboard.courses !== undefined && (
                            <Col xs={12} lg={6}>
                                <Card className="h-100 shadow-sm border-0">
                                    <Card.Body className="d-flex flex-column p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChalkboardUser className="text-primary fs-5" />
                                                <span className="fw-bold">오늘의 수업 일정</span>
                                            </div>

                                            {/* 상태별 필터 탭 */}
                                            <Nav
                                                variant="pills"
                                                className="bg-light p-1 rounded"
                                                activeKey={courseTab}
                                                onSelect={(key) => setCourseTab(key)}
                                                style={{ fontSize: "0.75rem" }}
                                            >
                                                <Nav.Item>
                                                    <Nav.Link eventKey="ALL" className="py-1 px-2">
                                                        전체 {courseCounts.all}
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="RUNNING" className="py-1 px-2">
                                                        진행 {courseCounts.running}
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="WAITING" className="py-1 px-2">
                                                        대기 {courseCounts.waiting}
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="FINISHED" className="py-1 px-2">
                                                        종료 {courseCounts.finished}
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                        </div>

                                        {filteredCourses.length === 0 ? (
                                            <div className="text-muted text-center py-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                                                <FaClock size={24} className="mb-2 opacity-50" />
                                                <p className="mb-0 small">해당 상태의 수업 일정이 없습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive flex-grow-1">
                                                <Table hover className="align-middle mb-0 text-center small">
                                                    <thead className="table-light text-secondary">
                                                        <tr>
                                                            <th className="text-start ps-2">강좌 / 과목</th>
                                                            <th style={{ width: "105px" }}>시간</th>
                                                            <th style={{ width: "65px" }}>강의실</th>
                                                            <th style={{ width: "65px" }}>상태</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredCourses.map((course) => (
                                                            <tr
                                                                key={`${course.courseNo}-${course.scheduleNo}`}
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => navigate(`/employee/course/detail/${course.courseNo}`)}
                                                            >
                                                                <td className="text-start ps-2 py-2">
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        {course.gradeLevel && (
                                                                            <Badge bg="secondary" className="px-1 py-0" style={{ fontSize: "0.7rem" }}>
                                                                                {course.gradeLevel}
                                                                            </Badge>
                                                                        )}
                                                                        <span className="fw-semibold text-dark text-truncate d-inline-block" style={{ maxWidth: "150px" }}>
                                                                            {course.courseTitle}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                        {course.courseSubject} · {course.tutorName || "미지정"}
                                                                    </div>
                                                                </td>
                                                                <td className="text-nowrap" style={{ fontSize: "0.8rem" }}>
                                                                    {course.scheduleInfo}
                                                                </td>
                                                                <td className="text-nowrap">
                                                                    <span className="badge bg-light text-dark border">
                                                                        {course.classroomInfo || "-"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {renderSessionStatusBadge(course.sessionStatus)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="mt-2 align-self-end"
                                            onClick={() => navigate("/employee/course/list")}
                                        >
                                            전체 강좌 <FaArrowRight className="ms-1" />
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}

                        {/* =========================
                            과제 요약
                           ========================= */}
                        <Col xs={12} lg={6}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="d-flex flex-column p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <FaPen className="text-primary" />
                                            <span className="fw-bold">진행중인 과제</span>
                                        </div>
                                        <Badge
                                            bg={dashboard.activeAssignmentCount > 0 ? "primary" : "secondary"}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate("/employee/assignment?assignmentPhase=제출가능")}
                                        >
                                            {dashboard.activeAssignmentCount}건
                                        </Badge>
                                    </div>

                                    {!dashboard.activeAssignments || dashboard.activeAssignments.length === 0 ? (
                                        <div className="text-muted text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                                            진행중인 과제가 없습니다.
                                        </div>
                                    ) : (
                                        <div className="flex-grow-1">
                                            {dashboard.activeAssignments.map((assignment) => {
                                                const dday = assignmentDdayLabel(assignment.assignmentDueDate);
                                                return (
                                                    <div
                                                        key={assignment.assignmentNo}
                                                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => navigate(`/employee/assignment/${assignment.assignmentNo}`)}
                                                    >
                                                        <div>
                                                            <div className="fw-semibold small">
                                                                {assignment.assignmentTitle}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                {assignment.courseTitle}
                                                            </div>
                                                        </div>
                                                        <Badge bg={dday.variant} className="ms-2 text-nowrap">
                                                            <FaClock className="me-1" />
                                                            {dday.text}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="mt-2 align-self-end"
                                        onClick={() => navigate("/employee/assignment")}
                                    >
                                        과제 전체보기 <FaArrowRight className="ms-1" />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* =========================
                            시험 요약
                           ========================= */}
                        <Col xs={12} lg={6}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="d-flex flex-column p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <FaClipboardCheck className="text-primary" />
                                            <span className="fw-bold">응시중 · 예정 시험</span>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <Badge
                                                bg={dashboard.availableExamCount > 0 ? "success" : "secondary"}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate("/employee/exam?examPhase=응시가능")}
                                            >
                                                응시가능 {dashboard.availableExamCount}
                                            </Badge>
                                            <Badge
                                                bg="info"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate("/employee/exam?examPhase=예정")}
                                            >
                                                예정 {dashboard.upcomingExamCount}
                                            </Badge>
                                        </div>
                                    </div>

                                    {!dashboard.exams || dashboard.exams.length === 0 ? (
                                        <div className="text-muted text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                                            응시중이거나 예정된 시험이 없습니다.
                                        </div>
                                    ) : (
                                        <div className="flex-grow-1">
                                            {dashboard.exams.map((exam) => {
                                                const dday = examDdayLabel(exam);
                                                return (
                                                    <div
                                                        key={exam.examNo}
                                                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => navigate(`/employee/exam/${exam.examNo}`)}
                                                    >
                                                        <div>
                                                            <div className="fw-semibold small">
                                                                {exam.examTitle}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                {exam.courseTitle}
                                                            </div>
                                                        </div>
                                                        <Badge bg={dday.variant} className="ms-2 text-nowrap">
                                                            <FaClock className="me-1" />
                                                            {dday.text}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="mt-2 align-self-end"
                                        onClick={() => navigate("/employee/exam")}
                                    >
                                        시험 전체보기 <FaArrowRight className="ms-1" />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* =========================
                            장기 미납 요약
                           ========================= */}
                        <Col xs={12} lg={6}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="d-flex flex-column p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <FaFileInvoiceDollar className="text-primary fs-5" />
                                            <span className="fw-bold">장기 미납 내역</span>
                                        </div>
                                        <Badge
                                            bg={oldestUnpaidList.length > 0 ? "danger" : "secondary"}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate("/employee/payment/list")}
                                        >
                                            {oldestUnpaidList.length}건
                                        </Badge>
                                    </div>

                                    {oldestUnpaidList.length === 0 ? (
                                        <div className="text-muted text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                                            미납액 없음
                                        </div>
                                    ) : (
                                        <div className="flex-grow-1">
                                            {/* 최대 4개 정도만 표시하여 다른 카드들과 높이를 맞춥니다 */}
                                            {oldestUnpaidList.slice(0, 4).map((payments, idx) => (
                                                <div
                                                    key={payments.paymentNo || idx}
                                                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => navigate(`/employee/payment/detail/${payments.paymentNo}`)}
                                                >
                                                    <div>
                                                        <div className="fw-semibold small text-dark">
                                                            {payments.studentName} 학생
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                            {payments.paymentMonth} 청구분
                                                        </div>
                                                    </div>
                                                    <div className="text-danger fw-bold text-nowrap small">
                                                        {payments.remainingAmount?.toLocaleString()}원
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="mt-2 align-self-end"
                                        onClick={() => navigate("/employee/payment/list")}
                                    >
                                        수납 전체보기 <FaArrowRight className="ms-1" />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}