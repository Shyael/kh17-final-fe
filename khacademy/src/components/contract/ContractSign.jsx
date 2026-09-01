import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaLock } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument";

export default function ContractSign() {
    //parameter
    const { contractNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [contract, setContract] = useState(null);
    const [employeeSignature, setEmployeeSignature] = useState("");
    const [employerSignature, setEmployerSignature] = useState("");
    const [signatureInfo, setSignatureInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    //서명할 계약 조회
    const loadData = useCallback(async ()=>{
        try {
            setLoading(true);

            //현재 Controller 명세가 PATCH이므로 그대로 사용
            const { data } = await apiClient.patch(
                `/contract/recallBefore/${contractNo}`
            );

            setContract(data);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "서명할 근로계약을 불러오지 못했습니다"
            );
        }
        finally {
            setLoading(false);
        }
    }, [contractNo]);

    useEffect(()=>{
        loadData();
    }, [loadData]);

    //직원 서명 입력
    const changeEmployeeSignature = useCallback(e=>{
        setEmployeeSignature(e.target.value);
    }, []);

    //원장 서명 입력
    const changeEmployerSignature = useCallback(e=>{
        setEmployerSignature(e.target.value);
    }, []);

    //직원 서명
    const employeeSign = useCallback(async ()=>{
        if(employeeSignature.trim() === "") {
            toast.warning("직원 서명을 입력해주세요");
            return;
        }

        if(sending === true) return;

        const result = await Swal.fire({
            title:"직원 서명을 저장하시겠습니까?",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"서명",
            cancelButtonText:"취소"
        });
        if(result.isConfirmed === false) return;

        try {
            setSending(true);

            await apiClient.patch(
                `/contract/${contractNo}/employeeSign`,
                {
                    contractNo,
                    employeeSignature
                }
            );

            toast.success("직원 서명이 저장되었습니다");
            setEmployeeSignature("");
            setSignatureInfo(null);
            await loadData();
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "직원 서명에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contractNo, employeeSignature, sending, loadData]);

    //원장 서명
    const employerSign = useCallback(async ()=>{
        if(employerSignature.trim() === "") {
            toast.warning("원장 서명을 입력해주세요");
            return;
        }

        if(sending === true) return;

        const result = await Swal.fire({
            title:"원장 서명을 저장하시겠습니까?",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"서명",
            cancelButtonText:"취소"
        });
        if(result.isConfirmed === false) return;

        try {
            setSending(true);

            await apiClient.patch(
                `/contract/${contractNo}/employerSign`,
                {
                    contractNo,
                    employerSignature
                }
            );

            toast.success("원장 서명이 저장되었습니다");
            setEmployerSignature("");
            setSignatureInfo(null);
            await loadData();
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "원장 서명에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contractNo, employerSignature, sending, loadData]);

    //저장된 서명 조회
    const loadSignature = useCallback(async ()=>{
        try {
            const { data } = await apiClient.get(
                `/contract/${contractNo}/findSignature`
            );

            setSignatureInfo(data);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "저장된 서명을 불러오지 못했습니다"
            );
        }
    }, [contractNo]);

    if(loading === true && contract === null) {
        return <h1>로딩중...</h1>
    }

    if(contract === null) {
        return (<>
            <Jumbotron title="근로계약 서명"/>
            <Row className="mt-5">
                <Col>서명할 근로계약을 확인할 수 없습니다.</Col>
            </Row>
        </>)
    }

    const signCompleted = contract.signedTime !== null
                        && contract.signedTime !== undefined;

    return (<>
        <Jumbotron title="근로계약 서명" content="근로계약 내용을 확인한 뒤 서명을 진행합니다"/>

        {/* 계약서를 먼저 확인 */}
        <ContractDocument contract={contract}/>

        {signCompleted === true && (
        <Row className="mt-4">
            <Col>
                <Alert variant="success">
                    양측 서명이 완료되었습니다.
                    체결일시 : {contract.signedTime}
                </Alert>
            </Col>
        </Row>
        )}

        {/* 직원 서명 */}
        <Row className="mt-5">
            <Col>
                <h4 className="fw-bold">을(직원) 서명</h4>
            </Col>
        </Row>

        <Row className="mt-4">
            <Form.Label column sm={3}>직원 서명</Form.Label>
            <Col sm={9}>
                <Form.Control type="text" value={employeeSignature}
                        onChange={changeEmployeeSignature}
                        disabled={signCompleted === true || sending === true}
                        placeholder="직원 서명을 입력하세요"/>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col className="text-end">
                <Button variant="success" onClick={employeeSign}
                        disabled={signCompleted === true || sending === true}>
                    <FaCheck/>
                    <span className="ms-2">직원 서명 저장</span>
                </Button>
            </Col>
        </Row>

        {/* 원장 서명 */}
        <Row className="mt-5">
            <Col>
                <h4 className="fw-bold">갑(원장) 서명</h4>
            </Col>
        </Row>

        <Row className="mt-4">
            <Form.Label column sm={3}>원장 서명</Form.Label>
            <Col sm={9}>
                <Form.Control type="text" value={employerSignature}
                        onChange={changeEmployerSignature}
                        disabled={signCompleted === true || sending === true}
                        placeholder="원장 서명을 입력하세요"/>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col className="text-end">
                <Button variant="dark" onClick={employerSign}
                        disabled={signCompleted === true || sending === true}>
                    <FaCheck/>
                    <span className="ms-2">원장 서명 저장</span>
                </Button>
            </Col>
        </Row>

        {/* 저장된 서명 */}
        <Row className="mt-5">
            <Col className="text-end">
                <Button variant="outline-dark" onClick={loadSignature}>
                    <FaLock/>
                    <span className="ms-2">저장된 서명 보기</span>
                </Button>
            </Col>
        </Row>

        {signatureInfo !== null && (
        <>
            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">직원 서명</Col>
                <Col sm={9} className="text-secondary">
                    {signatureInfo.employeeSignature ?? "미서명"}
                </Col>
            </Row>

            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">원장 서명</Col>
                <Col sm={9} className="text-secondary">
                    {signatureInfo.employerSignature ?? "미서명"}
                </Col>
            </Row>
        </>
        )}

        <Row className="mt-5 mb-5">
            <Col className="text-end">
                <Button variant="secondary"
                        onClick={()=>navigate(`/contract/detail/${contractNo}`)}>
                    계약 상세
                </Button>
            </Col>
        </Row>
    </>)
}
