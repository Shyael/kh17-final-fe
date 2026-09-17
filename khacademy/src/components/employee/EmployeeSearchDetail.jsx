import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { FaListUl } from "react-icons/fa6";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Modal,
    Row,
    Spinner
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import { loginUserState } from "@utils/storage";

import AdminWorkScheduleCalendar
    from "@components/attendance/admin/AdminWorkScheduleCalendar";


export default function EmployeeSearchDetail() {

    // =========================================================
    // parameter
    // =========================================================

    const { employeeNo } =
        useParams();


    // =========================================================
    // navigate
    // =========================================================

    const navigate =
        useNavigate();


    // =========================================================
    // 로그인 사용자
    // =========================================================

    const loginUser =
        useAtomValue(
            loginUserState
        );


    // =========================================================
    // 원장 여부
    // =========================================================

    const roleNames =
        Array.isArray(
            loginUser?.roleNames
        )
            ? loginUser.roleNames
            : [];


    const isAdmin =
        roleNames.includes(
            "ADMIN"
        );


    // =========================================================
    // state
    // =========================================================

    const [employee, setEmployee] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [showSchedule, setShowSchedule] =
        useState(false);

    const [contractLoading, setContractLoading] =
        useState(false);


    // =========================================================
    // 직원 상세 조회
    // =========================================================

    useEffect(
        () => {

            const loadEmployee =
                async () => {

                    try {

                        setLoading(
                            true
                        );


                        const response =
                            await apiClient.get(
                                `/employee/worker/detail/${employeeNo}`
                            );


                        setEmployee(
                            response.data
                        );

                    }
                    catch (err) {

                        console.error(
                            "직원 상세 조회 실패",
                            err
                        );


                        setEmployee(
                            null
                        );

                    }
                    finally {

                        setLoading(
                            false
                        );

                    }

                };


            loadEmployee();

        },
        [
            employeeNo
        ]
    );


    // =========================================================
    // 직원 상태 색상
    // =========================================================

    const employeeStatusColor =
        status => {

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


    // =========================================================
    // 계정 상태 출력
    // =========================================================

    const accountStatusText =
        status => {

            switch (status) {

                case "Y":
                    return "활성";

                case "N":
                    return "비활성";

                default:
                    return status ?? "-";
            }

        };


    // =========================================================
    // 날짜 출력
    // =========================================================

    const formatDate =
        value => {

            if (!value) {
                return "-";
            }


            return new Date(
                value
            ).toLocaleDateString();

        };


    // =========================================================
    // 근로계약 버튼
    //
    // 원장
    //      ↓
    // GET /api/admin/contract/{employeeNo}
    //
    // 계약 없음
    //      ↓
    // /admin/contract/add
    //
    // 계약 있음
    //      ↓
    // 계약 이력
    //
    // 원장 아님
    //      ↓
    // 계약 이력
    // =========================================================

    const moveContract =
        useCallback(
            async () => {

                if (!employee) {
                    return;
                }


                if (!isAdmin) {

                    navigate(
                        `/employee/contract/history/${employee.employeeNo}`
                    );

                    return;
                }


                if (contractLoading) {
                    return;
                }


                try {

                    setContractLoading(
                        true
                    );


                    const { data } =
                        await apiClient.get(
                            `/admin/contract/${employee.employeeNo}`
                        );


                    const contractList =
                        Array.isArray(data)
                            ? data
                            : [];


                    // 계약 없음
                    if (
                        contractList.length === 0
                    ) {

                        navigate(
                            `/admin/contract/add/${employee.employeeNo}`
                        );

                        return;
                    }

                    if (!contractList.some((e) => e.contractStatus === "active")) {
                        navigate(
                            `/admin/contract/add/${employee.employeeNo}`
                        );
                        return;
                    }


                    // 계약 있음
                    navigate(
                        `/employee/contract/history/${employee.employeeNo}`
                    );

                }
                catch (err) {

                    console.error(
                        "근로계약 조회 실패",
                        err
                    );


                    // =========================================
                    // 계약이 없는 직원
                    // 백엔드에서 404를 반환하는 경우
                    // =========================================

                    if (
                        err.response?.status === 404
                    ) {

                        navigate(
                            `/admin/contract/add/${employee.employeeNo}`
                        );

                        return;
                    }


                    toast.error(
                        err?.response?.data?.message
                        ??
                        "근로계약 정보를 확인하지 못했습니다."
                    );

                }
                finally {

                    setContractLoading(
                        false
                    );

                }

            },
            [
                employee,
                isAdmin,
                contractLoading,
                navigate
            ]
        );

    // =========================================================
    // loading
    // =========================================================

    if (loading) {

        return (

            <Container
                className="
                    py-5
                    text-center
                "
            >

                <Spinner
                    animation="border"
                />


                <div className="mt-3">

                    직원 정보를 불러오는 중입니다.

                </div>

            </Container>

        );

    }


    // =========================================================
    // 직원 없음
    // =========================================================

    if (!employee) {

        return (

            <Container
                className="
                    py-5
                    text-center
                "
            >

                <h5>

                    직원 정보를 찾을 수 없습니다.

                </h5>


                <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={
                        () =>
                            navigate(
                                -1
                            )
                    }
                >

                    돌아가기

                </Button>

            </Container>

        );

    }


    return (

        <Container className="py-4">


            {/* =====================================================
                상단
            ===================================================== */}
            <Row>
                <Col className="d-flex justify-content-start mb-3">
                    <Button
                        variant="outline-secondary"
                        className="d-flex align-items-center gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <FaListUl />
                        목록으로
                    </Button>
                </Col>
            </Row>

            <Row className="mb-4">


                <Col>


                    <div
                        className="
                            d-flex
                            align-items-center
                            gap-3
                        "
                    >

                        <h3 className="mb-0">

                            {
                                employee.accountName
                            }

                        </h3>


                        <Badge
                            bg={
                                employeeStatusColor(
                                    employee.employeeStatus
                                )
                            }
                        >

                            {
                                employee.employeeStatus
                            }

                        </Badge>


                        <Badge bg="primary">

                            {
                                employee.employeeType
                            }

                        </Badge>

                    </div>




                    <div
                        className="
                            text-muted
                            mt-2
                        "
                    >

                        직원번호{" "}

                        {
                            employee.employeeNo
                        }

                    </div>

                </Col>





            </Row>


            {/* =====================================================
                기본 정보
            ===================================================== */}

            <Card className="mb-4">

                <Card.Header>

                    기본 정보

                </Card.Header>


                <Card.Body>


                    <Row className="mb-3">


                        <Col md={6}>

                            <DetailItem
                                label="이름"
                                value={
                                    employee.accountName
                                }
                            />

                        </Col>


                        <Col md={6}>

                            <DetailItem
                                label="생년월일"
                                value={
                                    employee.accountBirth
                                }
                            />

                        </Col>


                    </Row>


                    <Row>


                        <Col md={6}>

                            <DetailItem
                                label="연락처"
                                value={
                                    employee.accountPhone
                                }
                            />

                        </Col>


                        <Col md={6}>

                            <DetailItem
                                label="이메일"
                                value={
                                    employee.accountId
                                }
                            />

                        </Col>


                    </Row>


                </Card.Body>

            </Card>


            {/* =====================================================
                근무 정보
            ===================================================== */}

            <Card className="mb-4">


                <Card.Header>

                    근무 정보

                </Card.Header>


                <Card.Body>


                    <Row className="mb-3">


                        <Col md={6}>

                            <DetailItem
                                label="직원 구분"
                                value={
                                    employee.employeeType
                                }
                            />

                        </Col>


                        <Col md={6}>

                            <DetailItem
                                label="직원 상태"
                                value={
                                    employee.employeeStatus
                                }
                            />

                        </Col>


                    </Row>


                    <Row>


                        <Col md={6}>

                            <DetailItem
                                label="최초 출근일"
                                value={
                                    formatDate(
                                        employee.employeeHtime
                                    )
                                }
                            />

                        </Col>


                    </Row>


                </Card.Body>

            </Card>


            {/* =====================================================
                계정 정보
            ===================================================== */}

            <Card className="mb-4">


                <Card.Header>

                    계정 정보

                </Card.Header>


                <Card.Body>


                    <Row className="mb-3">


                        <Col md={6}>

                            <DetailItem
                                label="계정 상태"
                                value={
                                    accountStatusText(
                                        employee.accountStatus
                                    )
                                }
                            />

                        </Col>


                        <Col md={6}>

                            <DetailItem
                                label="계정 유형"
                                value={
                                    employee.accountType
                                }
                            />

                        </Col>


                    </Row>


                    <Row>


                        <Col md={6}>

                            <DetailItem
                                label="최근 수정일"
                                value={
                                    formatDate(
                                        employee.accountUtime
                                    )
                                }
                            />

                        </Col>


                    </Row>


                </Card.Body>

            </Card>


            {/* =====================================================
                권한
            ===================================================== */}

            <Card className="mb-4">


                <Card.Header>

                    권한

                </Card.Header>


                <Card.Body>


                    {
                        employee.roles?.length
                            > 0
                            ? (

                                <div
                                    className="
                                        d-flex
                                        gap-2
                                        flex-wrap
                                    "
                                >

                                    {
                                        employee.roles.map(
                                            (
                                                role,
                                                index
                                            ) => (

                                                <Badge
                                                    bg="secondary"
                                                    key={
                                                        role.roleNo
                                                        ??
                                                        role.roleName
                                                        ??
                                                        index
                                                    }
                                                >

                                                    {
                                                        role.roleName
                                                    }

                                                </Badge>

                                            )
                                        )
                                    }

                                </div>

                            )
                            : (

                                <span className="text-muted">

                                    등록된 권한이 없습니다.

                                </span>

                            )
                    }


                </Card.Body>

            </Card>


            {/* =====================================================
                관련 업무
            ===================================================== */}
            {isAdmin && (<>
                <Card>


                    <Card.Header>

                        관련 업무

                    </Card.Header>


                    <Card.Body
                        className="
                        d-flex
                        gap-2
                        flex-wrap
                    "
                    >


                        {/* =============================================
                        근로계약
                    ============================================= */}

                        <Button
                            variant="outline-primary"
                            onClick={
                                moveContract
                            }
                            disabled={
                                contractLoading
                            }
                        >

                            {
                                contractLoading
                                    ? "계약 확인 중..."
                                    : "근로계약"
                            }

                        </Button>


                        {/* =============================================
                        근무일정
                    ============================================= */}

                        <Button
                            onClick={
                                () =>
                                    setShowSchedule(
                                        true
                                    )
                            }
                        >

                            근무일정 보기

                        </Button>


                        {/* =============================================
                        급여
                    ============================================= */}

                        <Button
                            variant="outline-primary"
                            onClick={
                                () =>
                                    navigate(
                                        `/admin/payroll/${employee.employeeNo}`
                                    )
                            }
                        >

                            급여

                        </Button>


                    </Card.Body>

                </Card>


                {/* =====================================================
                근무일정 Modal
            ===================================================== */}

                <Modal
                    show={
                        showSchedule
                    }
                    onHide={
                        () =>
                            setShowSchedule(
                                false
                            )
                    }
                    size="xl"
                    centered
                >


                    <Modal.Header closeButton>

                        <Modal.Title>

                            {
                                employee.accountName
                            }{" "}
                            근무일정

                        </Modal.Title>

                    </Modal.Header>


                    <Modal.Body>

                        <AdminWorkScheduleCalendar
                            employeeNo={
                                employee.employeeNo
                            }
                        />

                    </Modal.Body>


                </Modal>
            </>)}

        </Container>

    );

}


// =========================================================
// 상세 항목
// =========================================================

function DetailItem(
    {
        label,
        value
    }
) {

    return (

        <div>


            <div
                className="
                    text-muted
                    mb-1
                "
                style={{
                    fontSize:
                        "0.85rem"
                }}
            >

                {
                    label
                }

            </div>


            <div>

                {
                    value
                    ?? "-"
                }

            </div>


        </div>

    );

}