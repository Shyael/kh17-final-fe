import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Row
    ,Form
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";


const AdminPayrollList = () => {

    const {
        employeeNo
    } = useParams();

    const navigate =
        useNavigate();


    const [payrollList, setPayrollList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


     const now = new Date();

    const [payrollYear, setPayrollYear] =
        useState(
          String(now.getFullYear())
        );

const [payrollMonth, setPayrollMonth] =
    useState(now.getMonth() + 1);


const changePayrollYear = (e) => {

    const value =
        e.target.value.replace(
            /\D/g,
            ""
        );

    if (value.length <= 4) {
        setPayrollYear(value);
    }
};


    const movePayrollCalculate = () => {

    if (payrollYear.length !== 4) {
        toast.error(
            "연도는 4자리로 입력해주세요."
        );
        return;
    }

    navigate(
        `/admin/payroll/${employeeNo}/calculate/${payrollYear}/${payrollMonth}`
    );
};

    // =========================
    // 금액 표시
    // =========================

    const formatMoney = (value) => {

        if (value === null
            || value === undefined) {

            return "0";
        }

        return value.toLocaleString();
    };


    const formatHours = (value) => {

        if (
            value === null
            || value === undefined
        ) {
            return "-";
        }

        const number =
            Number(value);

        return Number(
            number.toFixed(2)
        );
    };

    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString("ko-KR");
    };

    // =========================
    // 급여 상태 한글 표시
    // =========================

    const payrollStatusText = (status) => {

        if (status === "calculating") {
            return "계산중";
        }

        if (status === "confirmed") {
            return "확정";
        }

        return status;
    };


    // =========================
    // 급여 목록 조회
    // =========================

    const loadPayrollList = async () => {

        try {

            setLoading(true);

            const response =
                await apiClient.get(
                    `/admin/payroll/list/${employeeNo}`
                );

            setPayrollList(
                response.data
            );

        }
        catch (error) {

            console.error(error);

            toast.error(
                "급여 목록을 불러오지 못했습니다"
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
        payrollYear,
        payrollMonth
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}/${payrollYear}/${payrollMonth}`
        );
    };


    // =========================
    // 최초 조회
    // =========================

    useEffect(() => {

        loadPayrollList();

    }, [
        employeeNo
    ]);


    return (
        <Container className="py-4">

            <Jumbotron
                title="급여 관리"
            />


            {/* ========================= */}
            {/* 기본정보 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-center">

                        <Col>

                            <h4>
                                직원 급여 목록
                            </h4>

                            <div className="mt-2">

                                직원번호 :{" "}

                                <strong>
                                    {employeeNo}
                                </strong>

                            </div>

                        </Col>


                        <Col className="text-end">


                            <Form.Control
                                     type="text"
                                    inputMode="numeric"
                                    value={payrollYear}
                                    onChange={changePayrollYear}
                                    maxLength={4}
                                />


                                <Form.Select
                                        value={payrollMonth}
                                        onChange={(e) =>
                                            setPayrollMonth(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        {
                                            Array.from(
                                                { length: 12 },
                                                (_, index) => index + 1
                                            ).map(month => (
                                                <option
                                                    key={month}
                                                    value={month}
                                                >
                                                    {month}월
                                                </option>
                                            ))
                                        }
                                </Form.Select>
                            <Button
                                onClick={
                                    movePayrollCalculate
                                }
                            >
                                급여 계산
                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 목록 제목 */}
            {/* ========================= */}

            <Card>

                <Card.Header>
                    급여 내역
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
                                        급여 목록을
                                        불러오는 중입니다
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
                                            등록된 급여 내역이
                                            없습니다
                                        </Col>

                                    </Row>

                                )
                                : (

                                    <>
                                        {/* ========================= */}
                                        {/* 목록 헤더 */}
                                        {/* ========================= */}

                                        <Row
                                            className="
                                        py-2
                                        border-bottom
                                        fw-bold
                                        text-center
                                    "
                                        >

                                            <Col md={2}>
                                                귀속월
                                            </Col>

                                            <Col md={2}>
                                                근로시간
                                            </Col>

                                            <Col md={2}>
                                                총 지급액
                                            </Col>

                                            <Col md={2}>
                                                총 공제액
                                            </Col>

                                            <Col md={2}>
                                                실수령액
                                            </Col>

                                            <Col md={1}>
                                                상태
                                            </Col>

                                            <Col md={1}>
                                                상세
                                            </Col>

                                        </Row>


                                        {/* ========================= */}
                                        {/* 급여 목록 */}
                                        {/* ========================= */}

                                        {
                                            payrollList.map(
                                                payroll => (

                                                    <Row
                                                        key={
                                                            payroll.payrollNo
                                                        }
                                                        className="
                                                    py-3
                                                    border-bottom
                                                    align-items-center
                                                    text-center
                                                "
                                                    >

                                                        {/* 귀속월 */}

                                                        <Col md={2}>

                                                            <strong>

                                                                {
                                                                    payroll.payrollYear
                                                                }년{" "}

                                                                {
                                                                    payroll.payrollMonth
                                                                }월

                                                            </strong>

                                                        </Col>


                                                        {/* 근로시간 */}

                                                        <Col md={2}>

                                                            {
                                                                formatHours(
                                                                payroll.totalWorkHours
                                                                ?? 0)
                                                            }시간

                                                        </Col>


                                                        {/* 총 지급액 */}

                                                        <Col
                                                            md={2}
                                                            className="text-end"
                                                        >

                                                            {
                                                                formatMoney(
                                                                    payroll.grossPay
                                                                )
                                                            }원

                                                        </Col>


                                                        {/* 총 공제액 */}

                                                        <Col
                                                            md={2}
                                                            className="text-end"
                                                        >

                                                            {
                                                                formatMoney(
                                                                    payroll.totalDeduction
                                                                )
                                                            }원

                                                        </Col>


                                                        {/* 실수령액 */}

                                                        <Col
                                                            md={2}
                                                            className="text-end"
                                                        >

                                                            <strong>

                                                                {
                                                                    formatMoney(
                                                                        payroll.netPay
                                                                    )
                                                                }원

                                                            </strong>

                                                        </Col>


                                                        {/* 급여 상태 */}

                                                        <Col md={1}>

                                                            {
                                                                payroll.payrollStatus
                                                                    === "confirmed"
                                                                    ? (

                                                                        <Badge bg="success">

                                                                            {
                                                                                payrollStatusText(
                                                                                    payroll.payrollStatus
                                                                                )
                                                                            }

                                                                        </Badge>

                                                                    )
                                                                    : (

                                                                        <Badge bg="secondary">

                                                                            {
                                                                                payrollStatusText(
                                                                                    payroll.payrollStatus
                                                                                )
                                                                            }

                                                                        </Badge>

                                                                    )
                                                            }

                                                        </Col>


                                                        {/* 상세 이동 */}

                                                        <Col md={1}>

                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={
                                                                    () =>
                                                                        movePayrollDetail(
                                                                            payroll.payrollYear,
                                                                            payroll.payrollMonth
                                                                        )
                                                                }
                                                            >
                                                                상세
                                                            </Button>

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


export default AdminPayrollList;