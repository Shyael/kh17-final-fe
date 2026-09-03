import { useState } from "react";

import {
    Button,
    Card,
    Col,
    Container,
    Form,
    ListGroup,
    Row
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";

import AdminWorkScheduleCalendar
    from "@components/attendance/admin/AdminWorkScheduleCalendar";




const AdminAttendance = () => {

    // 직원 이름 검색어
    const [keyword, setKeyword] =
        useState("");

    // 검색된 직원 목록
    const [employeeList, setEmployeeList] =
        useState([]);

    // 선택한 직원
    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    // 검색 중
    const [loading, setLoading] =
        useState(false);


    // 직원 이름 검색
    const searchEmployee = async () => {

        if (!keyword.trim()) {

            toast.warning(
                "직원 이름을 입력해주세요."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await apiClient.get(
                "/employee/searchName",
                {
                    params: {
                        accountName: keyword.trim()
                    }
                }
            );


            setEmployeeList(
                response.data ?? []
            );


            setSelectedEmployee(
                null
            );

        }
        catch (err) {

            console.error(err);

            toast.error(
                "직원 검색에 실패했습니다."
            );

        }
        finally {

            setLoading(false);

        }
    };


    // 엔터 검색
    const searchByEnter = (
        e
    ) => {

        if (e.key === "Enter") {

            e.preventDefault();

            searchEmployee();

        }
    };


    // 직원 선택
    const selectEmployee = (
        employee
    ) => {

        setSelectedEmployee(
            employee
        );

    };


    return (
        <Container className="py-4">


            {/* 제목 */}
            <div className="mb-4">

                <h3 className="mb-1">
                    직원 근태 관리
                </h3>

                <div className="text-muted">
                    직원의 근무일정과 근태를 조회하고 수정합니다.
                </div>

            </div>


            {/* 직원 검색 */}
            <Card className="mb-4">

                <Card.Body>

                    <Row className="g-2">


                        <Col md={9}>

                            <Form.Control
                                type="text"
                                placeholder="직원 이름을 입력하세요"
                                value={
                                    keyword
                                }
                                onChange={
                                    e =>
                                        setKeyword(
                                            e.target.value
                                        )
                                }
                                onKeyDown={
                                    searchByEnter
                                }
                            />

                        </Col>


                        <Col md={3}>

                            <Button
                                className="w-100"
                                onClick={
                                    searchEmployee
                                }
                                disabled={
                                    loading
                                }
                            >
                                {
                                    loading
                                        ? "검색 중..."
                                        : "검색"
                                }
                            </Button>

                        </Col>


                    </Row>

                </Card.Body>

            </Card>


            {/* 검색 결과 */}
            {
                employeeList.length > 0
                && (

                    <Card className="mb-4">

                        <Card.Header>
                            직원 검색 결과
                        </Card.Header>


                        <ListGroup
                            variant="flush"
                        >

                            {
                                employeeList.map(
                                    employee => (

                                        <ListGroup.Item
                                            key={
                                                employee.employeeNo
                                            }
                                            action
                                            active={
                                                selectedEmployee
                                                    ?.employeeNo
                                                ===
                                                employee.employeeNo
                                            }
                                            onClick={
                                                () =>
                                                    selectEmployee(
                                                        employee
                                                    )
                                            }
                                        >

                                            <div
                                                className="
                                                    d-flex
                                                    justify-content-between
                                                    align-items-center
                                                "
                                            >

                                                <div>

                                                    <div
                                                        className="
                                                            fw-bold
                                                        "
                                                    >
                                                        {
                                                            employee
                                                                .accountName
                                                        }
                                                    </div>

                                                    <div
                                                        className="
                                                            small
                                                            text-muted
                                                        "
                                                    >
                                                        {
                                                            employee
                                                                .accountId
                                                        }
                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        small
                                                    "
                                                >
                                                    선택
                                                </div>

                                            </div>

                                        </ListGroup.Item>

                                    )
                                )
                            }

                        </ListGroup>

                    </Card>

                )
            }


            {/* 검색 결과 없음 */}
            {
                !loading
                && keyword
                && employeeList.length === 0
                && (

                    <Card className="mb-4">

                        <Card.Body
                            className="
                                text-center
                                text-muted
                            "
                        >
                            검색된 직원이 없습니다.
                        </Card.Body>

                    </Card>

                )
            }


            {/* 선택 직원 정보 */}
            {
                selectedEmployee
                && (

                    <>

                        <Card className="mb-4">

                            <Card.Body>

                                <Row>

                                    <Col md={6}>

                                        <div
                                            className="
                                                text-muted
                                                small
                                            "
                                        >
                                            직원명
                                        </div>

                                        <div
                                            className="
                                                fw-bold
                                                fs-5
                                            "
                                        >
                                            {
                                                selectedEmployee
                                                    .accountName
                                            }
                                        </div>

                                    </Col>


                                    <Col md={6}>

                                        <div
                                            className="
                                                text-muted
                                                small
                                            "
                                        >
                                            계정
                                        </div>

                                        <div>
                                            {
                                                selectedEmployee
                                                    .accountId
                                            }
                                        </div>

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>


                        {/* 선택한 직원 근무일정 */}
                        {selectedEmployee && (
                            <AdminWorkScheduleCalendar
                                employeeNo={selectedEmployee.employeeNo}
                            />
                        )}

                    </>

                )
            }


        </Container>
    );
};


export default AdminAttendance;