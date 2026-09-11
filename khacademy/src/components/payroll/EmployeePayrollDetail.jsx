import {
    useEffect,
    useState
} from "react";

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
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";


const EmployeePayrollDetail = () => {

    const navigate =
        useNavigate();

    const {
        payrollYear,
        payrollMonth
    } = useParams();


    const [payroll, setPayroll] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    // =========================
    // 금액 표시
    // =========================

    const formatMoney = (value) => {

        if (
            value === null
            || value === undefined
        ) {
            return "0";
        }

        return Number(value).toLocaleString();
    };


    // =========================
    // 근로시간 표시
    // =========================

    const formatHours = (value) => {

        if (
            value === null
            || value === undefined
        ) {
            return 0;
        }

        return (
            Math.round(
                Number(value) * 100
            ) / 100
        );
    };


    // =========================
    // 날짜 + 시간 표시
    // =========================

    const formatDateTime = (value) => {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        const hour =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );

        const minute =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );

        const second =
            String(
                date.getSeconds()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day} `
            + `${hour}:${minute}:${second}`
        );
    };


    // =========================
    // 급여 상태
    // =========================

    const payrollStatusText = (status) => {

        if (status === "calculating") {
            return "계산중";
        }

        if (status === "confirmed") {
            return "확정";
        }

        return status ?? "-";
    };


    // =========================
    // 지급 상태
    // =========================

    const paymentStatusText = (status) => {

        if (status === "paid") {
            return "지급";
        }

        if (status === "cancelled") {
            return "지급취소";
        }

        if (status === "unpaid") {
            return "미지급";
        }

        return status ?? "-";
    };


    // =========================
    // 지급 상태 Badge
    // =========================

    const paymentStatusBadge = (status) => {

        if (status === "paid") {

            return (
                <Badge bg="success">
                    지급
                </Badge>
            );
        }

        if (status === "cancelled") {

            return (
                <Badge bg="danger">
                    지급취소
                </Badge>
            );
        }

        return (
            <Badge bg="secondary">
                {paymentStatusText(status)}
            </Badge>
        );
    };


    // =========================
    // 직원 본인 급여 조회
    // =========================

    const loadPayroll = async () => {

        try {

            setLoading(true);


            const response =
                await apiClient.get(
                    `/employee/payroll/my/${payrollYear}/${payrollMonth}`
                );


            setPayroll(
                response.data
            );

        }
        catch (error) {

            console.error(
                "직원 급여 상세 조회 실패",
                error
            );


            if (
                error.response?.status
                === 404
            ) {

                setPayroll(null);

                return;
            }


            toast.error(
                "급여 정보를 불러오지 못했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 최초 조회
    // =========================

    useEffect(() => {

        loadPayroll();

    }, [
        payrollYear,
        payrollMonth
    ]);


    // =========================
    // 로딩
    // =========================

    if (
        loading
        && payroll === null
    ) {

        return (
            <Container className="py-4">

                <Jumbotron
                    title="급여명세"
                />

                <div
                    className="
                        text-center
                        py-5
                    "
                >
                    급여 정보를 불러오는 중입니다
                </div>

            </Container>
        );
    }


    // =========================
    // 급여 없음
    // =========================

    if (payroll === null) {

        return (
            <Container className="py-4">

                <Jumbotron
                    title="급여명세"
                />

                <Card>

                    <Card.Body>

                        <div
                            className="
                                text-center
                                py-5
                            "
                        >

                            <div className="mb-4">
                                해당 월의 급여 정보가 없습니다
                            </div>

                            <Button
                                variant="outline-secondary"
                                onClick={
                                    () =>
                                        navigate(-1)
                                }
                            >
                                돌아가기
                            </Button>

                        </div>

                    </Card.Body>

                </Card>

            </Container>
        );
    }


    return (
        <Container className="py-4">

            <Jumbotron
                title="급여명세"
            />


            {/* ========================= */}
            {/* 기본 정보 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-center">

                        <Col>

                            <h3 className="mb-3">

                                {payroll.payrollYear}년{" "}
                                {payroll.payrollMonth}월 급여

                            </h3>


                            <Row className="mb-2">

                                <Col md={3}>
                                    급여상태
                                </Col>

                                <Col>

                                    <Badge
                                        bg={
                                            payroll.payrollStatus
                                            === "confirmed"
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        {
                                            payrollStatusText(
                                                payroll.payrollStatus
                                            )
                                        }
                                    </Badge>

                                </Col>

                            </Row>


                            <Row className="mb-2">

                                <Col md={3}>
                                    계산일시
                                </Col>

                                <Col>
                                    {
                                        formatDateTime(
                                            payroll.calculatedAt
                                        )
                                    }
                                </Col>

                            </Row>


                            <Row>

                                <Col md={3}>
                                    확정일시
                                </Col>

                                <Col>
                                    {
                                        formatDateTime(
                                            payroll.confirmedAt
                                        )
                                    }
                                </Col>

                            </Row>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 근로시간 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Header>
                    근로시간
                </Card.Header>

                <Card.Body>

                    <Row className="text-center">

                        <Col md={3}>

                            <div className="mb-2">
                                총 근로시간
                            </div>

                            <strong>
                                {
                                    formatHours(
                                        payroll.totalWorkHours
                                    )
                                }시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                연장근로
                            </div>

                            <strong>
                                {
                                    formatHours(
                                        payroll.totalOvertimeHours
                                    )
                                }시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                야간근로
                            </div>

                            <strong>
                                {
                                    formatHours(
                                        payroll.totalNightHours
                                    )
                                }시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                휴일근로
                            </div>

                            <strong>
                                {
                                    formatHours(
                                        payroll.totalHolidayHours
                                    )
                                }시간
                            </strong>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 지급 내역 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Header>
                    지급 내역
                </Card.Header>

                <Card.Body>

                    <PayRow
                        label="기본급"
                        value={payroll.basePay}
                        formatMoney={formatMoney}
                    />

                    <PayRow
                        label="주휴수당"
                        value={payroll.weekHolidayPay}
                        formatMoney={formatMoney}
                    />

                    <PayRow
                        label="연장근로수당"
                        value={payroll.overtimePay}
                        formatMoney={formatMoney}
                    />

                    <PayRow
                        label="야간근로수당"
                        value={payroll.nightPay}
                        formatMoney={formatMoney}
                    />

                    <PayRow
                        label="휴일근로수당"
                        value={payroll.holidayPay}
                        formatMoney={formatMoney}
                    />


                    <Row className="pt-3">

                        <Col>

                            <strong>
                                총 지급액
                            </strong>

                        </Col>

                        <Col className="text-end">

                            <strong>
                                {
                                    formatMoney(
                                        payroll.grossPay
                                    )
                                }원
                            </strong>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 공제 내역 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Header>
                    공제 내역
                </Card.Header>

                <Card.Body>

                    {
                        payroll.deductionList
                            ?.length > 0
                            ? (

                                payroll.deductionList.map(
                                    deduction => (

                                        <Row
                                            key={
                                                deduction.deductionType
                                            }
                                            className="
                                                py-2
                                                border-bottom
                                            "
                                        >

                                            <Col>
                                                {
                                                    deduction.deductionType
                                                }
                                            </Col>

                                            <Col className="text-end">

                                                {
                                                    formatMoney(
                                                        deduction.deductionAmount
                                                    )
                                                }원

                                            </Col>

                                        </Row>

                                    )
                                )

                            )
                            : (

                                <div
                                    className="
                                        text-center
                                        text-muted
                                        py-3
                                    "
                                >
                                    공제내역이 없습니다
                                </div>

                            )
                    }


                    <Row className="pt-3">

                        <Col>

                            <strong>
                                총 공제액
                            </strong>

                        </Col>

                        <Col className="text-end">

                            <strong>
                                {
                                    formatMoney(
                                        payroll.totalDeduction
                                    )
                                }원
                            </strong>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 실수령액 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-center">

                        <Col>

                            <div>
                                실수령액
                            </div>

                            <h3 className="mt-2">

                                {
                                    formatMoney(
                                        payroll.netPay
                                    )
                                }원

                            </h3>

                        </Col>


                        <Col className="text-end">

                            <div>
                                현재 지급액
                            </div>

                            <h4 className="mt-2">

                                {
                                    formatMoney(
                                        payroll.currentPaidAmount
                                    )
                                }원

                            </h4>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 지급 이력 */}
            {/* ========================= */}

            <Card>

                <Card.Header>
                    지급 이력
                </Card.Header>

                <Card.Body>

                    {
                        payroll.paymentList
                            ?.length > 0
                            ? (

                                payroll.paymentList.map(
                                    payment => (

                                        <Row
                                            key={
                                                payment.payrollPaymentNo
                                            }
                                            className="
                                                py-3
                                                border-bottom
                                                align-items-center
                                            "
                                        >

                                            <Col md={2}>

                                                {
                                                    paymentStatusBadge(
                                                        payment.paymentStatus
                                                    )
                                                }

                                            </Col>


                                            <Col md={3}>

                                                {
                                                    formatDateTime(
                                                        payment.paymentAt
                                                    )
                                                }

                                            </Col>


                                            <Col
                                                md={2}
                                                className="text-end"
                                            >

                                                {
                                                    formatMoney(
                                                        payment.paymentAmount
                                                    )
                                                }원

                                            </Col>


                                            <Col md={2}>

                                                {
                                                    payment.paymentMethod
                                                    ?? "-"
                                                }

                                            </Col>


                                            <Col md={3}>

                                                {
                                                    payment.paymentNote
                                                    ?? "-"
                                                }

                                            </Col>

                                        </Row>

                                    )
                                )

                            )
                            : (

                                <div
                                    className="
                                        text-center
                                        text-muted
                                        py-4
                                    "
                                >
                                    지급 이력이 없습니다
                                </div>

                            )
                    }

                </Card.Body>

            </Card>

        </Container>
    );
};


// =============================================
// 지급 항목 한 줄
// =============================================

function PayRow({
    label,
    value,
    formatMoney
}) {

    return (
        <Row className="py-2 border-bottom">

            <Col>
                {label}
            </Col>

            <Col className="text-end">
                {formatMoney(value)}원
            </Col>

        </Row>
    );
}


export default EmployeePayrollDetail;