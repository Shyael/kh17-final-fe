import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import PaginationBar from "@templates/PaginationBar";

const PAGE_SIZE = 10;
const PHASE_FILTERS = ["제출가능", "마감"];

export default function AssignmentList() {
    const navigate = useNavigate();

    // 과제 제목 입력값(draft)
    const [assignmentTitle, setAssignmentTitle] = useState("");
    // 실제 조회에 사용하는 파라미터 (검색/필터/페이지 이동 시에만 변경)
    const [params, setParams] = useState({
        page: 1,
        assignmentTitle: "",
        assignmentPhase: "",
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

    // 내가 등록한 과제 목록 조회
    const loadAssignmentList = useCallback(async () => {
        try {
            const response = await apiClient.get("/assignment/manage", {
                params: {
                    page: params.page,
                    size: PAGE_SIZE,
                    assignmentTitle: params.assignmentTitle || undefined,
                    assignmentPhase: params.assignmentPhase || undefined,
                    courseNo: params.courseNo ?? undefined,
                },
            });
            setPageResponse(response.data);
        }
        catch (err) {
            console.error(err);
        }
    }, [params]);

    // 강의 필터 목록 조회
    const loadCourseList = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/course/manage");
            setCourseList(response.data ?? []);
        }
        catch (err) {
            console.error("강의 목록 조회 실패", err);
            setCourseList([]);
        }
    }, []);

    useEffect(() => {
        loadAssignmentList();
    }, [loadAssignmentList]);

    useEffect(() => {
        loadCourseList();
    }, [loadCourseList]);

    // 검색 실행 (1페이지로 리셋)
    const handleSearch = useCallback((e) => {
        e?.preventDefault();
        setParams((prev) => ({
            ...prev,
            page: 1,
            assignmentTitle: assignmentTitle.trim(),
        }));
    }, [assignmentTitle]);

    // 상태 필터 (1페이지로 리셋)
    const handlePhaseFilter = useCallback((assignmentPhase) => {
        setParams((prev) => ({ ...prev, page: 1, assignmentPhase }));
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

    const assignmentList = pageResponse.list ?? [];

    // 마감 여부 배지 (assignmentPhase 기준)
    const phaseBadge = (phase) => {
        switch (phase) {
            case "제출가능":
                return <Badge bg="info">제출가능</Badge>;

            case "마감":
                return <Badge bg="dark">마감</Badge>;

            default:
                return <Badge bg="secondary">{phase}</Badge>;
        }
    };

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h3 className="mb-0">
                    과제 관리
                </h3>

                <Button
                    variant="primary"
                    className="flex-shrink-0"
                    onClick={() => navigate("/employee/assignment/add")}
                >
                    <FaPlus className="me-1" />
                    과제 등록
                </Button>
            </div>

            <Row className="g-2 mb-3">
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
                                placeholder="과제명 검색"
                                value={assignmentTitle}
                                onChange={(e) => setAssignmentTitle(e.target.value)}
                            />
                            <Button type="submit" variant="primary">
                                <FaMagnifyingGlass className="me-1" />
                                <span>검색</span>
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            <div className="mb-3">
                <Button
                    size="sm"
                    className="me-2 mb-2"
                    variant={params.assignmentPhase === "" ? "primary" : "outline-secondary"}
                    onClick={() => handlePhaseFilter("")}>
                    전체
                </Button>
                {PHASE_FILTERS.map((phase) => (
                    <Button
                        key={phase}
                        size="sm"
                        className="me-2 mb-2"
                        variant={params.assignmentPhase === phase ? "primary" : "outline-secondary"}
                        onClick={() => handlePhaseFilter(phase)}>
                        {phase}
                    </Button>
                ))}
            </div>

            <div className="text-muted mb-2">
                총 {pageResponse.totalCount}개의 과제
            </div>

            <Table
                bordered
                hover
                responsive
                className="align-middle text-center"
                style={{ minWidth: 720 }}
            >
                <thead>
                    <tr className="text-nowrap">
                        <th>번호</th>
                        <th>강의명</th>
                        <th>과제명</th>
                        <th>상태</th>
                        <th>마감일</th>
                        <th>등록일</th>
                        <th>관리</th>
                    </tr>
                </thead>

                <tbody>

                    {assignmentList.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-muted py-4">
                                조회된 과제가 없습니다.
                            </td>
                        </tr>
                    )}

                    {assignmentList.map((assignment) => (
                        <tr key={assignment.assignmentNo}>

                            <td>
                                {assignment.assignmentNo}
                            </td>

                            <td>
                                {assignment.courseTitle}
                            </td>

                            <td className="text-start">
                                {assignment.assignmentTitle}
                            </td>

                            <td>
                                {phaseBadge(assignment.assignmentPhase)}
                            </td>

                            <td className="text-nowrap">
                                {assignment.assignmentDueDate
                                    ? new Date(
                                        assignment.assignmentDueDate
                                    ).toLocaleString()
                                    : "-"
                                }
                            </td>

                            <td className="text-nowrap">
                                {assignment.assignmentWtime
                                    ? new Date(
                                        assignment.assignmentWtime
                                    ).toLocaleDateString()
                                    : "-"
                                }
                            </td>

                            <td className="text-nowrap">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                        navigate(
                                            `/employee/assignment/${assignment.assignmentNo}`
                                        )
                                    }>
                                    상세
                                </Button>
                            </td>

                        </tr>
                    ))}
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
        </>
    );
}
