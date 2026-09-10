import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Row
} from "react-bootstrap";

import {
    useAtomValue
} from "jotai";

import {
    toast
} from "react-toastify";

import {
    apiClient
} from "@utils/reaxios";

import {
    loginUserState
} from "@utils/storage";

import Jumbotron from "@templates/Jumbotron";


const EmployeePayrollList = () => {

    const navigate =
        useNavigate();


    const loginUser =
        useAtomValue(
            loginUserState
        );


    const employeeNo =
        loginUser?.employeeNo;


    const [payrollList, setPayrollList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


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


    // =========================
    // 급여 목록 조회
    // =========================

    const loadPayrollList = async () => {

        if (employeeNo === null
            || employeeNo === undefined) {

            return;
        }


        try {

            setLoading(true);


            const response =
                await apiClient.get(
                    `/employee/payroll/list/${employeeNo}`
                );


            // 직원에게는 확정된 급여만 표시
            const confirmedPayrollList =
                response.data.filter(
                    payroll =>
                        payroll.payrollStatus
                        === "confirmed"
                );


            setPayrollList(
                confirmedPayrollList
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
            `/employee/payroll/${payrollYear}/${payrollMonth}`
        );
    };


    useEffect(() => {

        loadPayrollList();

    }, [
        employeeNo
    ]);


    return (
        <Container className="py-4">

            <Jumbotron
                title="내 급여"
            />


            <Card>

                <Card.Header>
                    급여 목록
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
                                    급여 목록을 불러오는 중입니다
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
                                    조회할 수 있는 급여가 없습니다
                                </Col>

                            </Row>

                        )
                        : (

                            <>
                                {/* 제목 */}

                                <Row
                                    className="
                                        fw-bold
                                        text-center
                                        border-bottom
                                        py-3
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

                                    <Col md={2}>
                                        명세서
                                    </Col>

                                </Row>


                                {
                                    payrollList.map(
                                        payroll => (

                                            <Row
                                                key={
                                                    payroll.payrollNo
                                                }
                                                className="
                                                    align-items-center
                                                    text-center
                                                    border-bottom
                                                    py-3
                                                "
                                            >

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


                                                <Col md={2}>

                                                    {
                                                        payroll.totalWorkHours
                                                        ?? 0
                                                    }시간

                                                </Col>


                                                <Col md={2}>

                                                    {
                                                        formatMoney(
                                                            payroll.grossPay
                                                        )
                                                    }원

                                                </Col>


                                                <Col md={2}>

                                                    {
                                                        formatMoney(
                                                            payroll.totalDeduction
                                                        )
                                                    }원

                                                </Col>


                                                <Col md={2}>

                                                    <strong>

                                                        {
                                                            formatMoney(
                                                                payroll.netPay
                                                            )
                                                        }원

                                                    </strong>

                                                </Col>


                                                <Col md={2}>

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
                                                        급여명세서
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


export default EmployeePayrollList;