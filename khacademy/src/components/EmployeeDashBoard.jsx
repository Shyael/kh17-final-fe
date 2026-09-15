import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaPen, FaClipboardCheck, FaArrowRight, FaClock } from "react-icons/fa6";
import { useAtomValue } from "jotai";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";
import { loginUserState } from "@utils/storage";
import { assignmentDdayLabel, examDdayLabel } from "@utils/dday";

export default function EmployeeDashboard() {

    const navigate = useNavigate();

    const loginUser = useAtomValue(loginUserState);

    // 대시보드 요약 정보 (과제 / 시험) - 원장·데스크는 전체, 강사는 본인 등록분만 서버가 내려줌
    const [dashboard, setDashboard] = useState(null);

    // 대시보드 조회
    const loadDashboard = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/dashboard");
            setDashboard(response.data);
        }
        catch (err) {
            console.error("대시보드 조회 실패", err);
            toast.error("대시보드 정보를 불러오지 못했습니다.");
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    return (<>
        <Jumbotron
            title={`${loginUser?.accountName ?? "직원"}님, 안녕하세요`}
            content="진행중인 과제와 다가오는 시험을 확인해보세요."
        />

        {!dashboard ? (
            <p className="text-center text-muted py-5">
                대시보드 정보를 불러오는 중입니다...
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
                                    <span className="fw-bold">진행중인 과제</span>
                                </div>
                                <Badge
                                    bg={dashboard.activeAssignmentCount > 0 ? "primary" : "secondary"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/employee/assignment?assignmentPhase=제출가능")}>
                                    {dashboard.activeAssignmentCount}건
                                </Badge>
                            </div>

                            {dashboard.activeAssignments.length === 0 ? (
                                <div className="text-muted text-center py-4 flex-grow-1">
                                    진행중인 과제가 없습니다.
                                </div>
                            ) : (
                                <div className="flex-grow-1">
                                    {dashboard.activeAssignments.map(assignment => {
                                        const dday = assignmentDdayLabel(assignment.assignmentDueDate);
                                        return (
                                            <div
                                                key={assignment.assignmentNo}
                                                className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/employee/assignment/${assignment.assignmentNo}`)}>
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
                                onClick={() => navigate("/employee/assignment")}>
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
                                    <span className="fw-bold">응시중 · 예정 시험</span>
                                </div>
                                <div className="d-flex gap-1">
                                    <Badge
                                        bg={dashboard.availableExamCount > 0 ? "success" : "secondary"}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate("/employee/exam?examPhase=응시가능")}>
                                        응시가능 {dashboard.availableExamCount}
                                    </Badge>
                                    <Badge
                                        bg="info"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate("/employee/exam?examPhase=예정")}>
                                        예정 {dashboard.upcomingExamCount}
                                    </Badge>
                                </div>
                            </div>

                            {dashboard.exams.length === 0 ? (
                                <div className="text-muted text-center py-4 flex-grow-1">
                                    응시중이거나 예정된 시험이 없습니다.
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
                                                onClick={() => navigate(`/employee/exam/${exam.examNo}`)}>
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
                                onClick={() => navigate("/employee/exam")}>
                                시험 전체보기 <FaArrowRight className="ms-1" />
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        )}
    </>);
}
