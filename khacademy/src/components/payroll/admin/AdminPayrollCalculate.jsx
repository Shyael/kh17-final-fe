import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Button,
    Card,
    Col,
    Container,
    Row
} from "react-bootstrap";

import { useState } from "react";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";


const AdminPayrollCalculate = () => {

    const navigate =
        useNavigate();


    const {
        employeeNo,
        payrollYear,
        payrollMonth
    } = useParams();


    const [loading, setLoading] =
        useState(false);


    // =========================
    // 월별 급여 현황으로 이동
    // =========================

    const movePayrollMonthly = () => {

        navigate(
            "/admin/payroll"
        );
    };


    // =========================
    // 급여 계산
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


            navigate(
                `/admin/payroll/${employeeNo}/${payrollYear}/${payrollMonth}`
            );

        }
        catch (error) {

            console.error(error);


            if (error.response?.status === 404) {

                toast.error(
                    "급여 계산에 필요한 근로계약 또는 근태정보가 없습니다"
                );

                return;
            }


            if (error.response?.status === 403) {

                toast.error(
                    "급여를 계산할 수 없습니다"
                );

                return;
            }


            toast.error(
                "급여 계산에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    return (
        <Container className="py-4">

            <Jumbotron
                title="급여 계산"
            />


            {/* ========================= */}
            {/* 계산 대상 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Header>
                    급여 계산 대상
                </Card.Header>


                <Card.Body>

                    <Row className="mb-3">

                        <Col md={3}>
                            직원번호
                        </Col>

                        <Col>

                            <strong>
                                {employeeNo}
                            </strong>

                        </Col>

                    </Row>


                    <Row className="mb-3">

                        <Col md={3}>
                            급여 연도
                        </Col>

                        <Col>

                            <strong>
                                {payrollYear}년
                            </strong>

                        </Col>

                    </Row>


                    <Row>

                        <Col md={3}>
                            급여 월
                        </Col>

                        <Col>

                            <strong>
                                {payrollMonth}월
                            </strong>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 계산 안내 */}
            {/* ========================= */}

            <Card>

                <Card.Header>
                    급여 계산
                </Card.Header>


                <Card.Body>

                    <Row>

                        <Col>

                            <div className="mb-3">

                                선택한 직원의{" "}

                                <strong>
                                    {payrollYear}년{" "}
                                    {payrollMonth}월
                                </strong>

                                {" "}급여를 계산합니다.

                            </div>


                            <div className="text-muted">

                                해당 기간의 근로계약,
                                근무스케줄,
                                실제 근로시간을 기준으로
                                기본급과 각종 수당을 계산합니다.

                            </div>

                        </Col>

                    </Row>


                    <Row className="mt-4">

                        <Col className="text-end">

                            <Button
                                variant="outline-secondary"
                                className="me-2"
                                disabled={
                                    loading
                                }
                                onClick={
                                    movePayrollMonthly
                                }
                            >
                                취소
                            </Button>


                            <Button
                                disabled={
                                    loading
                                }
                                onClick={
                                    calculatePayroll
                                }
                            >

                                {
                                    loading
                                    ? "계산중..."
                                    : "급여 계산"
                                }

                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>

        </Container>
    );
};


export default AdminPayrollCalculate;