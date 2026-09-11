
import { useSetAtom } from "jotai";


import { useCallback, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaRightToBracket } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { loginActionState } from "@utils/storage";
import { authClient } from "@utils/reaxios";
import "@templates/menu/menu.css";

export default function AccountLogin() {
    //state
    const [account, setAccount] = useState({
        accountId: "",
        accountPassword: ""
    });

    //쓰기 전용 atom
    const loginAction = useSetAtom(loginActionState);

    //navigate
    const navigate = useNavigate();

    //입력
    const changeStringValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);
    
    //로그인
    const sendLogin = useCallback(async () => {
        //미입력 시 차단
        if (account.accountId === "" || account.accountPassword === "") {
            await Swal.fire("모든 정보를 입력하세요");
            return;
        }
        try {
            const { data } = await authClient.post("/login", account);
            console.log(data);

            //data에서 needUpdate와 나머지를 뽑아내서 나눠서 사용 (구조 분해 할당)
            const { needUpdate, ...userData } = data;
            loginAction(userData);

            //로그인 성공 시에도 경우가 나눠진다
            // - data에 needUpdate 항목의 값에 따라 이동하는 페이지가 달라진다
            if (needUpdate) {//비밀번호를 바꾼지 오래되어 업데이트가 필요한 상황
                navigate("/account/needUpdate");
            }
            else {//업데이트가 필요하지 않은 일반적인 상황
                navigate("/employeeHome");
            }
        }
        catch (e) {
            console.log("에러:", e);
            console.log("응답:", e.response);
            console.log("상태 코드:", e.response?.data);
            if (e.response?.status === 403) {
                navigate("/account/block");
            }
            else if (e.response?.status === 404) {
                await Swal.fire("정보가 일치하지 않습니다");
            }
            else {//500
                await Swal.fire("일시적인 서버 오류입니다.\n잠시 후 실행해주세요");
            }
        }
    }, [account]);

    const goFind = () =>
        navigate("/account/find", { state: { loginPath: "/employee/login" } });

    const onSubmit = (e) => {
        e.preventDefault();
        sendLogin();
    };

    return (
        <div className="kh-login">
            <div className="kh-login-card">
                <div className="kh-login-title">직원 로그인</div>

                <Form onSubmit={onSubmit}>
                    <Form.Control
                        type="text"
                        name="accountId"
                        value={account.accountId}
                        onChange={changeStringValue}
                        placeholder="아이디"
                        autoFocus
                    />
                    <Form.Control
                        type="password"
                        name="accountPassword"
                        value={account.accountPassword}
                        onChange={changeStringValue}
                        placeholder="비밀번호"
                        className="mt-3 mb-3"
                    />

                    <Button
                        type="submit"
                        variant="success"
                        className="w-100 mt-5 kh-login-submit"
                    >
                        <FaRightToBracket />
                        <span className="ms-2">로그인</span>
                    </Button>
                </Form>

                <div className="kh-login-links">
                    <button type="button" onClick={goFind}>아이디 찾기</button>
                    <span className="sep">|</span>
                    <button type="button" onClick={goFind}>비밀번호 찾기</button>
                </div>
            </div>
        </div>
    );
}
