import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";


const AdminPayrollDetail = () => {

    const {
        employeeNo,
        payrollYear,
        payrollMonth
    } = useParams();


    const [payroll, setPayroll] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    // =========================
    // 지급 모달
    // =========================

    const [showPayModal, setShowPayModal] =
        useState(false);

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [paymentNote, setPaymentNote] =
        useState("");


    // =========================
    // 지급 취소 모달
    // =========================

    const [showCancelModal, setShowCancelModal] =
        useState(false);

    const [cancelAmount, setCancelAmount] =
        useState("");

    const [cancelNote, setCancelNote] =
        useState("");


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
    // 지급 상태 한글 표시
    // =========================

    const paymentStatusText = (status) => {

        if (status === "paid") {
            return "지급";
        }

        if (status === "cancelled") {
            return "지급취소";
        }

        return status;
    };

    const formatHours = (value) => {
        if (value === null || value === undefined) {
            return "-";
        }

        return Math.round(Number(value) * 100) / 100;
    };

    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString("ko-KR");
    };

    // =========================
    // 급여 상세 조회
    // =========================

    const loadPayroll = async () => {

        try {

            setLoading(true);

            const response =
                await apiClient.get(
                    `/admin/payroll/detail/${employeeNo}/${payrollYear}/${payrollMonth}`
                );

            setPayroll(
                response.data
            );

        }
        catch (error) {

            if (error.response?.status === 404) {

                setPayroll(null);

                return;
            }

            console.error(error);

            toast.error(
                "급여 정보를 불러오지 못했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 최초 급여 계산
    // =========================

    const calculatePayroll = async () => {

        try {

            setLoading(true);

            await apiClient.post(
                "/admin/payroll/calculate",
                {
                    employeeNo: employeeNo,
                    payrollYear: payrollYear,
                    payrollMonth: payrollMonth
                }
            );

            toast.success(
                "급여 계산이 완료되었습니다"
            );

            await loadPayroll();

        }
        catch (error) {

            console.error(error);

            toast.error(
                "급여 계산에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 급여 재계산
    // =========================

    const recalculatePayroll = async () => {

        try {

            setLoading(true);

            await apiClient.patch(
                "/admin/payroll/recalculate",
                {
                    employeeNo: employeeNo,
                    payrollYear: payrollYear,
                    payrollMonth: payrollMonth
                }
            );

            toast.success(
                "급여 재계산이 완료되었습니다"
            );

            await loadPayroll();

        }
        catch (error) {

            console.error(error);

            toast.error(
                "급여 재계산에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 급여 확정
    // =========================

    const confirmPayroll = async () => {

        try {

            setLoading(true);

            await apiClient.patch(
                "/admin/payroll/confirm",
                {
                    employeeNo: employeeNo,
                    payrollYear: payrollYear,
                    payrollMonth: payrollMonth
                }
            );

            toast.success(
                "급여가 확정되었습니다"
            );

            await loadPayroll();

        }
        catch (error) {

            console.error(error);

            toast.error(
                "급여 확정에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 급여 지급
    // =========================

    const payPayroll = async () => {

        if (paymentMethod === null
            || paymentMethod.trim() === "") {

            toast.warning(
                "지급 방법을 입력해주세요"
            );

            return;
        }


        try {

            setLoading(true);

            await apiClient.post(
                "/admin/payroll/pay",
                {
                    employeeNo: employeeNo,
                    payrollYear: payrollYear,
                    payrollMonth: payrollMonth,
                    paymentMethod: paymentMethod,
                    paymentNote: paymentNote
                }
            );

            toast.success(
                "급여 지급이 완료되었습니다"
            );

            setShowPayModal(false);

            setPaymentMethod("");

            setPaymentNote("");

            await loadPayroll();

        }
        catch (error) {

            console.error(error);

            toast.error(
                "급여 지급에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 급여 지급 취소
    // =========================

    const cancelPayment = async () => {

        if (cancelAmount === null
            || cancelAmount === ""
            || cancelAmount <= 0) {

            toast.warning(
                "취소 금액을 입력해주세요"
            );

            return;
        }


        if (cancelAmount
            > payroll.currentPaidAmount) {

            toast.warning(
                "현재 지급액보다 많이 취소할 수 없습니다"
            );

            return;
        }


        try {

            setLoading(true);

            await apiClient.post(
                "/admin/payroll/cancel-payment",
                {
                    employeeNo: employeeNo,
                    payrollYear: payrollYear,
                    payrollMonth: payrollMonth,
                    cancelAmount: cancelAmount,
                    paymentNote: cancelNote
                }
            );

            toast.success(
                "지급 취소가 완료되었습니다"
            );

            setShowCancelModal(false);

            setCancelAmount("");

            setCancelNote("");

            await loadPayroll();

        }
        catch (error) {

            console.error(error);

            toast.error(
                "지급 취소에 실패했습니다"
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
        employeeNo,
        payrollYear,
        payrollMonth
    ]);


    // =========================
    // 조회중
    // =========================

    if (loading && payroll === null) {

        return (
            <Container className="py-4">

                <Jumbotron
                    title="급여 관리"
                />

                <Row>

                    <Col className="text-center py-5">

                        급여 정보를 불러오는 중입니다

                    </Col>

                </Row>

            </Container>
        );
    }


    // =========================
    // 아직 급여 계산 전
    // =========================

    if (payroll === null) {

        return (
            <Container className="py-4">

                <Jumbotron
                    title="급여 관리"
                />

                <Card>

                    <Card.Body>

                        <Row>

                            <Col
                                className="
                                    text-center
                                    py-5
                                "
                            >

                                <h5>

                                    {payrollYear}년{" "}
                                    {payrollMonth}월 급여가
                                    아직 계산되지 않았습니다

                                </h5>


                                <Button
                                    className="mt-4"
                                    disabled={loading}
                                    onClick={
                                        calculatePayroll
                                    }
                                >
                                    급여 계산
                                </Button>

                            </Col>

                        </Row>

                    </Card.Body>

                </Card>

            </Container>
        );
    }


    // =========================
    // 상태 판단
    // =========================

    const isConfirmed =
        payroll.payrollStatus ===
        "confirmed";


    const hasPayment =
        payroll.currentPaidAmount > 0;


    return (
        <Container className="py-4">

            <Jumbotron
                title="급여 관리"
            />


            {/* ========================= */}
            {/* 급여 기본정보 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-center">

                        <Col md={7}>

                            <h4>

                                {payroll.payrollYear}년{" "}
                                {payroll.payrollMonth}월 급여

                            </h4>


                            <Row className="mt-3">

                                <Col md={3}>
                                    직원번호
                                </Col>

                                <Col>
                                    {payroll.employeeNo}
                                </Col>

                            </Row>


                            <Row className="mt-2">

                                <Col md={3}>
                                    급여상태
                                </Col>

                                <Col>

                                    {
                                        isConfirmed
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

                            </Row>


                            <Row className="mt-2">

                                <Col md={3}>
                                    계산일시
                                </Col>

                                <Col>

                                    {
                                        formatDateTime(
                                        payroll.calculatedAt
                                        ?? "-")
                                    }

                                </Col>

                            </Row>


                            <Row className="mt-2">

                                <Col md={3}>
                                    확정일시
                                </Col>

                                <Col>

                                    {   formatDateTime(
                                        payroll.confirmedAt
                                        ?? "-")
                                    }

                                </Col>

                            </Row>

                        </Col>


                        <Col
                            md={5}
                            className="
                                text-end
                                mt-3
                                mt-md-0
                            "
                        >

                            <Button
                                variant="outline-secondary"
                                className="me-2"
                                disabled={
                                    loading
                                    || hasPayment
                                }
                                onClick={
                                    recalculatePayroll
                                }
                            >
                                재계산
                            </Button>


                            <Button
                                disabled={
                                    loading
                                    || isConfirmed
                                }
                                onClick={
                                    confirmPayroll
                                }
                            >
                                급여 확정
                            </Button>

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
                                {formatHours(payroll.totalWorkHours)}시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                연장근로
                            </div>

                            <strong>
                                {payroll.totalOvertimeHours}시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                야간근로
                            </div>

                            <strong>
                                {payroll.totalNightHours}시간
                            </strong>

                        </Col>


                        <Col md={3}>

                            <div className="mb-2">
                                휴일근로
                            </div>

                            <strong>
                                {payroll.totalHolidayHours}시간
                            </strong>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 지급 / 공제 */}
            {/* ========================= */}

            <Row>

                {/* ========================= */}
                {/* 지급내역 */}
                {/* ========================= */}

                <Col md={6}>

                    <Card className="mb-4">

                        <Card.Header>
                            지급내역
                        </Card.Header>

                        <Card.Body>

                            <Row className="py-2 border-bottom">

                                <Col>
                                    기본급
                                </Col>

                                <Col className="text-end">

                                    {
                                        formatMoney(
                                            payroll.basePay
                                        )
                                    }원

                                </Col>

                            </Row>


                            <Row className="py-2 border-bottom">

                                <Col>
                                    주휴수당
                                </Col>

                                <Col className="text-end">

                                    {
                                        formatMoney(
                                            payroll.weekHolidayPay
                                        )
                                    }원

                                </Col>

                            </Row>


                            <Row className="py-2 border-bottom">

                                <Col>
                                    연장근로수당
                                </Col>

                                <Col className="text-end">

                                    {
                                        formatMoney(
                                            payroll.overtimePay
                                        )
                                    }원

                                </Col>

                            </Row>


                            <Row className="py-2 border-bottom">

                                <Col>
                                    야간근로수당
                                </Col>

                                <Col className="text-end">

                                    {
                                        formatMoney(
                                            payroll.nightPay
                                        )
                                    }원

                                </Col>

                            </Row>


                            <Row className="py-2 border-bottom">

                                <Col>
                                    휴일근로수당
                                </Col>

                                <Col className="text-end">

                                    {
                                        formatMoney(
                                            payroll.holidayPay
                                        )
                                    }원

                                </Col>

                            </Row>


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

                </Col>


                {/* ========================= */}
                {/* 공제내역 */}
                {/* ========================= */}

                <Col md={6}>

                    <Card className="mb-4">

                        <Card.Header>
                            공제내역
                        </Card.Header>

                        <Card.Body>

                            {
                                payroll.deductionList
                                    ?.length > 0
                                    ? (

                                        payroll.deductionList
                                            .map(
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

                                        <Row>

                                            <Col
                                                className="
                                                text-center
                                                text-muted
                                                py-3
                                            "
                                            >
                                                공제내역이 없습니다
                                            </Col>

                                        </Row>

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

                </Col>

            </Row>


            {/* ========================= */}
            {/* 실수령액 / 지급 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-center">

                        <Col md={7}>

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


                            <Row className="mt-3">

                                <Col md={3}>
                                    현재 지급액
                                </Col>

                                <Col>

                                    <strong>

                                        {
                                            formatMoney(
                                                payroll.currentPaidAmount
                                            )
                                        }원

                                    </strong>

                                </Col>

                            </Row>

                        </Col>


                        <Col
                            md={5}
                            className="
                                text-end
                                mt-3
                                mt-md-0
                            "
                        >

                            <Button
                                className="me-2"
                                disabled={
                                    loading
                                    || !isConfirmed
                                    || hasPayment
                                }
                                onClick={
                                    () =>
                                        setShowPayModal(
                                            true
                                        )
                                }
                            >
                                급여 지급
                            </Button>


                            <Button
                                variant="danger"
                                disabled={
                                    loading
                                    || !hasPayment
                                }
                                onClick={
                                    () =>
                                        setShowCancelModal(
                                            true
                                        )
                                }
                            >
                                지급 취소
                            </Button>

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

                    {/* 제목 행 */}

                    <Row
                        className="
                            py-2
                            border-bottom
                            fw-bold
                            text-center
                        "
                    >

                        <Col md={1}>
                            번호
                        </Col>

                        <Col md={2}>
                            상태
                        </Col>

                        <Col md={2}>
                            금액
                        </Col>

                        <Col md={2}>
                            지급방법
                        </Col>

                        <Col md={3}>
                            처리일시
                        </Col>

                        <Col md={2}>
                            비고
                        </Col>

                    </Row>


                    {
                        payroll.paymentList
                            ?.length > 0
                            ? (

                                payroll.paymentList
                                    .map(
                                        payment => (

                                            <Row
                                                key={
                                                    payment.payrollPaymentNo
                                                }
                                                className="
                                                py-3
                                                border-bottom
                                                align-items-center
                                                text-center
                                            "
                                            >

                                                <Col md={1}>

                                                    {
                                                        payment.payrollPaymentNo
                                                    }

                                                </Col>


                                                <Col md={2}>

                                                    {
                                                        payment.paymentStatus
                                                            === "paid"
                                                            ? (

                                                                <Badge bg="success">

                                                                    {
                                                                        paymentStatusText(
                                                                            payment.paymentStatus
                                                                        )
                                                                    }

                                                                </Badge>

                                                            )
                                                            : (

                                                                <Badge bg="danger">

                                                                    {
                                                                        paymentStatusText(
                                                                            payment.paymentStatus
                                                                        )
                                                                    }

                                                                </Badge>

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

                                                    {formatDateTime(
                                                        payment.paymentAt
                                                        ?? "-")
                                                    }

                                                </Col>


                                                <Col md={2}>

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

                                <Row>

                                    <Col
                                        className="
                                        text-center
                                        text-muted
                                        py-4
                                    "
                                    >
                                        지급 이력이 없습니다
                                    </Col>

                                </Row>

                            )
                    }

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 급여 지급 모달 */}
            {/* ========================= */}

            <Modal
                show={
                    showPayModal
                }
                onHide={
                    () =>
                        setShowPayModal(
                            false
                        )
                }
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        급여 지급
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    <Row className="mb-4">

                        <Col>
                            지급금액
                        </Col>

                        <Col className="text-end">

                            <strong>

                                {
                                    formatMoney(
                                        payroll.netPay
                                    )
                                }원

                            </strong>

                        </Col>

                    </Row>


                    <Form.Group className="mb-3">

                        <Form.Label>
                            지급 방법
                        </Form.Label>

                        <Form.Control
                            value={
                                paymentMethod
                            }
                            onChange={
                                e =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                            }
                            placeholder="예: 계좌이체"
                        />

                    </Form.Group>


                    <Form.Group>

                        <Form.Label>
                            비고
                        </Form.Label>

                        <Form.Control
                            value={
                                paymentNote
                            }
                            onChange={
                                e =>
                                    setPaymentNote(
                                        e.target.value
                                    )
                            }
                        />

                    </Form.Group>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={
                            () =>
                                setShowPayModal(
                                    false
                                )
                        }
                    >
                        취소
                    </Button>


                    <Button
                        disabled={
                            loading
                        }
                        onClick={
                            payPayroll
                        }
                    >
                        지급
                    </Button>

                </Modal.Footer>

            </Modal>


            {/* ========================= */}
            {/* 지급 취소 모달 */}
            {/* ========================= */}

            <Modal
                show={
                    showCancelModal
                }
                onHide={
                    () =>
                        setShowCancelModal(
                            false
                        )
                }
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        지급 취소
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    <Row className="mb-4">

                        <Col>
                            현재 지급액
                        </Col>

                        <Col className="text-end">

                            <strong>

                                {
                                    formatMoney(
                                        payroll.currentPaidAmount
                                    )
                                }원

                            </strong>

                        </Col>

                    </Row>


                    <Form.Group className="mb-3">

                        <Form.Label>
                            취소 금액
                        </Form.Label>

                        <Form.Control
                            type="number"
                            value={
                                cancelAmount
                            }
                            onChange={
                                e =>
                                    setCancelAmount(
                                        e.target.value
                                    )
                            }
                        />

                    </Form.Group>


                    <Form.Group>

                        <Form.Label>
                            취소 사유
                        </Form.Label>

                        <Form.Control
                            value={
                                cancelNote
                            }
                            onChange={
                                e =>
                                    setCancelNote(
                                        e.target.value
                                    )
                            }
                        />

                    </Form.Group>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={
                            () =>
                                setShowCancelModal(
                                    false
                                )
                        }
                    >
                        닫기
                    </Button>


                    <Button
                        variant="danger"
                        disabled={
                            loading
                        }
                        onClick={
                            cancelPayment
                        }
                    >
                        지급 취소
                    </Button>

                </Modal.Footer>

            </Modal>

        </Container>
    );
};

export default AdminPayrollDetail;