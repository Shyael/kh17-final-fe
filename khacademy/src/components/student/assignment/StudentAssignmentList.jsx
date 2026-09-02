import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, ButtonGroup, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// 한 번에 보여줄 과제 수
const PAGE_SIZE = 3;

// 상태 필터 목록
const FILTERS = [
    { key: "전체", label: "전체" },
    { key: "미제출", label: "미제출 보기" },
    { key: "제출완료", label: "제출완료 보기" },
    { key: "채점완료", label: "채점완료 보기" },
];

export default function StudentAssignmentList() {

    const navigate = useNavigate();

    // 내 과제 목록
    const [assignmentList, setAssignmentList] = useState([]);

    // 선택된 상태 필터
    const [filter, setFilter] = useState("전체");

    // 선택된 강의 필터 (courseNo, "전체"면 전체)
    const [courseFilter, setCourseFilter] = useState("전체");

    // 더보기로 노출된 개수
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    //내 과제 목록 조회
    const loadAssignmentList = useCallback(async () => {
        try {
            const response = await apiClient.get("/assignment/student");

            setAssignmentList(response.data);
        }
        catch (err) {
            console.error("학생 과제 목록 조회 실패", err);
        }
    }, []);

    // 화면 진입 시 조회
    useEffect(() => {
        loadAssignmentList();
    }, [loadAssignmentList]);

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

    // 상태별 액션 버튼
    const actionButton = (assignment, status) => {
        const to = `/student/assignment/${assignment.assignmentNo}/submit`;
        const detail = `/student/assignment/${assignment.assignmentNo}/submit/${assignment.submitNo}`;
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
                        onClick={() => navigate(to)}>
                        제출하기
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

    // 최근 생성순 정렬 (새로 만든 과제가 위로)
    const sortedList = useMemo(() => {
        return [...assignmentList].sort(
            (a, b) => b.assignmentNo - a.assignmentNo
        );
    }, [assignmentList]);

    // 강의 목록 (중복 제거)
    const courseOptions = useMemo(() => {
        const map = new Map();
        assignmentList.forEach((assignment) => {
            const key = assignment.courseNo ?? assignment.courseTitle;
            if (key != null && !map.has(key)) {
                map.set(key, assignment.courseTitle);
            }
        });
        return Array.from(map, ([value, label]) => ({ value, label }));
    }, [assignmentList]);

    // 필터 적용된 목록 (강의 + 상태)
    const filteredList = useMemo(() => {
        return sortedList.filter((assignment) => {
            if (courseFilter !== "전체") {
                const key = assignment.courseNo ?? assignment.courseTitle;
                if (String(key) !== String(courseFilter)) {
                    return false;
                }
            }
            if (filter !== "전체" && getSubmitStatus(assignment) !== filter) {
                return false;
            }
            return true;
        });
    }, [sortedList, filter, courseFilter]);

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
        <Jumbotron title="내 과제" />

        {/* 1. 강의 선택 + 과제 상태 버튼 */}
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

        {/* 2. 과제 목록 */}
        <Row className="g-3">
            {visibleList.length === 0 ? (
                <Col xs={12}>
                    <p className="text-center text-muted py-4">
                        등록된 과제가 없습니다.
                    </p>
                </Col>
            ) : (
                visibleList.map((assignment) => {
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
                                        {submitStatusBadge(status)}
                                        {actionButton(assignment, status)}
                                    </div>

                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })
            )}
        </Row>

        {/* 6. 더보기 버튼 */}
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
