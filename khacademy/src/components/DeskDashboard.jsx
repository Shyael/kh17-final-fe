import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import {
    FaMoneyBillWave,
    FaCalendarCheck,
    FaBell,
    FaArrowRight
} from "react-icons/fa6";
import dayjs from "dayjs";

import { useNavigate } from "react-router-dom";

const reservationStatusBadge = {
    "0": <Badge bg="secondary">상담대기</Badge>,
    "1": <Badge bg="success">예약확정</Badge>,
    "2": <Badge bg="info">상담완료</Badge>,
    "9": <Badge bg="danger">예약취소</Badge>,
};



export default function DeskDashboard({ dashboard }) {
    const navigate = useNavigate();
    return (
        <Row className="g-3 mt-3">
            <div className="d-flex align-items-center gap-2 ms-auto">
        

            <Button 
                
                onClick={() => {

                    navigate("/admin/payroll")

                }}

                variant="info"
            >

                급여 관리



            </Button>

                </div>

            

           

            {/* 급여 지급 */}
            <Col xs={12} lg={4}>
                <Card className="h-100">
                    <Card.Body>

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <div className="d-flex align-items-center gap-2">
                                <FaMoneyBillWave className="text-success" />

                                <span className="fw-bold">
                                    급여 지급
                                </span>
                            </div>

                            <Badge
                                bg={
                                    dashboard.payrollDueList?.length > 0
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {dashboard.payrollDueList?.length ?? 0}건
                            </Badge>

                        </div>


                        {!dashboard.payrollDueList?.length ? (

                            <div className="text-muted text-center py-4">
                                지급 예정 급여가 없습니다.
                            </div>

                        ) : (

                            dashboard.payrollDueList?.slice(0, 5).map(payroll => (

                                <div
                                    key={payroll.payrollNo}
                                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                >

                                    <div>
                                        <div className="fw-semibold">
                                            {payroll.employeeName}
                                        </div>

                                        <div className="text-muted small">
                                            {payroll.payrollYear}년{" "}
                                            {payroll.payrollMonth}월
                                        </div>

                                        <div className="text-muted small">
                                            지급일 {payroll.payday}
                                        </div>
                                    </div>


                                    <div className="text-end">

                                        <div className="fw-semibold">
                                            {payroll.netPay?.toLocaleString()}원
                                        </div>

                                        <Badge
                                            bg={
                                                payroll.paymentStatus === "paid"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            {payroll.paymentStatus === "paid"
                                                ? "지급완료"
                                                : "미지급"}
                                        </Badge>

                                    </div>

                                </div>

                            ))
                        )}

                    </Card.Body>
                </Card>
            </Col>

            {/* 오늘의 상담예약 */}
            <Col xs={12} lg={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">

                        <div
                            className="d-flex justify-content-between align-items-center mb-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/employee/consult/reservation")}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <FaCalendarCheck className="text-primary" />
                                <span className="fw-bold">
                                    오늘의 상담예약
                                </span>
                            </div>

                            <Badge
                                bg={
                                    dashboard.todayReservationCount > 0
                                        ? "primary"
                                        : "secondary"
                                }
                            >
                                {dashboard.todayReservationCount ?? 0}건
                            </Badge>
                        </div>

                        {!dashboard.todayReservations?.length ? (

                            <div className="text-muted text-center py-4 flex-grow-1">
                                오늘 예정된 상담예약이 없습니다.
                            </div>

                        ) : (

                            <div className="flex-grow-1">
                                {dashboard.todayReservations?.slice(0, 5).map(reservation => (

                                    <div
                                        key={reservation.reservationNo}
                                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                    >

                                        <div>
                                            <div className="fw-semibold">
                                                {reservation.reservationName}
                                            </div>

                                            <div className="text-muted small">
                                                {reservation.reservationType} · {dayjs(reservation.reservationTime).format("HH:mm")}
                                            </div>
                                        </div>

                                        {reservationStatusBadge[reservation.reservationStatus] ?? (
                                            <Badge bg="secondary">{reservation.reservationStatus}</Badge>
                                        )}

                                    </div>

                                ))}
                            </div>
                        )}

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2 align-self-end"
                            onClick={() => navigate("/employee/consult/reservation")}
                        >
                            상담예약 전체보기 <FaArrowRight className="ms-1" />
                        </Button>

                    </Card.Body>
                </Card>
            </Col>

            {/* 새로운 상담예약 */}
            <Col xs={12} lg={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">

                        <div
                            className="d-flex justify-content-between align-items-center mb-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/employee/consult/reservation")}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <FaBell className="text-warning" />
                                <span className="fw-bold">
                                    새로운 상담예약 (최근 5건)
                                </span>
                            </div>
                        </div>

                        {!dashboard.recentReservations?.length ? (

                            <div className="text-muted text-center py-4 flex-grow-1">
                                새로 접수된 상담예약이 없습니다.
                            </div>

                        ) : (

                            <div className="flex-grow-1">
                                {dashboard.recentReservations?.slice(0, 5).map(reservation => (

                                    <div
                                        key={reservation.reservationNo}
                                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                    >

                                        <div>
                                            <div className="fw-semibold">
                                                {reservation.reservationName}
                                            </div>

                                            <div className="text-muted small">
                                                {reservation.reservationPhone} · {reservation.reservationType}
                                            </div>
                                        </div>

                                        {reservationStatusBadge[reservation.reservationStatus] ?? (
                                            <Badge bg="secondary">{reservation.reservationStatus}</Badge>
                                        )}

                                    </div>

                                ))}
                            </div>
                        )}

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2 align-self-end"
                            onClick={() => navigate("/employee/consult/reservation")}
                        >
                            상담예약 전체보기 <FaArrowRight className="ms-1" />
                        </Button>

                    </Card.Body>
                </Card>
            </Col>

        </Row>
    );
}
