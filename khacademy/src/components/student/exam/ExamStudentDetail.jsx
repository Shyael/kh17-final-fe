import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaPlay, FaArrowRotateRight, FaClipboardCheck, FaClock } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useAtomValue } from "jotai";
import { isParentState, selectedChildState, selectedChildNoState } from "@utils/storage";

export default function ExamStudentDetail() {

    const { examNo } = useParams();
    const navigate = useNavigate();

    // 학부모 여부 / 선택된 자녀
    const isParent = useAtomValue(isParentState);
    const selectedChild = useAtomValue(selectedChildState);
    const selectedChildNo = useAtomValue(selectedChildNoState);

    // 시험 상세 정보
    const [exam, setExam] = useState(null);

    // 응시 시작 중 중복 클릭 방지
    const [starting, setStarting] = useState(false);

    // 시험 상세 조회 (학생 본인 / 학부모는 선택한 자녀 기준)
    const loadExam = useCallback(async () => {
        try {
            let response;

            if (isParent) {
                if (selectedChildNo == null) {
                    setExam(null);
                    return;
                }
                response = await apiClient.get(
                    `/academy/exam/parent/student/${selectedChildNo}/${examNo}`
                );
            }
            else {
                response = await apiClient.get(`/academy/exam/student/${examNo}`);
            }

            setExam(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("시험 정보를 불러오지 못했습니다");
        }
    }, [isParent, selectedChildNo, examNo]);

    useEffect(() => {
        loadExam();
    }, [loadExam]);

    // 날짜 출력
    const formatDate = useCallback((date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "ko-KR",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }, []);

    // 현재 시험 단계 - 백엔드 examPhase(예정/응시가능/종료) 사용
    const phase = exam?.examPhase ?? null;

    // 문항 수 / 총점
    const questionCount = useMemo(() => {
        if (exam?.questionCount != null) {
            return exam.questionCount;
        }
        return exam?.questionList?.length ?? null;
    }, [exam]);

    const totalScore = useMemo(() => {
        if (exam?.totalScore != null) {
            return exam.totalScore;
        }
        if (Array.isArray(exam?.questionList)) {
            return exam.questionList.reduce(
                (sum, question) => sum + (Number(question.questionScore) || 0),
                0
            );
        }
        return null;
    }, [exam]);

    // 결과 조회 가능 여부 : 제출완료 + 시험 종료
    const canViewResult = useMemo(() => {
        if (!exam) {
            return false;
        }
        return exam.attemptStatus === "제출완료" && phase === "종료";
    }, [exam, phase]);

    // 시험 응시 시작
    const startExam = useCallback(async () => {

        if (!exam) {
            return;
        }

        // 응시 가능시간이 아닌 경우
        if (phase !== "응시가능") {
            toast.error(
                phase === "예정"
                    ? "아직 시험 응시 시간이 아닙니다."
                    : "시험 응시 기간이 종료되었습니다."
            );
            return;
        }

        if (starting) {
            return;
        }

        try {
            setStarting(true);

            const response = await apiClient.post("/academy/attempt", { examNo: Number(examNo) });

            const attemptNo = response.data;

            // 시험 응시 화면으로 이동
            navigate(`/student/exam/${examNo}/attempt/${attemptNo}`);
        }
        catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message ?? "시험 응시를 시작할 수 없습니다.");
        }
        finally {
            setStarting(false);
        }
    }, [exam, examNo, phase, starting, navigate]);

    // 응시중 시험 이어서 응시
    const continueExam = useCallback(() => {
        if (!exam?.attemptNo) {
            return;
        }
        navigate(`/student/exam/${examNo}/attempt/${exam.attemptNo}`);
    }, [exam, examNo, navigate]);

    // 결과 보기
    const moveResult = useCallback(() => {
        if (!exam?.attemptNo) {
            return;
        }
        navigate(`/student/exam/result/${exam.attemptNo}`);
    }, [exam, navigate]);

    // 상태 Badge
    const statusBadge = useMemo(() => {
        if (!exam) {
            return null;
        }

        if (exam.attemptStatus === "제출완료") {
            return <Badge bg="success">제출완료</Badge>;
        }

        if (exam.attemptStatus === "응시중") {
            return <Badge bg="primary">응시중</Badge>;
        }

        if (phase === "예정") {
            return <Badge bg="info">응시예정</Badge>;
        }
        if (phase === "종료") {
            return <Badge bg="secondary">종료</Badge>;
        }

        return <Badge bg="warning" text="dark">미응시</Badge>;

    }, [exam, phase]);

    // 응시 안내 문구
    const guideText = useMemo(() => {
        if (!exam) {
            return "";
        }

        // 학부모 : 자녀 응시 현황 안내
        if (isParent) {
            if (exam.attemptStatus === "제출완료") {
                return canViewResult
                    ? "자녀가 시험을 제출했습니다. 아래에서 점수를 확인할 수 있습니다."
                    : "자녀가 시험을 제출했습니다. 점수는 시험 종료 후 공개됩니다.";
            }
            if (exam.attemptStatus === "응시중") {
                return "자녀가 현재 시험에 응시하고 있습니다.";
            }
            if (phase === "예정") {
                return "아직 응시 시작 시간이 아닙니다.";
            }
            if (phase === "종료") {
                return "응시 기간이 종료되었습니다. 자녀가 응시하지 않았습니다.";
            }
            return "자녀가 아직 응시하지 않았습니다.";
        }

        if (exam.attemptStatus === "제출완료") {
            return canViewResult
                ? "시험을 제출했습니다. 아래에서 시험 결과를 확인할 수 있습니다."
                : "시험을 제출했습니다. 결과는 시험 종료 후 확인할 수 있습니다.";
        }
        if (exam.attemptStatus === "응시중") {
            return "진행 중인 응시 기록이 있습니다. 이어서 응시할 수 있습니다.";
        }
        if (phase === "예정") {
            return "아직 응시 시작 시간이 아닙니다. 응시 기간을 확인해 주세요.";
        }
        if (phase === "종료") {
            return "응시 기간이 종료되어 더 이상 응시할 수 없습니다.";
        }
        return "응시 기간 내에 아래 버튼으로 시험을 시작할 수 있습니다. 시작하면 제한시간이 적용됩니다.";
    }, [exam, phase, canViewResult, isParent]);

    // 로딩 화면
    if (!exam) {
        return (<>
            <Jumbotron title={isParent ? "자녀 시험 상세" : "시험 상세"} />
            <p className="text-center text-muted py-5">
                시험 정보를 불러오는 중입니다...
            </p>
        </>);
    }

    return (<>
        <Jumbotron title={isParent ? "자녀 시험 상세" : "시험 상세"} />

        {/* 학부모: 조회중인 자녀 표시 */}
        {isParent && selectedChild && (
            <div className="mt-3 text-muted">
                <strong>{selectedChild.studentName}</strong> 학생의 시험입니다.
            </div>
        )}

        {/* 1. 시험 정보 */}
        <Card className="mt-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h4 className="fw-bold mb-1">
                            {exam.examTitle}
                        </h4>
                        <div className="text-muted">
                            {exam.courseTitle}
                            {exam.accountName && (
                                <span className="ms-2">· {exam.accountName}</span>
                            )}
                        </div>
                    </div>
                    {statusBadge}
                </div>

                <hr />

                <Row className="g-3">
                    <Col xs={12} md={6}>
                        <div className="text-muted small">응시 시작</div>
                        <div className="fw-semibold">{formatDate(exam.examStart)}</div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="text-muted small">응시 마감</div>
                        <div className="fw-semibold">{formatDate(exam.examEnd)}</div>
                    </Col>
                    <Col xs={6} md={4}>
                        <div className="text-muted small">제한시간</div>
                        <div className="fw-semibold">
                            <FaClock className="me-1 text-secondary" />
                            {exam.examLimit ? `${exam.examLimit}분` : "제한 없음"}
                        </div>
                    </Col>
                    {questionCount != null && (
                        <Col xs={6} md={4}>
                            <div className="text-muted small">문항 수</div>
                            <div className="fw-semibold">{questionCount}문항</div>
                        </Col>
                    )}
                    {totalScore != null && (
                        <Col xs={6} md={4}>
                            <div className="text-muted small">총점</div>
                            <div className="fw-semibold">{totalScore}점</div>
                        </Col>
                    )}
                </Row>

                {exam.examInfo && (
                    <>
                        <hr />
                        <div className="text-muted small mb-1">시험 안내</div>
                        <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                            {exam.examInfo}
                        </p>
                    </>
                )}
            </Card.Body>
        </Card>

        {/* 2. 응시 안내 / 자녀 응시 현황 */}
        <Card className="mt-3">
            <Card.Body>
                <div className="fw-bold mb-2">
                    {isParent ? "자녀 응시 현황" : "응시 안내"}
                </div>
                <div className="border rounded p-3 bg-light text-muted">
                    {guideText}
                </div>

                <Row className="g-3 mt-1">
                    {exam.attemptStart && (
                        <Col xs={12} md={6}>
                            <div className="text-muted small">응시 시작일시</div>
                            <div className="fw-semibold">{formatDate(exam.attemptStart)}</div>
                        </Col>
                    )}
                    {exam.attemptSubmit && (
                        <Col xs={12} md={6}>
                            <div className="text-muted small">제출일시</div>
                            <div className="fw-semibold">{formatDate(exam.attemptSubmit)}</div>
                        </Col>
                    )}
                    {/* 점수는 제출완료 + 시험 종료 후에만 공개 */}
                    {canViewResult && exam.attemptScore != null && (
                        <Col xs={6} md={4}>
                            <div className="text-muted small">점수</div>
                            <div className="fw-semibold">{exam.attemptScore}점</div>
                        </Col>
                    )}
                </Row>
            </Card.Body>
        </Card>

        {/* 3. 버튼 */}
        <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">
                {/* 학부모 : 제출완료 + 시험 종료 → 자녀 시험 결과 보기 */}
                {isParent && canViewResult && exam.attemptNo && (
                    <Button
                        variant="success"
                        onClick={() => navigate(`/parent/exam/result/${exam.attemptNo}`)}>
                        <FaClipboardCheck className="me-2" />
                        자녀 시험 결과 보기
                    </Button>
                )}

                {/* 학생 전용 : 응시 관련 버튼 (학부모는 응시 불가) */}
                {!isParent && (
                    <>
                        {/* 미응시 + 응시가능 → 시험 응시 시작 */}
                        {!exam.attemptStatus && phase === "응시가능" && (
                            <Button
                                variant="primary"
                                onClick={startExam}
                                disabled={starting}>
                                <FaPlay className="me-2" />
                                {starting ? "시작하는 중..." : "시험 응시 시작"}
                            </Button>
                        )}

                        {/* 응시중 → 이어서 응시 */}
                        {exam.attemptStatus === "응시중" && (
                            <Button
                                variant="primary"
                                onClick={continueExam}>
                                <FaArrowRotateRight className="me-2" />
                                이어서 응시
                            </Button>
                        )}

                        {/* 제출완료 + 시험 종료 → 결과 보기 */}
                        {canViewResult && (
                            <Button
                                variant="success"
                                onClick={moveResult}>
                                <FaClipboardCheck className="me-2" />
                                시험 결과 보기
                            </Button>
                        )}

                        {/* 제출완료 + 시험 응시가능(진행중) → 결과 대기 안내 */}
                        {exam.attemptStatus === "제출완료" && !canViewResult && (
                            <Button variant="outline-secondary" disabled>
                                결과는 시험 종료 후 공개
                            </Button>
                        )}

                        {/* 예정 → 응시 대기 */}
                        {!exam.attemptStatus && phase === "예정" && (
                            <Button variant="outline-secondary" disabled>
                                응시 대기
                            </Button>
                        )}

                        {/* 미응시 + 종료 → 응시 불가 */}
                        {!exam.attemptStatus && phase === "종료" && (
                            <Button variant="outline-secondary" disabled>
                                응시 기간 종료
                            </Button>
                        )}
                    </>
                )}

                {/* 목록으로 */}
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/student/exam")}>
                    목록으로
                </Button>
            </Col>
        </Row>
    </>);
}
