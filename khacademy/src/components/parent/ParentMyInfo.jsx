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


                            {/* 자녀 학생 번호 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학생번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={parent.studentNo ?? ""}
                                        readOnly
                                    />
                                </Col>
                            </Row>


                            {/* 학생과의 관계 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    학생과의 관계
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={parent.relationship ?? ""}
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


                            {/* 수정 버튼 */}
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

        </>
    );
}