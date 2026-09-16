import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import {
    
    FaMoneyBillWave
} from "react-icons/fa6";


import { useNavigate } from "react-router-dom";



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

        </Row>
    );
}
