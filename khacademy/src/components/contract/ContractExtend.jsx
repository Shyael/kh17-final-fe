import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument.jsx";

export default function ContractExtend() {
    //parameter
    const { contractNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [contract, setContract] = useState(null);
    const [contractEnd, setContractEnd] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    //날짜 출력용
    const toDateInput = useCallback(value=>{
        if(value === null || value === undefined) return "";
        return value.substring(0, 10);
    }, []);

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
                ?? "연장할 근로계약을 불러오지 못했습니다"
            );
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }, [contractNo, navigate]);

    useEffect(()=>{
        loadData();
    }, [loadData]);

    //종료일 입력
    const changeContractEnd = useCallback(e=>{
        setContractEnd(e.target.value);
    }, []);

    //기간 연장
    const sendData = useCallback(async ()=>{
        if(contract === null) return;

        if(contract.contractStatus !== "active") {
            toast.warning("진행 중인 계약만 기간을 연장할 수 있습니다");
            return;
        }

        if(contract.contractEnd === null) {
            toast.warning("기간의 정함이 없는 계약은 연장할 수 없습니다");
            return;
        }

        if(contractEnd === "") {
            toast.warning("새 계약 종료일을 입력해주세요");
            return;
        }

        if(contractEnd <= toDateInput(contract.contractEnd)) {
            toast.warning("새 종료일은 현재 종료일보다 뒤여야 합니다");
            return;
        }

        if(sending === true) return;

        const result = await Swal.fire({
            title:"계약기간을 연장하시겠습니까?",
            text:`${toDateInput(contract.contractEnd)} → ${contractEnd}`,
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"연장",
            cancelButtonText:"취소"
        });
        if(result.isConfirmed === false) return;

        try {
            setSending(true);

            //Controller에서 path의 contractNo를 RequestVO에 설정하므로 종료일만 전달
            await apiClient.patch(
                `/contract/${contractNo}/extend`,
                { contractEnd }
            );

            toast.success("근로계약 기간이 연장되었습니다");
            navigate(`/contract/detail/${contractNo}`);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 연장에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contract, contractEnd, contractNo, sending, navigate, toDateInput]);

    if(loading === true || contract === null) {
        return <h1>로딩중...</h1>
    }

    return (<>
        <Jumbotron title="근로계약 기간 연장"
                content="현재 계약조건은 유지하고 계약 종료일만 연장합니다"/>

        {/* 현재 계약서 */}
        <ContractDocument contract={contract}/>

        {contract.contractStatus !== "active" && (
        <Row className="mt-4">
            <Col>
                <Alert variant="warning">
                    진행 중인 계약만 기간을 연장할 수 있습니다.
                </Alert>
            </Col>
        </Row>
        )}

        {contract.contractEnd === null && (
        <Row className="mt-4">
            <Col>
                <Alert variant="warning">
                    기간의 정함이 없는 계약은 연장 대상이 아닙니다.
                </Alert>
            </Col>
        </Row>
        )}

        {contract.contractStatus === "active" && contract.contractEnd !== null && (
        <Form>
            <Row className="mt-5">
                <Form.Label column sm={3}>현재 종료일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date"
                            value={toDateInput(contract.contractEnd)}
                            readOnly/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>새 종료일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date"
                            value={contractEnd}
                            min={toDateInput(contract.contractEnd)}
                            onChange={changeContractEnd}/>
                </Col>
            </Row>

            <Row className="mt-5 mb-5">
                <Col className="text-end">
                    <Button variant="secondary" size="lg"
                            onClick={()=>navigate(`/contract/detail/${contractNo}`)}
                            disabled={sending === true}>
                        <FaXmark/>
                        <span className="ms-2">취소</span>
                    </Button>

                    <Button variant="success" size="lg" className="ms-2"
                            onClick={sendData}
                            disabled={sending === true}>
                        <FaCheck/>
                        <span className="ms-2">
                            {sending === true ? "연장중..." : "기간 연장"}
                        </span>
                    </Button>
                </Col>
            </Row>
        </Form>
        )}
    </>)
}
