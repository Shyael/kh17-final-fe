import Jumbotron from "@templates/Jumbotron";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FaAsterisk, FaCheck, FaEye, FaEyeSlash, FaMagnifyingGlass, FaPaperPlane, FaRotateRight, FaSpinner, FaUserPlus, FaXmark } from "react-icons/fa6";
import axios from "axios";
import { useKakaoPostcodePopup } from "react-daum-postcode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiClient, certClient } from "../../utils/reaxios";

export default function EmployeeRegister() {
    //kakao post
    const open = useKakaoPostcodePopup(
        "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    );
    const today = new Date().toISOString().slice(0, 10);

    //state
    const [account, setAccount] = useState({
        accountId: "",
        accountPassword: "",
        accountPassword2: "",
        accountName: "",
        accountBirth: "",
        accountPhone: "",
        employeeType: "",
        employeeHtime: today, //고용일자
        accountStatus: "Y",
        roleNos: [],
    });
    const [result, setResult] = useState({
        accountId: { clazz: null, code: null },
        accountPassword: null,
        accountPassword2: null, //빼고 보내는 거 잊지말기
        accountName: null,
        accountBirth: null,
        accountPhone: null,
        employeeType: null,
        employeeHtime: null,
        accountStatus: null,
        roleNos: [],
    });

    //비밀번호와 비밀번호 확인을 한번에 다루겠다
    // const [visible, setVisible] = useState(false);
    // 따로 다루겠다
    const [visible, setVisible] = useState({
        accountPassword: false,
        accountPassword2: false
    });

    //callback
    const changeStringValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const changeEmployeeType = useCallback((e) => {
        const { value } = e.target;
        let roleNos = [];
        if (value === "데스크") {
            roleNos = [3];
        }
        else if (value === "강사") {
            roleNos = [4];
        }
        else if (value === "원장") {
            roleNos = [5];
        }

        setAccount(prev => ({
            ...prev,
            employeeType: value,
            roleNos: roleNos
        }));

        // 직원 유형 검증 결과 초기화
        setResult(prev => ({
            ...prev,
            employeeType: value === "" ? "is-invalid" : "is-valid"
        }));
    }, []);

    const changeAccountId = useCallback(e => {
        //인증이 끝났는데 입력을 다시 한 경우 → 인증완료를 없던 일로 한다
        if (result.accountId.clazz === "is-valid") {
            setResult(prev => ({
                ...prev,
                accountId: { clazz: null, code: null }
            }));
        }
        setAccount(prev => ({
            ...prev,
            accountId: e.target.value
        }));
    }, [result]);


    //검사 함수
    //[1] 아이디
    const checkAccountId = useCallback(async (e) => {
        const regex = /^([a-z][a-z0-9]{4,19})@([A-Za-z0-9\-\.]{1,})(\.[a-z]{2,3})$/;
        const valid = regex.test(account.accountId);
        if (valid === false) { //형식 위반
            setResult(prev => ({
                ...prev,
                accountId: { clazz: "is-invalid", code: "format" }
            }));
            return;
        }
        //형식 통과 → 중복 검사
        const { data } = await apiClient.get(`/employee/check-id/${account.accountId}`);
        const clazz = data ? "" : "is-invalid"; //형식과 중복검사를 통과하더라도 아직 인증번호가 남아있음
        const code = data ? null : "duplicate";
        setResult(prev => ({
            ...prev,
            accountId: { clazz: clazz, code: code }
        }));
    }, [account]);

    //[2] 비밀번호 검사
    const checkAccountPassword = useCallback(() => {
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)(?=.*?[\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\'\"\`\~\<\>\.\,\/\?\\\|]+)[A-Za-z0-9\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\'\"\`\~\<\>\.\,\/\?\\\|]{8,16}$/;
        const valid = regex.test(account.accountPassword);
        const clazz = valid ? "is-valid" : "is-invalid";

        //비밀번호 확인
        const valid2 = account.accountPassword.length > 0
            && account.accountPassword === account.accountPassword2;
        const clazz2 = valid2 ? "is-valid" : "is-invalid";
        setResult(prev => ({
            ...prev,
            accountPassword: clazz,
            accountPassword2: clazz2
        }));
    }, [account]);

    //[3] 이름
    const checkAccountName = useCallback(() => {
        const valid = account.accountName.trim() !== "";
        const clazz = valid ? "is-valid" : "is-invalid";

        setResult(prev => ({
            ...prev,
            accountName: clazz
        }));
    }, [account])

    //[4] 생일
    const checkAccountBirth = useCallback(() => {
        const regex = /^([0-9]{4})-(((02)-(0[1-9]|1[0-9]|2[0-9]))|((0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30))|((0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01])))$/;
        const valid = account.accountBirth.length !== "" || regex.test(account.accountBirth);
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, accountBirth: clazz }));
    }, [account]);

    //[5] 연락처
    const checkAccountPhone = useCallback(() => {
        const regex = /^010[1-9][0-9]{7}$/;

        const valid = account.accountPhone.length !== "" && regex.test(account.accountPhone);
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, accountPhone: clazz }));
    }, [account]);

    //[6] 직원 유형
    const checkEmployeeType = useCallback(() => {
        const valid = account.employeeType === '데스크'
            || account.employeeType === "강사"
            || account.employeeType === "원장";
        const clazz = valid ? "is-valid" : "is-invalid";

        setResult(prev => ({
            ...prev,
            employeeType: clazz
        }), [account]);
    }, [account])
    //[7] 고용 일자
    const checkEmployeeHtime = useCallback(() => {
        const valid = account.employeeHtime !== "";
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, employeeHtime: clazz }));
    }, [account]);

    //[8] 이용상태 
    const checkAccountStatus = useCallback(() => {
        const valid = account.accountStatus === 'Y'
            || account.accountStatus === "N";
        const clazz = valid ? "is-valid" : "is-invalid";

        setResult(prev => ({
            ...prev,
            accountStatus: clazz
        }), [account]);
    })

    //아이디(이메일) 인증
    const sendCert = useCallback(async () => {
        //다시 보내기 일수도 있으니 result의 accountId의 상태를 초기화한다
        setResult(prev => ({
            ...prev,
            accountId: { clazz: null, code: null }
        }), []);
        setCertNumberResult(null);
        setCertNumber("");
        try {
            setSending(true);
            const response = await certClient.post(
                "/send",
                { certEmail: account.accountId }
            );
            console.log("이메일 발송 완료");
        }
        catch (e) {
            toast.error("이메일 발송 오류 발생");
        }
        finally {
            setSending(false); //오류 여부 상관없이 false
        }
    }, [account.accountId]);

    //인증번호 관련 state
    const [certNumber, setCertNumber] = useState(""); //처음에 비어있다고 (문자열)
    const [certNumberResult, setCertNumberResult] = useState(null);
    const [sending, setSending] = useState(null); //이메일 발송중 여부 상태(null(발송중) / true(발송) / false(미발송))

    const changeCertNumber = useCallback(e => {
        const regex = /[^0-9]+/g;
        const replacement = e.target.value.replace(regex, "");
        setCertNumber(replacement);
    }, []);

    const checkCert = useCallback(async () => {
        //data는 CertCheckResponseVO의 valid값
        const { data } = await certClient.post(
            "/check",
            { certEmail: account.accountId, certNumber: certNumber }
        );
        // console.log("결과 : ", data.valid);
        setCertNumberResult(data.valid ? "is-valid" : "is-invalid");
        if (data.valid) { //인증결과가 성공이라면
            // result에 있는 accountId clazz에 is-valid를 넣어라
            setResult(prev => ({
                ...prev,
                accountId: { clazz: "is-valid", code: null }
            }));
        }
    }, [account.accountId, certNumber]);

    //memo
    const allValid = useMemo(() => {
        if (result.accountId.clazz !== "is-valid") return false; //필수
        if (result.accountPassword !== "is-valid") return false; //필수
        if (result.accountPassword2 !== "is-valid") return false; //필수
        if (result.accountName !== "is-valid") return false; //필수
        if (result.accountStatus !== "is-valid") return false; //필수
        if (result.accountPhone !== "is-valid") return false; //필수
        if (result.employeeType !== "is-valid") return false;
        if (result.employeeHtime !== "is-valid") return false;

        if (certNumberResult !== "is-valid") return false; //인증번호

        if (result.accountBirth === "is-invalid") return false; //선택

        return true;
    }, [result, certNumberResult]);

    // 최종 가입
    const navigate = useNavigate();
    const sendRegister = useCallback(async () => {
        try {
            // const copy = {...acount};
            // delete copy.acountPassword2; //아래 구조분해 할당 or 두줄 코드
            const { accountPassword2, ...copy } = account;
            const response = await apiClient.post("/employee/", copy);
            //toast.success("회원 등록이 완료되었습니다");
            navigate("/employee/registerSuccess");
        }
        catch (e) {
            // toast.error("회원 등록 과정에서 오류가 발생했습니다");
            navigate("/employee/registerFail");
        }
    }, [account]);

    return (<>
        <Jumbotron title="직원등록" content="부정확한 정보 입력이 환인된 경우 계정 이용 불가능합니다" />
        {/* 아이디 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                <span>아이디</span>
                <FaAsterisk className="text-danger" />
            </Form.Label>
            <Col sm={9}>
                <div className="d-flex flex-wrap">
                    <Form.Control type="text" inputMode="email" name="accountEmail"
                        value={account.accountId}
                        onChange={changeAccountId}
                        onBlur={checkAccountId}
                        className={`${result.accountId.clazz} w-auto d-inline-block`}
                        readOnly={sending} />
                    {/* 인증번호 발송버튼 */}
                    <Button variant={sending === false ? "danger" : "info"}
                        className="ms-2" onClick={sendCert}
                        disabled={
                            result.accountId.clazz === null//처음상태
                            || result.accountId.clazz === "is-invalid" //형식오류 or 중복 문제 발생시
                            || sending === true // 보내는 중일 때
                        }>
                        {sending === null && (<>
                            <FaPaperPlane />
                            <span className="ms-2 d-none d-sm-inline">인증번호 보내기</span>
                        </>)}
                        {sending === false && (<>
                            <FaRotateRight />
                            <span className="ms-2 d-none d-sm-inline">메일 다시보내기</span>
                        </>)}
                        {sending === true && (<>
                            <FaSpinner className="spin" />
                            <span className="ms-2 d-none d-sm-inline">인증번호 발송중</span>
                        </>)}
                    </Button>
                    <div className="valid-feedback">사용가능한 이메일입니다</div>
                    <div className="invalid-feedback">
                        {result.accountId.code === "format" && (<>
                            올바르지 않은 이메일 형식입니다.
                        </>)}
                        {result.accountId.code === "duplicate" && (<>
                            이미 사용중인 이메일입니다.
                        </>)}
                    </div>
                </div>
            </Col>
        </Row>
        {/* 인증번호 입력화면은 발송이 완료된 경우 + 인증완료가 안된 상황에서만 나와야 함 */}
        {(certNumberResult !== "is-valid" && sending === false) && (
            <Row className="mt-2">
                <Col sm={{ span: 9, offset: 3 }}>
                    <div className="d-flex flex-wrap">
                        <Form.Control type="text" placeholder="인증번호"
                            value={certNumber} onChange={changeCertNumber}
                            className={`w-auto ${certNumberResult}`} />
                        {/* 인증번호 확인버튼 */}
                        <Button variant="success" className="ms-2" onClick={checkCert}>
                            <FaCheck />
                            <span className="ms-2 d-none d-sm-inline">인증번호 확인</span>
                        </Button>
                        <div className="valid-feedback">인증번호가 확인이 완료되었습니다</div>
                        <div className="invalid-feedback">인증번호가 일치하지 않습니다</div>
                    </div>
                </Col>
            </Row>
        )}

        {/* 비밀번호 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                <span>비밀번호</span>
                <FaAsterisk className="text-danger" />

                {visible.accountPassword === true ? (
                    <FaEye className="text-danger ms-4" onClick={e => {
                        setVisible(prev => ({ ...prev, accountPassword: false }))
                    }} />
                ) : (
                    <FaEyeSlash className="text-secondary ms-4" onClick={e => {
                        setVisible(prev => ({ ...prev, accountPassword: true }))
                    }} />
                )}
            </Form.Label>
            <Col sm={9}>
                <Form.Control
                    type={visible.accountPassword ? "text" : "password"} inputMode="numeric" name="accountPassword"
                    value={account.accountPassword}
                    onChange={changeStringValue}
                    onBlur={checkAccountPassword}
                    className={result.accountPassword}
                    placeholder="대문자, 소문자, 숫자, 특수문자 포함 8~16글자 이내" />
                <div className="valid-feedback">사용가능한 비밀번호 입니다</div>
                <div className="invalid-feedback">영문 대/소문자, 숫자, 특수문자를 1개이상 포함하여 8~16글자로 작성하세요</div>
            </Col>
        </Row>

        {/* 비밀번호 확인 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                <span>비밀번호확인</span>
                <FaAsterisk className="text-danger" />
                {visible.accountPassword2 === true ? (
                    <FaEye className="text-danger ms-4" onClick={e => {
                        setVisible(prev => ({ ...prev, accountPassword2: false }))
                    }} />
                ) : (
                    <FaEyeSlash className="text-secondary ms-4" onClick={e => {
                        setVisible(prev => ({ ...prev, accountPassword2: true }))
                    }} />
                )}
            </Form.Label>
            <Col sm={9}>
                <Form.Control
                    type={visible.accountPassword2 ? "text" : "password"} inputMode="numeric" name="accountPassword2"
                    value={account.accountPassword2}
                    onChange={changeStringValue}
                    onBlur={checkAccountPassword}
                    className={result.accountPassword2}
                    placeholder="비밀번호를 한번 더 입력하세요" />
                <div className="valid-feedback">입력하신 비밀번호와 일치합니다</div>
                <div className="invalid-feedback">비밀번호를 입력하시거나 비밀번호가 일치하지 않습니다</div>
            </Col>
        </Row>
        {/* 이름 */}
        <Row className="mt-4">
            <Form.Check column sm={3}>
                <span>이름</span>
            </Form.Check>
            <Col sm={9}>
                <Form.Control type="text" name="accountName"
                    value={account.accountName}
                    onChange={changeStringValue}
                    onBlur={checkAccountName}
                    className={result.accountName}
                    placeholder="" />
                <div className="valid-feedback"></div>
            </Col>
        </Row>
        {/* 생년월일 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                <span>생년월일</span>
            </Form.Label>
            <Col sm={9}>
                <Form.Control type="date" name="accountBirth"
                    value={account.accountBirth}
                    onChange={changeStringValue}
                    onBlur={checkAccountBirth}
                    className={result.accountBirth}
                    placeholder="" />
                <div className="valid-feedback"></div>
            </Col>
        </Row>

        {/* 연락처 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                <span>연락처</span>
                <FaAsterisk className="text-danger" />
            </Form.Label>
            <Col sm={9}>
                <Form.Control type="text" inputMode="numeric" name="accountPhone"
                    value={account.accountPhone}
                    onChange={changeStringValue}
                    onBlur={checkAccountPhone}
                    className={`form-control ${result.accountPhone}`}
                    placeholder="" />
                <div className="invalid-feedback">연락처 형식이 올바르지 않습니다</div>
            </Col>
        </Row>

        {/* 고용일자 */}
        <Row className="mt-2">
            <Form.Label column sm={3}>
                고용일자
            </Form.Label>

            <Col sm={9}>
                <Form.Control
                    type="date"
                    name="employeeHtime"
                    value={account.employeeHtime}
                    onChange={changeStringValue}
                    onBlur={checkEmployeeHtime}
                    className={result.employeeHtime}
                    placeholder=""
                />
            </Col>
        </Row>

        {/* 직원 유형 */}
        <Row className="mt-2">
            <Form.Label column sm={3}>
                <span>직원 유형</span>
                <FaAsterisk className="text-danger" />
            </Form.Label>

            <Col sm={9}>
                <Form.Select
                    name="employeeType"
                    value={account.employeeType}
                    onChange={changeEmployeeType}
                    className={`form-control ${result.employeeType}`}
                >
                    <option value="">직원 유형 선택</option>
                    <option value="데스크">데스크</option>
                    <option value="강사">강사</option>
                    <option value="원장">원장</option>
                </Form.Select>
            </Col>
        </Row>


        {/* 이용가능여부 */}
        <Row className="mt-4">
            <Form.Label column sm={3}>
                이용가능여부
                <FaAsterisk className="text-danger" />
            </Form.Label>

            <Col sm={9}>
                <Form.Check
                    type="radio"
                    label="등록"
                    name="accountStatus"
                    value="Y"
                    checked={account.accountStatus === "Y"}
                    onChange={e=>
                        {
                            changeStringValue(e);
                            setResult(prev=>({...prev, accountStatus:"is-valid"}))}
                        }
                />
                <Form.Check
                    type="radio"
                    label="미등록"
                    name="accountStatus"
                    value="N"
                    checked={account.accountStatus === "N"}
                    onChange={e=>
                    {
                        changeStringValue(e);
                        setResult(prev=>({...prev, accountStatus:"in-valid"}))}
                    }
                />
            </Col>
        </Row>
        

        {/* 버튼 */}
        <Row className="my-5">
            <Col>
                <Button variant="success" size="lg" className="w-100"
                    disabled={allValid === false} onClick={sendRegister}>
                    <FaUserPlus className="me-2 mb-1" />
                    <span>직원 등록하기</span>
                </Button>
            </Col>
        </Row>
    </>)
}