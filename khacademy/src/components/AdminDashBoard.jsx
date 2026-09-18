import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import {
    FaFileSignature,
    FaCalendarXmark,
    FaMoneyBillWave,
    FaArrowRight
} from "react-icons/fa6";
import { formatDate } from "@utils/format";

import { useNavigate } from "react-router-dom";



export default function AdminDashBoard({ dashboard }) {
    const navigate = useNavigate();
    return (
        <Row className="g-3 mt-3">
            <div className="d-flex align-items-center gap-2 ms-auto">





            </div>

            {/* 서명 대기 계약 */}
            <Col xs={12} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <FaFileSignature className="text-warning" />
                                <span className="fw-bold">
                                    서명 대기 계약
                                </span>
                            </div>

                            <Badge
                                bg={
                                    dashboard.pendingContractList?.length > 0
                                        ? "warning"
                                        : "secondary"
                                }
                            >
                                {dashboard.pendingContractList?.length ?? 0}건
                            </Badge>
                        </div>


                        {!dashboard.pendingContractList?.length ? (

                            <div className="text-muted text-center py-4">
                                서명 대기 계약이 없습니다.
                            </div>

                        ) : (

                            dashboard.pendingContractList?.slice(0, 5).map(contract => (

                                <div
                                    key={contract.contractNo}
                                    className="py-2 border-bottom"

                                >
                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <div className="fw-semibold"
                                                onClick={()=>navigate(`/admin/contract/detail/${contract.contractNo}`)}
                                                style={{cursor : "pointer"}}
                                            >

                                                {contract.employeeName}
                                            </div>

                                            <div className="text-muted small">
                                                계약번호 {contract.contractNo}
                                            </div>
                                        </div>




                                    </div>
                                </div>

                            ))
                        )}

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2 align-self-end"

                            onClick={() => {

                                navigate("/admin/contract/list")

                            }}


                        >

                            계약 관리<FaArrowRight className="ms-1" />



                        </Button>


                    </Card.Body>
                </Card>
            </Col>


            {/* 계약 만료 임박 */}
            <Col xs={12} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <FaCalendarXmark className="text-danger" />

                                <span className="fw-bold">
                                    계약 만료 임박
                                </span>
                            </div>

                            <Badge
                                bg={
                                    dashboard.contractExpiringList?.length > 0
                                        ? "danger"
                                        : "secondary"
                                }
                            >
                                {dashboard.contractExpiringList?.length ?? 0}건

                            </Badge>

                        </div>


                        {!dashboard.contractExpiringList?.length ? (

                            <div className="text-muted text-center py-4">
                                만료 임박 계약이 없습니다.
                            </div>

                        ) : (

                            dashboard.contractExpiringList?.slice(0, 5).map(contract => (

                                <div
                                    key={contract.contractNo}
                                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                >

                                    <div>
                                        <div className="fw-semibold"
                                            onClick={()=>navigate(`/admin/contract/detail/${contract.contractNo}`)}
                                            style={{cursor : "pointer"}}>
                                            {contract.employeeName}
                                        </div>

                                        <div className="text-muted small">
                                            {formatDate(contract.contractEnd)}
                                        </div>
                                    </div>


                                    <Badge bg="danger">
                                        {contract.dday === 0
                                            ? "D-Day"
                                            : `D-${contract.dday}`}
                                    </Badge>

                                </div>

                            ))
                        )}

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2 align-self-end"

                            onClick={() => {

                                navigate("/admin/contract/list")

                            }}


                        >

                            계약 관리<FaArrowRight className="ms-1" />



                        </Button>


                    </Card.Body>
                </Card>
            </Col>


            {/* 급여 지급 */}
            <Col xs={12} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
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
                                        <div className="fw-semibold"
                                            onClick={()=>navigate(`/admin/payroll/${payroll.employeeNo}/${payroll.payrollYear}/${payroll.payrollMonth}`)} 
                                            style={{cursor:"pointer"}}>
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
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2 align-self-end"

                            onClick={() => {

                                navigate("/admin/payroll")

                            }}


                        >

                            급여 관리<FaArrowRight className="ms-1" />



                        </Button>

                    </Card.Body>
                </Card>
            </Col>

        </Row>
    );
}
