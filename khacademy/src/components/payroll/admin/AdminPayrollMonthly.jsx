import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";

import Jumbotron from "@templates/Jumbotron";


const AdminPayrollMonthly = () => {

    const navigate =
        useNavigate();


    const [payrollYear, setPayrollYear] =
        useState("");

    const [payrollMonth, setPayrollMonth] =
        useState("");

    const [payrollList, setPayrollList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [searched, setSearched] =
        useState(false);


    // =========================
    // 금액 표시
    // =========================

    const formatMoney = (value) => {

        if (value === null
            || value === undefined) {

            return "-";
        }

        return value.toLocaleString();
    };


    // =========================
    // 급여 상태 표시
    // =========================

    const payrollStatusText = (status) => {

        if (status === null
            || status === undefined) {

            return "미계산";
        }


        if (status === "calculating") {

            return "계산중";
        }


        if (status === "confirmed") {

            return "확정";
        }


        return status;
    };


    // =========================
    // 상태 Badge
    // =========================

    const payrollStatusBadge = (status) => {

        if (status === null
            || status === undefined) {

            return (
                <Badge
                    bg="light"
                    text="dark"
                >
                    미계산
                </Badge>
            );
        }


        if (status === "calculating") {

            return (
                <Badge bg="secondary">
                    계산중
                </Badge>
            );
        }


        if (status === "confirmed") {

            return (
                <Badge bg="success">
                    확정
                </Badge>
            );
        }


        return (
            <Badge bg="secondary">

                {
                    payrollStatusText(
                        status
                    )
                }

            </Badge>
        );
    };


    // =========================
    // 월별 급여 현황 조회
    // =========================

    const searchPayroll = async () => {

        if (payrollYear === null
            || payrollYear === "") {

            toast.warning(
                "급여 연도를 입력해주세요"
            );

            return;
        }


        if (payrollMonth === null
            || payrollMonth === "") {

            toast.warning(
                "급여 월을 선택해주세요"
            );

            return;
        }


        if (payrollMonth < 1
            || payrollMonth > 12) {

            toast.warning(
                "급여 월을 확인해주세요"
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await apiClient.get(
                    `/employee/admin/payroll/monthly/${payrollYear}/${payrollMonth}`
                );


            setPayrollList(
                response.data
            );


            setSearched(true);

        }
        catch (error) {

            console.error(error);


            toast.error(
                "월별 급여 현황 조회에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 급여 상세 이동
    // =========================

    const movePayrollDetail = (
        employeeNo
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}/${payrollYear}/${payrollMonth}`
        );
    };


    // =========================
    // 급여 최초 계산 이동
    // =========================

    const movePayrollCalculate = (
        employeeNo
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}/calculate`
        );
    };


    return (
        <Container className="py-4">

            <Jumbotron
                title="월별 급여 현황"
            />


            {/* ========================= */}
            {/* 조회 조건 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-end">

                        <Col md={5}>

                            <Form.Group>

                                <Form.Label>
                                    급여 연도
                                </Form.Label>


                                <Form.Control
                                    type="number"
                                    value={
                                        payrollYear
                                    }
                                    onChange={
                                        e =>
                                            setPayrollYear(
                                                e.target.value
                                            )
                                    }
                                    placeholder="예: 2026"
                                />

                            </Form.Group>

                        </Col>


                        <Col md={5}>

                            <Form.Group>

                                <Form.Label>
                                    급여 월
                                </Form.Label>


                                <Form.Select
                                    value={
                                        payrollMonth
                                    }
                                    onChange={
                                        e =>
                                            setPayrollMonth(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        월 선택
                                    </option>

                                    <option value="1">
                                        1월
                                    </option>

                                    <option value="2">
                                        2월
                                    </option>

                                    <option value="3">
                                        3월
                                    </option>

                                    <option value="4">
                                        4월
                                    </option>

                                    <option value="5">
                                        5월
                                    </option>

                                    <option value="6">
                                        6월
                                    </option>

                                    <option value="7">
                                        7월
                                    </option>

                                    <option value="8">
                                        8월
                                    </option>

                                    <option value="9">
                                        9월
                                    </option>

                                    <option value="10">
                                        10월
                                    </option>

                                    <option value="11">
                                        11월
                                    </option>

                                    <option value="12">
                                        12월
                                    </option>

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        <Col md={2}>

                            <Button
                                className="w-100"
                                disabled={
                                    loading
                                }
                                onClick={
                                    searchPayroll
                                }
                            >
                                조회
                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 급여 현황 */}
            {/* ========================= */}

            <Card>

                <Card.Header>

                    {
                        searched
                        ? (
                            <>
                                {payrollYear}년{" "}
                                {payrollMonth}월 급여 현황
                            </>
                        )
                        : (
                            "급여 현황"
                        )
                    }

                </Card.Header>


                <Card.Body>

                    {
                        loading
                        ? (

                            <Row>

                                <Col
                                    className="
                                        text-center
                                        py-5
                                    "
                                >
                                    급여 현황을 불러오는 중입니다
                                </Col>

                            </Row>

                        )
                        : !searched
                        ? (

                            <Row>

                                <Col
                                    className="
                                        text-center
                                        text-muted
                                        py-5
                                    "
                                >
                                    조회할 연도와 월을 선택해주세요
                                </Col>

                            </Row>

                        )
                        : payrollList.length === 0
                        ? (

                            <Row>

                                <Col
                                    className="
                                        text-center
                                        text-muted
                                        py-5
                                    "
                                >
                                    해당 월에 급여 대상 직원이 없습니다
                                </Col>

                            </Row>

                        )
                        : (

                            <>
                                {/* ========================= */}
                                {/* 제목 */}
                                {/* ========================= */}

                                <Row
                                    className="
                                        fw-bold
                                        text-center
                                        border-bottom
                                        py-3
                                    "
                                >

                                    <Col md={2}>
                                        직원
                                    </Col>

                                    <Col md={2}>
                                        상태
                                    </Col>

                                    <Col md={2}>
                                        근로시간
                                    </Col>

                                    <Col md={2}>
                                        총 지급액
                                    </Col>

                                    <Col md={2}>
                                        실수령액
                                    </Col>

                                    <Col md={2}>
                                        관리
                                    </Col>

                                </Row>


                                {/* ========================= */}
                                {/* 직원별 급여 */}
                                {/* ========================= */}

                                {
                                    payrollList.map(
                                        payroll => (

                                            <Row
                                                key={
                                                    payroll.employeeNo
                                                }
                                                className="
                                                    align-items-center
                                                    text-center
                                                    border-bottom
                                                    py-3
                                                "
                                            >

                                                {/* 직원 */}

                                                <Col md={2}>

                                                    <div>

                                                        <strong>

                                                            {
                                                                payroll.accountName
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div
                                                        className="
                                                            small
                                                            text-muted
                                                        "
                                                    >

                                                        직원번호{" "}

                                                        {
                                                            payroll.employeeNo
                                                        }

                                                    </div>

                                                </Col>


                                                {/* 상태 */}

                                                <Col md={2}>

                                                    {
                                                        payrollStatusBadge(
                                                            payroll.payrollStatus
                                                        )
                                                    }

                                                </Col>


                                                {/* 근로시간 */}

                                                <Col md={2}>

                                                    {
                                                        payroll.payrollNo
                                                        === null
                                                        || payroll.payrollNo
                                                        === undefined
                                                        ? (
                                                            "-"
                                                        )
                                                        : (
                                                            <>
                                                                {
                                                                    payroll.totalWorkHours
                                                                    ?? 0
                                                                }시간
                                                            </>
                                                        )
                                                    }

                                                </Col>


                                                {/* 총 지급액 */}

                                                <Col md={2}>

                                                    {
                                                        formatMoney(
                                                            payroll.grossPay
                                                        )
                                                    }

                                                    {
                                                        payroll.grossPay
                                                        !== null
                                                        && payroll.grossPay
                                                        !== undefined
                                                        ? "원"
                                                        : ""
                                                    }

                                                </Col>


                                                {/* 실수령액 */}

                                                <Col md={2}>

                                                    <strong>

                                                        {
                                                            formatMoney(
                                                                payroll.netPay
                                                            )
                                                        }

                                                        {
                                                            payroll.netPay
                                                            !== null
                                                            && payroll.netPay
                                                            !== undefined
                                                            ? "원"
                                                            : ""
                                                        }

                                                    </strong>

                                                </Col>


                                                {/* 관리 */}

                                                <Col md={2}>

                                                    {
                                                        payroll.payrollNo
                                                        === null
                                                        || payroll.payrollNo
                                                        === undefined
                                                        ? (

                                                            <Button
                                                                size="sm"
                                                                onClick={
                                                                    () =>
                                                                        movePayrollCalculate(
                                                                            payroll.employeeNo
                                                                        )
                                                                }
                                                            >
                                                                급여 계산
                                                            </Button>

                                                        )
                                                        : (

                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={
                                                                    () =>
                                                                        movePayrollDetail(
                                                                            payroll.employeeNo
                                                                        )
                                                                }
                                                            >
                                                                상세
                                                            </Button>

                                                        )
                                                    }

                                                </Col>

                                            </Row>

                                        )
                                    )
                                }

                            </>

                        )
                    }

                </Card.Body>

            </Card>

        </Container>
    );
};


export default AdminPayrollMonthly;