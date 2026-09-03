import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Form, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";

export default function AssignmentManage() {

    //URL
    const { assignmentNo } = useParams();
    const navigate = useNavigate();

    // 과제 번호가 있으면 수정, 없으면 등록
    const isEdit = assignmentNo !== undefined;

    // 과제 입력정보
    const [assignment, setAssignment] = useState({
        courseNo: "",
        courseTitle: "",
        assignmentTitle: "",
        assignmentContent: "",
        assignmentStatus: "게시",
        assignmentDueDate: ""
    });

    // 마감일시는 현재 이후만 선택 가능
    const filterFutureTime = (time) => new Date().getTime() < new Date(time).getTime();

    // 첨부파일 (신규 업로드, 여러 개)
    const [files, setFiles] = useState([]);
    const filesRef = useRef();

    // 기존에 등록되어 있는 첨부파일
    const [beforeFiles, setBeforeFiles] = useState([]);

    const changeFiles = useCallback((e) => {
        setFiles(e.target.files);
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    useEffect(() => {
        if (files.length > 0) return;

        if (filesRef.current) {
            filesRef.current.value = "";
        }
    }, [files]);

    // 기존 첨부파일 체크박스 선택
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
        ));
    }, []);

    // 전체선택
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

    // 체크된 기존 첨부파일 삭제
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
                `/assignment/${assignmentNo}/file/${attachNo}`
            );
        }

        toast.success("첨부파일이 삭제되었습니다.");
        setBeforeFiles(prev => prev.filter(
            attach => !attachNumbers.includes(attach.attachNo)
        ));
    }, [beforeFiles, assignmentNo]);

    // 입력값 변경
    const changeAssignmentValue = (e) => {
        const { name, value } = e.target;
        setAssignment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    //내가 수업중인 강의 목록
    const [courseList, setCourseList] = useState([]);

    //강의 목록 불러오기
    const loadCourseList = useCallback(async () => {
        try {
            const response = await apiClient.get("/course/employee");

            setCourseList(response.data);
        }
        catch (err) {
            console.error("강의 목록 조회 실패", err);
        }
    }, []);

    // 과제 상세 조회
    const loadAssignment = useCallback(async () => {
        try {
            const response =
                await apiClient.get(`/assignment/${assignmentNo}`);

            const data = response.data;

            setAssignment({
                courseNo: data.courseNo,
                courseTitle: data.courseTitle,
                assignmentTitle: data.assignmentTitle,
                assignmentContent: data.assignmentContent,
                assignmentStatus: data.assignmentStatus,
                assignmentDueDate: data.assignmentDueDate ?? ""
            });

            setBeforeFiles(data.fileList ?? []);

        }
        catch (err) {
            console.error("과제 상세 조회 실패", err);
        }
    }, [assignmentNo]);

    // 화면 진입 시 조회
    useEffect(() => {

        if (isEdit) {
            // 수정 모드 → 기존 과제 조회
            loadAssignment();
        }
        else {
            // 등록 모드 → 내가 담당하는 강의 조회
            loadCourseList();
        }

    }, [isEdit, loadAssignment, loadCourseList]);

    //등록
    const insertAssignment = async () => {
        if (!assignment.courseNo) {
            toast.error("강좌를 선택해주세요.");
            return;
        }

        if (!assignment.assignmentTitle.trim()) {
            toast.error("과제명을 입력해주세요.");
            return;
        }

        if (!assignment.assignmentContent.trim()) {
            toast.error("과제 안내를 입력해주세요.");
            return;
        }

        if (assignment.assignmentDueDate
            && new Date(assignment.assignmentDueDate).getTime() <= Date.now()) {
            toast.error("마감일시는 현재 시간 이후로 설정해주세요.");
            return;
        }

        try {
            const form = new FormData();

            form.append(
                "assignment",
                new Blob(
                    [JSON.stringify({
                        ...assignment,
                        courseNo: Number(assignment.courseNo),
                        assignmentDueDate: assignment.assignmentDueDate || null
                    })],
                    { type: "application/json" }
                )
            );

            Array.from(files).forEach((file) => {
                form.append("files", file);
            });

            const response = await apiClient.post("/assignment/", form);

            const assignmentNo = response.data;
            toast.success("과제 등록이 완료되었습니다.");

            clearFiles();

            navigate(`/employee/assignment/${assignmentNo}`);
        }
        catch (err) {
            console.error("과제 등록 실패", err);
        }
    };

    // 과제 수정
    const updateAssignment = async () => {

        if (!assignment.assignmentTitle.trim()) {
            toast.error("과제명을 입력해주세요.");
            return;
        }

        if (!assignment.assignmentContent.trim()) {
            toast.error("과제 안내를 입력해주세요.");
            return;
        }

        if (assignment.assignmentDueDate
            && new Date(assignment.assignmentDueDate).getTime() <= Date.now()) {
            toast.error("마감일시는 현재 시간 이후로 설정해주세요.");
            return;
        }

        try {

            const form = new FormData();

            form.append(
                "assignment",
                new Blob(
                    [JSON.stringify({
                        assignmentTitle: assignment.assignmentTitle,
                        assignmentContent: assignment.assignmentContent,
                        assignmentStatus: assignment.assignmentStatus,
                        assignmentDueDate:
                            assignment.assignmentDueDate || null
                    })],
                    { type: "application/json" }
                )
            );

            Array.from(files).forEach((file) => {
                form.append("files", file);
            });

            await apiClient.put(`/assignment/${assignmentNo}`, form);

            // 수정 후 상세페이지 이동
            toast.success("수정이 완료되었습니다");

            clearFiles();

            navigate(`/employee/assignment/${assignmentNo}`);

        }
        catch (err) {
            console.error("과제 수정 실패", err);
        }
    };


    return (<>
        <Jumbotron title="과제 관리" />

        <Row className="mt-4">
            <Col sm={6}>
                <Form.Label>
                    <span>강좌</span>
                </Form.Label>

                {!isEdit ? (
                    <Form.Select
                        name="courseNo"
                        value={assignment.courseNo}
                        onChange={changeAssignmentValue}>
                        <option value="">
                            강좌 선택
                        </option>

                        {courseList.map(course => (
                            <option
                                key={course.courseNo}
                                value={course.courseNo}>
                                {course.courseTitle}
                            </option>
                        ))}
                    </Form.Select>
                ) : (
                    <Form.Control
                        type="text"
                        value={assignment.courseTitle}
                        readOnly />
                )}

            </Col>

            {/* 과제명 */}
            <Col sm={6}>
                <Form.Label>
                    <span>과제명</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    name="assignmentTitle"
                    value={assignment.assignmentTitle}
                    onChange={changeAssignmentValue}
                    placeholder="수학의 정석 교재풀이" />
            </Col>
        </Row>

        <Row className="mt-4">
            <Col>
                <Form.Label>
                    <span>마감일시</span>
                </Form.Label>
                <DatePicker
                    selected={
                        assignment.assignmentDueDate
                            ? new Date(assignment.assignmentDueDate)
                            : null
                    }
                    onChange={(date) => {
                        setAssignment(prev => ({
                            ...prev,
                            assignmentDueDate: date
                        }));
                    }}
                    showTimeSelect
                    timeIntervals={10}
                    minDate={new Date()}
                    filterTime={filterFutureTime}
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="마감일시를 선택하세요"
                />
            </Col>
        </Row>

        {/* 소개 */}
        <Row className="mt-4">
            <Col>
                <Form.Label>
                    <span>과제 안내</span>
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={5}
                    name="assignmentContent"
                    value={assignment.assignmentContent}
                    onChange={changeAssignmentValue} />
            </Col>
        </Row>

        <hr className="mt-4" />

        {/* 첨부파일 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>첨부파일</Form.Label>
            <Col sm={9}>
                <div className="d-flex">
                    <Form.Control type="file" multiple
                        ref={filesRef}
                        onInput={changeFiles} />
                    {files.length > 0 && (
                        <Button variant="danger" onClick={clearFiles} className="ms-2">
                            <FaXmark />
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
                    <Form.Check type="checkbox" label="전체 선택"
                        checked={isAllFilesChecked}
                        onChange={checkAllFiles} />

                    <Button variant="danger" onClick={deleteCheckedFiles}>
                        체크된 항목 삭제
                    </Button>

                    <ListGroup>
                        {beforeFiles.map(attach => (
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
                                        onChange={e => choiceFile(attach, e)} />
                                </div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        )}

        {/* 버튼 */}
        <Row className="mt-4">
            <Col className="text-end">
                <Button
                    as={Link}
                    to={`/employee/assignment/${assignmentNo}`}
                    variant="danger"
                    className="ms-2">
                    <FaXmark className="me-2" />
                    <span>취소하기</span>
                </Button>
                <Button
                    type="button"
                    variant="success"
                    className="ms-2"
                    onClick={
                        isEdit
                            ? updateAssignment
                            : insertAssignment
                    }>
                    <FaCheck className="me-2" />
                    <span>
                        {isEdit
                            ? "수정하기"
                            : "등록하기"}
                    </span>
                </Button>
            </Col>
        </Row>
    </>)
}