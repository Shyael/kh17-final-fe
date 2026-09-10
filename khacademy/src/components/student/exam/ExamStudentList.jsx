import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, ButtonGroup, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { toast } from "react-toastify";

// 한 페이지에 보여줄 시험 수
const PAGE_SIZE = 10;

// 응시 상태 필터 (서버 attemptStatus 파라미터)
const ATTEMPT_FILTERS = ["미응시", "응시중", "제출완료"];

export default function ExamStudentList() {

    const navigate = useNavigate();

    // 시험 제목 입력값(draft)
    const [examTitle, setExamTitle] = useState("");

    // 실제 조회에 사용하는 파라미터 (검색/필터/페이지 이동 시에만 변경)
    const [params, setParams] = useState({
        page: 1,
        examTitle: "",
        attemptStatus: "",
        courseNo: null,
    });

    // 강의 필터 목록 (본인 수강 강의)
    const [courseList, setCourseList] = useState([]);

    // 백엔드 PageResponseVO 응답
    const [pageResponse, setPageResponse] = useState({
        list: [],
        totalCount: 0,
        page: 1,
        size: PAGE_SIZE,
        totalPages: 0,
        startBlock: 1,
        endBlock: 0,
        prev: false,
        next: false,
    });

    // 시험 목록 조회
    const loadExamList = useCallback(async () => {
        try {
            const response = await apiClient.get("/exam/student", {
                params: {
                    page: params.page,
                    size: PAGE_SIZE,
                    examTitle: params.examTitle || undefined,
                    attemptStatus: params.attemptStatus || undefined,
                    courseNo: params.courseNo ?? undefined,
                },
            });
            setPageResponse(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("시험 목록을 불러오지 못했습니다.");
            setPageResponse((prev) => ({ ...prev, list: [], totalCount: 0, totalPages: 0 }));
        }
    }, [params]);

    // 강의 필터 목록 조회
    const loadCourseList = useCallback(async () => {
        try {
            const response = await apiClient.get("/academy/student/course");
            setCourseList(response.data ?? []);
        }
        catch (e) {
            console.error("수강 강의 목록 조회 실패", e);
            setCourseList([]);
        }
    }, []);

    useEffect(() => {
        loadExamList();
    }, [loadExamList]);

    useEffect(() => {
        loadCourseList();
    }, [loadCourseList]);

    // 검색 실행 (1페이지로 리셋)
    const handleSearch = useCallback((e) => {
        e?.preventDefault();
        setParams((prev) => ({ ...prev, page: 1, examTitle: examTitle.trim() }));
    }, [examTitle]);

    // 응시 상태 필터 (1페이지로 리셋)
    const handleAttemptFilter = useCallback((attemptStatus) => {
        setParams((prev) => ({ ...prev, page: 1, attemptStatus }));
    }, []);

    // 강의 필터 (1페이지로 리셋)
    const handleCourseFilter = useCallback((value) => {
        setParams((prev) => ({
            ...prev,
            page: 1,
            courseNo: value ? Number(value) : null,
        }));
    }, []);

    // 페이지 이동
    const handlePageChange = useCallback((page) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

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

    // 응시 상태 라벨 (배지/버튼용)
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

    const examList = useMemo(
        () => pageResponse.list ?? [],
        [pageResponse.list]
    );

    // 최근 생성순 정렬 (새로 만든 시험이 위로)
    const sortedList = useMemo(() => {
        return [...examList].sort(
            (a, b) => b.examNo - a.examNo
        );
    }, [examList]);

    // 강의 필터 옵션
    const courseOptions = useMemo(() => {
        return courseList.map((course) => ({
            value: course.courseNo,
            label: course.courseTitle,
        }));
    }, [courseList]);

    return (<>
        <Jumbotron title="내 시험" />

        {/* 1. 강의 선택 + 시험명 검색 */}
        <Row className="g-2 mb-3">
            <Col xs={12} md={4} lg={3}>
                <Form.Select
                    value={params.courseNo ?? ""}
                    onChange={(e) => handleCourseFilter(e.target.value)}>
                    <option value="">전체 강의</option>
                    {courseOptions.map((course) => (
                        <option key={course.value} value={course.value}>
                            {course.label}
                        </option>
                    ))}
                </Form.Select>
            </Col>

            <Col xs={12} md={5} lg={4}>
                <Form onSubmit={handleSearch}>
                    <InputGroup>
                        <Form.Control
                            placeholder="시험명 검색"
                            value={examTitle}
                            onChange={(e) => setExamTitle(e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                            <FaMagnifyingGlass className="me-1" />
                            <span>검색</span>
                        </Button>
                    </InputGroup>
                </Form>
            </Col>
        </Row>

        {/* 2. 응시 상태 필터 (서버) */}
        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3">
            <ButtonGroup>
                <Button
                    variant={params.attemptStatus === "" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => handleAttemptFilter("")}>
                    전체
                </Button>
                {ATTEMPT_FILTERS.map((status) => (
                    <Button
                        key={status}
                        variant={params.attemptStatus === status ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => handleAttemptFilter(status)}>
                        {status}
                    </Button>
                ))}
            </ButtonGroup>
        </div>

        <div className="text-muted mb-2">
            총 {pageResponse.totalCount}개의 시험
        </div>

        {/* 3. 시험 목록 */}
        <Row className="g-3">
            {sortedList.length === 0 ? (
                <Col xs={12}>
                    <p className="text-center text-muted py-4">
                        조회된 시험이 없습니다.
                    </p>
                </Col>
            ) : (
                sortedList.map((exam) => (
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

        {/* 4. 페이지네이션 */}
        <PaginationBar
            page={pageResponse.page}
            totalPages={pageResponse.totalPages}
            startBlock={pageResponse.startBlock}
            endBlock={pageResponse.endBlock}
            prev={pageResponse.prev}
            next={pageResponse.next}
            onChange={handlePageChange}
        />
    </>)
}
