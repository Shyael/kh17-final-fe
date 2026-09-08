import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import { Badge, Button, ButtonGroup, Card, Col, Row, Table } from "react-bootstrap";

//정답률이 이 값 미만이면 "낮은 문항"으로 표시
const LOW_CORRECT_RATE = 30;

// 응시 현황 / 결과 보기 공용 화면
// (버튼 라벨만 다르고 표시 내용은 동일)
export default function ExamResult() {

    const navigate = useNavigate();

    //주소에서 시험 번호 가져오기
    const { examNo } = useParams();

    //시험 기본정보
    const [exam, setExam] = useState(null);

    //응시자 목록
    const [submissionList, setSubmissionList] = useState([]);

    //시험 통계
    const [statistics, setStatistics] = useState({
        totalStudentCount: 0,
        submittedCount: 0,
        inProgressCount: 0,
        notAttemptedCount: 0,
        averageScore: null,
        highestScore: null,
        lowestScore: null,
        questionStatistics: []
    });

    //응시 인원목록 탭 (전체 / 미응시)
    const [attemptTab, setAttemptTab] = useState("전체");

    //시험 정보 + 응시자 + 통계 조회
    const loadResult = useCallback(async () => {
        try {
            const [
                examResponse,
                attemptResponse,
                statisticsResponse
            ] = await Promise.all([
                //시험 기본정보
                apiClient.get(`/exam/${examNo}`),
                //응시자 목록
                apiClient.get(`/exam/${examNo}/attempts`),
                //시험 통계
                apiClient.get(`/exam/${examNo}/statistics`)
            ]);

            //시험 기본정보
            setExam(examResponse.data);

            //현재 화면 JSX에서 사용하는 이름에 맞춰 변환
            setSubmissionList(
                attemptResponse.data.map(item => ({
                    memberNo: item.studentNo,
                    submissionNo: item.attemptNo,
                    memberName: item.studentName,
                    //attempt가 없으면 미응시
                    submitStatus: item.attemptStatus ?? "미응시",
                    score: item.attemptScore,
                    submittedAt: item.attemptSubmit,
                    startedAt: item.attemptStart
                }))
            );

            //통계
            setStatistics(statisticsResponse.data);
        }
        catch (e) {
            console.error(e);
            toast.error("시험 정보를 불러오지 못했습니다.");
        }
    }, [examNo]);

    //최초 1회 조회
    useEffect(() => {
        loadResult();
    }, [loadResult]);

    // 짧은 날짜 출력 (월/일 시:분)
    const formatShortDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString("ko-KR", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // 공개 상태에서 현재시간 기준 세부 단계
    const phase = useMemo(() => {

        if (!exam || exam.examStatus !== "공개") return null;

        const now = new Date();

        if (exam.examStart && now < new Date(exam.examStart)) return "응시 예정";
        if (exam.examEnd && now < new Date(exam.examEnd)) return "진행중";
        return "시험 종료";
    }, [exam]);

    // 종료 이후(또는 마감)면 결과, 그 전이면 진행 현황
    const isResultView = phase === "시험 종료" || exam?.examStatus === "마감";

    // 화면 우측 상단에 표시할 상태 라벨
    const statusLabel = phase ?? exam?.examStatus ?? "-";
    const statusBg = statusLabel === "진행중"
        ? "success"
        : statusLabel === "응시 예정"
            ? "info"
            : "secondary";

    // 문항 수
    const questionCount = statistics.questionStatistics?.length
        ?? exam?.questionList?.length
        ?? 0;

    // 정답률이 낮은 문항 수
    const lowRateCount = useMemo(() => (
        (statistics.questionStatistics ?? []).filter(
            question =>
                question.submittedCount > 0 &&
                question.correctRate < LOW_CORRECT_RATE
        ).length
    ), [statistics.questionStatistics]);

    // 탭에 따라 걸러낸 응시자 목록
    const filteredSubmissionList = useMemo(() => {
        if (attemptTab === "미응시") {
            return submissionList.filter(item => item.submitStatus === "미응시");
        }
        return submissionList;
    }, [submissionList, attemptTab]);

    // 응시자 한 명의 상태 분류
    const classify = (item) => {
        const isNotAttempted = item.submitStatus === "미응시";
        const isInProgress = !isNotAttempted
            && (item.submitStatus === "응시중"
                || item.submitStatus === "진행중"
                || !item.submittedAt);
        return {
            isNotAttempted,
            isInProgress,
            isSubmitted: !isNotAttempted && !isInProgress
        };
    };
    
    return (<>
        <Jumbotron title={isResultView ? "시험 결과" : "응시 현황"} />

        {/* 1. 시험 정보 */}
        <Row className="mt-4">
            <Col>
                <Card>
                    <Card.Body>
                        <div className="text-muted small mb-1">
                            {exam?.courseTitle ?? "-"}
                            <span className="mx-1">·</span>
                            {questionCount}문항
                            <span className="mx-1">·</span>
                            {formatShortDate(exam?.examStart)} ~ {formatShortDate(exam?.examEnd)}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">{exam?.examTitle ?? "-"}</h4>
                            <Badge bg={statusBg} className="fs-6">{statusLabel}</Badge>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* 2. 시험 응시 정보 */}
        <Row className="mt-3 g-3">
            <Col xs={6} lg={3}>
                <Card body>
                    <div className="text-muted small">응시</div>
                    <div className="fs-3 fw-bold">
                        {statistics.submittedCount ?? 0}
                        <span className="fs-6 text-muted"> / {statistics.totalStudentCount ?? 0}</span>
                    </div>
                </Card>
            </Col>
            <Col xs={6} lg={3}>
                <Card body>
                    <div className="text-muted small">평균</div>
                    <div className="fs-3 fw-bold">
                        {statistics.averageScore != null ? statistics.averageScore.toFixed(1) : "-"}
                        <span className="fs-6 text-muted">점</span>
                    </div>
                </Card>
            </Col>
            <Col xs={6} lg={3}>
                <Card body>
                    <div className="text-muted small">최고</div>
                    <div className="fs-3 fw-bold">
                        {statistics.highestScore ?? "-"}
                    </div>
                </Card>
            </Col>
            <Col xs={6} lg={3}>
                <Card body>
                    <div className="text-muted small">최저</div>
                    <div className="fs-3 fw-bold">
                        {statistics.lowestScore ?? "-"}
                    </div>
                </Card>
            </Col>
        </Row>

        <Row className="mt-4 g-4">

            {/* 3. 문항별 정답률 */}
            <Col lg={5}>
                <Card className="h-100">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">문항별 정답률</h5>
                            {lowRateCount > 0 && (
                                <span className="text-danger small">
                                    정답률 {LOW_CORRECT_RATE}% 미만 {lowRateCount}문항
                                </span>
                            )}
                        </div>

                        {(statistics.questionStatistics ?? []).length === 0 && (
                            <div className="text-muted text-center py-4">
                                집계된 문항 통계가 없습니다.
                            </div>
                        )}

                        {(statistics.questionStatistics ?? []).map(question => {
                            const isLow = 
                                question.submittedCount > 0 &&
                                question.correctRate < LOW_CORRECT_RATE;
                            return (
                                <div
                                    key={question.questionNo}
                                    className="d-flex align-items-center mb-2">
                                    <span
                                        className={"text-nowrap " + (isLow ? "text-danger fw-bold" : "")}
                                        style={{ width: "36px" }}>
                                        {question.questionOrder}번
                                    </span>
                                    <div
                                        className="flex-grow-1 mx-2 rounded"
                                        style={{ height: "12px", background: "#e9ecef" }}>
                                        <div
                                            className="rounded"
                                            style={{
                                                width: `${Math.min(question.correctRate ?? 0, 100)}%`,
                                                height: "100%",
                                                background: isLow ? "#dc3545" : "#0d6efd"
                                            }} />
                                    </div>
                                    <span
                                        className={"text-end " + (isLow ? "text-danger fw-bold" : "text-muted")}
                                        style={{ width: "44px" }}>
                                        {Math.round(question.correctRate ?? 0)}%
                                    </span>
                                </div>
                            );
                        })}

                        {lowRateCount > 0 && (
                            <div className="mt-3 p-2 rounded bg-danger-subtle text-danger small">
                               정답률이 지나치게 낮은 문항은 정답 설정 오류 여부를 확인해 보세요.
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            {/* 4. 응시 인원목록 */}
            <Col lg={7}>
                <Card className="h-100">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">학생별 결과</h5>
                            <ButtonGroup size="sm">
                                <Button
                                    variant={attemptTab === "전체" ? "secondary" : "outline-secondary"}
                                    onClick={() => setAttemptTab("전체")}>
                                    전체
                                </Button>
                                <Button
                                    variant={attemptTab === "미응시" ? "secondary" : "outline-secondary"}
                                    onClick={() => setAttemptTab("미응시")}>
                                    미응시
                                </Button>
                            </ButtonGroup>
                        </div>

                        <Table responsive hover className="align-middle text-nowrap mb-0">
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>점수</th>
                                    <th>제출시각</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissionList.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-4">
                                            표시할 응시자가 없습니다.
                                        </td>
                                    </tr>
                                )}
                                {filteredSubmissionList.map((item, index) => {
                                    const { isNotAttempted, isInProgress } = classify(item);
                                    return (
                                        <tr key={item.submissionNo ?? item.memberNo ?? index}>
                                            <td>{item.memberName ?? "-"}</td>

                                            <td>
                                                {isNotAttempted || isInProgress
                                                    ? <span className="text-muted">
                                                        {isInProgress ? "응시중" : "-"}
                                                    </span>
                                                    : <span className="fw-bold">{item.score ?? "-"}</span>}
                                            </td>

                                            <td>
                                                {isNotAttempted
                                                    ? <Badge bg="warning" text="dark">미응시</Badge>
                                                    : isInProgress
                                                        ? <span className="text-muted">
                                                            {item.startedAt ? `${formatShortDate(item.startedAt)} 진행` : "진행중"}
                                                        </span>
                                                        : formatShortDate(item.submittedAt)}
                                            </td>

                                            <td className="text-end">
                                                {!isNotAttempted && !isInProgress && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0"
                                                        onClick={() =>
                                                            //TODO: 학생 결과 상세 페이지 경로 확정되면 수정
                                                            navigate(`/employee/exam/${examNo}/attempt/${item.submissionNo}`)}>
                                                        상세
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* 6 · 7. 하단 버튼 */}
        <Row className="mt-4 mb-4">
            <Col className="text-end">
                <Button variant="outline-secondary" as={Link} to={`/employee/exam`}>
                    목록으로
                </Button>
            </Col>
        </Row>
    </>);
}
