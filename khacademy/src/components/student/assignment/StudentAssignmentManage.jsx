import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import { Badge, Button, Card, Col, Form, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { FaCheck, FaDownload, FaListUl, FaPaperclip, FaXmark } from "react-icons/fa6";

// 제출 내용 최대 글자 수
const MAX_CONTENT_LENGTH = 1000;

export default function StudentAssignmentManage() {

    //URL
    const { assignmentNo } = useParams();
    const navigate = useNavigate();

    //과제 정보
    const [assignment, setAssignment] = useState({
        assignmentNo: 0,
        courseNo: 0,
        courseTitle: "",
        accountName: "",
        assignmentTitle: "",
        assignmentContent: "",
        assignmentStatus: "",
        assignmentDueDate: null,
        fileList: []
    });

    // 내 제출 정보
    const [submit, setSubmit] = useState({
        submitNo: null,
        assignmentNo: Number(assignmentNo),
        submitContent: ""
    });

    //submitNo가 있으면 수정모드
    const isEdit = submit.submitNo != null;

    //첨부파일 (신규 업로드, 여러 개)
    const [files, setFiles] = useState([]);
    const filesRef = useRef();

    //기존에 등록되어 있는 첨부파일
    const [beforeFiles, setBeforeFiles] = useState([]);

    const changeFiles = useCallback((e) => {
        setFiles(Array.from(e.target.files));
    }, []);

    const clearFiles = useCallback(()=>{
        setFiles([]);
    }, []);

    useEffect(() => {
        if (files.length > 0) return;

        if (filesRef.current) {
            filesRef.current.value = "";
        }
    }, [files]);

    //기존 첨부파일 체크박스 선택
    const choiceFile = useCallback((target, e) => {
        setBeforeFiles(prev => prev.map(
            attach => {
                if (attach.attachNo === target.attachNo) {
                    return {
                        ...attach,
                        choice: e.target.checked
                    };
                }
                return { ...attach };
            }
        ))
    }, [])

    //전체선택
    const checkAllFiles = useCallback((e) => {
        setBeforeFiles(prev => prev.map(
            attach => ({
                ...attach,
                choice: e.target.checked
            })
        ));
    }, []);

    const isAllFilesChecked = useMemo(() => {
        return beforeFiles.length > 0 && beforeFiles.every(attach => attach.choice === true);
    }, [beforeFiles]);

    //체크된 기존 첨부파일 삭제
    const deleteCheckedFiles = useCallback(async () => {
        const attachNumbers = beforeFiles.filter(
            attach => attach.choice === true
        ).map(
            attach => attach.attachNo
        );

        if (attachNumbers.length === 0) {
            return;
        }

        for (const attachNo of attachNumbers) {
            await apiClient.delete(
                `/assignment-submit/${submit.submitNo}/file/${attachNo}`
            );
        }

        toast.success("첨부파일이 삭제되었습니다.");
        setBeforeFiles(prev => prev.filter(
            attach => !attachNumbers.includes(attach.attachNo)
        ));
    }, [beforeFiles,submit.submitNo]);

    //과제 상세 조회
    const loadAssignment = useCallback(async () => {
        try {
            const response = await apiClient.get(
                `/assignment/${assignmentNo}`
            );

            setAssignment(response.data);
        }
        catch (err) {
            console.error("과제 조회 실패", err);
        }
    }, [assignmentNo]);

    //내 제출 조회
    const loadSubmit = useCallback(async () => {
        try {
            const response = await apiClient.get(
                `/assignment-submit/assignment/${assignmentNo}/me`
            );

            //이미 제출한 과제
            if (response.data) {
                setSubmit({
                    submitNo: response.data.submitNo,
                    assignmentNo: Number(assignmentNo),
                    submitContent: response.data.submitContent ?? ""
                });

            setBeforeFiles(
                (response.data.fileList ?? []).map(file => ({
                    ...file,
                    choice: false
                }))
            )
            }
        }
        catch (err) {
            console.error("과제 제출 조회 실패", err);
        }
    }, [assignmentNo]);

    // 화면 진입 시 조회
    useEffect(() => {
        loadAssignment();
        loadSubmit();
    }, [loadAssignment, loadSubmit]);

    // 제출내용 변경
    const changeSubmitValue = (e) => {

        const { name, value } = e.target;

        if (value.length > MAX_CONTENT_LENGTH) {
            return;
        }

        setSubmit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    //과제 최초 제출
    const insertSubmit = async () => {
        if (isOverdue) {
            toast.error("과제 제출 기한이 지났습니다.");
            return;
        }
        if (!submit.submitContent.trim()) {
            toast.error("제출 내용을 입력해주세요.");
            return;
        }

        try {
            const form = new FormData();

            //제출내용
            form.append(
                "submit",
                new Blob(
                    [
                        JSON.stringify({
                            assignmentNo: Number(assignmentNo),
                            submitContent: submit.submitContent
                        })
                    ],
                    {
                        type: "application/json"
                    }
                )
            );

            //첨부파일
            files.forEach((file) => {
                form.append("files", file);
            });

            const response = await apiClient.post(
                "/assignment-submit/",
                form
            );

            toast.success("과제를 제출했습니다.");

            navigate(
                `/student/assignment/${assignmentNo}/submit/${response.data.submitNo}`
            );
        }
        catch (err) {
            console.error("과제 제출 실패", err);
            toast.error(
                err.response?.data?.message ?? "과제 제출에 실패했습니다."
            );
        }
    };

    // 과제 제출 수정
    const updateSubmit = async () => {
        if (isOverdue) {
            toast.error("과제 제출 기한이 지났습니다.");
            return;
        }
        if (!submit.submitContent.trim()) {
            toast.error("제출 내용을 입력해주세요.");
            return;
        }
        try {
            const form = new FormData();

            // 제출 내용
            form.append(
                "submit",
                new Blob(
                    [
                        JSON.stringify({
                            submitContent: submit.submitContent
                        })
                    ],
                    {
                        type: "application/json"
                    }
                )
            );

            // 새로 추가한 첨부파일
            files.forEach((file) => {
                form.append("files", file);
            });

            await apiClient.put(
                `/assignment-submit/${submit.submitNo}`,
                form
            );

            toast.success("제출 내용을 수정했습니다.");

            navigate(
                `/student/assignment/${assignment.assignmentNo}/submit/${submit.submitNo}`
            );
        }
        catch (err) {
            console.error("과제 제출 수정 실패", err);
            toast.error(
                err.response?.data?.message ?? "제출 내용 수정에 실패했습니다."
            );
        }
    };

    // 마감일 표기 (예: 8/26 23:59 마감)
    const dueDateText = useMemo(() => {

        if (!assignment.assignmentDueDate) {
            return "마감일 없음";
        }

        const due = new Date(assignment.assignmentDueDate);

        const month = due.getMonth() + 1;
        const date = due.getDate();
        const hour = String(due.getHours()).padStart(2, "0");
        const minute = String(due.getMinutes()).padStart(2, "0");

        return `${month}/${date} ${hour}:${minute} 마감`;
    }, [assignment.assignmentDueDate]);

    // 마감까지 남은 일수 (예: 2일 남음 / 오늘 마감 / 마감 지남)
    const remainText = useMemo(() => {

        if (!assignment.assignmentDueDate) {
            return null;
        }

        const now = new Date();
        const due = new Date(assignment.assignmentDueDate);
        const diffDay = Math.ceil(
            (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDay < 0) {
            return "마감 지남";
        }
        if (diffDay === 0) {
            return "오늘 마감";
        }
        return `${diffDay}일 남음`;
    }, [assignment.assignmentDueDate]);

    const isOverdue = remainText === "마감 지남";

    // 제출 상태 배지
    const submitStatusBadge = () => {
        if (isEdit) {
            return <Badge bg="secondary">제출완료</Badge>;
        }
        return <Badge bg="danger">미제출</Badge>;
    };

    return (<>
        <Jumbotron title={isEdit ? "과제 제출 수정" : "과제 제출"} />

        {/* 1. 과제 상세 */}
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
                                </div>

                                <div className={isOverdue ? "text-danger mt-2" : "text-primary mt-2"}>
                                    <span className="fw-bold">{dueDateText}</span>
                                    {remainText && (
                                        <>
                                            <span className="mx-2">·</span>
                                            <span>{remainText}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                {submitStatusBadge()}
                            </div>
                        </div>

                        <hr />

                        <div className="text-muted mb-1 small">과제 안내</div>
                        <p
                            className="mb-0 p-3 bg-light rounded"
                            style={{ whiteSpace: "pre-line" }}>
                            {assignment.assignmentContent}
                        </p>

                        <div className="fw-bold mb-2 mt-2">
                            <FaPaperclip className="me-1" />
                            <span>첨부파일</span>
                        </div>
                        <ListGroup>
                            {assignment.fileList.map(file => (
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
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* 2. 제출하기 */}
        <Row className="mt-4">
            <Col>
                <Card>
                    <Card.Body>
                        <h4 className="fw-bold mb-3">제출하기</h4>

                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="mb-1">내용</Form.Label>
                            <span className="text-muted small">
                                {submit.submitContent.length} / {MAX_CONTENT_LENGTH}자
                            </span>
                        </div>

                        <Form.Control
                            as="textarea"
                            rows={8}
                            name="submitContent"
                            value={submit.submitContent}
                            onChange={changeSubmitValue}
                            maxLength={MAX_CONTENT_LENGTH}
                            readOnly={isOverdue}
                            placeholder="과제 내용을 작성해주세요." />

                        {isOverdue && (
                            <div className="text-danger small mt-2">
                                과제 제출 기한이 지나 제출 및 수정할 수 없습니다.
                            </div>
                        )}

                        {/* TODO: 파일 첨부 영역 (추후 추가) */}
                        <Row className="mt-4">
                            <Form.Label column sm={3}>제출첨부파일</Form.Label>
                            <Col sm={9}>
                                <div className="d-flex">
                                    <Form.Control type="file" multiple
                                        ref={filesRef}
                                        onInput={changeFiles}/>
                                    {files.length > 0 && (
                                        <Button variant="danger" onClick={clearFiles} className="ms-2">
                                            <FaXmark/>
                                        </Button>
                                    )}
                                </div>

                                {files.length > 0 && (
                                    <ListGroup className="mt-3">
                                        {Array.from(files).map((file, index) => (
                                            <ListGroupItem key={index}>
                                                {file.name}
                                                <span className="ms-2 text-info">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </ListGroupItem>    
                                        ))}
                                    </ListGroup>
                                )}
                            </Col>
                        </Row>

                        {isEdit && beforeFiles.length > 0 && (
                            <Row className="mt-4">
                                <Form.Label column sm={3}>등록된 첨부파일</Form.Label>
                                <Col sm={9}>
                                    <Form.Check type="checkbox" label= "전체 선택"
                                        checked={isAllFilesChecked}
                                        onChange={checkAllFiles}/>

                                    <Button variant="danger" onClick={deleteCheckedFiles}>
                                        체크된 항목 삭제   
                                    </Button>

                                    <ListGroup>
                                        {beforeFiles.map(attach =>(
                                            <ListGroupItem key={attach.attachNo}>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        {attach.attachName}
                                                        <span className="ms-2 text-info">
                                                            ({(attach.attachSize / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <Form.Check type="checkbox"
                                                        checked={attach.choice === true}
                                                        onChange={e => choiceFile(attach, e)}/>
                                                </div>
                                            </ListGroupItem>
                                        ))}
                                    </ListGroup>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* 버튼 */}
        <Row className="mt-4">
            <Col className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                    제출 후 마감 전까지 수정할 수 있어요
                </span>

                <div>
                    <Button
                        variant="outline-secondary"
                        onClick={() =>
                            navigate("/student/assignment")
                        }>
                        <FaListUl className="me-2" />
                        목록으로
                    </Button>

                    <Button
                        variant="primary"
                        className="ms-2"
                        disabled={isOverdue}
                        onClick={
                            isEdit
                                ? updateSubmit
                                : insertSubmit
                        }>
                        <FaCheck className="me-2" />
                        {isEdit ? "수정하기" : "제출하기"}
                    </Button>
                </div>
            </Col>
        </Row>
    </>)
}
