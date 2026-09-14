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


const AdminPayrollMain = () => {

    const navigate = useNavigate();

    const now = new Date();


    // =====================================================
    // 검색 조건
    // =====================================================

    const [accountName, setAccountName] =
        useState("");

    const [payrollYear, setPayrollYear] =
        useState(
            String(now.getFullYear())
        );

    const [payrollMonth, setPayrollMonth] =
        useState(
            String(now.getMonth() + 1)
        );


    // =====================================================
    // 조회 결과
    // =====================================================

    const [payrollList, setPayrollList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [searched, setSearched] =
        useState(false);


    // =====================================================
    // 금액 표시
    // =====================================================

    const formatMoney = (value) => {

        if (
            value === null
            || value === undefined
        ) {
            return "-";
        }

        return Number(value).toLocaleString();
    };


    // =====================================================
    // 근로시간 표시
    // =====================================================

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


    // =====================================================
    // 급여 상태 Badge
    // =====================================================

    const payrollStatusBadge = (status) => {

        if (
            status === null
            || status === undefined
        ) {
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
                {status}
            </Badge>
        );
    };


    // =====================================================
    // 급여 조회
    // =====================================================

    const searchPayroll = async () => {

        if (
            payrollYear === null
            || payrollYear.trim() === ""
        ) {

            toast.warning(
                "급여 연도를 입력해주세요"
            );

            return;
        }


        if (
            payrollMonth === null
            || payrollMonth === ""
        ) {

            toast.warning(
                "급여 월을 선택해주세요"
            );

            return;
        }


        const year =
            Number(payrollYear);

        const month =
            Number(payrollMonth);


        if (
            year < 1000
            || year > 9999
        ) {

            toast.warning(
                "급여 연도를 확인해주세요"
            );

            return;
        }


        if (
            month < 1
            || month > 12
        ) {

            toast.warning(
                "급여 월을 확인해주세요"
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await apiClient.get(
                    `/admin/payroll/monthly/${year}/${month}`
                );


            let list =
                response.data ?? [];


            // 직원 이름이 입력되어 있으면
            // 조회 결과에서 이름 필터링
            if (
                accountName !== null
                && accountName.trim() !== ""
            ) {

                const keyword =
                    accountName.trim();


                list =
                    list.filter(
                        payroll =>
                            payroll.accountName
                                ?.includes(keyword)
                    );

            }


            setPayrollList(
                list
            );

            setSearched(true);

        }
        catch (error) {

            console.error(
                "급여 조회 실패",
                error
            );

            setPayrollList([]);

            setSearched(true);

            toast.error(
                "급여 조회에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =====================================================
    // 엔터 조회
    // =====================================================

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            searchPayroll();

        }
    };


    // =====================================================
    // 직원별 급여 이력
    // =====================================================

    const moveEmployeePayroll = (
        employeeNo
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}`
        );
    };


    // =====================================================
    // 해당 월 급여 상세
    // =====================================================

    const movePayrollDetail = (
        employeeNo
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}/${payrollYear}/${payrollMonth}`
        );
    };


    // =====================================================
    // 급여 계산
    // =====================================================

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
                title="급여 관리"
            />


            {/* ================================================= */}
            {/* 검색 */}
            {/* ================================================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-end">

                        {/* 직원 이름 */}

                        <Col md={4}>

                            <Form.Group>

                                <Form.Label>
                                    직원 이름
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={
                                        accountName
                                    }
                                    onChange={
                                        e =>
                                            setAccountName(
                                                e.target.value
                                            )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="직원 이름"
                                />

                            </Form.Group>

                        </Col>


                        {/* 연도 */}

                        <Col md={3}>

                            <Form.Group>

                                <Form.Label>
                                    급여 연도
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={
                                        payrollYear
                                    }
                                    onChange={
                                        e => {

                                            const value =
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    );

                                            if (
                                                value.length
                                                <= 4
                                            ) {

                                                setPayrollYear(
                                                    value
                                                );

                                            }

                                        }
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="2026"
                                />

                            </Form.Group>

                        </Col>


                        {/* 월 */}

                        <Col md={3}>

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

                                    {
                                        Array.from(
                                            { length: 12 },
                                            (_, index) => (

                                                <option
                                                    key={
                                                        index + 1
                                                    }
                                                    value={
                                                        index + 1
                                                    }
                                                >
                                                    {
                                                        index + 1
                                                    }월
                                                </option>

                                            )
                                        )
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        {/* 조회 */}

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
                                {
                                    loading
                                    ? "조회 중"
                                    : "조회"
                                }
                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ================================================= */}
            {/* 급여 목록 */}
            {/* ================================================= */}

            <Card>

                <Card.Header>

                    <strong>
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
                    </strong>

                </Card.Header>


                <Card.Body>

                    {
                        loading
                        ? (

                            <div
                                className="
                                    text-center
                                    py-5
                                "
                            >
                                급여 현황을 불러오는 중입니다
                            </div>

                        )
                        : !searched
                        ? (

                            <div
                                className="
                                    text-center
                                    text-muted
                                    py-5
                                "
                            >
                                조회 조건을 입력한 후 조회해주세요
                            </div>

                        )
                        : payrollList.length === 0
                        ? (

                            <div
                                className="
                                    text-center
                                    text-muted
                                    py-5
                                "
                            >
                                조회된 급여 대상 직원이 없습니다
                            </div>

                        )
                        : (
                            <>

                                {/* 헤더 */}

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

                                    <Col md={1}>
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

                                    <Col md={3}>
                                        관리
                                    </Col>

                                </Row>


                                {/* 목록 */}

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

                                                <Col md={1}>

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
                                                        ? "-"
                                                        : (
                                                            <>
                                                                {
                                                                    formatHours(
                                                                        payroll.totalWorkHours
                                                                    )
                                                                }
                                                                시간
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

                                                <Col md={3}>

                                                    <div
                                                        className="
                                                            d-flex
                                                            justify-content-center
                                                            gap-2
                                                        "
                                                    >

                                                        {/* 직원 급여 전체 이력 */}

                                                        <Button
                                                            size="sm"
                                                            variant="outline-secondary"
                                                            onClick={
                                                                () =>
                                                                    moveEmployeePayroll(
                                                                        payroll.employeeNo
                                                                    )
                                                            }
                                                        >
                                                            급여 이력
                                                        </Button>


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

                                                    </div>

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


export default AdminPayrollMain;