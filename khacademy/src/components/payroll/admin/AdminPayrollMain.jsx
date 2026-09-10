import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
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

    const navigate =
        useNavigate();


    const [accountName, setAccountName] =
        useState("");

    const [employeeList, setEmployeeList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const now = new Date();


    // =========================
    // 직원 검색
    // =========================

    const searchEmployee = async () => {

        if (accountName === null
            || accountName.trim() === "") {

            toast.warning(
                "직원 이름을 입력해주세요"
            );

            return;
        }


        try {

            setLoading(true);

            const response =
                await apiClient.patch(
                    `/employee/worker/searchName/${accountName}`
                );

            setEmployeeList(
                response.data
            );

        }
        catch (error) {

            console.error(error);

            toast.error(
                "직원 검색에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================
    // 엔터 검색
    // =========================

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            searchEmployee();

        }
    };


    // =========================
    // 직원 급여 목록 이동
    // =========================

    const movePayrollList = (
        employeeNo
    ) => {

        navigate(
            `/admin/payroll/${employeeNo}`
        );
    };


    return (
        <Container className="py-4">

            <Jumbotron
                title="급여 관리"
            />


            {/* ========================= */}
            {/* 직원 검색 */}
            {/* ========================= */}

            <Card className="mb-4">

                <Card.Body>

                    <Row className="align-items-end">

                        <Col md={9}>

                            <Form.Group>

                                <Form.Label>
                                    직원 검색
                                </Form.Label>

                                <Form.Control
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
                                    placeholder="직원 이름을 입력하세요"
                                />

                            </Form.Group>

                        </Col>


                        <Col
                            md={3}
                            className="
                                mt-3
                                mt-md-0
                            "
                        >

                            <Button
                                className="w-100"
                                disabled={
                                    loading
                                }
                                onClick={
                                    searchEmployee
                                }
                            >
                                검색
                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>


            {/* ========================= */}
            {/* 검색 결과 */}
            {/* ========================= */}

            <Card>

                <Card.Header>
                    직원 검색 결과
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
                                    직원 정보를
                                    불러오는 중입니다
                                </Col>

                            </Row>

                        )
                        : employeeList.length === 0
                        ? (

                            <Row>

                                <Col
                                    className="
                                        text-center
                                        text-muted
                                        py-5
                                    "
                                >
                                    검색된 직원이 없습니다
                                </Col>

                            </Row>

                        )
                        : (

                            <>
                                {/* ========================= */}
                                {/* 헤더 */}
                                {/* ========================= */}

                                <Row
                                    className="
                                        py-2
                                        border-bottom
                                        fw-bold
                                        text-center
                                    "
                                >

                                    <Col md={2}>
                                        직원번호
                                    </Col>

                                    <Col md={3}>
                                        이름
                                    </Col>

                                    <Col md={4}>
                                        계정
                                    </Col>

                                    <Col md={3}>
                                        급여
                                    </Col>

                                </Row>


                                {/* ========================= */}
                                {/* 직원 목록 */}
                                {/* ========================= */}

                                {
                                    employeeList.map(
                                        employee => (

                                            <Row
                                                key={
                                                    employee.employeeNo
                                                }
                                                className="
                                                    py-3
                                                    border-bottom
                                                    align-items-center
                                                    text-center
                                                "
                                            >

                                                <Col md={2}>

                                                    {
                                                        employee.employeeNo
                                                    }

                                                </Col>


                                                <Col md={3}>

                                                    <strong>

                                                        {
                                                            employee.accountName
                                                        }

                                                    </strong>

                                                </Col>


                                                <Col md={4}>

                                                    {
                                                        employee.accountId
                                                    }

                                                </Col>


                                                <Col md={3}>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={
                                                            () =>
                                                                movePayrollList(
                                                                    employee.employeeNo
                                                                )
                                                        }
                                                    >
                                                        급여 조회
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


export default AdminPayrollMain;