import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function ParentMyInfo() {

    const [parent, setParent] = useState(null);

    // 비밀번호 확인 모달
    const [passwordModal, setPasswordModal] = useState(false);

    // 수정 모드
    const [editMode, setEditMode] = useState(false);

    // 비밀번호
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    // 비밀번호 변경용
    const [changePasswordModal, setChangePasswordModal] = useState(false);

    const [prevAccountPassword, setPrevAccountPassword] = useState("");
    const [newAccountPassword, setNewAccountPassword] = useState("");
    const [newAccountPasswordCheck, setNewAccountPasswordCheck] = useState("");

    const [changePasswordLoading, setChangePasswordLoading] = useState(false);

    // 학생 연동 모달
    const [linkModal, setLinkModal] = useState(false);

    // 학생 연동코드
    const [linkCode, setLinkCode] = useState("");

    // 학생과의 관계
    const [relationship, setRelationship] = useState("부");

    // 연동 중
    const [linkLoading, setLinkLoading] = useState(false);

    // 학생 관계 수정 모달
    const [relationshipModal, setRelationshipModal] = useState(false);

    // 관계 수정 대상 학생
    const [selectedStudent, setSelectedStudent] = useState(null);

    // 수정할 관계
    const [editRelationship, setEditRelationship] = useState("부");

    // 관계 수정 중
    const [relationshipLoading, setRelationshipLoading] = useState(false);

    // =========================
    // 학부모 정보 조회
    // =========================
    const loadParent = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/parent/me");

            console.log("학부모 정보 =", data);

            setParent(data);
        }
        catch (e) {
            console.error("학부모 정보 조회 실패 =", e);

            await Swal.fire(
                "조회 실패",
                "학부모 정보를 불러오지 못했습니다.",
                "error"
            );
        }
    }, []);


    useEffect(() => {
        loadParent();
    }, [loadParent]);


    // =========================
    // 비밀번호 확인
    // =========================
    const checkPassword = useCallback(async () => {
        try {
            const { data } = await apiClient.post(
                "/parent/password-check",
                {
                    accountPassword: password
                }
            );

            if (data === true) {
                setPasswordModal(false);
                setEditMode(true);

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

    // =========================
    // 비밀번호 변경을 위한 확인
    // =========================
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

    // =========================
    // 입력값 변경
    // =========================
    const changeStringValue = useCallback((e) => {
        const { name, value } = e.target;

        setParent(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);


    // =========================
    // 학부모 정보 수정
    // =========================
    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();

        try {
            const { data } = await apiClient.put(
                "/parent/",
                {
                    accountName: parent.accountName,
                    accountPhone: parent.accountPhone,
                    accountBirth: parent.accountBirth
                }
            );

            console.log("학부모 정보 수정 결과 =", data);

            await Swal.fire(
                "수정 완료",
                "개인정보가 수정되었습니다.",
                "success"
            );

            // 수정 모드 종료
            setEditMode(false);

            // 최신 정보 다시 조회
            loadParent();
        }
        catch (error) {
            console.error("학부모 정보 수정 실패 =", error);

            await Swal.fire(
                "수정 실패",
                "개인정보 수정에 실패했습니다.",
                "error"
            );
        }
    }, [parent, loadParent]);

    // =========================
    // 학생 연동
    // =========================
    const linkStudent = useCallback(async () => {
        if (linkCode.trim() === "") {
            await Swal.fire(
                "입력 오류",
                "학생에게 받은 연동코드를 입력해주세요.",
                "warning"
            );
            return;
        }

        try {
            setLinkLoading(true);

            const { data } = await apiClient.post(
                "/parent/link-student",
                {
                    linkCode: linkCode.trim(),
                    relationship: relationship
                }
            );

            console.log("학생 연동 결과 =", data);

            await Swal.fire(
                "연동 완료",
                `${data.studentName} 학생과 연동되었습니다.`,
                "success"
            );

            //모달 초기화
            setLinkModal(false);
            setLinkCode("");
            setRelationship("부");

            await loadParent();
        }
        catch (error) {

            console.error("학생 연동 실패 =", error);

            const message =
                error.response?.data?.message
                || "학생 연동에 실패했습니다.";

            await Swal.fire(
                "연동 실패",
                message,
                "error"
            );

        }
        finally {
            setLinkLoading(false);
        }

    }, [linkCode, relationship, loadParent]);

    // =========================
    // 학생과의 관계 수정
    // =========================
    const updateRelationship = useCallback(async () => {

        if (selectedStudent === null) {
            return;
        }

        try {

            setRelationshipLoading(true);

            const { data } = await apiClient.put(
                "/parent/relationship",
                {
                    studentNo: selectedStudent.studentNo,
                    relationship: editRelationship
                }
            );

            console.log("학생 관계 수정 결과 =", data);

            await Swal.fire(
                "수정 완료",
                "학생과의 관계가 수정되었습니다.",
                "success"
            );

            // 모달 닫기
            setRelationshipModal(false);

            // 선택 학생 초기화
            setSelectedStudent(null);

            // 관계 초기화
            setEditRelationship("부");

            // 최신 정보 다시 조회
            await loadParent();

        }
        catch (error) {

            console.error("학생 관계 수정 실패 =", error);

            const message =
                error.response?.data?.message
                || "학생과의 관계 수정에 실패했습니다.";

            await Swal.fire(
                "수정 실패",
                message,
                "error"
            );

        }
        finally {

            setRelationshipLoading(false);

        }

    }, [
        selectedStudent,
        editRelationship,
        loadParent
    ]);

    // =========================
    // 로딩
    // =========================
    if (parent === null) {
        return (
            <>
                <Jumbotron
                    title="내 정보"
                    content="학부모 정보를 불러오는 중입니다."
                />

                <div className="text-center mt-5">
                    정보를 불러오는 중...
                </div>
            </>
        );
    }


    return (
        <>
            {editMode ? (
                <>
                    {/* =========================
                        수정 화면
                    ========================= */}

                    <Jumbotron
                        title="내 정보 수정"
                        content="개인정보를 수정할 수 있습니다."
                    />

                    <Row className="mt-5">
                        <Col md={8} className="mx-auto">

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
                                            value={parent.accountName ?? ""}
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
                                            type="tel"
                                            name="accountPhone"
                                            value={parent.accountPhone ?? ""}
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
                                            value={parent.accountBirth ?? ""}
                                            onChange={changeStringValue}
                                        />
                                    </Col>
                                </Row>


                                {/* 버튼 */}
                                <Row className="mt-5">
                                    <Col className="text-end">

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => {
                                                setEditMode(false);

                                                // 수정 취소하면 원래 정보 다시 조회
                                                loadParent();
                                            }}
                                        >
                                            취소
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="success"
                                        >
                                            수정
                                        </Button>

                                    </Col>
                                </Row>

                            </Form>

                        </Col>
                    </Row>
                </>
            ) : (
                <>
                    {/* =========================
                        조회 화면
                    ========================= */}

                    <Jumbotron
                        title="내 정보"
                        content="내 계정 및 학부모 정보를 확인할 수 있습니다."
                    />

                    <Row className="mt-5">
                        <Col md={8} className="mx-auto">


                            {/* 학부모 번호 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학부모번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={parent.parentNo ?? ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>

                            {/* =========================
                                자녀 정보
                            ========================= */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    자녀 정보
                                </Form.Label>

                                <Col sm={9}>

                                    {parent.students && parent.students.length > 0 ? (

                                        parent.students.map((student) => (

                                            <div
                                                key={student.studentNo}
                                                className="border rounded p-3 mb-3"
                                            >

                                                {/* 학생 이름 */}
                                                <Row className="mb-2">
                                                    <Col sm={4}>
                                                        <strong>학생 이름</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {student.studentName ?? ""}
                                                    </Col>
                                                </Row>


                                                {/* 학생번호 */}
                                                <Row className="mb-2">
                                                    <Col sm={4}>
                                                        <strong>학생번호</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {student.studentNo ?? ""}
                                                    </Col>
                                                </Row>


                                                {/* 관계 */}
                                                <Row className="mb-3">
                                                    <Col sm={4}>
                                                        <strong>관계</strong>
                                                    </Col>

                                                    <Col sm={8}>
                                                        {student.relationship ?? ""}
                                                    </Col>
                                                </Row>


                                                {/* 관계 수정 버튼 */}
                                                <div className="text-end">

                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {

                                                            setSelectedStudent(student);

                                                            setEditRelationship(
                                                                student.relationship ?? "부"
                                                            );

                                                            setRelationshipModal(true);

                                                        }}
                                                    >
                                                        관계 수정
                                                    </Button>

                                                </div>

                                            </div>

                                        ))

                                    ) : (

                                        <div className="text-muted">
                                            연동된 자녀가 없습니다.
                                        </div>

                                    )}

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
                                        value={parent.accountId ?? ""}
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
                                        value={parent.accountName ?? ""}
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
                                        type="date"
                                        value={parent.accountBirth ?? ""}
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
                                        value={parent.accountPhone ?? ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 계정 상태 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    계정상태
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={parent.accountStatus ?? ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 계정 유형 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    계정유형
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={parent.accountType ?? ""}
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
                                            parent.accountUtime
                                                ? new Date(
                                                    parent.accountUtime
                                                ).toLocaleDateString("ko-KR")
                                                : ""
                                        }
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 연동 및 수정 버튼 */}
                            <Row className="mt-5">
                                <Col className="text-end">

                                    {/* 학생 연동 */}
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => {
                                            setLinkCode("");
                                            setRelationship("부");
                                            setLinkModal(true);
                                        }}
                                    >
                                        학생 연동
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

                                    {/* 개인정보 수정 */}
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
            {/* =========================
                학생 연동 모달
            ========================= */}

            <Modal
                show={linkModal}
                onHide={() => {
                    if (!linkLoading) {
                        setLinkModal(false);
                    }
                }}
                centered
            >
                <Modal.Header closeButton={!linkLoading}>
                    <Modal.Title>
                        학생 연동
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    <p className="text-muted">
                        학생에게 받은 연동코드를 입력해주세요.
                    </p>

                    {/* 연동코드 */}
                    <Form.Group className="mb-4">

                        <Form.Label>
                            연동코드
                        </Form.Label>

                        <Form.Control
                            type="text"
                            value={linkCode}
                            onChange={e => {
                                setLinkCode(e.target.value.toUpperCase());
                            }}
                            placeholder="학생에게 받은 연동코드"
                            disabled={linkLoading}
                        />

                    </Form.Group>

                    {/* 관계 */}
                    <Form.Group>

                        <Form.Label>
                            학생과의 관계
                        </Form.Label>

                        <Form.Select
                            value={relationship}
                            onChange={e => {
                                setRelationship(e.target.value);
                            }}
                            disabled={linkLoading}
                        >
                            <option value="부">부</option>
                            <option value="모">모</option>
                            <option value="보호자">보호자</option>
                            <option value="기타">기타</option>
                        </Form.Select>
                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setLinkModal(false);
                            setLinkCode("");
                            setRelationship("부");
                        }}
                        disabled={linkLoading}
                    >
                        취소
                    </Button>

                    <Button
                        variant="primary"
                        onClick={linkStudent}
                        disabled={
                            linkLoading ||
                            linkCode.trim() === ""
                        }
                    >
                        {linkLoading ? "연동 중..." : "연동하기"}
                    </Button>

                </Modal.Footer>

            </Modal>

            {/* =========================
                학생 관계 수정 모달
            ========================= */}

            <Modal
                show={relationshipModal}
                onHide={() => {

                    if (!relationshipLoading) {

                        setRelationshipModal(false);
                        setSelectedStudent(null);
                        setEditRelationship("부");

                    }

                }}
                centered
            >

                <Modal.Header closeButton={!relationshipLoading}>

                    <Modal.Title>
                        학생과의 관계 수정
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    {selectedStudent && (
                        <>

                            {/* 학생 이름 */}
                            <div className="mb-4">

                                <div className="text-muted mb-1">
                                    학생
                                </div>

                                <div className="fw-bold">
                                    {selectedStudent.studentName}
                                </div>

                            </div>


                            {/* 학생번호 */}
                            <div className="mb-4">

                                <div className="text-muted mb-1">
                                    학생번호
                                </div>

                                <div>
                                    {selectedStudent.studentNo}
                                </div>

                            </div>


                            {/* 관계 */}
                            <Form.Group>

                                <Form.Label>
                                    학생과의 관계
                                </Form.Label>

                                <Form.Select
                                    value={editRelationship}
                                    onChange={(e) => {
                                        setEditRelationship(e.target.value);
                                    }}
                                    disabled={relationshipLoading}
                                >

                                    <option value="부">
                                        부
                                    </option>

                                    <option value="모">
                                        모
                                    </option>

                                    <option value="보호자">
                                        보호자
                                    </option>

                                    <option value="기타">
                                        기타
                                    </option>

                                </Form.Select>

                            </Form.Group>

                        </>
                    )}

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={() => {

                            setRelationshipModal(false);
                            setSelectedStudent(null);
                            setEditRelationship("부");

                        }}
                        disabled={relationshipLoading}
                    >
                        취소
                    </Button>


                    <Button
                        variant="primary"
                        onClick={updateRelationship}
                        disabled={relationshipLoading}
                    >
                        {relationshipLoading
                            ? "수정 중..."
                            : "수정"
                        }
                    </Button>

                </Modal.Footer>

            </Modal>

            {/* =========================
                비밀번호 확인 모달
            ========================= */}

            <Modal
                show={passwordModal}
                onHide={() => setPasswordModal(false)}
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
                            if (e.key === "Enter" && password !== "") {
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