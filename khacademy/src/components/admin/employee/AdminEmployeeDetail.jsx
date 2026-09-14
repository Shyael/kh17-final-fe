import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEmployeeDetail() {

    const navigate = useNavigate();

    const { employeeNo } = useParams();

    const [employee, setEmployee] = useState(null);


    // ========================================
    // 직원 상세정보 조회
    // ========================================
    const loadEmployee = useCallback(async () => {

        try {

            const { data } = await apiClient.get(
                `/admin/employee/detail/${employeeNo}`
            );

            console.log("직원 상세정보 =", data);

            setEmployee(data);

        }
        catch (error) {

            console.error("직원 상세정보 조회 실패 =", error);

            await Swal.fire(
                "조회 실패",
                "직원 상세정보를 불러오지 못했습니다.",
                "error"
            );

            navigate("/admin/employee/list");

        }

    }, [employeeNo, navigate]);


    // ========================================
    // 최초 조회
    // ========================================
    useEffect(() => {

        loadEmployee();

    }, [loadEmployee]);


    // ========================================
    // 로딩
    // ========================================
    if (employee === null) {

        return (
            <>
                <Jumbotron
                    title="직원 상세"
                    content="직원 상세정보를 불러오는 중입니다."
                />

                <div className="text-center mt-5">
                    정보를 불러오는 중...
                </div>
            </>
        );

    }


    // ========================================
    // 날짜
    // ========================================
    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return date.substring(0, 10);

    };


    return (
        <>

            <Jumbotron
                title="직원 상세"
                content="직원 상세정보를 확인할 수 있습니다."
            />


            <Row className="mt-5">

                <Col md={9} className="mx-auto">

                    {/* ========================================
                        직원 상세
                    ======================================== */}

                    <div className="border rounded p-4">

                        <h4 className="mb-4">
                            직원 상세
                        </h4>


                        {/* ========================================
                            기본 계정정보
                        ======================================== */}

                        <h5 className="text-primary mb-4">
                            기본 계정정보
                        </h5>


                        {/* 아이디 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                아이디(이메일)
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="email"
                                    value={
                                        employee.accountId || ""
                                    }
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
                                    value={
                                        employee.accountName || ""
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 휴대폰 번호 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                휴대폰 번호
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="tel"
                                    value={
                                        employee.accountPhone || ""
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 생년월일 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                생년월일
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        employee.accountBirth || ""
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 계정 상태 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                계정 상태
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        employee.accountStatus === "Y"
                                            ? "정상"
                                            : "비활성"
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* ========================================
                            직원 정보
                        ======================================== */}

                        <hr className="my-4" />


                        <h5 className="text-primary mb-4">
                            직원 정보
                        </h5>


                        {/* 직원번호 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                직원번호
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        employee.employeeNo
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 고용형태 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                고용형태
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        employee.employeeType || ""
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 고용일자 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                고용일자
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        formatDate(
                                            employee.employeeHtime
                                        )
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* 재직상태 */}

                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                재직상태
                            </Form.Label>

                            <Col sm={9}>

                                <Form.Control
                                    type="text"
                                    value={
                                        employee.employeeStatus || ""
                                    }
                                    readOnly
                                />

                            </Col>

                        </Row>


                        {/* ========================================
                            권한 정보
                        ======================================== */}

                        <hr className="my-4" />


                        <h5 className="text-primary mb-4">
                            적용된 권한
                        </h5>


                        <Row className="mb-4">

                            <Form.Label column sm={3}>
                                권한
                            </Form.Label>

                            <Col sm={9}>

                                {employee.roles &&
                                employee.roles.length > 0 ? (

                                    employee.roles.map((role) => (

                                        <div
                                            key={role.roleNo}
                                            className="border rounded p-3 mb-2"
                                        >

                                            <div className="fw-bold">
                                                {role.roleName}
                                            </div>

                                            {role.roleDescription && (

                                                <div className="text-muted small mt-1">
                                                    {role.roleDescription}
                                                </div>

                                            )}

                                        </div>

                                    ))

                                ) : (

                                    <div className="text-muted">
                                        적용된 권한이 없습니다.
                                    </div>

                                )}

                            </Col>

                        </Row>


                        {/* ========================================
                            버튼
                        ======================================== */}

                        <Row className="mt-5">

                            <Col className="text-end">

                                <Button
                                    variant="primary"
                                    className="me-2"
                                    onClick={() => {
                                        navigate(
                                            "/admin/employee/list"
                                        );
                                    }}
                                >
                                    목록
                                </Button>


                                <Button
                                    variant="warning"
                                    className="me-2"
                                    onClick={() => {
                                        navigate(
                                            `/admin/employee/edit/${employee.employeeNo}`
                                        );
                                    }}
                                >
                                    수정
                                </Button>


                                <Button
                                    variant="danger"
                                    onClick={async () => {

                                        const result =
                                            await Swal.fire({
                                                title: "직원 삭제",
                                                text: "정말 삭제하시겠습니까?",
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonText: "삭제",
                                                cancelButtonText: "취소"
                                            });

                                        if (result.isConfirmed) {

                                            // 삭제 API 연결 예정

                                            console.log(
                                                "삭제 직원번호 =",
                                                employee.employeeNo
                                            );

                                        }

                                    }}
                                >
                                    삭제
                                </Button>

                            </Col>

                        </Row>

                    </div>

                </Col>

            </Row>

        </>
    );
}