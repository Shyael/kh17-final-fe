import Jumbotron from "@templates/Jumbotron";
import { useCallback, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiClient } from "@utils/reaxios";

export default function AccountFind() {

    const location = useLocation();

    const loginPath = location.state?.loginPath || "/member/login";

    const [loading, setLoading] = useState(false);
    // 아이디 찾기 / 비밀번호 찾기
    const [mode, setMode] = useState("id");

    // 아이디 찾기 정보
    const [idFind, setIdFind] = useState({
        accountName: "",
        accountPhone: "",
    });

    // 비밀번호 찾기 정보
    const [passwordFind, setPasswordFind] = useState({
        accountId: "",
        accountName: "",
        accountPhone: "",
    });

    // 아이디 찾기 결과
    const [foundAccountId, setFoundAccountId] = useState("");

    // 비밀번호 찾기 결과
    const [passwordFindComplete, setPasswordFindComplete] = useState(false);

    const navigate = useNavigate();


    // =========================
    // 입력
    // =========================

    // 아이디 찾기 입력
    const changeIdValue = useCallback(e => {
        const { name, value } = e.target;

        setIdFind(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 비밀번호 찾기 입력
    const changePasswordValue = useCallback(e => {
        const { name, value } = e.target;

        setPasswordFind(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);


    // =========================
    // 아이디 찾기
    // =========================

    const findAccountId = useCallback(async () => {

        // 미입력 검사
        if (
            idFind.accountName === "" ||
            idFind.accountPhone === ""
        ) {
            await Swal.fire("이름과 연락처를 모두 입력하세요");
            return;
        }

        try {
            const { data } = await apiClient.post(
                "/account/find-id",
                idFind
            );

            console.log("data =", data);

            setFoundAccountId(data.accountId);
        }
        catch (e) {
            console.log("에러 전체:", e);
            console.log("에러 응답:", e.response);
            console.log("에러 상태:", e.status);

            if (e.status === 404) {
                await Swal.fire("일치하는 회원정보가 없습니다");
            }
            else {
                await Swal.fire(
                    "일시적인 서버 오류입니다.\n잠시 후 다시 시도해주세요"
                );
            }
        }

    }, [idFind]);


    // =========================
    // 비밀번호 찾기
    // =========================

    const findAccountPassword = useCallback(async () => {

        // 미입력 검사
        if (
            passwordFind.accountId === "" ||
            passwordFind.accountName === "" ||
            passwordFind.accountPhone === ""
        ) {
            await Swal.fire("모든 정보를 입력하세요");
            return;
        }

        try {
            setLoading(true);
            await apiClient.post(
                "/account/find-password",
                passwordFind
            );

            // 이메일 발송 성공
            setPasswordFindComplete(true);

        }
        catch (e) {

            if (e.status === 404) {
                await Swal.fire("일치하는 회원정보가 없습니다");
            }
            else {
                await Swal.fire(
                    "일시적인 서버 오류입니다.\n잠시 후 다시 시도해주세요"
                );
            }

        }
        finally {
            setLoading(false);
        }
    }, [passwordFind]);


    // =========================
    // 모드 변경
    // =========================

    const changeMode = useCallback((newMode) => {

        setMode(newMode);

        // 아이디 찾기 초기화
        setIdFind({
            accountName: "",
            accountPhone: ""
        });

        setFoundAccountId("");

        // 비밀번호 찾기 초기화
        setPasswordFind({
            accountId: "",
            accountName: "",
            accountPhone: ""
        });

        setPasswordFindComplete(false);

    }, []);


    return (
        <>

            <Jumbotron
                title="아이디, 비밀번호 찾기"
                content="가입하신 계정의 정보를 입력해주세요."
            />


            {/* =========================
                탭
            ========================= */}

            <Row className="mt-4">
                <Col className="d-flex">

                    <Button
                        variant={
                            mode === "id"
                                ? "success"
                                : "outline-success"
                        }
                        className="flex-fill me-2"
                        onClick={() => changeMode("id")}
                    >
                        아이디 찾기
                    </Button>

                    <Button
                        variant={
                            mode === "password"
                                ? "success"
                                : "outline-success"
                        }
                        className="flex-fill"
                        onClick={() => changeMode("password")}
                    >
                        비밀번호 찾기
                    </Button>

                </Col>
            </Row>


            {/* =========================
                아이디 찾기
            ========================= */}

            {mode === "id" && (
                <>
                    {foundAccountId === "" ? (
                        <>

                            <Row className="mt-5">
                                <Form.Label column sm={3}>
                                    이름
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        name="accountName"
                                        value={idFind.accountName}
                                        onChange={changeIdValue}
                                        placeholder="이름"
                                        autoFocus
                                    />
                                </Col>
                            </Row>


                            <Row className="mt-4">
                                <Form.Label column sm={3}>
                                    휴대폰번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="tel"
                                        name="accountPhone"
                                        value={idFind.accountPhone}
                                        onChange={changeIdValue}
                                        placeholder="휴대폰번호"
                                    />
                                </Col>
                            </Row>


                            <Row className="mt-5">
                                <Col className="text-end">

                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={findAccountId}
                                    >
                                        아이디 찾기
                                    </Button>

                                </Col>
                            </Row>

                        </>
                    ) : (
                        <>

                            {/* 아이디 찾기 결과 */}

                            <Row className="mt-5">
                                <Col className="text-center">

                                    <div className="text-muted mb-3">
                                        회원님의 아이디는
                                    </div>

                                    <h3>
                                        {foundAccountId}
                                    </h3>

                                    <div className="text-muted mt-3">
                                        입니다.
                                    </div>

                                </Col>
                            </Row>


                            <Row className="mt-5">
                                <Col className="text-center">

                                    <Button
                                        type="button"
                                        variant="success"
                                        size="lg"
                                        onClick={() =>
                                            navigate(loginPath)
                                        }
                                    >
                                        로그인으로 이동
                                    </Button>

                                </Col>
                            </Row>

                        </>
                    )}
                </>
            )}


            {/* =========================
                비밀번호 찾기
            ========================= */}

            {mode === "password" && (
                <>
                    {passwordFindComplete === false ? (
                        <>

                            <Row className="mt-5">
                                <Form.Label column sm={3}>
                                    아이디
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="email"
                                        name="accountId"
                                        value={passwordFind.accountId}
                                        onChange={changePasswordValue}
                                        placeholder="이메일"
                                        autoFocus
                                    />
                                </Col>
                            </Row>


                            <Row className="mt-4">
                                <Form.Label column sm={3}>
                                    이름
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        name="accountName"
                                        value={passwordFind.accountName}
                                        onChange={changePasswordValue}
                                        placeholder="이름"
                                    />
                                </Col>
                            </Row>


                            <Row className="mt-4">
                                <Form.Label column sm={3}>
                                    휴대폰번호
                                </Form.Label>

                                <Col sm={9}>
                                    <Form.Control
                                        type="tel"
                                        name="accountPhone"
                                        value={passwordFind.accountPhone}
                                        onChange={changePasswordValue}
                                        placeholder="휴대폰번호"
                                    />
                                </Col>
                            </Row>


                            <Row className="mt-5">
                                <Col className="text-end">

                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={findAccountPassword}
                                        disabled={loading}
                                    >
                                        {loading ? "이메일 발송 중..." : "이메일 인증"}
                                    </Button>

                                </Col>
                            </Row>

                        </>
                    ) : (
                        <>

                            {/* 비밀번호 찾기 결과 */}

                            <Row className="mt-5">
                                <Col className="text-center">

                                    <div className="text-muted mb-3">
                                        임시 비밀번호가 이메일로 발송되었습니다.
                                    </div>

                                    <h4>
                                        {passwordFind.accountId}
                                    </h4>

                                    <div className="text-muted mt-3">
                                        이메일을 확인해주세요.
                                    </div>

                                </Col>
                            </Row>


                            <Row className="mt-5">
                                <Col className="text-center">

                                    <Button
                                        type="button"
                                        variant="success"
                                        size="lg"
                                        onClick={() =>
                                            navigate(loginPath)
                                        }
                                    >
                                        로그인으로 이동
                                    </Button>

                                </Col>
                            </Row>

                        </>
                    )}
                </>
            )}

        </>
    );
}