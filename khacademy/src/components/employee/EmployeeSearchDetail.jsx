import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminWorkScheduleCalendar from "@components/attendance/admin/AdminWorkScheduleCalendar";
import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Row,
    Spinner
    , Modal
} from "react-bootstrap";

import { apiClient } from "@utils/reaxios";

export default function EmployeeDetail() {

    const { employeeNo } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSchedule, setShowSchedule] = useState(false);



    useEffect(() => {

        const loadEmployee = async () => {

            try {
                setLoading(true);

                const response = await apiClient.get(
                    `/admin/employee/${employeeNo}`
                );

                setEmployee(response.data);
            }
            catch (err) {
                console.error("직원 상세 조회 실패", err);
                setEmployee(null);
            }
            finally {
                setLoading(false);
            }
        };

        loadEmployee();

    }, [employeeNo]);





    const employeeStatusColor = (status) => {

        switch (status) {
            case "재직":
                return "success";

            case "대기":
                return "secondary";

            case "휴직":
                return "warning";

            case "퇴사":
                return "danger";

            default:
                return "secondary";
        }
    };


    const accountStatusText = (status) => {

        switch (status) {
            case "Y":
                return "활성";

            case "N":
                return "비활성";

            default:
                return status ?? "-";
        }
    };


    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleDateString();
    };


    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <div className="mt-3">
                    직원 정보를 불러오는 중입니다.
                </div>
            </Container>
        );
    }


    if (!employee) {
        return (
            <Container className="py-5 text-center">

                <h5>
                    직원 정보를 찾을 수 없습니다.
                </h5>

                <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={() => navigate(-1)}
                >
                    돌아가기
                </Button>

            </Container>
        );
    }


    return (
        <Container className="py-4">

            {/* 상단 */}
            <Row className="mb-4">
                <Col>

                    <div className="d-flex align-items-center gap-3">

                        <h3 className="mb-0">
                            {employee.accountName}
                        </h3>

                        <Badge
                            bg={employeeStatusColor(
                                employee.employeeStatus
                            )}
                        >
                            {employee.employeeStatus}
                        </Badge>

                        <Badge bg="primary">
                            {employee.employeeType}
                        </Badge>

                    </div>

                    <div className="text-muted mt-2">
                        직원번호 {employee.employeeNo}
                    </div>

                </Col>

                <Col xs="auto">

                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate(-1)}
                    >
                        목록으로
                    </Button>

                </Col>
            </Row>


            {/* 기본 정보 */}
            <Card className="mb-4">
                <Card.Header>
                    기본 정보
                </Card.Header>

                <Card.Body>

                    <Row className="mb-3">

                        <Col md={6}>
                            <DetailItem
                                label="이름"
                                value={employee.accountName}
                            />
                        </Col>

                        <Col md={6}>
                            <DetailItem
                                label="생년월일"
                                value={employee.accountBirth}
                            />
                        </Col>

                    </Row>

                    <Row>

                        <Col md={6}>
                            <DetailItem
                                label="연락처"
                                value={employee.accountPhone}
                            />
                        </Col>

                        <Col md={6}>
                            <DetailItem
                                label="이메일"
                                value={employee.accountId}
                            />
                        </Col>

                    </Row>

                </Card.Body>
            </Card>


            {/* 근무 정보 */}
            <Card className="mb-4">

                <Card.Header>
                    근무 정보
                </Card.Header>

                <Card.Body>

                    <Row className="mb-3">

                        <Col md={6}>
                            <DetailItem
                                label="직원 구분"
                                value={employee.employeeType}
                            />
                        </Col>

                        <Col md={6}>
                            <DetailItem
                                label="직원 상태"
                                value={employee.employeeStatus}
                            />
                        </Col>

                    </Row>

                    <Row>

                        <Col md={6}>
                            <DetailItem
                                label="최초 출근일"
                                value={formatDate(
                                    employee.employeeHtime
                                )}
                            />
                        </Col>

                    </Row>

                </Card.Body>
            </Card>


            {/* 계정 정보 */}
            <Card className="mb-4">

                <Card.Header>
                    계정 정보
                </Card.Header>

                <Card.Body>

                    <Row className="mb-3">

                        <Col md={6}>
                            <DetailItem
                                label="계정 상태"
                                value={accountStatusText(
                                    employee.accountStatus
                                )}
                            />
                        </Col>

                        <Col md={6}>
                            <DetailItem
                                label="계정 유형"
                                value={employee.accountType}
                            />
                        </Col>

                    </Row>

                    <Row>

                        <Col md={6}>
                            <DetailItem
                                label="최근 수정일"
                                value={formatDate(
                                    employee.accountUtime
                                )}
                            />
                        </Col>

                    </Row>

                </Card.Body>
            </Card>


            {/* 권한 */}
            <Card className="mb-4">

                <Card.Header>
                    권한
                </Card.Header>

                <Card.Body>

                    {employee.roles?.length > 0 ? (

                        <div className="d-flex gap-2 flex-wrap">

                            {employee.roles.map(
                                (role, index) => (

                                    <Badge
                                        bg="secondary"
                                        key={
                                            role.roleNo ??
                                            role.roleName ??
                                            index
                                        }
                                    >
                                        {role.roleName}
                                    </Badge>

                                )
                            )}

                        </div>

                    ) : (
                        <span className="text-muted">
                            등록된 권한이 없습니다.
                        </span>
                    )}

                </Card.Body>
            </Card>


            {/* 관련 업무 */}
            <Card>

                <Card.Header>
                    관련 업무
                </Card.Header>

                <Card.Body className="d-flex gap-2 flex-wrap">

                    <Button
                        variant="outline-primary"
                        onClick={() =>
                            navigate(
                                `/employee/contract/history/${employee.employeeNo}`
                            )
                        }
                    >
                        근로계약
                    </Button>

                    <Button
                        onClick={() => setShowSchedule(true)}
                    >
                        근무일정 보기
                    </Button>

                    <Button
                        variant="outline-primary"
                        onClick={() =>
                            navigate(
                                `/admin/payroll/${employee.employeeNo}`
                            )
                        }
                    >
                        급여
                    </Button>

                </Card.Body>

            </Card>

            <Modal
                show={showSchedule}
                onHide={() => setShowSchedule(false)}
                size="xl"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {employee.accountName} 근무일정
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <AdminWorkScheduleCalendar
                        employeeNo={employee.employeeNo}
                    />
                </Modal.Body>
            </Modal>

        </Container>


    );
}




function DetailItem({ label, value }) {

    return (
        <div>

            <div
                className="text-muted mb-1"
                style={{ fontSize: "0.85rem" }}
            >
                {label}
            </div>

            <div>
                {value ?? "-"}
            </div>

        </div>
    );
}