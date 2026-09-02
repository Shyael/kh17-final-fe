import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function StudentMyInfo() {

    const [student, setStudent] = useState(null);

    // 학부모 연동코드 정보들어오는 곳
    const [linkCode, setLinkCode] = useState("");
    const [linkModal, setLinkModal] = useState(false);

    // 수정 모드
    const [editMode, setEditMode] = useState(false);

    // 비밀번호 확인 모달
    const [passwordModal, setPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    //비밀번호 변경용
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [prevAccountPassword, setPrevAccountPassword] = useState("");
    const [newAccountPassword, setNewAccountPassword] = useState("");
    const [newAccountPasswordCheck, setNewAccountPasswordCheck] = useState("");
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);

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

    // 학부모 연결 코드
    const createLinkCode = useCallback(async () => {

        try {
            const { data } = await apiClient.post("/student/link");
            setLinkCode(data.linkCode);
            setLinkModal(true);
        }
        catch (error) {
            console.error("학부모 연결코드 생성 실패 = ", error);

            await Swal.fire(
                "생성 실패",
                "학부모 연결코드 생성에 실패했습니다.",
                "error"
            );
        }

    }, []);

    useEffect(() => {
        loadStudent();
    }, [loadStudent]);

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

    // 비밀번호 변경을 위한 확인
    const changePassword = useCallback(async () => {
        //현재 비밀번호 입력 확인
        if (prevAccountPassword.trim() === "") {
            await Swal.fire(
                "입력 오류",
                "현재 비밀번호를 입력해주세요.",
                "warning"
            );
            return;
        }

        //새 비밀번호 입력 확인
        if (newAccountPassword.trim() === "") {
            await Swal.fire(
                "입력 오류",
                "새 비밀번호를 입력해주세요",
                "warning"
            );
            return;
        }

        // 새 비밀번호 확인
        if (newAccountPasswordCheck.trim() === "") {
            await Swal.fire(
                "입력 오류",
                "새 비밀번호 확인을 입력해주세요.",
                "warning"
            );
            return;
        }

        // 새 비밀번호 일치 확인
        if (newAccountPassword !== newAccountPasswordCheck) {
            await Swal.fire(
                "입력 오류",
                "비밀번호가 일치하지 않습니다.",
                "warning"
            );
            return;
        }
        // 새 비밀번호 동일유무확인
        if (prevAccountPassword === newAccountPassword) {
            await Swal.fire(
                "입력 오류",
                "동일한 비밀번호로는 변경이 불가능합니다.",
                "warning"
            );
            return;
        }

        try {
            setChangePasswordLoading(true);

            const { data } = await apiClient.patch("/account/password", {
                prevAccountPassword: prevAccountPassword,
                newAccountPassword: newAccountPassword
            });
            console.log("비밀번호 변경 결과 =", data);

            if (data.result) {

                await Swal.fire(
                    "변경 완료",
                    data.message || "비밀번호 변경이 완료되었습니다.",
                    "success"
                );

                // 모달 닫기
                setChangePasswordModal(false);

                // 입력값 초기화
                setPrevAccountPassword("");
                setNewAccountPassword("");
                setNewAccountPasswordCheck("");

            }
            else {
                await Swal.fire(
                    "변경 실패",
                    data.message || "비밀번호 변경에 실패했습니다.",
                    "error"
                );
            }
        }
        catch (error) {

            console.error("비밀번호 변경 실패 =", error);

            const message =
                error.response?.data?.message
                || "비밀번호 변경에 실패했습니다.";

            await Swal.fire(
                "변경 실패",
                message,
                "error"
            );
        }
        finally {
            setChangePasswordLoading(false);
        }

    }, [prevAccountPassword, newAccountPassword, newAccountPasswordCheck]);

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

                            {/* =========================
    보호자 정보
========================= */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    보호자 정보
                                </Form.Label>

                                <Col sm={9}>

                                    {student.parents && student.parents.length > 0 ? (

                                        student.parents.map((parent) => (

                                            <div
                                                key={parent.parentNo}
                                                className="border rounded p-3 mb-3"
                                            >

                                                {/* 보호자 번호 */}
                                                <Row className="mb-2">
                                                    <Col sm={4}>
                                                        <strong>보호자번호</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {parent.parentNo ?? ""}
                                                    </Col>
                                                </Row>

                                                {/* 보호자 이름 */}
                                                <Row className="mb-2">
                                                    <Col sm={4}>
                                                        <strong>보호자 이름</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {parent.parentName ?? ""}
                                                    </Col>
                                                </Row>

                                                {/* 관계 */}
                                                <Row>
                                                    <Col sm={4}>
                                                        <strong>관계</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {parent.relationship ?? ""}
                                                    </Col>
                                                </Row>

                                            </div>

                                        ))

                                    ) : (

                                        <div className="text-muted">
                                            연동된 보호자가 없습니다.
                                        </div>

                                    )}

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

                                    {/* 학부모 연동 코드 */}
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={createLinkCode}
                                    >
                                        학부모 연동 코드
                                    </Button>
                                    {/* 비밀번호 변경 */}
                                    <Button
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => {

                                            setPrevAccountPassword("");
                                            setNewAccountPassword("");
                                            setNewAccountPasswordCheck("");

                                            setChangePasswordModal(true);
                                        }}
                                    >
                                        비밀번호 변경
                                    </Button>

                                    {/* 정보 수정 */}
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

            {/* 연결코드 모달 */}
            <Modal
                show={linkModal}
                onHide={() => setLinkModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        학부모 연동 코드
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center py-4">
                    <p className="mb-4">
                        학부모에게 아래 코드를 전달해주세요.
                    </p>

                    <div className="border rounded p-3 mb-3 bg-light">
                        <h3 className="mb-0 fw-bold">
                            {linkCode}
                        </h3>
                    </div>

                    <Button
                        variant="outline-primary"
                        onClick={async () => {
                            await navigator.clipboard.writeText(linkCode);

                            Swal.fire({
                                icon: "success",
                                title: "복사 완료",
                                text: "연동 코드가 복사되었습니다.",
                                timer: 1200,
                                showConfirmButton: false
                            });
                        }}
                    >
                        코드 복사
                    </Button>

                    <p className="text-muted small mt-4 mb-0">
                        ※ 학부모 계정에서 이 코드를 입력하면
                        학생과 연결할 수 있습니다.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setLinkModal(false)}
                    >
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* =========================
                비밀번호 변경 모달
            ========================= */}

            <Modal
                show={changePasswordModal}
                onHide={() => {

                    if (!changePasswordLoading) {

                        setChangePasswordModal(false);

                        setPrevAccountPassword("");
                        setNewAccountPassword("");
                        setNewAccountPasswordCheck("");
                    }

                }}
                centered
            >

                <Modal.Header closeButton={!changePasswordLoading}>
                    <Modal.Title>
                        비밀번호 변경
                    </Modal.Title>
                </Modal.Header>


                <Modal.Body>

                    <p className="text-muted">
                        현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다.
                    </p>

                    {/* 현재 비밀번호 */}
                    <Form.Group className="mb-4">

                        <Form.Label>
                            현재 비밀번호
                        </Form.Label>

                        <Form.Control
                            type="password"
                            value={prevAccountPassword}
                            onChange={(e) => {
                                setPrevAccountPassword(e.target.value);
                            }}
                            placeholder="현재 비밀번호"
                            disabled={changePasswordLoading}
                        />

                    </Form.Group>

                    {/* 새 비밀번호 */}
                    <Form.Group className="mb-4">

                        <Form.Label>
                            새 비밀번호
                        </Form.Label>

                        <Form.Control
                            type="password"
                            value={newAccountPassword}
                            onChange={(e) => {
                                setNewAccountPassword(e.target.value);
                            }}
                            placeholder="새 비밀번호"
                            disabled={changePasswordLoading}
                        />

                        <Form.Text className="text-muted">
                            8~16자이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
                        </Form.Text>

                    </Form.Group>


                    {/* 새 비밀번호 확인 */}
                    <Form.Group>

                        <Form.Label>
                            새 비밀번호 확인
                        </Form.Label>

                        <Form.Control
                            type="password"
                            value={newAccountPasswordCheck}
                            onChange={(e) => {
                                setNewAccountPasswordCheck(e.target.value);
                            }}
                            placeholder="새 비밀번호 확인"
                            disabled={changePasswordLoading}
                        />

                        {/* 입력한 경우에만 일치 여부 표시 */}
                        {newAccountPasswordCheck !== "" &&
                            newAccountPassword !== newAccountPasswordCheck && (

                                <div className="text-danger mt-2">
                                    새 비밀번호가 일치하지 않습니다.
                                </div>

                            )}

                        {newAccountPasswordCheck !== "" &&
                            newAccountPassword === newAccountPasswordCheck && (

                                <div className="text-success mt-2">
                                    새 비밀번호가 일치합니다.
                                </div>

                            )}

                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>

                    {/* 취소 */}
                    <Button
                        variant="secondary"
                        onClick={() => {

                            setChangePasswordModal(false);

                            setPrevAccountPassword("");
                            setNewAccountPassword("");
                            setNewAccountPasswordCheck("");

                        }}
                        disabled={changePasswordLoading}
                    >
                        취소
                    </Button>


                    {/* 변경 */}
                    <Button
                        variant="warning"
                        onClick={changePassword}
                        disabled={
                            changePasswordLoading ||
                            prevAccountPassword === "" ||
                            newAccountPassword === "" ||
                            newAccountPasswordCheck === "" ||
                            newAccountPassword !== newAccountPasswordCheck
                        }
                    >
                        {changePasswordLoading
                            ? "변경 중..."
                            : "변경하기"
                        }
                    </Button>

                </Modal.Footer>

            </Modal>
        </>
    );
}