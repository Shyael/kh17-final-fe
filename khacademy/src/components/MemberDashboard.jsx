import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Row, Table } from "react-bootstrap";
import {
    FaPen,
    FaClipboardCheck,
    FaArrowRight,
    FaClock,
    FaChalkboardUser
} from "react-icons/fa6";
import { useAtomValue } from "jotai";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";
import { loginUserState, isParentState, selectedChildNoState } from "@utils/storage";
import { assignmentDdayLabel, examDdayLabel } from "@utils/dday";

export default function MemberDashboard() {
    const navigate = useNavigate();

    const loginUser = useAtomValue(loginUserState);
    const isParent = useAtomValue(isParentState);
    const selectedChildNo = useAtomValue(selectedChildNoState);

    // 원본 응답 (학생: 단일 객체 / 학부모: { children: [...] })
    const [raw, setRaw] = useState(null);

    // 대시보드 조회
    const loadDashboard = useCallback(async () => {
        try {
            const response = await apiClient.get("/academy/dashboard");
            setRaw(response.data);
        } catch (err) {
            console.error("대시보드 조회 실패", err);
            toast.error("대시보드 정보를 불러오지 못했습니다.");
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // 학부모는 메뉴에서 변경되는 selectedChildNo에 맞춰 해당 자녀의 데이터 추출
    const dashboard = useMemo(() => {
        if (!raw) return null;
        if (!isParent) return raw;

        const children = raw.children ?? [];
        return (
            children.find((child) => child.studentNo === selectedChildNo) ??
            children[0] ??
            null
        );
    }, [raw, isParent, selectedChildNo]);

    // 과제 상세(제출) 이동
    const moveToAssignment = (assignmentNo) => {
        navigate(
            isParent
                ? `/parent/assignment/${assignmentNo}`
                : `/student/assignment/${assignmentNo}/submit`
        );
    };

    // 강좌 상세 페이지 이동
    const moveToCourse = (courseNo) => {
        if (!courseNo) return;
        navigate(
            isParent
                ? `/parent/attendance/list/${courseNo}`
                : `/student/attendance/list/${courseNo}`
        );
    };

    // 세션 상태 배지
    const renderSessionStatusBadge = (status) => {
        switch (status) {
            case "진행중":
                return <Badge bg="success">수업중</Badge>;
            case "종료":
                return <Badge bg="secondary">종료</Badge>;
            case "취소":
                return <Badge bg="danger">휴강</Badge>;
            default:
                return <Badge bg="light" text="dark" className="border">수업대기</Badge>;
        }
    };

    // 표시 이름
    const displayName = isParent
        ? (dashboard?.studentName ?? "자녀")
        : (loginUser?.accountName ?? "회원");

    const courseList = dashboard?.courses ?? [];

    return (
        <>
            <Jumbotron
                title={`${displayName}님, 안녕하세요`}
                content={isParent ? "자녀의 오늘의 수업 일정과 과제·시험 현황을 확인해보세요." : "오늘의 수업 일정과 과제·시험을 확인해보세요."}
            />

            {!raw ? (
                <p className="text-center text-muted py-5">
                    대시보드 정보를 불러오는 중입니다...
                </p>
            ) : isParent && !dashboard ? (
                <p className="text-center text-muted py-5">
                    등록된 자녀 정보가 없습니다.
                </p>
            ) : (
                <Row className="g-3 mt-1">
                    {/* =========================
                        오늘의 수업 일정
                       ========================= */}
                    {dashboard.courses !== undefined && (
                        <Col xs={12} lg={4}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="d-flex flex-column p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <FaChalkboardUser className="text-primary fs-5" />
                                            <span className="fw-bold">오늘의 수업</span>
                                        </div>
                                    </div>

                                    {courseList.length === 0 ? (
                                        <div className="text-muted text-center py-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                                            <FaClock size={24} className="mb-2 opacity-50" />
                                            <p className="mb-0 small">오늘 예정된 수업이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive flex-grow-1">
                                            <Table hover className="align-middle mb-0 text-center small">
                                                <thead className="table-light text-secondary">
                                                    <tr>
                                                        <th className="text-start ps-2">강좌</th>
                                                        <th style={{ width: "95px" }}>시간</th>
                                                        <th style={{ width: "55px" }}>강의실</th>
                                                        <th style={{ width: "65px" }}>상태</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseList.map((course, idx) => (
                                                        <tr
                                                            key={course.scheduleNo ?? course.courseNo ?? `course-${idx}`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => moveToCourse(course.courseNo)}
                                                        >
                                                            <td className="text-start ps-2 py-2">
                                                                <span className="fw-semibold text-dark text-truncate d-inline-block" style={{ maxWidth: "120px" }}>
                                                                    {course.courseTitle}
                                                                </span>
                                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                    {course.courseSubject} · {course.tutorName} T
                                                                </div>
                                                            </td>
                                                            <td className="text-nowrap" style={{ fontSize: "0.78rem" }}>
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
                                        onClick={() => navigate(isParent ? "/parent/attendance/list" : "/student/attendance/list")}
                                    >
                                        강좌 목록 <FaArrowRight className="ms-1" />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}

                    {/* =========================
                        미제출 과제 요약
                       ========================= */}
                    <Col xs={12} lg={dashboard.courses !== undefined ? 4 : 6}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex flex-column p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <FaPen className="text-primary" />
                                        <span className="fw-bold">미제출 과제</span>
                                    </div>
                                    <Badge bg={dashboard.pendingAssignmentCount > 0 ? "danger" : "secondary"}>
                                        {dashboard.pendingAssignmentCount}건
                                    </Badge>
                                </div>

                                {!dashboard.pendingAssignments || dashboard.pendingAssignments.length === 0 ? (
                                    <div className="text-muted text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                                        미제출 과제가 없습니다.
                                    </div>
                                ) : (
                                    <div className="flex-grow-1">
                                        {dashboard.pendingAssignments.map((assignment) => {
                                            const dday = assignmentDdayLabel(assignment.assignmentDueDate);
                                            return (
                                                <div
                                                    key={assignment.assignmentNo}
                                                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => moveToAssignment(assignment.assignmentNo)}
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
                                    onClick={() => navigate("/student/assignment")}
                                >
                                    과제 전체보기 <FaArrowRight className="ms-1" />
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* =========================
                        시험 요약
                       ========================= */}
                    <Col xs={12} lg={dashboard.courses !== undefined ? 4 : 6}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex flex-column p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <FaClipboardCheck className="text-primary" />
                                        <span className="fw-bold">시험</span>
                                    </div>
                                    <div className="d-flex gap-1">
                                        <Badge bg={dashboard.availableExamCount > 0 ? "success" : "secondary"}>
                                            응시가능 {dashboard.availableExamCount}
                                        </Badge>
                                        <Badge bg="info">
                                            예정 {dashboard.upcomingExamCount}
                                        </Badge>
                                    </div>
                                </div>

                                {!dashboard.exams || dashboard.exams.length === 0 ? (
                                    <div className="text-muted text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center">
                                        예정된 시험이 없습니다.
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
                                                    onClick={() => navigate(`/student/exam/${exam.examNo}`)}
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
                                    onClick={() => navigate("/student/exam")}
                                >
                                    시험 전체보기 <FaArrowRight className="ms-1" />
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
}