import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaPen, FaClipboardCheck, FaArrowRight, FaClock } from "react-icons/fa6";
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
        }
        catch (err) {
            console.error("대시보드 조회 실패", err);
            toast.error("대시보드 정보를 불러오지 못했습니다.");
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // 학부모는 children 배열 중 현재 선택된 자녀의 대시보드만 뽑아서 사용
    const dashboard = useMemo(() => {
        if (!raw) {
            return null;
        }
        if (!isParent) {
            return raw;
        }
        const children = raw.children ?? [];
        return (
            children.find(child => child.studentNo === selectedChildNo) ??
            children[0] ??
            null
        );
    }, [raw, isParent, selectedChildNo]);

    // 과제 상세(제출) 이동 - 학부모는 조회 전용 상세, 학생은 제출 화면
    const moveToAssignment = (assignmentNo) => {
        navigate(
            isParent
                ? `/parent/assignment/${assignmentNo}`
                : `/student/assignment/${assignmentNo}/submit`
        );
    };

    // 표시 이름 (학부모면 선택된 자녀 이름, 아니면 본인 이름)
    const displayName =
        isParent
            ? (dashboard?.studentName ?? "자녀")
            : (loginUser?.accountName ?? "회원");

    return (<>
        <Jumbotron
            title={`${displayName}님, 안녕하세요`}
            content={isParent ? "자녀의 과제·시험 현황을 확인할 수 있습니다." : "오늘의 과제와 시험을 확인해보세요."}
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
                {/* 과제 요약 */}
                <Col xs={12} md={6}>
                    <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <FaPen className="text-primary" />
                                    <span className="fw-bold">미제출 과제</span>
                                </div>
                                <Badge bg={dashboard.pendingAssignmentCount > 0 ? "danger" : "secondary"}>
                                    {dashboard.pendingAssignmentCount}건
                                </Badge>
                            </div>

                            {dashboard.pendingAssignments.length === 0 ? (
                                <div className="text-muted text-center py-4 flex-grow-1">
                                    미제출 과제가 없습니다.
                                </div>
                            ) : (
                                <div className="flex-grow-1">
                                    {dashboard.pendingAssignments.map(assignment => {
                                        const dday = assignmentDdayLabel(assignment.assignmentDueDate);
                                        return (
                                            <div
                                                key={assignment.assignmentNo}
                                                className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => moveToAssignment(assignment.assignmentNo)}>
                                                <div>
                                                    <div className="fw-semibold">
                                                        {assignment.assignmentTitle}
                                                    </div>
                                                    <div className="text-muted small">
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
                                className="mt-3 align-self-end"
                                onClick={() => navigate("/student/assignment")}>
                                과제 전체보기 <FaArrowRight className="ms-1" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 시험 요약 */}
                <Col xs={12} md={6}>
                    <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
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

                            {dashboard.exams.length === 0 ? (
                                <div className="text-muted text-center py-4 flex-grow-1">
                                    예정된 시험이 없습니다.
                                </div>
                            ) : (
                                <div className="flex-grow-1">
                                    {dashboard.exams.map(exam => {
                                        const dday = examDdayLabel(exam);
                                        return (
                                            <div
                                                key={exam.examNo}
                                                className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/student/exam/${exam.examNo}`)}>
                                                <div>
                                                    <div className="fw-semibold">
                                                        {exam.examTitle}
                                                    </div>
                                                    <div className="text-muted small">
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
                                className="mt-3 align-self-end"
                                onClick={() => navigate("/student/exam")}>
                                시험 전체보기 <FaArrowRight className="ms-1" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        )}
    </>);
}
