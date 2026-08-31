import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaPen } from "react-icons/fa6";
import { useAtomValue } from "jotai";
import { isEmployeeState } from "@utils/storage";
import { toast } from "react-toastify";

export default function StudentAssignmentDetail() {

    //URL
    const { assignmentNo, submitNo } = useParams();
    const navigate = useNavigate();

    //학생 여부 (직원이 아니면 학생)
    const isStudent = !useAtomValue(isEmployeeState);

    // 과제 정보
    const [assignment, setAssignment] = useState({
        assignmentNo: 0,
        courseNo: 0,
        courseTitle: "",
        accountName: "",
        assignmentTitle: "",
        assignmentContent: "",
        assignmentStatus: "",
        assignmentDueDate: null,
        assignmentWtime: null
    });

    //제출 정보
    const [submit, setSubmit] = useState({
        submitNo: 0,
        assignmentNo: 0,
        assignmentTitle: "",
        studentNo: 0,
        accountName: "",
        submitContent: "",
        submitComment: "",
        submitWtime: null,
        submitEtime: null,
    });

    //과제 상세 조회
    const loadAssignment = useCallback(async () => {
        try {
            const response = await apiClient.get(`/assignment/${assignmentNo}`);
            setAssignment(response.data);
        }
        catch (err) {
            console.error("과제 상세 조회 실패", err);
        }
    }, [assignmentNo]);

    //제출 상세 조회
    const loadSubmit = useCallback(async () => {
        try {
            const response = await apiClient.get(
                `/assignment-submit/${submitNo}`
            );

            setSubmit({
                ...response.data,
                submitComment: response.data.submitComment ?? ""
            });
        }
        catch (err) {
            console.error("과제 제출 상세 조회 실패", err);
        }
    }, [submitNo]);

    //화면 진입 시 조회
    useEffect(() => {
        loadAssignment();
        loadSubmit();
    }, [loadAssignment, loadSubmit]);

    // 피드백 입력
    const changeComment = (e) => {
        setSubmit(prev => ({
            ...prev,
            submitComment: e.target.value
        }));
    };

    // 강사 피드백 등록 / 수정
    const updateComment = async () => {
        if (!submit.submitComment.trim()) {
            toast.error("피드백을 입력해주세요.");
            return;
        }
        try {
            await apiClient.put(
                `/assignment-submit/${submitNo}/comment`,
                {
                    submitComment: submit.submitComment
                }
            );
            toast.success("피드백을 저장했습니다.");
            loadSubmit();
        }
        catch (err) {
            console.error("피드백 저장 실패", err);
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

    // 날짜 표시
    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }
        return new Date(value).toLocaleString();
    };

    // 피드백 존재 여부
    const hasComment = Boolean(submit.submitComment && submit.submitComment.trim());

    // 제출 상태 (피드백 있으면 채점완료)
    const submitStatus = hasComment ? "채점완료" : "제출완료";

    // 마감 지남 여부 (지나면 수정하기 숨김)
    const isDueOver = useMemo(() => {
        if (!assignment.assignmentDueDate) {
            return false;
        }
        return new Date(assignment.assignmentDueDate) < new Date();
    }, [assignment.assignmentDueDate]);

    return (<>
        <Jumbotron title="과제 제출 상세" />

        {/* 1. 과제 정보 */}
        <Card className="mt-4">
            <Card.Body className="d-flex justify-content-between align-items-start">
                <div>
                    <h4 className="fw-bold mb-1">
                        {assignment.assignmentTitle}
                    </h4>
                    <div className="text-muted">
                        {formatDueDate(assignment.assignmentDueDate)}
                    </div>
                </div>

                <Badge bg={submitStatus === "채점완료" ? "success" : "secondary"}>
                    {submitStatus}
                </Badge>
            </Card.Body>
        </Card>

        {/* 2. 작성 내용 */}
        <Card className="mt-3">
            <Card.Body>
                <div className="text-muted small">작성 내용</div>
                <div className="fw-bold mb-3">제출물</div>

                <div
                    className="bg-light border rounded p-3"
                    style={{ whiteSpace: "pre-line" }}>
                    {submit.submitContent || "-"}
                </div>

                <div className="text-muted small mt-2">
                    제출일시 : {formatDateTime(submit.submitWtime)}
                    {submit.submitEtime && (
                        <>
                            <span className="mx-2">·</span>
                            수정일시 : {formatDateTime(submit.submitEtime)}
                        </>
                    )}
                </div>
            </Card.Body>
        </Card>

        {/* 3. 피드백 */}
        <Card className="mt-3">
            <Card.Body>
                <div className="fw-bold mb-3">피드백</div>
                <div className="text-muted small mb-1">코멘트</div>

                {isStudent ? (
                    hasComment ? (
                        <div
                            className="border rounded p-3"
                            style={{ whiteSpace: "pre-line" }}>
                            {submit.submitComment}
                        </div>
                    ) : (
                        <div className="border rounded p-3 text-muted">
                            아직 등록된 피드백이 없습니다.
                        </div>
                    )
                ) : (
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={submit.submitComment}
                        onChange={changeComment}
                        placeholder="학생에게 전달할 피드백을 입력하세요."
                    />
                )}
            </Card.Body>
        </Card>

        {/* 4·5. 버튼 */}
        <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">

                {/* 학생 : 마감 전이면 수정하기 */}
                {isStudent && !isDueOver && (
                    <Button
                        as={Link}
                        to={`/student/assignment/${assignmentNo}/submit`}
                        variant="outline-primary">
                        <FaPen className="me-2" />
                        수정하기
                    </Button>
                )}

                {/* 직원 : 피드백 저장 */}
                {!isStudent && (
                    <Button
                        variant="success"
                        onClick={updateComment}>
                        <FaCheck className="me-2" />
                        피드백 저장
                    </Button>
                )}

                {/* 목록으로 */}
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(
                        isStudent
                            ? "/student/assignment"
                            : `/employee/assignment/${assignmentNo}`
                    )}>
                    목록으로
                </Button>
            </Col>
        </Row>
    </>)
}