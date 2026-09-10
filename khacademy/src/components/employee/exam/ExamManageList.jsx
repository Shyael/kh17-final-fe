import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";

const PAGE_SIZE = 10;

// 시험 상태 필터 (서버 examStatus 파라미터)
const STATUS_FILTERS = ["작성중", "공개", "마감"];

export default function ExamManageList() {
    const navigate = useNavigate();

    // 시험명 입력값(draft)
    const [examTitle, setExamTitle] = useState("");

    // 실제 조회에 사용하는 파라미터 (검색/필터/페이지 이동 시에만 변경)
    const [params, setParams] = useState({
        page: 1,
        examTitle: "",
        examStatus: "",
        courseNo: null,
    });

    // 강의 필터 목록
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

    //시험 목록 조회
    const loadExamList = useCallback(async () => {
        try {
            const response = await apiClient.get("/exam/manage", {
                params: {
                    page: params.page,
                    size: PAGE_SIZE,
                    examTitle: params.examTitle || undefined,
                    examStatus: params.examStatus || undefined,
                    courseNo: params.courseNo ?? undefined,
                },
            });
            setPageResponse(response.data);
        }
        catch (e) {
            console.error(e);
            setPageResponse((prev) => ({ ...prev, list: [], totalCount: 0, totalPages: 0 }));
        }
    }, [params]);

    //강의 필터 목록 조회
    const loadCourseList = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/course/manage");
            setCourseList(response.data ?? []);
        }
        catch (e) {
            console.error("강의 목록 조회 실패", e);
            setCourseList([]);
        }
    }, []);

    useEffect(() => {
        loadExamList();
    }, [loadExamList]);

    useEffect(() => {
        loadCourseList();
    }, [loadCourseList]);

    //검색 실행 (1페이지로 리셋)
    const handleSearch = useCallback((e) => {
        e?.preventDefault();
        setParams((prev) => ({ ...prev, page: 1, examTitle: examTitle.trim() }));
    }, [examTitle]);

    //시험 상태 필터 (1페이지로 리셋)
    const handleStatusFilter = useCallback((examStatus) => {
        setParams((prev) => ({ ...prev, page: 1, examStatus }));
    }, []);

    //강의 필터 (1페이지로 리셋)
    const handleCourseFilter = useCallback((value) => {
        setParams((prev) => ({
            ...prev,
            page: 1,
            courseNo: value ? Number(value) : null,
        }));
    }, []);

    //페이지 이동
    const handlePageChange = useCallback((page) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

    // 공개 상태에서 현재시간 기준 세부 단계 계산
    // 현재 < examStart              → "응시 예정"
    // examStart <= 현재 < examEnd   → "진행중"
    // 현재 >= examEnd               → "시험 종료"
    const getOpenPhase = (start, end) => {

        const now = new Date();

        if (start && now < new Date(start)) return "응시 예정";
        if (end && now < new Date(end)) return "진행중";
        return "시험 종료";
    };

   // 시험 상태 Badge
    const getStatusBadge = (exam) => {

        switch (exam.examStatus) {

            case "작성중":
                return (
                    <Badge bg="secondary">작성중</Badge>
                );

            case "공개": {

                const phase = getOpenPhase(exam.examStart, exam.examEnd);

                const bg = phase === "응시 예정"
                    ? "info"
                    : phase === "진행중"
                        ? "success"
                        : "dark";

                return (
                    <Badge bg={bg}>{phase}</Badge>
                );
            }

            case "마감":
                return (
                    <Badge bg="dark">마감</Badge>
                );

            default:
                return (
                    <Badge bg="secondary">{exam.examStatus}</Badge>
                );
        }
    };

    // 상태에 따른 맨 오른쪽 관리 버튼
    const renderManageButton = (exam) => {

        // 작성중 → 수정 (링크 구현 완료)
        if (exam.examStatus === "작성중") {
            return (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/employee/exam/${exam.examNo}`)}
                >
                    수정
                </Button>
            );
        }

        // 공개 → 시험 종료면 결과 보기, 그 외(응시 예정/진행중)는 응시 현황
        if (exam.examStatus === "공개") {

            const phase = getOpenPhase(exam.examStart, exam.examEnd);

            const label = phase === "시험 종료"
                ? "결과 보기"
                : "응시 현황";

            return (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/employee/exam/${exam.examNo}/result`)}
                >
                    {label}
                </Button>
            );
        }

        // 마감 → 결과 보기
        return (
            <Button
                size="sm"
                variant="outline-primary"
                onClick={() => navigate(`/employee/exam/${exam.examNo}/result`)}
            >
                결과 보기
            </Button>
        );
    };

    // 날짜 출력
    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // 응시기간(시작~종료) 출력
    const formatDateRange = (start, end) => (
        <>
            {formatDate(start)}
            <span className="text-muted"> ~ </span>
            {formatDate(end)}
        </>
    );

    const examList = pageResponse.list ?? [];

    return (<>
        <Jumbotron title="시험정보 리스트" />

        <Row className="mt-4">
            <Col className="text-end">
                <Button as={Link} to={`/employee/exam/add`} variant="success" className="ms-2">
                    <FaPlus className="me-2" />
                    <span>신규시험생성</span>
                </Button>
            </Col>
        </Row>

        <Row className="mt-4 g-2">
            <Col xs={12} md={4} lg={3}>
                <Form.Select
                    value={params.courseNo ?? ""}
                    onChange={(e) => handleCourseFilter(e.target.value)}>
                    <option value="">전체 강의</option>
                    {courseList.map((course) => (
                        <option key={course.courseNo} value={course.courseNo}>
                            {course.courseTitle}
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

        <div className="mt-3">
            <Button
                size="sm"
                className="me-2 mb-2"
                variant={params.examStatus === "" ? "primary" : "outline-secondary"}
                onClick={() => handleStatusFilter("")}>
                전체
            </Button>
            {STATUS_FILTERS.map((status) => (
                <Button
                    key={status}
                    size="sm"
                    className="me-2 mb-2"
                    variant={params.examStatus === status ? "primary" : "outline-secondary"}
                    onClick={() => handleStatusFilter(status)}>
                    {status}
                </Button>
            ))}
        </div>

        <div className="text-muted mb-2">
            총 {pageResponse.totalCount}개의 시험
        </div>

        <Row>
            <Col>
                <Table responsive striped hover className="text-nowrap">
                    <thead>
                        <tr>
                            <th className="d-none d-md-table-cell">번호</th>
                            <th>강의명</th>
                            <th>시험명</th>
                            <th>응시기간</th>
                            <th className="d-none d-md-table-cell">제한시간</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examList.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted py-4">
                                    조회된 시험이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            examList.map(exam => (
                                <tr key={exam.examNo}>
                                    <td className="d-none d-md-table-cell">{exam.examNo}</td>
                                    <td>{exam.courseTitle}</td>
                                    <td className="text-start">{exam.examTitle}</td>
                                    <td>{formatDateRange(exam.examStart, exam.examEnd)}</td>
                                    <td className="d-none d-md-table-cell">
                                        {exam.examLimit ? `${exam.examLimit}분` : "제한 없음"}
                                    </td>
                                    <td>{getStatusBadge(exam)}</td>
                                    <td>{renderManageButton(exam)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>

                <PaginationBar
                    page={pageResponse.page}
                    totalPages={pageResponse.totalPages}
                    startBlock={pageResponse.startBlock}
                    endBlock={pageResponse.endBlock}
                    prev={pageResponse.prev}
                    next={pageResponse.next}
                    onChange={handlePageChange}
                />
            </Col>
        </Row>

    </>)
}
