import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function EmployeeMyInfo() {

    const [employee, setEmployee] = useState(null);
    const [passwordModal, setPasswordModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    // 직원 정보 조회
    const loadEmployee = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/employee/me");

            console.log("직원 정보 =", data);

            setEmployee(data);
        }
        catch (e) {
            console.log("직원 정보 조회 실패 =", e);

            await Swal.fire(
                "직원 정보를 불러오지 못했습니다."
            );
        }
    }, []);

    useEffect(() => {
        loadEmployee();
    }, [loadEmployee]);

    //비밀번호 확인 함수
    const checkPassword = useCallback(async () => {
        try {
            const { data } = await apiClient.post(
                "/employee/password-check",
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
            console.error(error);
            setPasswordError(true);
        }
    }, [password]);

    const changeStringValue = useCallback((e) => {
        const { name, value } = e.target;

        setEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 직원 정보 수정
    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();

        try {
            const { data } = await apiClient.put("/employee/", {
                accountName: employee.accountName,
                accountPhone: employee.accountPhone,
                accountBirth: employee.accountBirth
            });

            console.log("직원 정보 수정 결과 =", data);

            await Swal.fire(
                "수정 완료",
                "직원 정보가 수정되었습니다.",
                "success"
            );

            // 수정 모드 종료
            setEditMode(false);

            // 수정된 최신 정보 다시 조회
            loadEmployee();
        }
        catch (error) {
            console.error("직원 정보 수정 실패 =", error);

            await Swal.fire(
                "수정 실패",
                "직원 정보 수정에 실패했습니다.",
                "error"
            );
        }
    }, [employee, loadEmployee]);

    if (employee === null) {
        return (
            <>
                <Jumbotron
                    title="내 정보"
                    content="직원 정보를 불러오는 중입니다."
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
                    <Jumbotron
                        title="내 정보 수정"
                        content="개인정보를 수정할 수 있습니다."
                    />

                    <Form>
                        {/* 이름 */}
                        <Row className="mb-4">
                            <Form.Label column sm={3}>
                                이름
                            </Form.Label>
                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    name="accountName"
                                    value={employee.accountName}
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
                                    value={employee.accountPhone}
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
                                    value={employee.accountBirth}
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
                                    onClick={() => setEditMode(false)}
                                >
                                    취소
                                </Button>

                                <Button
                                    variant="success"
                                    onClick={sendUpdate}
                                >
                                    수정
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </>
            ) : (
                <>
                    <Jumbotron
                        title="내 정보"
                        content="내 계정 및 직원 정보를 확인할 수 있습니다."
                    />

                    <Row className="mt-5">
                        <Col md={8} className="mx-auto">

                            {/* 직원번호 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    직원번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={employee.employeeNo}
                                        readOnly
                                    />
                                </Col>
                            </Row>

                            {/* 유형 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    유형
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={employee.accountType}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                            {/* 직원유형 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    직원유형
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={employee.employeeType}
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
                                        value={employee.accountId}
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
                                        value={employee.accountName}
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
                                        value={employee.accountBirth}
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
                                        value={employee.accountPhone}
                                        readOnly
                                    />
                                </Col>
                            </Row>

                            {/* 입사일 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    입사일
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={
                                            employee.employeeHtime
                                                ? employee.employeeHtime.substring(0, 10)
                                                : ""
                                        }
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
                                        value={employee.accountStatus}
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
                                        value={employee.accountType}
                                        readOnly
                                    />
                                </Col>
                            </Row>

                            {/* 수정일 */}
                            <Row className="mb-4">
                                <Form.Label column sm={3}>
                                    정보 수정일
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        value={
                                            employee.accountUtime
                                                ? new Date(employee.accountUtime).toLocaleDateString("ko-KR")
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


            <Modal
                show={passwordModal}
                onHide={() => setPasswordModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>비밀번호 확인</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>개인정보 수정을 위해 현재 비밀번호를 입력해주세요.</p>

                    <Form.Control
                        type="password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setPasswordError(false);
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
                        onClick={() => setPasswordModal(false)}
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