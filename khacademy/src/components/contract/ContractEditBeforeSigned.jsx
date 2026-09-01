import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument.jsx";

export default function ContractEditBeforeSigned() {
    //parameter
    const { contractNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [contract, setContract] = useState({
        contractNo : contractNo ?? "",
        employeeNo : "",
        wageType : "",
        baseWage : "",
        dailyWorkHours : "",
        weeklyWorkHours : "",
        writtenBreakTimes : "",
        contractStart : "",
        contractEnd : "",
        payday : "",
        contractContent : "",
        contractStatus : ""
    });

    //날짜 input 형식으로 변경
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

            setContract({
                contractNo : data.contractNo,
                employeeNo : data.employeeNo,
                wageType : data.wageType ?? "",
                baseWage : data.baseWage ?? "",
                dailyWorkHours : data.dailyWorkHours ?? "",
                weeklyWorkHours : data.weeklyWorkHours ?? "",
                writtenBreakTimes : data.writtenBreakTimes ?? "",
                contractStart : toDateInput(data.contractStart),
                contractEnd : toDateInput(data.contractEnd),
                payday : data.payday ?? "",
                contractContent : data.contractContent ?? "",
                contractStatus : data.contractStatus ?? ""
            });
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 정보를 불러오지 못했습니다"
            );
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }, [contractNo, navigate, toDateInput]);

    useEffect(()=>{
        loadData();
    }, [loadData]);

    //입력
    const changeStringValue = useCallback(e=>{
        const { name, value } = e.target;
        setContract(prev=>({
            ...prev,
            [name] : value
        }));
    }, []);

    //입력값 검사
    const checkContract = useCallback(()=>{
        if(contract.contractStatus !== "pending") {
            toast.warning("서명 대기 상태의 계약만 수정할 수 있습니다");
            return false;
        }

        if(contract.wageType === "" || contract.baseWage === "") {
            toast.warning("임금 정보를 입력해주세요");
            return false;
        }

        const dailyWorkHours = parseFloat(contract.dailyWorkHours);
        const weeklyWorkHours = parseFloat(contract.weeklyWorkHours);

        if(contract.dailyWorkHours === "" || contract.weeklyWorkHours === ""
            || dailyWorkHours <= 0 || weeklyWorkHours <= 0
            || dailyWorkHours > weeklyWorkHours) {
            toast.warning("소정근로시간을 확인해주세요");
            return false;
        }

        const writtenBreakTimes = parseInt(contract.writtenBreakTimes, 10);

        if(contract.writtenBreakTimes === "" || writtenBreakTimes < 0) {
            toast.warning("휴게시간을 확인해주세요");
            return false;
        }

        if(dailyWorkHours >= 8 && writtenBreakTimes < 60) {
            toast.warning("1일 8시간 이상 근무 시 휴게시간은 60분 이상이어야 합니다");
            return false;
        }

        if(dailyWorkHours >= 4 && dailyWorkHours < 8 && writtenBreakTimes < 30) {
            toast.warning("1일 4시간 이상 근무 시 휴게시간은 30분 이상이어야 합니다");
            return false;
        }

        if(contract.contractStart === "") {
            toast.warning("계약 시작일을 입력해주세요");
            return false;
        }

        if(contract.contractEnd !== "" && contract.contractStart > contract.contractEnd) {
            toast.warning("계약 종료일은 시작일보다 빠를 수 없습니다");
            return false;
        }

        const payday = parseInt(contract.payday, 10);

        if(contract.payday === "" || payday < 1 || payday > 31) {
            toast.warning("급여 지급일은 1일부터 31일 사이로 입력해주세요");
            return false;
        }

        if(contract.contractContent.trim() === "") {
            toast.warning("근로계약 내용을 입력해주세요");
            return false;
        }

        return true;
    }, [contract]);

    //서명 전 수정
    const sendData = useCallback(async ()=>{
        if(checkContract() === false) return;
        if(sending === true) return;

        const result = await Swal.fire({
            title:"근로계약을 수정하시겠습니까?",
            text:"수정된 내용을 확인한 뒤 다시 서명을 진행해주세요",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"수정",
            cancelButtonText:"취소"
        });
        if(result.isConfirmed === false) return;

        const request = {
            contractNo : contract.contractNo,
            wageType : contract.wageType,
            baseWage : contract.baseWage,
            dailyWorkHours : contract.dailyWorkHours,
            weeklyWorkHours : contract.weeklyWorkHours,
            writtenBreakTimes : contract.writtenBreakTimes,
            contractStart : contract.contractStart,
            contractEnd : contract.contractEnd === "" ? null : contract.contractEnd,
            payday : contract.payday,
            contractContent : contract.contractContent
        };

        try {
            setSending(true);

            await apiClient.patch(
                `/contract/editBefore/${contractNo}`,
                request
            );

            toast.success("근로계약이 수정되었습니다");
            navigate(`/contract/detail/${contractNo}`);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 수정에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contract, contractNo, sending, checkContract, navigate]);

    if(loading === true) {
        return <h1>로딩중...</h1>
    }

    return (<>
        <Jumbotron title="서명 전 근로계약 수정"
                content="양측 서명이 완료되기 전의 계약내용을 수정합니다"/>

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
            <Col sm={9} className="text-secondary">{contract.contractStatus}</Col>
        </Row>

        {contract.contractStatus !== "pending" && (
        <Row className="mt-4">
            <Col>
                <Alert variant="warning">
                    서명 대기 상태의 계약만 수정할 수 있습니다.
                </Alert>
            </Col>
        </Row>
        )}

        <Form>
            <Row className="mt-5">
                <Form.Label column sm={3}>임금형태</Form.Label>
                <Col sm={9}>
                    <Form.Select name="wageType" value={contract.wageType}
                            onChange={changeStringValue}>
                        <option value="monthly">월급</option>
                        <option value="hourly">시급</option>
                        <option value="daily">일급</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>기본임금</Form.Label>
                <Col sm={9}>
                    <Form.Control type="number" min="1" name="baseWage"
                            value={contract.baseWage}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>1일 소정근로시간</Form.Label>
                <Col sm={9}>
                    <Form.Control type="number" min="0.5" step="0.5"
                            name="dailyWorkHours"
                            value={contract.dailyWorkHours}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>1주 소정근로시간</Form.Label>
                <Col sm={9}>
                    <Form.Control type="number" min="0.5" step="0.5"
                            name="weeklyWorkHours"
                            value={contract.weeklyWorkHours}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>휴게시간</Form.Label>
                <Col sm={9}>
                    <Form.Control type="number" min="0" name="writtenBreakTimes"
                            value={contract.writtenBreakTimes}
                            onChange={changeStringValue}/>
                    <Form.Text className="text-muted">
                        4시간 이상 근무 시 30분 이상, 8시간 이상 근무 시 60분 이상
                    </Form.Text>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>계약 시작일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date" name="contractStart"
                            value={contract.contractStart}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>계약 종료일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date" name="contractEnd"
                            value={contract.contractEnd}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>급여 지급일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="number" min="1" max="31" name="payday"
                            value={contract.payday}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>기타 근로조건</Form.Label>
                <Col sm={9}>
                    <Form.Control as="textarea" rows={6} name="contractContent"
                            value={contract.contractContent}
                            onChange={changeStringValue}/>
                </Col>
            </Row>
        </Form>

        {/* 수정내용 미리보기 */}
        <ContractDocument contract={contract}/>

        <Row className="mt-5 mb-5">
            <Col className="text-end">
                <Button variant="secondary" size="lg"
                        onClick={()=>navigate(`/contract/detail/${contractNo}`)}
                        disabled={sending === true}>
                    <FaXmark/>
                    <span className="ms-2">취소</span>
                </Button>

                <Button variant="warning" size="lg" className="ms-2"
                        onClick={sendData}
                        disabled={sending === true || contract.contractStatus !== "pending"}>
                    <FaCheck/>
                    <span className="ms-2">
                        {sending === true ? "수정중..." : "수정 완료"}
                    </span>
                </Button>
            </Col>
        </Row>
    </>)
}
