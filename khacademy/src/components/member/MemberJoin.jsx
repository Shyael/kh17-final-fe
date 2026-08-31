import Jumbotron from "@templates/Jumbotron";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FaAsterisk, FaCheck, FaEye, FaEyeSlash, FaMagnifyingGlass, FaPaperPlane, FaRotateRight, FaSpinner, FaUserPlus, FaXmark } from "react-icons/fa6";
import axios from "axios";
import { useKakaoPostcodePopup } from "react-daum-postcode";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiClient, certClient } from "../../utils/reaxios";

export default function MemberJoin() {
    //kakao post
    const open = useKakaoPostcodePopup(
        "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    );

    const [accountType, setAccountType] = useState('STUDENT'); // student||parent

    //state
    const [account, setAccount] = useState({
        //공통 정보 , 학부모는 회원가입 단계에서는 공통정보만 필요
        accountId: "",
        accountPassword: "",
        accountPassword2: "",
        accountName: "",
        accountBirth: "",
        accountPhone: "",
        //학생 정보
        studentSchool: "",
        studentGrade: "",
        studentGender: "",
        studentEtc: "",
    });
    const [result, setResult] = useState({
        accountId: { clazz: null, code: null },
        accountPassword: null,
        accountPassword2: null, //빼고 보내는 거 잊지말기
        accountName: null,
        accountBirth: null,
        accountPhone: null,
        //학생 정보
        studentSchool: null,
        studentGrade: null,
        studentGender: null,
    });

    //비밀번호 보이기 / 숨기기
    const [visible, setVisible] = useState({
        accountPassword: false,
        accountPassword2: false
    });

    //이메일 인증번호 관련 상태
    const [certNumber, setCertNumber] = useState(""); //처음에 비어있다고 (문자열)
    const [certNumberResult, setCertNumberResult] = useState(null);
    const [sending, setSending] = useState(null); //이메일 발송중 여부 상태(null(발송중) / true(발송) / false(미발송))

    //공통 문자열 변경 callback
    const changeStringValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    //탭 변경 시
    const handleAccountTypeChange = (type) => {
        setAccountType(type);
    };

    // 아이디 변경 callback
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
    //[1] 아이디(이메일) 형식 & 중복 검사
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
        //accountType에 따라 엔드포인트 분기
        const url = accountType === 'STUDENT'
            ? `/student/check-id/${account.accountId}`
            : `/parent/check-id/${account.accountId}`

        //형식 통과 → 중복 검사
        const { data } = await apiClient.get(url);
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

    //[6] 학생 학교 검사
    const checkStudentSchool = useCallback(() => {
        const valid = account.studentSchool.trim() !== "";
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, studentSchool: clazz }));
    }, [account]);

    //[7] 학생 학년 검사
    const checkStudentGrade = useCallback(() => {
        const valid = account.studentGrade === "초1"
            || account.studentGrade === "초2"
            || account.studentGrade === "초3"
            || account.studentGrade === "초4"
            || account.studentGrade === "초5"
            || account.studentGrade === "초6"
            || account.studentGrade === "중1"
            || account.studentGrade === "중2"
            || account.studentGrade === "중3"
            || account.studentGrade === "고1"
            || account.studentGrade === "고2"
            || account.studentGrade === "고3"
            || account.studentGrade === "일반"
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, studentGrade: clazz }));
    }, [account]);

    // [8] 학생 성별 검사
    const checkStudentGender = useCallback(() => {
        const valid = account.studentGender === "남"
            || account.studentGender === "여"
        const clazz = valid ? "is-valid" : "is-invalid";
        setResult(prev => ({ ...prev, studentGender: clazz }));
    }, [account]);

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

    //인증번호 입력 처리
    const changeCertNumber = useCallback(e => {
        const regex = /[^0-9]+/g;
        const replacement = e.target.value.replace(regex, "");
        setCertNumber(replacement);
    }, []);

    //인증번호 확인
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

    //memo : 전체 입력폼 유효성 체크
    const allValid = useMemo(() => {
        //공통 필수값 체크
        if (result.accountId.clazz !== "is-valid") return false; //필수
        if (result.accountPassword !== "is-valid") return false; //필수
        if (result.accountPassword2 !== "is-valid") return false; //필수
        if (result.accountName !== "is-valid") return false; //필수
        if (result.accountPhone !== "is-valid") return false; //필수
        if (result.accountBirth === "is-invalid") return false; //선택

        if (certNumberResult !== "is-valid") return false; //인증번호

        //학생 선택 시 학생 필수값 추가 체크
        if (accountType === 'STUDENT') {
            if (result.studentSchool !== "is-valid") return false; //필수
            if (result.studentGrade !== "is-valid") return false; //필수

        }

        return true;
    }, [result, certNumberResult, accountType]);

    // 최종 가입
    const navigate = useNavigate();
    const sendRegister = useCallback(async () => {
        try {
            // const copy = {...acount};
            // delete copy.acountPassword2; //아래 구조분해 할당 or 두줄 코드
            const { accountPassword2, ...copy } = account;
            let response;

            if (accountType === 'STUDENT') {
                //학생 회원가입 API 호출
                response = await apiClient.post("/student/", copy);
            }
            else {
                const parentPayload = {
                    accountId: copy.accountId,
                    accountPassword: copy.accountPassword,
                    accountName: copy.accountName,
                    accountBirth: copy.accountBirth,
                    accountPhone: copy.accountPhone
                };
                response = await apiClient.post("/parent/", parentPayload);
            }

            const msg = response.data?.message || "회원 등록 신청이 완료되었습니다.";
            navigate("/member/joinSuccess");
        }
        catch (e) {
            // toast.error("회원 등록 과정에서 오류가 발생했습니다");
            navigate("/member/joinFail");
        }
    }, [account]);

    return (<>
        <Jumbotron title="회원가입" content="학생 및 학부모 회원가입 페이지입니다." />

        {/* 회원 유형 선택 탭 버튼 */}
        <Row className="mt-4 mb-3">
            <Col sm={{ span: 9, offset: 3 }}>
                <div className="btn-group w-100" role="group">
                    <Button
                        type="button"
                        variant={accountType === 'STUDENT' ? 'primary' : 'outline-primary'}
                        className="py-2 fw-bold"
                        onClick={() => handleAccountTypeChange('STUDENT')}
                    >
                        학생 회원가입
                    </Button>
                    <Button
                        type="button"
                        variant={accountType === 'PARENT' ? 'primary' : 'outline-primary'}
                        className="py-2 fw-bold"
                        onClick={() => handleAccountTypeChange('PARENT')}
                    >
                        학부모 회원가입
                    </Button>
                </div>
            </Col>
        </Row>

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

        {/* 학생 입력 필드 */}
        {accountType === 'STUDENT' && (<>

            {/* 학교명 */}
            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>학교명</span>
                    <FaAsterisk className="text-danger" />
                </Form.Label>
                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="studentSchool"
                        value={account.studentSchool}
                        onChange={changeStringValue}
                        onBlur={checkStudentSchool}
                        className={result.studentSchool}
                        placeholder="학교명을 입력하세요 (예: 한국고등학교)"
                    />
                    <div className="invalid-feedback">학교명을 입력해주세요</div>
                </Col>
            </Row>

            {/* 학년 */}
            <Row className="mt-2">
                <Form.Label column sm={3}>
                    <span>학년</span>
                    <FaAsterisk className="text-danger" />
                </Form.Label>

                <Col sm={9}>
                    <Form.Select
                        name="studentGrade"
                        value={account.studentGrade}
                        onChange={changeStringValue}
                        onBlur={checkStudentGrade}
                        className={`form-control ${result.studentGrade}`}
                    >
                        <option value="">학년 선택</option>
                        <option value="초1">초1</option>
                        <option value="초2">초2</option>
                        <option value="초3">초3</option>
                        <option value="초4">초4</option>
                        <option value="초5">초5</option>
                        <option value="초6">초6</option>
                        <option value="중1">중1</option>
                        <option value="중2">중2</option>
                        <option value="중3">중3</option>
                        <option value="고1">고1</option>
                        <option value="고2">고2</option>
                        <option value="고3">고3</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* 성별 */}
            <Row className="mt-2">
                <Form.Label column sm={3}>
                    <span>성별</span>
                    <FaAsterisk className="text-danger" />
                </Form.Label>

                <Col sm={9}>
                    <Form.Select
                        name="studentGender"
                        value={account.studentGender}
                        onChange={changeStringValue}
                        onBlur={checkStudentGender}
                        className={`form-control ${result.studentGender}`}
                    >
                        <option value="">성별 선택</option>
                        <option value="남">남</option>
                        <option value="여">여</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>특이사항 / 메모</span>
                </Form.Label>
                <Col sm={9}>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        name="studentEtc"
                        value={account.studentEtc}
                        onChange={changeStringValue}
                        placeholder="추가 전달사항이 있을 경우 작성하세요 (선택)"
                    />
                </Col>
            </Row>
        </>)}

        {/* ================= 학부모 전용 안내 문구 ================= */}
        {accountType === 'PARENT' && (
            <Row className="mt-4">
                <Col sm={{ span: 9, offset: 3 }}>
                    <div className="alert alert-info mb-0">
                        학부모 회원은 가입 승인 후 <strong>마이페이지에서 자녀 발급 코드</strong>를 입력하여 자녀 연동을 진행하실 수 있습니다.
                    </div>
                </Col>
            </Row>
        )}

        {/* 버튼 */}
        <Row className="my-5">
            <Col>
                <Button variant="success" size="lg" className="w-100"
                    disabled={allValid === false} onClick={sendRegister}>
                    <FaUserPlus className="me-2 mb-1" />
                    <span>{accountType === 'STUDENT' ? '학생 회원가입 신청' : '학부모 회원가입 신청'}</span>
                    </Button>
            </Col>
        </Row>
    </>)
}