import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import {
    Badge,
    Button,
    Col,
    Row
} from "react-bootstrap";

import {
    FaArrowLeft,
    FaLock
} from "react-icons/fa6";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";

import ContractDocument from "@components/contract/admin/ContractDocument.jsx";


export default function EmployeeContractDetail() {

    // =========================
    // parameter
    // =========================

    const { contractNo } =
            useParams();


    // =========================
    // navigate
    // =========================

    const navigate =
            useNavigate();


    // =========================
    // state
    // =========================

    const [contract, setContract] =
            useState(null);

    const [loading, setLoading] =
            useState(true);


    // =========================
    // 계약 조회
    // =========================

    const loadData =
            useCallback(async () => {

        try {

            setLoading(true);


            const { data } =
                    await apiClient.get(
                        `/employee/contract/detail/${contractNo}`
                    );


            setContract(
                    data
            );

        }
        catch(e) {

            console.error(e);


            toast.error(
                e?.response?.data?.message
                ?? "근로계약 정보를 불러오지 못했습니다"
            );


            setContract(null);

        }
        finally {

            setLoading(false);
        }

    }, [contractNo]);


    useEffect(() => {

        loadData();

    }, [loadData]);


    // =========================
    // 상태 한글
    // =========================

    const statusText =
            useCallback(status => {

        if (status === "pending") {
            return "서명 대기";
        }

        if (status === "scheduled") {
            return "시작 예정";
        }

        if (status === "active") {
            return "진행 중";
        }

        if (status === "ended") {
            return "종료";
        }


        return status;

    }, []);


    // =========================
    // 상태 색상
    // =========================

    const statusColor =
            useCallback(status => {

        if (status === "pending") {
            return "warning";
        }

        if (status === "scheduled") {
            return "info";
        }

        if (status === "active") {
            return "success";
        }

        if (status === "ended") {
            return "secondary";
        }


        return "dark";

    }, []);


    // =========================
    // 주휴일 한글
    // =========================

    const weeklyHolidayDayText =
            useCallback(day => {

        if (day === null
                || day === undefined) {

            return "해당 없음";
        }


        if (day === "MONDAY") {
            return "월요일";
        }

        if (day === "TUESDAY") {
            return "화요일";
        }

        if (day === "WEDNESDAY") {
            return "수요일";
        }

        if (day === "THURSDAY") {
            return "목요일";
        }

        if (day === "FRIDAY") {
            return "금요일";
        }

        if (day === "SATURDAY") {
            return "토요일";
        }

        if (day === "SUNDAY") {
            return "일요일";
        }


        return day;

    }, []);


    // =========================
    // loading
    // =========================

    if (loading === true
            && contract === null) {

        return (
            <h1>
                로딩중...
            </h1>
        );
    }


    // =========================
    // 계약 없음
    // =========================

    if (contract === null) {

        return (<>

            <Jumbotron
                title="근로계약 상세"
            />


            <Row className="mt-5">

                <Col>

                    근로계약 정보를
                    확인할 수 없습니다.

                </Col>

            </Row>

        </>);
    }


    return (<>

        <Jumbotron
            title="내 근로계약"
            content="현재 근로계약 내용과 체결 상태를 확인합니다"
        />


        {/* =========================
            기본정보
        ========================= */}

        <Row className="mt-5">

            <Col
                sm={3}
                className="fw-bold text-info"
            >
                계약번호
            </Col>

            <Col
                sm={9}
                className="text-secondary"
            >
                {contract.contractNo}
            </Col>

        </Row>


        <Row className="mt-4">

            <Col
                sm={3}
                className="fw-bold text-info"
            >
                계약상태
            </Col>

            <Col sm={9}>

                <Badge
                    bg={statusColor(
                        contract.contractStatus
                    )}
                >

                    {statusText(
                        contract.contractStatus
                    )}

                </Badge>

            </Col>

        </Row>


        <Row className="mt-4">

            <Col
                sm={3}
                className="fw-bold text-info"
            >
                체결일시
            </Col>

            <Col
                sm={9}
                className="text-secondary"
            >

                {
                    contract.signedTime
                    ?? "양측 서명 전"
                }

            </Col>

        </Row>


        <Row className="mt-4">

            <Col
                sm={3}
                className="fw-bold text-info"
            >
                주휴일
            </Col>

            <Col
                sm={9}
                className="text-secondary"
            >

                {weeklyHolidayDayText(
                    contract.weeklyHolidayDay
                )}

            </Col>

        </Row>


        {/* =========================
            근로계약서
        ========================= */}

        <ContractDocument
            contract={contract}
        />


        {/* =========================
            직원용 기능
        ========================= */}

        <Row className="mt-5 mb-5">

            <Col className="text-end">


                {/* 계약 이력 */}
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/employee/contract/history/${contract.employeeNo}`
                        )
                    }
                >

                    계약 이력

                </Button>


                {/* 서명 전 */}
                {contract.contractStatus === "pending" && (

                    <Button
                        variant="success"
                        className="ms-2"
                        onClick={() =>
                            navigate(
                                `/employee/contract/sign/${contractNo}`
                            )
                        }
                    >

                        <FaLock/>

                        <span className="ms-2">
                            계약 서명
                        </span>

                    </Button>

                )}


                {/* 체결 완료 */}
                {contract.signedTime !== null
                        && contract.signedTime !== undefined && (

                    <Button
                        variant="outline-dark"
                        className="ms-2"
                        onClick={() =>
                            navigate(
                                `/employee/contract/sign/${contractNo}`
                            )
                        }
                    >

                        서명 보기

                    </Button>

                )}


                {/* 이전 */}
                <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <FaArrowLeft/>

                    <span className="ms-2">
                        이전
                    </span>

                </Button>

            </Col>

        </Row>

    </>);
}