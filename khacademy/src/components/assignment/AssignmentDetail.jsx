import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FaCheck, FaPen, FaTrash, FaLock } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";

export default function AssignmentDetail() {
    // URL
    const { assignmentNo } = useParams();
    const navigate = useNavigate();

    // 과제 상세정보
    const [assignment, setAssignment] = useState({
        assignmentNo: 0,
        courseNo: 0,
        courseTitle: "",
        employeeNo: 0,
        accountName: "",
        assignmentTitle: "",
        assignmentContent: "",
        assignmentStatus: "",
        assignmentDueDate: null,
        assignmentWtime: null
    });

    // 해당 과제 수강생 전체 + 제출정보
    const [studentList, setStudentList] = useState([]);

    // 제출 현황 필터 (전체 / 미확인 / 미제출)
    const [filter, setFilter] = useState("전체");

    // 체크된 제출 번호 목록 (일괄 확인완료용)
    const [checkedSubmitNos, setCheckedSubmitNos] = useState([]);

    // 과제 상세 조회
    const loadAssignment = useCallback(async () => {

        try {
            const response = await apiClient.get(
                `/assignment/${assignmentNo}`
            );

            setAssignment(response.data);
        }
        catch (err) {
            console.error("과제 상세 조회 실패", err);
        }

    }, [assignmentNo]);

    // 학생별 제출현황 조회
    const loadStudentList = useCallback(async () => {

        try {
            const response = await apiClient.get(
                `/assignment-submit/assignment/${assignmentNo}/students`
            );

            setStudentList(response.data);
        }
        catch (err) {
            console.error("학생 제출현황 조회 실패", err);
        }

    }, [assignmentNo]);

    // 화면 진입 시 조회
    useEffect(() => {
        loadAssignment();
        loadStudentList();
    }, [loadAssignment, loadStudentList]);

    // 전체 학생 수
    const totalCount = studentList.length;

    // 제출한 학생 수
    const submitCount = useMemo(() => {
        return studentList.filter(student =>
            student.submitNo != null
        ).length;
    }, [studentList]);

    // 미제출 학생 수
    const notSubmitCount = useMemo(() => {
        return studentList.filter(student =>
            student.submitNo == null
        ).length;
    }, [studentList]);

    // 미확인 학생 수
    const notCheckedCount = useMemo(() => {
        return studentList.filter(student =>
            student.submitNo != null &&
            student.submitComment == null
        ).length;
    }, [studentList]);

    // 확인완료 학생 수
    const checkedCount = useMemo(() => {
        return studentList.filter(student =>
            student.submitNo != null &&
            student.submitComment != null
        ).length;
    }, [studentList]);

    // 학생 제출 상태 판별
    const getStudentStatus = (student) => {

        if (student.submitNo == null) {
            return "미제출";
        }

        if (student.submitComment == null) {
            return "미확인";
        }

        return "확인완료";
    };

    // 상태 배지
    const statusBadge = (status) => {

        switch (status) {
            case "확인완료":
                return <Badge bg="success">확인완료</Badge>;

            case "미확인":
                return <Badge bg="warning" text="dark">미확인</Badge>;

            default:
                return <Badge bg="secondary">미제출</Badge>;
        }
    };

    // 필터 적용된 학생 목록
    const filteredStudentList = useMemo(() => {

        return studentList.filter(student => {
            const status = getStudentStatus(student);

            if (filter === "미확인") {
                return status === "미확인";
            }

            if (filter === "미제출") {
                return status === "미제출";
            }

            return true;
        });
    }, [studentList, filter]);

    // 체크 가능한(제출한) 학생의 제출 번호 목록
    const checkableSubmitNos = useMemo(() => {
        return filteredStudentList
            .filter(student => student.submitNo != null)
            .map(student => student.submitNo);
    }, [filteredStudentList]);

    // 전체 선택 여부
    const isAllChecked =
        checkableSubmitNos.length > 0 &&
        checkableSubmitNos.every(no => checkedSubmitNos.includes(no));

    // 개별 체크 토글
    const toggleCheck = (submitNo) => {
        setCheckedSubmitNos(prev =>
            prev.includes(submitNo)
                ? prev.filter(no => no !== submitNo)
                : [...prev, submitNo]
        );
    };

    // 전체 체크 토글
    const toggleCheckAll = () => {
        setCheckedSubmitNos(isAllChecked ? [] : checkableSubmitNos);
    };

    // 과제 수정 페이지 이동
    const moveToEdit = () => {
        navigate(`/employee/assignment/${assignmentNo}/edit`);
    };

    // 과제 마감
    const closeAssignment = async () => {

        if (!window.confirm("과제를 마감 상태로 변경하시겠습니까?")) {
            return;
        }

        try {
            await apiClient.put(
                `/assignment/${assignmentNo}`,
                {
                    assignmentTitle: assignment.assignmentTitle,
                    assignmentContent: assignment.assignmentContent,
                    assignmentStatus: "마감",
                    assignmentDueDate: assignment.assignmentDueDate || null
                }
            );

            toast.success("과제가 마감되었습니다.");
            loadAssignment();
        }
        catch (err) {
            console.error("과제 마감 실패", err);
        }
    };

    // 과제 삭제
    const deleteAssignment = async () => {

        if (!window.confirm("과제를 삭제하시겠습니까? 삭제한 정보는 복구할 수 없습니다.")) {
            return;
        }

        try {
            await apiClient.delete(`/assignment/${assignmentNo}`);

            toast.success("과제가 삭제되었습니다.");
            navigate("/employee/assignment");
        }
        catch (err) {
            console.error("과제 삭제 실패", err);
        }
    };

    // 선택한 항목 일괄 확인완료
    const applyBulkCheck = async () => {

        if (checkedSubmitNos.length === 0) {
            toast.error("확인완료할 항목을 선택해주세요.");
            return;
        }

        try {
            await apiClient.put(
                `/assignment-submit/check`,
                { submitNoList: checkedSubmitNos }
            );

            toast.success("선택한 항목을 확인완료로 변경했습니다.");
            setCheckedSubmitNos([]);
            loadStudentList();
        }
        catch (err) {
            console.error("일괄 확인완료 실패", err);
        }
    };

    // 학생 제출 상세 보기
    const moveToSubmitDetail = (student) => {

        if (student.submitNo == null) {
            return;
        }

        navigate(
            `/employee/assignment/${assignmentNo}/submit/${student.submitNo}`
        );
    };

    // 날짜 포맷
    const formatDateTime = (value) => {
        return value ? new Date(value).toLocaleString() : "-";
    };

    const isClosed = assignment.assignmentStatus === "마감";

    return (
        <>
            <Jumbotron title="과제 상세" />

            {/* 과제 정보 + 관리 버튼 */}
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                    <h3 className="fw-bold mb-2">
                                        {assignment.assignmentTitle}
                                    </h3>
                                    <div className="text-muted">
                                        <span>{assignment.courseTitle}</span>
                                        <span className="mx-2">·</span>
                                        <span>{assignment.accountName} 강사</span>
                                        <span className="mx-2">·</span>
                                        <span>
                                            {formatDateTime(assignment.assignmentDueDate)} 마감
                                        </span>
                                        <span className="ms-2">
                                            {isClosed
                                                ? <Badge bg="secondary">마감</Badge>
                                                : <Badge bg="success">게시</Badge>}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-nowrap">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="ms-2"
                                        onClick={moveToEdit}>
                                        <FaPen className="me-1" />
                                        <span>수정</span>
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="ms-2"
                                        disabled={isClosed}
                                        onClick={closeAssignment}>
                                        <FaLock className="me-1" />
                                        <span>마감</span>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="ms-2"
                                        onClick={deleteAssignment}>
                                        <FaTrash className="me-1" />
                                        <span>삭제</span>
                                    </Button>
                                </div>
                            </div>

                            <hr />

                            <p
                                className="mb-0"
                                style={{ whiteSpace: "pre-line" }}>
                                {assignment.assignmentContent}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 제출 현황 요약 */}
            <Row className="mt-4 g-3">
                <Col xs={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="text-muted mb-1">제출</div>
                            <div className="fs-4 fw-bold">
                                {submitCount} / {totalCount}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="text-muted mb-1">미확인</div>
                            <div className="fs-4 fw-bold text-warning">
                                {notCheckedCount}건
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="text-muted mb-1">미제출</div>
                            <div className="fs-4 fw-bold text-danger">
                                {notSubmitCount}건
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="text-muted mb-1">확인완료</div>
                            <div className="fs-4 fw-bold text-success">
                                {checkedCount}건
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 학생별 제출 현황 */}
            <Row className="mt-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h4 className="fw-bold mb-0">
                            학생별 제출 현황
                        </h4>

                        <div className="d-flex align-items-center gap-2">
                            {["전체", "미확인", "미제출"].map(name => (
                                <Button
                                    key={name}
                                    size="sm"
                                    variant={
                                        filter === name
                                            ? "primary"
                                            : "outline-primary"
                                    }
                                    onClick={() => setFilter(name)}>
                                    {name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mb-2">
                        <Button
                            size="sm"
                            variant="success"
                            disabled={checkedSubmitNos.length === 0}
                            onClick={applyBulkCheck}>
                            <FaCheck className="me-1" />
                            <span>
                                선택한 항목 일괄 확인완료
                                {checkedSubmitNos.length > 0 &&
                                    ` (${checkedSubmitNos.length})`}
                            </span>
                        </Button>
                    </div>

                    <Table
                        bordered
                        hover
                        responsive
                        className="align-middle text-center">
                        <thead>
                            <tr>
                                <th style={{ width: "48px" }}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={isAllChecked}
                                        onChange={toggleCheckAll}
                                        disabled={checkableSubmitNos.length === 0}
                                    />
                                </th>
                                <th>이름</th>
                                <th>제출 일시</th>
                                <th>상태</th>
                                <th style={{ width: "80px" }}>관리</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredStudentList.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        학생이 없습니다.
                                    </td>
                                </tr>
                            )}

                            {filteredStudentList.map((student, index) => {
                                const status = getStudentStatus(student);
                                const submitted = student.submitNo != null;

                                return (
                                    <tr
                                        key={
                                            student.studentNo ??
                                            student.memberNo ??
                                            student.submitNo ??
                                            index
                                        }>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={
                                                    submitted &&
                                                    checkedSubmitNos.includes(
                                                        student.submitNo
                                                    )
                                                }
                                                disabled={!submitted}
                                                onChange={() =>
                                                    toggleCheck(student.submitNo)
                                                }
                                            />
                                        </td>

                                        <td>
                                            {student.accountName ??
                                                student.studentName ??
                                                student.memberName}
                                        </td>

                                        <td>
                                            {submitted
                                                ? formatDateTime(
                                                    student.submitWtime ??
                                                    student.submitDate
                                                )
                                                : "-"}
                                        </td>

                                        <td>
                                            {statusBadge(status)}
                                        </td>

                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                disabled={!submitted}
                                                onClick={() =>
                                                    moveToSubmitDetail(student)
                                                }>
                                                보기
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    );
}
