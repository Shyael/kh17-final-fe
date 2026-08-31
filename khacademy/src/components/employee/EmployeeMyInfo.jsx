import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function EmployeeMyInfo() {

    const [employee, setEmployee] = useState(null);

    // 직원 정보 조회
    const loadEmployee = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/employee/me");

            console.log("직원 정보 =", data);

            setEmployee(data);
        }
        catch (e) {
            console.log("직원 정보 조회 실패 =", e);

            await Swal.fire(
                "직원 정보를 불러오지 못했습니다."
            );
        }
    }, []);

    useEffect(() => {
        loadEmployee();
    }, [loadEmployee]);


    if (employee === null) {
        return (
            <>
                <Jumbotron
                    title="내 정보"
                    content="직원 정보를 불러오는 중입니다."
                />

                <div className="text-center mt-5">
                    정보를 불러오는 중...
                </div>
            </>
        );
    }


    return (
        <>
            <Jumbotron
                title="내 정보"
                content="내 계정 및 직원 정보를 확인할 수 있습니다."
            />

            <Row className="mt-5">
                <Col md={8} className="mx-auto">

                    {/* 직원번호 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            직원번호
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={employee.employeeNo}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 직원유형 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            직원유형
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={employee.employeeType}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 아이디 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            아이디
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="email"
                                value={employee.accountId}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 이름 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            이름
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={employee.accountName}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 연락처 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            연락처
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="tel"
                                value={employee.accountPhone}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 입사일 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            입사일
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={
                                    employee.employeeHtime
                                        ? employee.employeeHtime.substring(0, 10)
                                        : ""
                                }
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 계정 상태 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            계정상태
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={employee.accountStatus}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 계정 유형 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            계정유형
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={employee.accountType}
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 수정일 */}
                    <Row className="mb-4">
                        <Form.Label column sm={3}>
                            정보 수정일
                        </Form.Label>

                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                value={
                                    employee.employeeUtime
                                        ? employee.employeeUtime.substring(0, 10)
                                        : ""
                                }
                                readOnly
                            />
                        </Col>
                    </Row>

                    {/* 버튼 */}
                    <Row className="mt-5">
                        <Col className="text-end">
                            <Button
                                variant="success"
                            >
                                정보 수정
                            </Button>
                        </Col>
                    </Row>

                </Col>
            </Row>
        </>
    );
}