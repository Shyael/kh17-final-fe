import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, ButtonGroup, Card, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";

// 한 번에 보여줄 시험 수
const PAGE_SIZE = 3;

// 상태 필터 목록
const FILTERS = [
    { key: "전체", label: "전체" },
    { key: "미응시", label: "미응시 보기" },
    { key: "응시중", label: "응시중 보기" },
    { key: "제출완료", label: "제출완료 보기" },
];

export default function ExamStudentList() {

    const navigate = useNavigate();

    // 학생 시험 목록
    const [examList, setExamList] = useState([]);

    // 선택된 상태 필터
    const [filter, setFilter] = useState("전체");

    // 선택된 강의 필터 (courseNo, "전체"면 전체)
    const [courseFilter, setCourseFilter] = useState("전체");

    // 더보기로 노출된 개수
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // 시험 목록 조회
    const loadExamList = useCallback(async () => {
        try {
            const response = await apiClient.get("/exam/student");
            setExamList(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("시험 목록을 불러오지 못했습니다.");
        }
    }, []);

    // 최초 1회 조회
    useEffect(() => {
        loadExamList();
        setVisibleCount(PAGE_SIZE);
    }, [loadExamList]);

    // 날짜 출력
    const formatDate = (date) => {

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
    };

    // 응시기간(시작 ~ 종료) 출력
    const formatDateRange = (start, end) => (
        <>
            {formatDate(start)}
            <span className="text-muted"> ~ </span>
            {formatDate(end)}
        </>
    );

    // 시험 현재 상태 (시간 기준)
    const getExamPhase = useCallback((exam) => {
        const now = new Date();
        const start = exam.examStart ? new Date(exam.examStart) : null;
        const end = exam.examEnd ? new Date(exam.examEnd) : null;

        // 마감 처리된 시험
        if (exam.examStatus === "마감") {
            return "종료";
        }

        if (start && now < start) {
            return "예정";
        }

        if (end && now >= end) {
            return "종료";
        }

        return "응시가능";
    }, []);

    // 응시 상태 라벨 (필터 매칭용)
    const getAttemptLabel = useCallback((exam) => {
        if (exam.attemptStatus === "제출완료") {
            return "제출완료";
        }
        if (exam.attemptStatus === "응시중") {
            return "응시중";
        }

        const phase = getExamPhase(exam);

        if (phase === "예정") {
            return "응시예정";
        }
        if (phase === "종료") {
            return "종료";
        }
        return "미응시";
    }, [getExamPhase]);

    // 응시 상태 배지
    const submitStatusBadge = (exam) => {
        const label = getAttemptLabel(exam);

        switch (label) {
            case "제출완료":
                return <Badge bg="success">제출완료</Badge>;
            case "응시중":
                return <Badge bg="primary">응시중</Badge>;
            case "응시예정":
                return <Badge bg="info">응시예정</Badge>;
            case "종료":
                return <Badge bg="secondary">종료</Badge>;
            default:
                return <Badge bg="danger">미응시</Badge>;
        }
    };

    // 상태별 액션 버튼
    const actionButton = (exam) => {
        const label = getAttemptLabel(exam);
        const detail = `/student/exam/${exam.examNo}`;

        switch (label) {
            case "제출완료":
                return (
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => navigate(detail)}>
                        결과보기
                    </Button>
                );
            case "응시중":
                return (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(detail)}>
                        이어서 응시
                    </Button>
                );
            case "응시예정":
                return (
                    <Button variant="outline-secondary" size="sm" disabled>
                        응시 예정
                    </Button>
                );
            case "종료":
                return (
                    <Button variant="outline-secondary" size="sm" disabled>
                        기간 종료
                    </Button>
                );
            default:
                return (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(detail)}>
                        응시하기
                    </Button>
                );
        }
    };

    // 최근 생성순 정렬 (새로 만든 시험이 위로)
    const sortedList = useMemo(() => {
        return [...examList].sort(
            (a, b) => b.examNo - a.examNo
        );
    }, [examList]);

    // 강의 목록 (중복 제거)
    const courseOptions = useMemo(() => {
        const map = new Map();
        examList.forEach((exam) => {
            const key = exam.courseNo ?? exam.courseTitle;
            if (key != null && !map.has(key)) {
                map.set(key, exam.courseTitle);
            }
        });
        return Array.from(map, ([value, label]) => ({ value, label }));
    }, [examList]);

    // 필터 적용된 목록 (강의 + 상태)
    const filteredList = useMemo(() => {
        return sortedList.filter((exam) => {
            if (courseFilter !== "전체") {
                const key = exam.courseNo ?? exam.courseTitle;
                if (String(key) !== String(courseFilter)) {
                    return false;
                }
            }
            if (filter !== "전체" && getAttemptLabel(exam) !== filter) {
                return false;
            }
            return true;
        });
    }, [sortedList, filter, courseFilter, getAttemptLabel]);

    // 실제 화면에 노출되는 목록
    const visibleList = filteredList.slice(0, visibleCount);

    // 필터 변경 시 더보기 초기화
    const changeFilter = (key) => {
        setFilter(key);
        setVisibleCount(PAGE_SIZE);
    };

    // 강의 필터 변경 시 더보기 초기화
    const changeCourse = (e) => {
        setCourseFilter(e.target.value);
        setVisibleCount(PAGE_SIZE);
    };

    return (<>
        <Jumbotron title="내 시험" />

        {/* 1. 강의 선택 + 시험 상태 버튼 */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <Form.Select
                size="sm"
                style={{ width: "auto" }}
                value={courseFilter}
                onChange={changeCourse}>
                <option value="전체">전체 강의</option>
                {courseOptions.map((course) => (
                    <option key={course.value} value={course.value}>
                        {course.label}
                    </option>
                ))}
            </Form.Select>

            <ButtonGroup>
                {FILTERS.map((item) => (
                    <Button
                        key={item.key}
                        variant={
                            filter === item.key
                                ? "primary"
                                : "outline-primary"
                        }
                        size="sm"
                        onClick={() => changeFilter(item.key)}>
                        {item.label}
                    </Button>
                ))}
            </ButtonGroup>
        </div>

        {/* 2. 시험 목록 */}
        <Row className="g-3">
            {visibleList.length === 0 ? (
                <Col xs={12}>
                    <p className="text-center text-muted py-4">
                        등록된 시험이 없습니다.
                    </p>
                </Col>
            ) : (
                visibleList.map((exam) => (
                    <Col xs={12} key={exam.examNo}>
                        <Card>
                            <Card.Body className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Card.Title className="mb-1">
                                        {exam.examTitle}
                                    </Card.Title>

                                    <Card.Subtitle className="text-muted mb-3">
                                        {exam.courseTitle} {exam.accountName}
                                    </Card.Subtitle>

                                    <div className="text-muted small">
                                        {formatDateRange(exam.examStart, exam.examEnd)}
                                    </div>

                                    <div className="text-muted small">
                                        제한시간 : {exam.examLimit ? `${exam.examLimit}분` : "제한 없음"}
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-end gap-2">
                                    {submitStatusBadge(exam)}
                                    {actionButton(exam)}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))
            )}
        </Row>

        {/* 3. 더보기 버튼 */}
        {visibleCount < filteredList.length && (
            <div className="text-center mt-4">
                <Button
                    variant="light"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                    더보기 ∨
                </Button>
            </div>
        )}
    </>)
}
