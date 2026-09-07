import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { FaDownload, FaListUl, FaPaperclip } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { useAtomValue } from "jotai";
import { selectedChildState, selectedChildNoState } from "@utils/storage";

export default function ParentAssignmentDetail() {

    // URL
    const { assignmentNo } = useParams();
    const navigate = useNavigate();

    // 선택된 자녀
    const selectedChild = useAtomValue(selectedChildState);
    const selectedChildNo = useAtomValue(selectedChildNoState);

    // 과제 상세정보
    const [assignment, setAssignment] = useState({
        assignmentNo: 0,
        courseNo: 0,
        courseTitle: "",
        accountName: "",
        assignmentTitle: "",
        assignmentContent: "",
        assignmentStatus: "",
        assignmentDueDate: null,
        assignmentWtime: null,
        fileList: []
    });

    // 자녀 제출 내용 (미제출이면 null)
    const [submit, setSubmit] = useState(null);

    // 자녀 과제 상세 조회 (학부모 → 진짜 자녀인지 백엔드에서 검증)
    const loadAssignment = useCallback(async () => {

        if (selectedChildNo == null) {
            return;
        }

        try {
            const response = await apiClient.get(
                `/assignment/parent/student/${selectedChildNo}/${assignmentNo}`
            );

            setAssignment(response.data);
        }
        catch (err) {
            console.error("자녀 과제 상세 조회 실패", err);
        }

    }, [selectedChildNo, assignmentNo]);

    // 자녀 제출 내용 조회
    const loadSubmit = useCallback(async () => {

        if (selectedChildNo == null) {
            return;
        }

        try {
            const response = await apiClient.get(
                `/assignment-submit/parent/student/${selectedChildNo}/assignment/${assignmentNo}`
            );

            setSubmit(response.data || null);
        }
        catch (err) {
            console.error("자녀 제출 내용 조회 실패", err);
            setSubmit(null);
        }

    }, [selectedChildNo, assignmentNo]);

    // 화면 진입 시 / 자녀 변경 시 조회
    useEffect(() => {
        loadAssignment();
        loadSubmit();
    }, [loadAssignment, loadSubmit]);

    // 날짜 포맷
    const formatDateTime = (value) => {
        return value ? new Date(value).toLocaleString() : "-";
    };

    // 첨부파일 목록 렌더링
    const renderFileList = (fileList) => (
        <ListGroup>
            {fileList.map(file => (
                <ListGroupItem
                    key={file.attachNo}
                    className="d-flex justify-content-between align-items-center">
                    <div>
                        {file.attachName}
                        <span className="ms-2 text-info">
                            ({(file.attachSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                    </div>

                    <a
                        href={`${import.meta.env.VITE_SERVER_URL}/api/attach/${file.attachNo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none">
                        <FaDownload className="me-1" />
                        <span>다운로드</span>
                    </a>
                </ListGroupItem>
            ))}
        </ListGroup>
    );

    const isClosed = assignment.assignmentStatus === "마감";

    // 제출 상태
    const hasSubmit = submit != null;
    const hasComment = Boolean(submit?.submitComment && submit.submitComment.trim());

    return (
        <>
            <Jumbotron title="자녀 과제 상세" />

            {selectedChild && (
                <div className="mb-3 text-muted">
                    <strong>{selectedChild.studentName}</strong> 학생의 과제입니다.
                </div>
            )}

            <Row className="mt-2">
                <Col>
                    <Card>
                        <Card.Body>
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

                            <hr />

                            <p
                                className={assignment.fileList?.length > 0 ? "" : "mb-0"}
                                style={{ whiteSpace: "pre-line" }}>
                                {assignment.assignmentContent}
                            </p>

                            {/* 과제 첨부파일 */}
                            {assignment.fileList?.length > 0 && (
                                <>
                                    <hr />
                                    <div className="fw-bold mb-2">
                                        <FaPaperclip className="me-1" />
                                        <span>과제 첨부파일</span>
                                    </div>
                                    {renderFileList(assignment.fileList)}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 자녀 제출 내용 */}
            <Card className="mt-3">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="fw-bold mb-3">제출물</div>
                        <Badge bg={hasComment ? "success" : hasSubmit ? "secondary" : "danger"}>
                            {hasComment ? "채점완료" : hasSubmit ? "제출완료" : "미제출"}
                        </Badge>
                    </div>

                    {hasSubmit ? (
                        <>
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

                            {submit.fileList?.length > 0 && (
                                <>
                                    <hr />
                                    <div className="fw-bold mb-2">
                                        <FaPaperclip className="me-1" />
                                        <span>제출 첨부파일</span>
                                    </div>
                                    {renderFileList(submit.fileList)}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="border rounded p-3 text-muted">
                            아직 제출하지 않았습니다.
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* 강사 피드백 */}
            <Card className="mt-3">
                <Card.Body>
                    <div className="fw-bold mb-3">피드백</div>
                    {hasComment ? (
                        <div
                            className="border rounded p-3"
                            style={{ whiteSpace: "pre-line" }}>
                            {submit.submitComment}
                        </div>
                    ) : (
                        <div className="border rounded p-3 text-muted">
                            아직 등록된 피드백이 없습니다.
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Row className="mt-4">
                <Col className="d-flex justify-content-end">
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/student/assignment")}>
                        <FaListUl className="me-2" />
                        목록으로
                    </Button>
                </Col>
            </Row>
        </>
    );
}
