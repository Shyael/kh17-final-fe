import Jumbotron from "@templates/Jumbotron";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Alert,
    Button,
    Col,
    Form,
    Row
} from "react-bootstrap";

import {
    FaCheck,
    FaMagnifyingGlass,
    FaXmark
} from "react-icons/fa6";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    useAtomValue
} from "jotai";

import {
    loginUserState
} from "@utils/storage";

import {
    apiClient
} from "@utils/reaxios";

import {
    toast
} from "react-toastify";

import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument";


// 일반 성인·일 8시간/주 40시간제, 매주 동일한 소정근로시간 기준.
// 기본임금만으로 검증하며 연장·야간·휴일 가산수당은 포함하지 않는다.
// 월급: 통상근로자 주 5일, 추가 약정 유급시간 없음. 주 40시간은 월 209시간.
// 다른 근무제도/임금 구성은 별도의 산정 기준이 필요하다.
const MINIMUM_HOURLY_WAGE_2026 = 10320;
const WEEKLY_HOLIDAY_DAYS = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];

function validateContractTerms(contract) {
    const missing = value => value == null || String(value).trim() === "";
    const dailyWorkHours = Number(contract.dailyWorkHours);
    const weeklyWorkHours = Number(contract.weeklyWorkHours);
    const writtenBreakMinutes = Number(contract.writtenBreakMinutes);
    const baseWage = Number(contract.baseWage);
    if (!["hourly", "daily", "monthly"].includes(contract.wageType)
        || missing(contract.baseWage) || !Number.isFinite(baseWage) || baseWage <= 0) {
        return "임금 형태와 기본임금을 확인해주세요";
    }
    if (missing(contract.dailyWorkHours) || missing(contract.weeklyWorkHours)
        || !Number.isFinite(dailyWorkHours) || !Number.isFinite(weeklyWorkHours)
        || dailyWorkHours <= 0 || weeklyWorkHours <= 0
        || dailyWorkHours > weeklyWorkHours) {
        return "소정근로시간을 확인해주세요";
    }
    if (dailyWorkHours > 8 || weeklyWorkHours > 40) {
        return "소정근로시간은 1일 8시간, 1주 40시간을 초과할 수 없습니다";
    }
    if (weeklyWorkHours >= 15 && !WEEKLY_HOLIDAY_DAYS.includes(contract.weeklyHolidayDay)) {
        return "주 15시간 이상 근로 시 주휴일을 선택해주세요";
    }
    if (missing(contract.writtenBreakMinutes) || !Number.isInteger(writtenBreakMinutes)
        || writtenBreakMinutes < 0) {
        return "휴게시간은 0 이상의 정수로 분 단위 입력해주세요";
    }
    const minimumBreakMinutes = dailyWorkHours >= 8 ? 60 : dailyWorkHours >= 4 ? 30 : 0;
    if (writtenBreakMinutes < minimumBreakMinutes) {
        return "해당 근로시간의 휴게시간은 " + minimumBreakMinutes + "분 이상이어야 합니다";
    }
    // 2026년과 겹치는 계약에만 해당 연도 금액을 적용한다.
    // 2027년 이후 등 다른 연도의 최저임금 검증은 별도로 추가해야 한다.
    const covers2026 = contract.contractStart && contract.contractStart <= "2026-12-31"
        && (!contract.contractEnd || contract.contractEnd >= "2026-01-01");
    if (covers2026) {
        const weeklyPaidHolidayHours = weeklyWorkHours >= 15 ? weeklyWorkHours / 5 : 0;
        const monthlyHours = weeklyWorkHours === 40 ? 209
            : (weeklyWorkHours + weeklyPaidHolidayHours) * 365 / 7 / 12;
        const wageHours = contract.wageType === "hourly" ? 1
            : contract.wageType === "daily" ? dailyWorkHours : monthlyHours;
        const minimumWage = Math.ceil(MINIMUM_HOURLY_WAGE_2026 * wageHours);
        if (baseWage < minimumWage) {
            return "2026년 기준 기본임금은 " + minimumWage.toLocaleString("ko-KR") + "원 이상이어야 합니다";
        }
    }
    return null;
}

export default function ContractAdd() {

    // =========================================================
    // parameter
    // =========================================================

    const {
        employeeNo
    } = useParams();


    // =========================================================
    // navigate
    // =========================================================

    const navigate =
        useNavigate();


    // =========================================================
    // 로그인 사용자
    // =========================================================

    const loginUser =
        useAtomValue(
            loginUserState
        );


    // =========================================================
    // state
    // =========================================================

    const [employeeType, setEmployeeType] =
        useState("");


    const [employee, setEmployee] =
        useState(null);


    const [loading, setLoading] =
        useState(false);


    const [sending, setSending] =
        useState(false);


    const [contract, setContract] =
        useState({

            employeeNo:
                employeeNo ?? "",

            wageType:
                "",

            baseWage:
                "",

            dailyWorkHours:
                "",

            weeklyWorkHours:
                "",

            weeklyHolidayDay:
                "",

            writtenBreakMinutes:
                "",

            contractStart:
                "",

            contractEnd:
                "",

            payday:
                "",

            contractContent:
                ""

        });


    // =========================================================
    // employeeNo 변경 시 contract 동기화
    // =========================================================

    useEffect(
        () => {

            setContract(
                prev => ({
                    ...prev,

                    employeeNo:
                        employeeNo ?? ""
                })
            );

        },
        [
            employeeNo
        ]
    );


    // =========================================================
    // 직원 조회
    //
    // desk / teacher 둘 중 존재하는 직원 채택
    // =========================================================

    const loadEmployee =
        useCallback(
            async () => {

                if (!employeeNo) {
                    return;
                }


                try {

                    setLoading(
                        true
                    );


                    setEmployee(
                        null
                    );


                    setEmployeeType(
                        ""
                    );


                    const [
                        deskResult,
                        teacherResult
                    ] =
                        await Promise.allSettled([

                            apiClient.get(
                                `/admin/contract/desk/${employeeNo}`
                            ),

                            apiClient.get(
                                `/admin/contract/teacher/${employeeNo}`
                            )

                        ]);


                    // =================================================
                    // 데스크
                    // =================================================

                    if (
                        deskResult.status === "fulfilled"
                        &&
                        deskResult.value?.data
                    ) {

                        setEmployeeType(
                            "desk"
                        );


                        setEmployee(
                            deskResult.value.data
                        );


                        return;
                    }


                    // =================================================
                    // 강사
                    // =================================================

                    if (
                        teacherResult.status === "fulfilled"
                        &&
                        teacherResult.value?.data
                    ) {

                        setEmployeeType(
                            "teacher"
                        );


                        setEmployee(
                            teacherResult.value.data
                        );


                        return;
                    }


                    toast.error(
                        "계약 대상 직원 정보를 찾을 수 없습니다"
                    );

                }
                catch (e) {

                    console.error(
                        e
                    );


                    setEmployee(
                        null
                    );


                    setEmployeeType(
                        ""
                    );


                    toast.error(
                        e?.response?.data?.message
                        ??
                        "직원 정보를 불러오지 못했습니다"
                    );

                }
                finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                employeeNo
            ]
        );


    // =========================================================
    // 직원 자동 조회
    // =========================================================

    useEffect(
        () => {

            loadEmployee();

        },
        [
            loadEmployee
        ]
    );


    // =========================================================
    // 입력값 변경
    // =========================================================

    const changeStringValue =
        useCallback(
            e => {

                const {
                    name,
                    value
                } = e.target;


                setContract(
                    prev => ({
                        ...prev,

                        [name]: value,
            weeklyHolidayDay: name === "weeklyWorkHours" && Number(value) < 15
                ? "" : name === "weeklyHolidayDay" ? value : prev.weeklyHolidayDay
                    })
                );

            },
            []
        );


    // =========================================================
    // 입력값 검사
    // =========================================================

    const checkContract =
        useCallback(
            () => {

                // =================================================
                // 직원
                // =================================================

                if (
                    employee === null
                ) {

                    toast.warning(
                        "계약 대상 직원을 확인해주세요"
                    );

                    return false;
                }


                // =================================================
                // 직원상태
                // =================================================

                if (
                    employee.employeeStatus !== "대기"
                    &&
                    employee.employeeStatus !== "종료"
                ) {

                    toast.warning(
                        "대기 또는 퇴사 상태의 직원만 신규 근로계약을 작성할 수 있습니다"
                    );

                    return false;
                }


                const validationMessage = validateContractTerms(contract);
                if (validationMessage) {
                    toast.warning(validationMessage);
                    return false;
                }

                // =================================================
                // 계약 시작일
                // =================================================

                if (
                    contract.contractStart === ""
                ) {

                    toast.warning(
                        "계약 시작일을 입력해주세요"
                    );

                    return false;
                }


                // =================================================
                // 계약 종료일
                // =================================================

                if (
                    contract.contractEnd !== ""
                    &&
                    contract.contractStart
                    >
                    contract.contractEnd
                ) {

                    toast.warning(
                        "계약 종료일은 시작일보다 빠를 수 없습니다"
                    );

                    return false;
                }


                // =================================================
                // 급여 지급일
                // =================================================

                const payday =
                    Number(contract.payday);


                if (
                    contract.payday === ""
                    ||
                    !Number.isInteger(payday) || payday < 1
                    ||
                    payday > 31
                ) {

                    toast.warning(
                        "급여 지급일은 1일부터 31일 사이로 입력해주세요"
                    );

                    return false;
                }


                // =================================================
                // 기타 근로조건
                // =================================================

                if (
                    contract.contractContent
                        .trim()
                    === ""
                ) {

                    toast.warning(
                        "근로계약 내용을 입력해주세요"
                    );

                    return false;
                }


                return true;

            },
            [
                employee,
                contract
            ]
        );


    // =========================================================
    // 계약 작성
    // =========================================================

    const sendData =
        useCallback(
            async () => {

                if (
                    checkContract() === false
                ) {
                    return;
                }


                if (
                    sending === true
                ) {
                    return;
                }


                const result =
                    await Swal.fire({

                        title:
                            "근로계약을 작성하시겠습니까?",

                        text:
                            "작성 후 직원과 원장의 서명이 필요합니다",

                        icon:
                            "question",

                        showCancelButton:
                            true,

                        confirmButtonText:
                            "작성",

                        cancelButtonText:
                            "취소"

                    });


                if (
                    result.isConfirmed === false
                ) {
                    return;
                }


                const request = {

                    ...contract,

                    weeklyHolidayDay:
                        Number(
                            contract.weeklyWorkHours
                        ) < 15
                            ? null
                            : contract.weeklyHolidayDay,

                    contractEnd:
                        contract.contractEnd === ""
                            ? null
                            : contract.contractEnd

                };


                try {

                    setSending(
                        true
                    );


                    const {
                        data
                    } =
                        await apiClient.post(
                            "/admin/contract/add",
                            request
                        );


                    toast.success(
                        "근로계약이 작성되었습니다"
                    );


                    navigate(
                        `/contract/sign/${data.contractNo}`
                    );

                }
                catch (e) {

                    console.error(
                        e
                    );


                    toast.error(
                        e?.response?.data?.message
                        ??
                        "근로계약 작성에 실패했습니다"
                    );

                }
                finally {

                    setSending(
                        false
                    );

                }

            },
            [
                contract,
                sending,
                checkContract,
                navigate
            ]
        );


    // =========================================================
    // render
    // =========================================================

    return (
        <>

            <Jumbotron
                title="근로계약 작성"
                content="계약 대상 직원과 근로조건을 입력해주세요"
            />


            {/* =====================================================
                조회 중
            ===================================================== */}

            {
                loading === true
                && (

                    <Row className="mt-5">

                        <Col
                            className="text-secondary"
                        >

                            <FaMagnifyingGlass
                                className="me-2"
                            />

                            직원 정보를 불러오는 중입니다

                        </Col>

                    </Row>

                )
            }


            {/* =====================================================
                직원 조회 완료
            ===================================================== */}

            {
                loading === false
                &&
                employee !== null
                && (

                    <>


                        {/* =================================================
                            메인 2단 구조
                        ================================================= */}

                        <Row
                            className="mt-5 g-4 align-items-start"
                        >


                            {/* =================================================
                                왼쪽
                                계약서
                            ================================================= */}

                            <Col
                                xs={12}
                                lg={6}
                            >

                                <ContractDocument
                                    contract={
                                        contract
                                    }
                                    employee={
                                        employee
                                    }
                                    employer={
                                        loginUser
                                    }
                                />

                            </Col>


                            {/* =================================================
                                오른쪽
                                직원정보 + 근로조건
                            ================================================= */}

                            <Col
                                xs={12}
                                lg={6}
                                className="border-start ps-lg-5"
                            >


                                {/* =================================================
                                    직원정보
                                ================================================= */}

                                <div>

                                    <h4 className="fw-bold mb-4">

                                        직원정보

                                    </h4>


                                    {/* 직원이름 */}

                                    <Row className="mb-4">

                                        <Form.Label
                                            column
                                            sm={3}
                                        >
                                            직원이름
                                        </Form.Label>


                                        <Col sm={9}>

                                            <Form.Control
                                                type="text"
                                                value={
                                                    employee.accountName
                                                    ?? ""
                                                }
                                                readOnly
                                            />

                                        </Col>

                                    </Row>


                                    {/* 연락처 */}

                                    <Row className="mb-4">

                                        <Form.Label
                                            column
                                            sm={3}
                                        >
                                            연락처
                                        </Form.Label>


                                        <Col sm={9}>

                                            <Form.Control
                                                type="text"
                                                value={
                                                    employee.accountPhone
                                                    ?? ""
                                                }
                                                readOnly
                                            />

                                        </Col>

                                    </Row>


                                    {/* 직원유형 */}

                                    <Row className="mb-4">

                                        <Form.Label
                                            column
                                            sm={3}
                                        >
                                            직원유형
                                        </Form.Label>


                                        <Col sm={9}>

                                            <Form.Control
                                                type="text"
                                                value={
                                                    employeeType === "desk"
                                                        ? "데스크"
                                                        : employeeType === "teacher"
                                                            ? "강사"
                                                            : ""
                                                }
                                                readOnly
                                            />

                                        </Col>

                                    </Row>


                                    {/* 고용형태 */}

                                    <Row className="mb-4">

                                        <Form.Label
                                            column
                                            sm={3}
                                        >
                                            고용형태
                                        </Form.Label>


                                        <Col sm={9}>

                                            <Form.Control
                                                type="text"
                                                value={
                                                    employee.employeeType
                                                    ?? ""
                                                }
                                                readOnly
                                            />

                                        </Col>

                                    </Row>


                                    {/* 고용상태 */}

                                    <Row className="mb-4">

                                        <Form.Label
                                            column
                                            sm={3}
                                        >
                                            고용상태
                                        </Form.Label>


                                        <Col sm={9}>

                                            <Form.Control
                                                type="text"
                                                value={
                                                    employee.employeeStatus
                                                    ?? ""
                                                }
                                                readOnly
                                            />

                                        </Col>

                                    </Row>

                                </div>


                                {/* =================================================
                                    계약 불가능 상태
                                ================================================= */}

                                {
                                    employee.employeeStatus !== "대기"
                                    &&
                                    employee.employeeStatus !== "종료"
                                    && (

                                        <Alert
                                            variant="warning"
                                            className="mt-4"
                                        >

                                            대기 또는 퇴사 상태의 직원만
                                            신규 근로계약을 작성할 수 있습니다.

                                            <br />

                                            재직 중인 직원은 근로조건 변경 기능을 이용해주세요.

                                        </Alert>

                                    )
                                }


                                {/* =================================================
                                    대기 / 종료일 때만 근로조건
                                ================================================= */}

                                {
                                    (
                                        employee.employeeStatus === "대기"
                                        ||
                                        employee.employeeStatus === "종료"
                                    )
                                    && (

                                        <>


                                            <hr className="my-5" />


                                            {/* =================================================
                                                근로조건
                                            ================================================= */}

                                            <div>

                                                <h4 className="fw-bold mb-4">

                                                    근로조건 입력

                                                </h4>


                                                {/* =================================================
                                                    임금형태
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        임금형태
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Select
                                                            name="wageType"
                                                            value={
                                                                contract.wageType
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        >

                                                            <option value="">
                                                                선택
                                                            </option>

                                                            <option value="monthly">
                                                                월급
                                                            </option>

                                                            <option value="hourly">
                                                                시급
                                                            </option>

                                                            <option value="daily">
                                                                일급
                                                            </option>

                                                        </Form.Select>

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    기본임금
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        기본임금
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            name="baseWage"
                                                            value={
                                                                contract.baseWage
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    1일 소정근로시간
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        1일 소정근로시간
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="number"
                                                            min="0.5"
                                                            step="0.5"
                                                            name="dailyWorkHours" max="8"
                                                            value={
                                                                contract.dailyWorkHours
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    1주 소정근로시간
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        1주 소정근로시간
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="number"
                                                            min="0.5"
                                                            step="0.5"
                                                            name="weeklyWorkHours" max="40"
                                                            value={
                                                                contract.weeklyWorkHours
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    주휴일
                                                ================================================= */}

                                                {
                                                    Number(
                                                        contract.weeklyWorkHours
                                                    ) >= 15
                                                    && (

                                                        <Row className="mb-4">

                                                            <Form.Label
                                                                column
                                                                sm={3}
                                                            >
                                                                주휴일
                                                            </Form.Label>


                                                            <Col sm={9}>

                                                                <Form.Select
                                                                    name="weeklyHolidayDay" disabled={Number(contract.weeklyWorkHours) < 15}
                                                                    value={
                                                                        contract.weeklyHolidayDay
                                                                    }
                                                                    onChange={
                                                                        changeStringValue
                                                                    }
                                                                >

                                                                    <option value="">
                                                                        선택
                                                                    </option>

                                                                    <option value="MONDAY">
                                                                        월요일
                                                                    </option>

                                                                    <option value="TUESDAY">
                                                                        화요일
                                                                    </option>

                                                                    <option value="WEDNESDAY">
                                                                        수요일
                                                                    </option>

                                                                    <option value="THURSDAY">
                                                                        목요일
                                                                    </option>

                                                                    <option value="FRIDAY">
                                                                        금요일
                                                                    </option>

                                                                    <option value="SATURDAY">
                                                                        토요일
                                                                    </option>

                                                                    <option value="SUNDAY">
                                                                        일요일
                                                                    </option>

                                                                </Form.Select>

                                                            </Col>

                                                        </Row>

                                                    )
                                                }


                                                {/* =================================================
                                                    휴게시간
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        휴게시간
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            name="writtenBreakMinutes"
                                                            value={
                                                                contract.writtenBreakMinutes
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                            placeholder="분 단위로 입력해주세요"
                                                        />


                                                        <Form.Text
                                                            className="text-muted"
                                                        >

                                                            4시간 이상 근무 시 30분 이상,
                                                            8시간 이상 근무 시 60분 이상

                                                        </Form.Text>

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    계약 시작일
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        계약 시작일
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="date"
                                                            name="contractStart"
                                                            value={
                                                                contract.contractStart
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    계약 종료일
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        계약 종료일
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="date"
                                                            name="contractEnd"
                                                            value={
                                                                contract.contractEnd
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />


                                                        <Form.Text
                                                            className="text-muted"
                                                        >

                                                            기간의 정함이 없는 계약은 비워두세요

                                                        </Form.Text>

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    급여 지급일
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        급여 지급일
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            max="31"
                                                            name="payday"
                                                            value={
                                                                contract.payday
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                            placeholder="1~31일 사이로 입력해주세요"
                                                        />

                                                    </Col>

                                                </Row>


                                                {/* =================================================
                                                    기타 근로조건
                                                ================================================= */}

                                                <Row className="mb-4">

                                                    <Form.Label
                                                        column
                                                        sm={3}
                                                    >
                                                        기타 근로조건
                                                    </Form.Label>


                                                    <Col sm={9}>

                                                        <Form.Control
                                                            as="textarea"
                                                            rows={6}
                                                            name="contractContent"
                                                            value={
                                                                contract.contractContent
                                                            }
                                                            onChange={
                                                                changeStringValue
                                                            }
                                                        />

                                                    </Col>

                                                </Row>


                                            </div>

                                        </>

                                    )
                                }


                            </Col>

                        </Row>


                        {/* =================================================
                            하단 버튼
                        ================================================= */}

                        {
                            (
                                employee.employeeStatus === "대기"
                                ||
                                employee.employeeStatus === "종료"
                            )
                            && (

                                <Row className="mt-5 mb-5">

                                    <Col
                                        className="text-end"
                                    >


                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={
                                                () =>
                                                    navigate(
                                                        -1
                                                    )
                                            }
                                            disabled={
                                                sending === true
                                            }
                                        >

                                            <FaXmark />

                                            <span className="ms-2">
                                                취소
                                            </span>

                                        </Button>


                                        <Button
                                            variant="success"
                                            size="lg"
                                            className="ms-2"
                                            onClick={
                                                sendData
                                            }
                                            disabled={
                                                sending === true
                                            }
                                        >

                                            <FaCheck />

                                            <span className="ms-2">

                                                {
                                                    sending === true
                                                        ? "작성중..."
                                                        : "근로계약 작성"
                                                }

                                            </span>

                                        </Button>


                                    </Col>

                                </Row>

                            )
                        }


                    </>

                )
            }


        </>
    );
}