import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function StudentMyInfo() {

    const [student, setStudent] = useState(null);
    console.log("학생정보" + student);
    // 수정 모드
    const [editMode, setEditMode] = useState(false);

    // 비밀번호 확인 모달
    const [passwordModal, setPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);


    // ========================================
    // 학생 정보 조회
    // ========================================
    const loadStudent = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/student/me");

            console.log("학생 정보 =", data);

            setStudent(data);
        }
        catch (e) {
            console.error("학생 정보 조회 실패 =", e);

            await Swal.fire(
                "학생 정보를 불러오지 못했습니다."
            );
        }
    }, []);


    useEffect(() => {
        loadStudent();
    }, [loadStudent]);


    // ========================================
    // 수정 화면 입력값 변경
    // ========================================
    const changeStringValue = useCallback((e) => {
        const { name, value } = e.target;

        setStudent(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);


    // ========================================
    // 비밀번호 확인
    // ========================================
    const checkPassword = useCallback(async () => {

        if (password === "") {
            return;
        }

        try {

            const { data } = await apiClient.post(
                "/student/password-check",
                {
                    accountPassword: password
                }
            );

            if (data === true) {

                setPasswordModal(false);

                // 수정 모드 진입
                setEditMode(true);

                // 비밀번호 초기화
                setPassword("");
                setPasswordError(false);

            }
            else {

                setPasswordError(true);

            }

        }
        catch (error) {

            console.error("비밀번호 확인 실패 =", error);

            setPasswordError(true);

        }

    }, [password]);


    // ========================================
    // 학생 정보 수정
    // ========================================
    const sendUpdate = useCallback(async (e) => {

        e.preventDefault();

        try {

            await apiClient.put(
                "/student/",
                {
                    accountName: student.accountName,
                    accountPhone: student.accountPhone,
                    accountBirth: student.accountBirth,

                    studentSchool: student.studentSchool,
                    studentGrade: student.studentGrade
                }
            );

            // 수정 완료 후 전체 정보 다시 조회
            await loadStudent();

            // 조회 모드로 변경
            setEditMode(false);

            await Swal.fire(
                "수정 완료",
                "학생 정보가 수정되었습니다.",
                "success"
            );

        }
        catch (error) {

            console.error("학생 정보 수정 실패 =", error);

            await Swal.fire(
                "수정 실패",
                "학생 정보 수정에 실패했습니다.",
                "error"
            );

        }

    }, [student]);


    // ========================================
    // 로딩
    // ========================================
    if (student === null) {
        return (
            <>
                <Jumbotron
                    title="내 정보"
                    content="학생 정보를 불러오는 중입니다."
                />

                <div className="text-center mt-5">
                    정보를 불러오는 중...
                </div>
            </>
        );
    }


    return (
        <>
            {/* ================================================= */}
            {/* 수정 화면 */}
            {/* ================================================= */}
            {editMode ? (

                <>
                    <Jumbotron
                        title="내 정보 수정"
                        content="개인정보를 수정할 수 있습니다."
                    />

                    <Form onSubmit={sendUpdate}>

                        {/* 이름 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                이름
                            </Form.Label>

                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    name="accountName"
                                    value={student.accountName || ""}
                                    onChange={changeStringValue}
                                />
                            </Col>
                        </Row>


                        {/* 연락처 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                연락처
                            </Form.Label>

                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    name="accountPhone"
                                    value={student.accountPhone || ""}
                                    onChange={changeStringValue}
                                />
                            </Col>
                        </Row>


                        {/* 생년월일 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                생년월일
                            </Form.Label>

                            <Col sm={9}>
                                <Form.Control
                                    type="date"
                                    name="accountBirth"
                                    value={student.accountBirth || ""}
                                    onChange={changeStringValue}
                                />
                            </Col>
                        </Row>


                        {/* 학교 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                학교
                            </Form.Label>

                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    name="studentSchool"
                                    value={student.studentSchool || ""}
                                    onChange={changeStringValue}
                                />
                            </Col>
                        </Row>


                        {/* 학년 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                학년
                            </Form.Label>

                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    name="studentGrade"
                                    value={student.studentGrade || ""}
                                    onChange={changeStringValue}
                                />
                            </Col>
                        </Row>


                        {/* 버튼 */}
                        <Row className="mt-5">
                            <Col className="text-end">

                                <Button
                                    variant="secondary"
                                    className="me-2"
                                    type="button"
                                    onClick={() => {
                                        setEditMode(false);
                                        loadStudent();
                                    }}
                                >
                                    취소
                                </Button>

                                <Button
                                    variant="success"
                                    type="submit"
                                >
                                    저장
                                </Button>

                            </Col>
                        </Row>

                    </Form>
                </>

            ) : (

                /* ================================================= */
                /* 조회 화면 */
                /* ================================================= */

                <>
                    <Jumbotron
                        title="내 정보"
                        content="내 계정 및 학생 정보를 확인할 수 있습니다."
                    />

                    <Row className="mt-5">
                        <Col md={8} className="mx-auto">


                            {/* 학생번호 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학생번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.studentNo ?? ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 계정 유형 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    계정 유형
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.accountType || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 아이디 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    아이디
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="email"
                                        value={student.accountId || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 이름 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    이름
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.accountName || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 연락처 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    연락처
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="tel"
                                        value={student.accountPhone || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 생년월일 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    생년월일
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.accountBirth || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 학교 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학교
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.studentSchool || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 학년 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학년
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.studentGrade || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 학생 상태 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학생 상태
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={student.studentAcademicStatus || ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 학생 등록일 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학생 등록일
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={
                                            student.studentCtime
                                                ? student.studentCtime.substring(0, 10)
                                                : ""
                                        }
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 정보 수정일 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    정보 수정일
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={
                                            student.accountUtime || student.studentUtime
                                                ? new Date(
                                                    Math.max(
                                                        student.accountUtime
                                                            ? new Date(student.accountUtime).getTime()
                                                            : 0,
                                                        student.studentUtime
                                                            ? new Date(student.studentUtime).getTime()
                                                            : 0
                                                    )
                                                ).toISOString().substring(0, 10)
                                                : ""
                                        }
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 버튼 */}
                            <Row className="mt-5">
                                <Col className="text-end">

                                    <Button
                                        variant="success"
                                        onClick={() => {
                                            setPassword("");
                                            setPasswordError(false);
                                            setPasswordModal(true);
                                        }}
                                    >
                                        정보 수정
                                    </Button>

                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </>
            )}


            {/* ================================================= */}
            {/* 비밀번호 확인 모달 */}
            {/* ================================================= */}

            <Modal
                show={passwordModal}
                onHide={() => {
                    setPasswordModal(false);
                    setPassword("");
                    setPasswordError(false);
                }}
                centered
            >

                <Modal.Header closeButton>
                    <Modal.Title>
                        비밀번호 확인
                    </Modal.Title>
                </Modal.Header>


                <Modal.Body>

                    <p>
                        개인정보 수정을 위해 현재 비밀번호를 입력해주세요.
                    </p>

                    <Form.Control
                        type="password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                checkPassword();
                            }
                        }}
                        placeholder="현재 비밀번호"
                    />

                    {passwordError && (
                        <div className="text-danger mt-2">
                            비밀번호가 일치하지 않습니다.
                        </div>
                    )}

                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setPasswordModal(false);
                            setPassword("");
                            setPasswordError(false);
                        }}
                    >
                        취소
                    </Button>

                    <Button
                        variant="success"
                        onClick={checkPassword}
                        disabled={password === ""}
                    >
                        확인
                    </Button>

                </Modal.Footer>

            </Modal>

        </>
    );
}