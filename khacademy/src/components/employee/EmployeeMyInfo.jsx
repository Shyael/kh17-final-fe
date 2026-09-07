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

    //비밀번호 변경용
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [prevAccountPassword, setPrevAccountPassword] = useState("");
    const [newAccountPassword, setNewAccountPassword] = useState("");
    const [newAccountPasswordCheck, setNewAccountPasswordCheck] = useState("");
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);


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

    // 비밀번호 변경을 위한 확인
    const changePassword = useCallback(async () => {
        //현재 비밀번호 입력 확인
        if (prevAccountPassword.trim() === "") {
            await Swal.fire(
                "입력 오류",
                "현재 비밀번호를 입력해주세요",
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
                "새 비밀번호를 입력해주세요",
                "warning"
            );
            return;
        }

        // 새 비밀번호 일치확인
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
            //버튼을 누르면 비밀번호 변경 모달창 on
            setChangePasswordLoading(true);

            //이전 비밀번호와 새로운 비밀번호 백엔드 검사
            const { data } = await apiClient.patch("/account/password",
                {
                    prevAccountPassword: prevAccountPassword,
                    newAccountPassword: newAccountPassword
                }
            );
            console.log("비밀번호 변경 결과 = ", data);

            if (data.result) {

                await Swal.fire(
                    "변경 완료",
                    data.message || "비밀번호 변경이 완료되었습니다.",
                    "success"
                );

                //모달 닫기
                setChangePasswordModal(false);

                //입력값 초기화
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
            const message = error.response?.data?.message
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
                                    {/* 비밀번호 변경버튼 */}
                                    <Button variant = "warning" className="me-2"
                                        onClick={() => {
                                            setPrevAccountPassword("");
                                            setNewAccountPassword("");
                                            setNewAccountPasswordCheck("");
                                            setChangePasswordModal(true);
                                        }}
                                    >
                                        비밀번호 변경
                                    </Button>

                                    {/* 개인정보 수정버튼  */}
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

            {/* 수정창 전환을 위한 비밀번호 확인 모달 */}
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

            {/* 비밀번호 변경 모달 */}
            <Modal show={changePasswordModal}
                onHide={()=> { //모달을 닫으려고 함
                    if(!changePasswordLoading) {
                        setChangePasswordModal(false);

                        setPrevAccountPassword("");
                        setNewAccountPassword("");
                        setNewAccountPasswordCheck("");
                    }  
                }}
                centered //모달을 화면의 세로방향 가운데 표시하기 위한 코드
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
                        <Form.Control type="password" value={prevAccountPassword}
                            onChange={(e)=> {
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

                        <Form.Control type="password" value={newAccountPassword}
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

                        <Form.Control type="password" value={newAccountPasswordCheck}
                        onChange={(e) => {
                            setNewAccountPasswordCheck(e.target.value);
                        }}
                        placeholder="새 비밀번호 확인"
                        disabled={changePasswordLoading}
                        />

                        {/* 입력한 경우에만 일치 여부 표시 */}
                        {newAccountPasswordCheck !== "" && 
                            newAccountPassword !== newAccountPasswordCheck
                        && (
                            <div className="text-danger mt-2">
                                새 비밀번호가 일치하지 않습니다.
                            </div> 
                        )}

                        {newAccountPasswordCheck !== "" && 
                            newAccountPassword === newAccountPasswordCheck
                        && (
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