import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AdminEmployeeList() {

    const navigate = useNavigate();

    // 직원 목록
    const [employees, setEmployees] = useState([]);

    // 로딩
    const [loading, setLoading] = useState(true);


    // ========================================
    // 직원 목록 조회
    // ========================================
    const loadEmployees = useCallback(async () => {

        try {

            const { data } = await apiClient.get(
                "/admin/employee/list"
            );

            console.log("직원 목록 =", data);

            setEmployees(data);

        }
        catch (error) {

            console.error("직원 목록 조회 실패 =", error);

            await Swal.fire(
                "조회 실패",
                "직원 목록을 불러오지 못했습니다.",
                "error"
            );

        }
        finally {

            setLoading(false);

        }

    }, []);


    // ========================================
    // 최초 조회
    // ========================================
    useEffect(() => {

        loadEmployees();

    }, [loadEmployees]);


    // ========================================
    // 상세 페이지 이동
    // ========================================
    const goDetail = useCallback((employeeNo) => {

        navigate(`/admin/employee/detail/${employeeNo}`);

    }, [navigate]);


    // ========================================
    // 로딩
    // ========================================
    if (loading) {

        return (
            <>
                <Jumbotron
                    title="직원 관리"
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
                title="직원 관리"
                content="등록된 직원 정보를 확인할 수 있습니다."
            />


            <Row className="mt-5">

                <Col md={11} className="mx-auto">

                    {/* 상단 */}

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            직원 목록
                        </h4>

                        <Button
                            variant="primary"
                            onClick={() => {
                                navigate("/employee/register");
                            }}
                        >
                            직원 등록
                        </Button>

                    </div>


                    {/* 직원 목록 */}

                    <Table
                        bordered
                        hover
                        responsive
                        className="text-center align-middle"
                    >

                        <thead>

                            <tr>

                                <th>직원번호</th>
                                <th>이름</th>
                                <th>아이디</th>
                                <th>연락처</th>
                                <th>고용형태</th>
                                <th>고용일자</th>
                                <th>재직상태</th>
                                <th>계정상태</th>

                            </tr>

                        </thead>


                        <tbody>

                            {employees.length === 0 ? (

                                <tr>

                                    <td colSpan={8}>
                                        등록된 직원이 없습니다.
                                    </td>

                                </tr>

                            ) : (

                                employees.map((employee) => (

                                    <tr
                                        key={employee.employeeNo}
                                        onClick={() => {
                                            goDetail(employee.employeeNo);
                                        }}
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >

                                        <td>
                                            {employee.employeeNo}
                                        </td>

                                        <td>
                                            {employee.accountName}
                                        </td>

                                        <td>
                                            {employee.accountId}
                                        </td>

                                        <td>
                                            {employee.accountPhone}
                                        </td>

                                        <td>
                                            {employee.employeeType}
                                        </td>

                                        <td>
                                            {employee.employeeHtime
                                                ? employee.employeeHtime.substring(0, 10)
                                                : ""}
                                        </td>

                                        <td>
                                            {employee.employeeStatus}
                                        </td>

                                        <td>
                                            {employee.accountStatus === "Y"
                                                ? "정상"
                                                : "비활성"}
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </Table>

                </Col>

            </Row>

        </>
    );
}