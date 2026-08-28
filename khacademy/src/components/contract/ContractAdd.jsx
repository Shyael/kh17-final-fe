import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Button,
    Col,
    Container,
    Form,
    Row
} from "react-bootstrap";

import {
    FaFileCircleCheck
} from "react-icons/fa6";

import { toast } from "react-toastify";

import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";


export default function ContractAdd() {

    // Router
    const { employeeNo } = useParams();
    const navigate = useNavigate();


    // state
    const [contract, setContract] = useState({
        employeeNo: "",
        wageType: "",
        baseWage: "",
        dailyWorkHours: "",
        weeklyWorkHours: "",
        contractStart: "",
        contractEnd: "",
        payday: ""
    });

    const [submitting, setSubmitting] =
        useState(false);


    const [result, setResult] = useState({
        contractStart: "",
        contractEnd: "",
        dailyWorkHours: "",
        weeklyWorkHours: ""
    });

    useEffect(() => {

        // 시작일만 입력했거나
        // 종료일이 비어있으면 검사하지 않음
        if (
            contract.contractStart === ""
            || contract.contractEnd === ""
        ) {

            setResult(prev => ({
                ...prev,
                contractStart: "",
                contractEnd: ""
            }));

            return;
        }


        // 둘 다 입력된 경우에만 비교
        if (contract.contractStart > contract.contractEnd) {

            setResult(prev => ({
                ...prev,
                contractStart: "is-invalid",
                contractEnd: "is-invalid"
            }));

        }
        else {

            setResult(prev => ({
                ...prev,
                contractStart: "is-valid",
                contractEnd: "is-valid"
            }));

        }

    }, [
        contract.contractStart,
        contract.contractEnd
    ]);

    // 일반 입력
    const changeStringValue = useCallback(e => {

        const { name, value } = e.target;

        setContract(prev => ({
            ...prev,
            [name]: value
        }));

    }, []);


    // 숫자 입력
    const changeNumericValue = useCallback(e => {

        const { name, value } = e.target;

        const onlyNumber =
            value.replace(/[^0-9.]+/g, "");

        setContract(prev => ({
            ...prev,
            [name]: onlyNumber
        }));

    }, []);


    const validateContractDate = useCallback(() => {

        // 시작일이 없으면 검사 불가
        if (contract.contractStart === null) {

            setResult(prev => ({
                ...prev,
                contractStart: "",
                contractEnd: null
            }));

            return false;
        }


        // 종료일이 없으면 기간의 정함이 없는 계약
        // 날짜 비교 검사 생략
        if (contract.contractEnd === null) {

            setResult(prev => ({
                ...prev,
                contractStart: "is-valid",
                contractEnd: null
            }));

            return true;
        }


        // 종료일이 존재할 때만 날짜 비교
        if (contract.contractStart > contract.contractEnd) {

            setResult(prev => ({
                ...prev,
                contractStart: "is-invalid",
                contractEnd: "is-invalid"
            }));

            return false;
        }


        setResult(prev => ({
            ...prev,
            contractStart: "is-valid",
            contractEnd: "is-valid"
        }));

        return true;

    }, [
        contract.contractStart,
        contract.contractEnd
    ]);

    const validateWorkHours = useCallback(() => {

        const daily = contract.dailyWorkHours;
        const weekly = contract.weeklyWorkHours;

        if (
            contract.dailyWorkHours === ""
            || contract.weeklyWorkHours === ""
        ) {
            setResult(prev => ({
                ...prev,
                dailyWorkHours: "",
                weeklyWorkHours: ""
            }));

            return false;
        }


        if (daily <= 0 || weekly <= 0) {

            setResult(prev => ({
                ...prev,
                dailyWorkHours: "is-invalid",
                weeklyWorkHours: "is-invalid"
            }));

            return false;
        }


        if (daily > weekly) {

            setResult(prev => ({
                ...prev,
                dailyWorkHours: "is-invalid",
                weeklyWorkHours: "is-invalid"
            }));

            return false;
        }


        setResult(prev => ({
            ...prev,
            dailyWorkHours: "is-valid",
            weeklyWorkHours: "is-valid"
        }));

        return true;

    }, [
        contract.dailyWorkHours,
        contract.weeklyWorkHours
    ]);

    // 작성 완료 가능 여부
    const allValid = useMemo(() => {

        const daily =
            contract.dailyWorkHours;

        const weekly =
            contract.weeklyWorkHours;

        const validDate =
            contract.contractEnd === null
            || contract.contractStart <= contract.contractEnd;

        return contract.wageType !== ""
            && contract.baseWage !== ""
            && contract.dailyWorkHours !== ""
            && contract.weeklyWorkHours !== ""
            && contract.contractStart !== ""
            && contract.payday !== ""
            && daily > 0
            && weekly > 0
            && daily <= weekly
            && validDate;

    }, [contract]);

    // 계약서 내용 생성
    const makeContractContent = useCallback(() => {

        const wageTypeText = {
            monthly: "월급",
            daily: "일급",
            hourly: "시급"
        }[contract.wageType] ?? "";


        return `
근 로 계 약 서

사용자와 근로자는 다음과 같이 근로계약을 체결한다.

1. 근로계약기간
${contract.contractStart}부터
${contract.contractEnd || "기간의 정함 없음"}까지

2. 임금
임금형태 : ${wageTypeText}
기본임금 : ${contract.baseWage}원
임금지급일 : 매월 ${contract.payday}일

3. 소정근로시간
1일 소정근로시간 : ${contract.dailyWorkHours}시간
1주 소정근로시간 : ${contract.weeklyWorkHours}시간

4. 기타
사용자와 근로자는 본 근로계약의 내용을 성실히 이행한다.
본 계약서에 명시되지 않은 사항은 관계 법령 및 사업장 규정에 따른다.
        `.trim();

    }, [contract]);


    // 계약 등록
    const sendData = useCallback(async e => {

        e.preventDefault();

        if (submitting || !allValid)
            return;


        try {

            setSubmitting(true);


            const request = {

                employeeNo:
                    employeeNo,

                wageType:
                    contract.wageType,

                baseWage:
                    contract.baseWage,

                dailyWorkHours:
                    contract.dailyWorkHours,

                weeklyWorkHours:
                    contract.weeklyWorkHours,

                contractStart:
                    contract.contractStart,

                contractEnd:
                    contract.contractEnd === ""
                        ? null
                        : contract.contractEnd,

                payday:
                    contract.payday,

                contractContent:
                    makeContractContent()
            };


            const { data } = await apiClient.post(
                "/contract/add",
                request
            );


            toast.success(
                "근로계약서 작성이 완료되었습니다"
            );


            navigate(
                `/contract/before/${data.contractNo}`
            );

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message
                ?? "근로계약 등록 중 오류가 발생했습니다"
            );

        }
        finally {

            setSubmitting(false);

        }

    }, [
        employeeNo,
        contract,
        submitting,
        allValid,
        makeContractContent,
        navigate
    ]);


    return (
        <>
            <Jumbotron
                title="근로계약 작성"
                content="직원의 근로조건을 입력하여 근로계약서를 작성합니다"
            />


            <Container className="my-5">

                <Form onSubmit={sendData}>


                    {/* 제목 */}
                    <div className="text-center my-5">

                        <h2 className="fw-bold">
                            근 로 계 약 서
                        </h2>

                    </div>


                    {/* 기본 문장 */}
                    <div className="mb-5">

                        <p className="fs-5">
                            사용자와 근로자는 다음과 같이
                            근로계약을 체결한다.
                        </p>

                    </div>


                    {/* 1. 근로계약기간 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            1. 근로계약기간
                        </h5>


                        <Row className="align-items-center">

                            <Col md={5}>

                                <Form.Control
                                    type="date"
                                    name="contractStart"
                                    value={contract.contractStart}
                                    onChange={changeStringValue}
                                    className={result.contractStart}
                                />

                                <div className="invalid-feedback">
                                    계약 시작일은 종료일보다 늦을 수 없습니다
                                </div>

                            </Col>


                            <Col
                                md={2}
                                className="text-center"
                            >
                                부터
                            </Col>


                            <Col md={5}>
                                <Form.Control
                                    type="date"
                                    name="contractEnd"
                                    value={contract.contractEnd}
                                    onChange={changeStringValue}
                                    className={result.contractEnd}
                                />

                                <div className="invalid-feedback">
                                    계약 종료일은 시작일보다 빠를 수 없습니다
                                </div>

                                <Form.Text className="text-muted">
                                    기간의 정함이 없는 경우 비워두세요
                                </Form.Text>
                            </Col>

                        </Row>

                    </section>


                    {/* 2. 임금 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            2. 임금
                        </h5>


                        <p>
                            근로자에게 지급하는 임금은 다음과 같다.
                        </p>


                        <Row className="align-items-center mb-3">

                            <Col md={2}>
                                임금형태
                            </Col>

                            <Col md={4}>

                                <Form.Select
                                    name="wageType"
                                    value={contract.wageType}
                                    onChange={changeStringValue}
                                >

                                    <option value="">
                                        선택
                                    </option>

                                    <option value="monthly">
                                        월급
                                    </option>

                                    <option value="daily">
                                        일급
                                    </option>

                                    <option value="hourly">
                                        시급
                                    </option>

                                </Form.Select>

                            </Col>

                        </Row>


                        <Row className="align-items-center mb-3">

                            <Col md={2}>
                                기본임금
                            </Col>

                            <Col md={4}>

                                <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    name="baseWage"
                                    value={contract.baseWage}
                                    onChange={changeNumericValue}
                                />

                            </Col>

                            <Col md={1}>
                                원
                            </Col>

                        </Row>


                        <Row className="align-items-center">

                            <Col md={2}>
                                지급일
                            </Col>

                            <Col md="auto">
                                매월
                            </Col>

                            <Col md={2}>

                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={31}
                                    name="payday"
                                    value={contract.payday}
                                    onChange={changeNumericValue}
                                />

                            </Col>

                            <Col md="auto">
                                일
                            </Col>

                        </Row>

                    </section>


                    {/* 3. 소정근로시간 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            3. 소정근로시간
                        </h5>


                        <p>
                            근로자의 소정근로시간은 다음과 같다.
                        </p>


                        <Row className="align-items-center mb-3">

                            <Col md={3}>
                                1일 소정근로시간
                            </Col>

                            <Col md={3}>

                                <Form.Control
                                    type="number"
                                    step="0.5"
                                    name="dailyWorkHours"
                                    value={contract.dailyWorkHours}
                                    onChange={changeNumericValue}
                                    onBlur={validateWorkHours}
                                    className={result.dailyWorkHours}
                                />

                                <div className="invalid-feedback">
                                    1일 소정근로시간은 1주 소정근로시간보다 클 수 없습니다
                                </div>
                            </Col>

                            <Col md="auto">
                                시간
                            </Col>

                        </Row>


                        <Row className="align-items-center">

                            <Col md={3}>
                                1주 소정근로시간
                            </Col>

                            <Col md={3}>
                                <Form.Control
                                    type="number"
                                    step="0.5"
                                    name="weeklyWorkHours"
                                    value={contract.weeklyWorkHours}
                                    onChange={changeNumericValue}
                                    onBlur={validateWorkHours}
                                    className={result.weeklyWorkHours}
                                />

                                <div className="invalid-feedback">
                                    1주 소정근로시간을 확인하세요
                                </div>
                            </Col>

                            <Col md="auto">
                                시간
                            </Col>

                        </Row>

                    </section>


                    {/* 4. 기타 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            4. 기타
                        </h5>

                        <p>
                            사용자와 근로자는 본 근로계약의 내용을
                            성실히 이행한다.
                        </p>

                        <p>
                            본 계약서에 명시되지 않은 사항은
                            관계 법령 및 사업장 규정에 따른다.
                        </p>

                    </section>


                    {/* 작성 완료 */}
                    <div className="d-flex justify-content-end mb-5">

                        <Button
                            type="submit"
                            disabled={!allValid || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />
                                    데이터 전송 중...
                                </>
                            ) : (
                                <>
                                    <FaFileCircleCheck className="me-2" />
                                    제출하기
                                </>
                            )}
                        </Button>
                    </div>

                </Form>

            </Container>
        </>
    );
}