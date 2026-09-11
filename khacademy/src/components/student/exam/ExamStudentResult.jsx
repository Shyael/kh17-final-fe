import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAtomValue } from "jotai";
import { selectedChildNoState } from "@utils/storage";

// 응시 결과 화면 최대 폭 (가운데 정렬) - 응시 화면과 동일 규칙
const PAGE_MAX_WIDTH = 1280;

// 문제 첨부 이미지 URL (응시 화면 ExamStudentAttempt와 동일 규칙)
const buildAttachUrl = (attachNo) =>
    `${import.meta.env.VITE_SERVER_URL}/api/attach/${attachNo}`;

export default function ExamStudentResult() {
    const { examNo, attemptNo } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    //강사 화면 여부
    const isManage = location.pathname.startsWith("/employee/");

    //학부모 화면 여부 (자녀 시험 결과 조회)
    const isParent = location.pathname.startsWith("/parent/");
    const selectedChildNo = useAtomValue(selectedChildNoState);

    //시험 결과
    const [result, setResult] = useState(null);

    //로딩
    const [loading, setLoading] = useState(true);

    //목록 필터 : all(전체) / wrong(오답만)
    const [filter, setFilter] = useState("all");

    //시험 결과 조회
    const loadResult = useCallback(async () => {
        try {
            let url;
            if (isManage) {
                url = `/attempt/${attemptNo}/result/manage`;
            }
            else if (isParent) {
                url = `/exam/parent/student/${selectedChildNo}/attempt/${attemptNo}/result`;
            }
            else {
                url = `/attempt/${attemptNo}/result`;
            }

            const response = await apiClient.get(url);
            setResult(response.data);
        }
        catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message ?? "시험 결과를 불러오지 못했습니다.");
            //강사 / 학생·학부모 각각 다른 목록으로
            if (isManage) {
                navigate(`/employee/exam/${examNo}/result`, {
                    replace: true
                });
            }
            else {
                navigate("/student/exam", {
                    replace: true
                });
            }
        }
        finally {
            setLoading(false);
        }
    }, [attemptNo, examNo, isManage, isParent, selectedChildNo, navigate]);

    useEffect(() => {
        loadResult();
    }, [loadResult]);

    //Y/N, boolean 공용 판별
    const isTrue = useCallback((value) => {
        return (
            value === true
            || value === "Y"
            || value === "y"
        );
    }, []);

    //날짜
    const formatDate = useCallback((date) => {
        if (!date) {
            return "-";
        }
        return new Date(date)
            .toLocaleString(
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

    //문제 목록 (order 정렬)
    const questionList = useMemo(() => {
        if (!result?.questionList) {
            return [];
        }
        return [...result.questionList].sort(
            (a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0)
        );
    }, [result]);

    //정답 개수
    const correctCount = useMemo(() => {
        return questionList.filter(
            question => isTrue(question.isCorrect)
        ).length;
    }, [questionList, isTrue]);

    //필터 적용된 목록
    const visibleQuestionList = useMemo(() => {
        if (filter === "wrong") {
            return questionList.filter(
                question => !isTrue(question.isCorrect)
            );
        }
        return questionList;
    }, [questionList, filter, isTrue]);

    if (loading) {
        return (<>
            <Jumbotron title="시험 결과" />

            <div className="text-center text-muted py-5">
                시험 결과를 불러오는 중입니다.
            </div>
        </>);
    }

    if (!result) {
        return (<>
            <Jumbotron title="시험 결과" />

            <div className="text-center text-muted py-5">
                시험 결과가 없습니다.
            </div>
        </>);
    }

    const totalCount = questionList.length;

    return (<>
        <Jumbotron title="시험 결과" />

        <div
            className="px-3 px-lg-0 py-4"
            style={{ maxWidth: PAGE_MAX_WIDTH, margin: "0 auto" }}>

            {/* 1. 시험 정보 및 결과 정보 */}
            <Card className="mb-3">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h4 className="fw-bold mb-1">
                                {result.examTitle ?? "시험"}
                            </h4>
                            {(result.courseTitle || result.studentName) && (
                                <div className="text-muted small">
                                    {result.courseTitle}
                                    {result.studentName && (
                                        <span className="ms-2">· {result.studentName}</span>
                                    )}
                                </div>
                            )}
                            <div className="mt-3">
                                <span className="display-6 fw-bold">
                                    {result.attemptScore ?? 0}
                                </span>
                                <span className="fs-5 text-muted">
                                    {" "}/ {result.totalScore ?? 0}점
                                </span>
                            </div>
                        </div>

                        <div className="text-md-end">
                            <div className="mb-2">
                                <span className="text-muted small me-2">정답</span>
                                <span className="fw-bold">
                                    {correctCount} / {totalCount} 문항
                                </span>
                            </div>
                            <div>
                                <span className="text-muted small me-2">제출</span>
                                <span className="fw-bold">
                                    {formatDate(result.attemptSubmit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* 2. 정답 여부 필터 */}
            <div className="d-flex gap-2 mb-3">
                <Button
                    variant={filter === "all" ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => setFilter("all")}>
                    전체 ({totalCount})
                </Button>
                <Button
                    variant={filter === "wrong" ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => setFilter("wrong")}>
                    오답만 ({totalCount - correctCount})
                </Button>
            </div>

            {/* 3. 내가 푼 문제 정보 */}
            {visibleQuestionList.length === 0 ? (
                <Card className="mb-3">
                    <Card.Body className="text-center text-muted py-5">
                        {filter === "wrong"
                            ? "틀린 문항이 없습니다."
                            : "출제된 문제가 없습니다."}
                    </Card.Body>
                </Card>
            ) : (
                visibleQuestionList.map((question) => {

                    const correct = isTrue(question.isCorrect);

                    const attachList =
                        question.fileList
                        ?? question.attachList
                        ?? [];

                    return (
                        <Card key={question.questionNo} className="mb-3">
                            <Card.Body>
                                {/* 정답/오답 뱃지 + 문제 번호 + 배점 */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <Badge bg={correct ? "success" : "danger"}>
                                            {correct ? "정답" : "오답"}
                                        </Badge>
                                        <span className="fw-bold fs-5">
                                            {question.questionOrder}번
                                        </span>
                                    </div>
                                    <Badge bg="light" text="dark">
                                        {question.questionScore}점
                                    </Badge>
                                </div>

                                {/* 문제 지문 */}
                                <p className="fs-6 mb-3" style={{ whiteSpace: "pre-line" }}>
                                    {question.questionContent}
                                </p>

                                {/* 문제 첨부 이미지 */}
                                {attachList.length > 0 && (
                                    <div className="d-flex flex-wrap gap-3 mb-3">
                                        {attachList.map(attach => (
                                            <img
                                                key={attach.attachNo}
                                                src={buildAttachUrl(attach.attachNo)}
                                                alt={attach.attachName ?? "문제 이미지"}
                                                className="border rounded"
                                                style={{
                                                    maxHeight: "260px",
                                                    maxWidth: "100%",
                                                    objectFit: "contain"
                                                }} />
                                        ))}
                                    </div>
                                )}

                                {/* 보기 목록 : 정답(초록) / 내가 고른 오답(빨강) */}
                                <div className="d-flex flex-column gap-2">
                                    {[...(question.optionList ?? [])]
                                        .sort(
                                            (a, b) =>
                                                (a.optionOrder ?? 0) - (b.optionOrder ?? 0)
                                        )
                                        .map((option, optionIndex) => {

                                            const isAnswer = isTrue(option.correct);
                                            const isSelected = isTrue(option.selected);
                                            const isWrongPick = isSelected && !isAnswer;

                                            let optionClass = "border rounded px-3 py-2 d-flex align-items-center gap-2";
                                            if (isAnswer) {
                                                optionClass += " border-success bg-success-subtle";
                                            }
                                            else if (isWrongPick) {
                                                optionClass += " border-danger bg-danger-subtle";
                                            }

                                            return (
                                                <div
                                                    key={option.optionNo}
                                                    className={optionClass}>
                                                    <span className="text-muted">
                                                        {optionIndex + 1}.
                                                    </span>
                                                    <span className="flex-grow-1">
                                                        {option.optionContent}
                                                    </span>
                                                    {isAnswer && (
                                                        <Badge bg="success">정답</Badge>
                                                    )}
                                                    {isWrongPick && (
                                                        <Badge bg="danger">내 선택</Badge>
                                                    )}
                                                    {isSelected && isAnswer && (
                                                        <Badge bg="success">내 선택</Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* 해설 */}
                                {question.questionComment && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <div className="fw-bold small text-muted mb-1">해설</div>
                                        <div style={{ whiteSpace: "pre-line" }}>
                                            {question.questionComment}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    );
                })
            )}

            {/* 4. 목록으로 버튼 */}
            <div className="text-end mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => {
                        if (isManage) {
                            navigate(`/employee/exam/${examNo}/result`);
                        }
                        else {
                            navigate("/student/exam");
                        }
                    }}>
                    목록으로
                </Button>
            </div>
        </div>
    </>);
}
