import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, ButtonGroup, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useAtomValue } from "jotai";
import { isParentState, selectedChildState, selectedChildNoState } from "@utils/storage";

// 한 페이지에 보여줄 과제 수
const PAGE_SIZE = 10;

// 제출 상태 필터 (서버 submitStatus 파라미터)
const SUBMIT_FILTERS = ["미제출", "제출완료", "채점완료"];

// 마감 여부 필터 (서버 assignmentPhase 파라미터)
const PHASE_FILTERS = ["제출가능", "마감"];

export default function StudentAssignmentList() {

    const navigate = useNavigate();

    // 학부모 여부 / 선택된 자녀
    const isParent = useAtomValue(isParentState);
    const selectedChild = useAtomValue(selectedChildState);
    const selectedChildNo = useAtomValue(selectedChildNoState);

    // 과제 제목 입력값(draft)
    const [assignmentTitle, setAssignmentTitle] = useState("");

    // 실제 조회에 사용하는 파라미터 (검색/필터/페이지 이동 시에만 변경)
    const [params, setParams] = useState({
        page: 1,
        assignmentTitle: "",
        submitStatus: "",
        assignmentPhase: "",
        courseNo: null,
    });

    // 강의 필터 목록 (학생 본인 수강 강의)
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

    //내 과제 목록 조회 (학생 본인 / 학부모는 선택한 자녀 기준)
    const loadAssignmentList = useCallback(async () => {
        try {
            const query = {
                params: {
                    page: params.page,
                    size: PAGE_SIZE,
                    assignmentTitle: params.assignmentTitle || undefined,
                    submitStatus: params.submitStatus || undefined,
                    assignmentPhase: params.assignmentPhase || undefined,
                    courseNo: params.courseNo ?? undefined,
                },
            };

            let response;

            if (isParent) {
                // 자녀 선택 전이면 목록 비우고 대기
                if (selectedChildNo == null) {
                    setPageResponse((prev) => ({ ...prev, list: [], totalCount: 0, totalPages: 0 }));
                    return;
                }

                response = await apiClient.get(
                    `/academy/assignment/parent/student/${selectedChildNo}`,
                    query
                );
            }
            else {
                response = await apiClient.get("/academy/assignment/student", query);
            }

            setPageResponse(response.data);
        }
        catch (err) {
            console.error("과제 목록 조회 실패", err);
            setPageResponse((prev) => ({ ...prev, list: [], totalCount: 0, totalPages: 0 }));
        }
    }, [isParent, selectedChildNo, params]);

    // 강의 필터 목록 조회 (학생: 본인 수강 / 학부모: 선택한 자녀 수강)
    const loadCourseList = useCallback(async () => {
        try {
            let response;

            if (isParent) {
                if (selectedChildNo == null) {
                    setCourseList([]);
                    return;
                }
                response = await apiClient.get(
                    `/academy/student/parent/${selectedChildNo}/course`
                );
            }
            else {
                response = await apiClient.get("/academy/student/course");
            }

            setCourseList(response.data ?? []);
        }
        catch (err) {
            console.error("수강 강의 목록 조회 실패", err);
            setCourseList([]);
        }
    }, [isParent, selectedChildNo]);

    // 화면 진입 시 / 자녀 변경 시 / 파라미터 변경 시 조회
    useEffect(() => {
        loadAssignmentList();
    }, [loadAssignmentList]);

    useEffect(() => {
        loadCourseList();
    }, [loadCourseList]);

    // 자녀가 바뀌면 검색조건 초기화
    useEffect(() => {
        setAssignmentTitle("");
        setParams({
            page: 1,
            assignmentTitle: "",
            submitStatus: "",
            assignmentPhase: "",
            courseNo: null,
        });
    }, [selectedChildNo]);

    // 검색 실행 (1페이지로 리셋)
    const handleSearch = useCallback((e) => {
        e?.preventDefault();
        setParams((prev) => ({
            ...prev,
            page: 1,
            assignmentTitle: assignmentTitle.trim(),
        }));
    }, [assignmentTitle]);

    // 제출 상태 필터 (1페이지로 리셋)
    const handleSubmitFilter = useCallback((submitStatus) => {
        setParams((prev) => ({ ...prev, page: 1, submitStatus }));
    }, []);

    // 마감 여부 필터 (1페이지로 리셋)
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

    // 제출 상태 확인
    const getSubmitStatus = (assignment) => {
        if (assignment.submitNo == null) {
            return "미제출";
        }
        if (assignment.submitComment == null) {
            return "제출완료";
        }
        return "채점완료";
    };

    // 제출 상태 배지
    const submitStatusBadge = (status) => {
        switch (status) {
            case "채점완료":
                return <Badge bg="success">채점완료</Badge>;
            case "제출완료":
                return <Badge bg="secondary">제출완료</Badge>;
            default:
                return <Badge bg="danger">미제출</Badge>;
        }
    };

    // 마감 여부 뱃지 (assignmentPhase 기준)
    const phaseBadge = (assignmentPhase) => {
        if (assignmentPhase === "마감") {
            return <Badge bg="dark">마감</Badge>;
        }
        return <Badge bg="info">제출가능</Badge>;
    };

    // 상태별 액션 버튼
    const actionButton = (assignment, status) => {
        const to = `/student/assignment/${assignment.assignmentNo}/submit`;
        const detail = `/student/assignment/${assignment.assignmentNo}/submit/${assignment.submitNo}`;
        const canSubmit = assignment.assignmentPhase === "제출가능";

        // 학부모는 제출/수정 불가 → 자녀 과제 상세만 조회
        if (isParent) {
            return (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                        navigate(
                            `/parent/assignment/${assignment.assignmentNo}`
                        )
                    }>
                    과제 상세
                </Button>
            );
        }

        switch (status) {
            case "채점완료":
                return (
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => navigate(detail)}>
                        피드백보기
                    </Button>
                );
            case "제출완료":
                return (
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(detail)}>
                        제출보기
                    </Button>
                );
            default:
                return (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={!canSubmit}
                        onClick={() => navigate(to)}>
                        {canSubmit ? "제출하기" : "마감됨"}
                    </Button>
                );
        }
    };

    // 마감일 표시 (예: 8/26 까지)
    const formatDueDate = (value) => {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        return `${date.getMonth() + 1}/${date.getDate()} 까지`;
    };

    const assignmentList = useMemo(
        () => pageResponse.list ?? [],
        [pageResponse.list]
    );

    // 최근 생성순 정렬 (새로 만든 과제가 위로)
    const sortedList = useMemo(() => {
        return [...assignmentList].sort(
            (a, b) => b.assignmentNo - a.assignmentNo
        );
    }, [assignmentList]);

    // 강의 필터 옵션 (학생: 본인 수강 / 학부모: 자녀 수강)
    const courseOptions = useMemo(() => {
        return courseList.map((course) => ({
            value: course.courseNo,
            label: course.courseTitle,
        }));
    }, [courseList]);

    return (<>
        <Jumbotron title={isParent ? "자녀 과제" : "내 과제"} />

        {/* 학부모: 현재 조회중인 자녀 표시 */}
        {isParent && (
            <div className="mb-3">
                {selectedChild ? (
                    <span className="text-muted">
                        <strong>{selectedChild.studentName}</strong> 학생의 과제를 보고 있습니다.
                        <span className="ms-1">(메뉴에서 자녀 변경)</span>
                    </span>
                ) : (
                    <span className="text-danger">
                        조회할 자녀가 없습니다.
                    </span>
                )}
            </div>
        )}

        {/* 1. 강의 선택 + 과제명 검색 */}
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

        {/* 2. 제출 상태 / 마감 여부 필터 (서버) */}
        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3">
            <ButtonGroup>
                <Button
                    variant={params.submitStatus === "" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => handleSubmitFilter("")}>
                    전체
                </Button>
                {SUBMIT_FILTERS.map((status) => (
                    <Button
                        key={status}
                        variant={params.submitStatus === status ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => handleSubmitFilter(status)}>
                        {status}
                    </Button>
                ))}
            </ButtonGroup>

            <ButtonGroup>
                <Button
                    variant={params.assignmentPhase === "" ? "secondary" : "outline-secondary"}
                    size="sm"
                    onClick={() => handlePhaseFilter("")}>
                    전체
                </Button>
                {PHASE_FILTERS.map((phase) => (
                    <Button
                        key={phase}
                        variant={params.assignmentPhase === phase ? "secondary" : "outline-secondary"}
                        size="sm"
                        onClick={() => handlePhaseFilter(phase)}>
                        {phase}
                    </Button>
                ))}
            </ButtonGroup>
        </div>

        <div className="text-muted mb-2">
            총 {pageResponse.totalCount}개의 과제
        </div>

        {/* 3. 과제 목록 */}
        <Row className="g-3">
            {sortedList.length === 0 ? (
                <Col xs={12}>
                    <p className="text-center text-muted py-4">
                        조회된 과제가 없습니다.
                    </p>
                </Col>
            ) : (
                sortedList.map((assignment) => {
                    const status = getSubmitStatus(assignment);
                    return (
                        <Col xs={12} key={assignment.assignmentNo}>
                            <Card>
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <Card.Title className="mb-1">
                                            {assignment.assignmentTitle}
                                        </Card.Title>

                                        <Card.Subtitle className="text-muted mb-3">
                                            {assignment.courseTitle} {assignment.accountName}
                                        </Card.Subtitle>

                                        <div className="text-muted small">
                                            {formatDueDate(assignment.assignmentDueDate)}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-2">
                                        <div className="d-flex gap-1">
                                            {submitStatusBadge(status)}
                                            {phaseBadge(assignment.assignmentPhase)}
                                        </div>
                                        {actionButton(assignment, status)}
                                    </div>

                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })
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
