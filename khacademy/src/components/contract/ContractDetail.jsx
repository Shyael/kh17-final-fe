import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import { FaLock, FaSquarePen, FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument.jsx";

export default function ContractDetail() {
    //parameter
    const { contractNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    //계약 조회
    const loadData = useCallback(async ()=>{
        try {
            setLoading(true);

            const { data } = await apiClient.get(
                `/contract/detail/${contractNo}`
            );

            setContract(data);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 정보를 불러오지 못했습니다"
            );
        }
        finally {
            setLoading(false);
        }
    }, [contractNo]);

    useEffect(()=>{
        loadData();
    }, [loadData]);

    //상태 한글 표시
    const statusText = useCallback(status=>{
        if(status === "pending") return "서명 대기";
        if(status === "scheduled") return "시작 예정";
        if(status === "active") return "진행 중";
        if(status === "ended") return "종료";
        return status;
    }, []);

    //상태 색상
    const statusColor = useCallback(status=>{
        if(status === "pending") return "warning";
        if(status === "scheduled") return "info";
        if(status === "active") return "success";
        if(status === "ended") return "secondary";
        return "dark";
    }, []);

    //계약 종료
    const exitContract = useCallback(async ()=>{
        const result = await Swal.fire({
            title:"근로계약을 종료하시겠습니까?",
            text:"중도 종료 후에는 되돌릴 수 없습니다",
            icon:"warning",
            showCancelButton:true,
            confirmButtonText:"계약 종료",
            cancelButtonText:"취소",
            confirmButtonColor:"#d63031"
        });
        if(result.isConfirmed === false) return;

        try {
            await apiClient.patch(`/contract/${contractNo}/exit`);

            toast.success("근로계약이 종료되었습니다");
            loadData();
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 종료에 실패했습니다"
            );
        }
    }, [contractNo, loadData]);

    if(loading === true && contract === null) {
        return <h1>로딩중...</h1>
    }

    if(contract === null) {
        return (<>
            <Jumbotron title="근로계약 상세"/>
            <Row className="mt-5">
                <Col>근로계약 정보를 확인할 수 없습니다.</Col>
            </Row>
        </>)
    }

    return (<>
        <Jumbotron title="근로계약 상세" content="근로계약 내용과 현재 상태를 확인합니다"/>

        <Row className="mt-5">
            <Col sm={3} className="fw-bold text-info">계약번호</Col>
            <Col sm={9} className="text-secondary">{contract.contractNo}</Col>
        </Row>

        <Row className="mt-4">
            <Col sm={3} className="fw-bold text-info">직원번호</Col>
            <Col sm={9} className="text-secondary">{contract.employeeNo}</Col>
        </Row>

        <Row className="mt-4">
            <Col sm={3} className="fw-bold text-info">계약상태</Col>
            <Col sm={9}>
                <Badge bg={statusColor(contract.contractStatus)}>
                    {statusText(contract.contractStatus)}
                </Badge>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col sm={3} className="fw-bold text-info">체결일시</Col>
            <Col sm={9} className="text-secondary">
                {contract.signedTime ?? "양측 서명 전"}
            </Col>
        </Row>

        {/* 저장된 데이터로 완성된 근로계약서 출력 */}
        <ContractDocument contract={contract}/>

        {/* 계약 관련 기능 */}
        <Row className="mt-5 mb-5">
            <Col className="text-end">
                <Button variant="secondary"
                        onClick={()=>navigate(`/contract/history/${contract.employeeNo}`)}>
                    계약 이력
                </Button>

                {contract.contractStatus === "pending" && (
                <>
                    <Button variant="warning" className="ms-2"
                            onClick={()=>navigate(`/contract/edit/${contractNo}`)}>
                        <FaSquarePen/>
                        <span className="ms-2">서명 전 수정</span>
                    </Button>

                    <Button variant="success" className="ms-2"
                            onClick={()=>navigate(`/contract/sign/${contractNo}`)}>
                        <FaLock/>
                        <span className="ms-2">계약 서명</span>
                    </Button>
                </>
                )}

                {contract.signedTime !== null && contract.signedTime !== undefined && (
                <Button variant="outline-dark" className="ms-2"
                        onClick={()=>navigate(`/contract/sign/${contractNo}`)}>
                    서명 보기
                </Button>
                )}

                {contract.contractStatus === "active" && contract.contractEnd !== null && (
                <Button variant="info" className="ms-2"
                        onClick={()=>navigate(`/contract/extend/${contractNo}`)}>
                    기간 연장
                </Button>
                )}

                {contract.contractStatus === "active" && (
                <>
                    <Button variant="warning" className="ms-2"
                            onClick={()=>navigate(`/contract/change-condition/${contractNo}`)}>
                        <FaSquarePen/>
                        <span className="ms-2">근로조건 변경</span>
                    </Button>

                    <Button variant="danger" className="ms-2"
                            onClick={exitContract}>
                        <FaXmark/>
                        <span className="ms-2">중도 종료</span>
                    </Button>
                </>
                )}
            </Col>
        </Row>
    </>)
}
