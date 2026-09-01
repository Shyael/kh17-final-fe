import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument.jsx";

export default function ContractChangeCondition() {
    //parameter
    const { contractNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [currentContract, setCurrentContract] = useState(null);
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
        contractContent : ""
    });

    //날짜 input 형식으로 변경
    const toDateInput = useCallback(value=>{
        if(value === null || value === undefined) return "";
        return value.substring(0, 10);
    }, []);

    //현재 계약 조회
    const loadData = useCallback(async ()=>{
        try {
            setLoading(true);

            const { data } = await apiClient.get(
                `/contract/detail/${contractNo}`
            );

            setCurrentContract(data);

            //현재 조건을 새 계약의 기본값으로 사용
            setContract({
                contractNo : data.contractNo,
                employeeNo : data.employeeNo,
                wageType : data.wageType ?? "",
                baseWage : data.baseWage ?? "",
                dailyWorkHours : data.dailyWorkHours ?? "",
                weeklyWorkHours : data.weeklyWorkHours ?? "",
                writtenBreakTimes : data.writtenBreakTimes ?? "",
                contractStart : "",
                contractEnd : toDateInput(data.contractEnd),
                payday : data.payday ?? "",
                contractContent : data.contractContent ?? ""
            });
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "현재 근로계약을 불러오지 못했습니다"
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
        if(currentContract?.contractStatus !== "active") {
            toast.warning("진행 중인 계약만 근로조건을 변경할 수 있습니다");
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
            toast.warning("새 계약 시작일을 입력해주세요");
            return false;
        }

        if(contract.contractEnd !== "" && contract.contractStart > contract.contractEnd) {
            toast.warning("새 계약 종료일은 시작일보다 빠를 수 없습니다");
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
    }, [currentContract, contract]);

    //근로조건 변경
    const sendData = useCallback(async ()=>{
        if(checkContract() === false) return;
        if(sending === true) return;

        const result = await Swal.fire({
            title:"근로조건을 변경하시겠습니까?",
            text:"기존 계약은 보존하고 변경된 조건으로 새 계약을 작성합니다",
            icon:"warning",
            showCancelButton:true,
            confirmButtonText:"새 계약 작성",
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

            const { data } = await apiClient.post(
                `/contract/${contractNo}/changeWorkCondition`,
                request
            );

            toast.success("변경된 근로조건으로 새 계약이 작성되었습니다");
            navigate(`/contract/sign/${data.contractNo}`);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로조건 변경에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contract, contractNo, sending, checkContract, navigate]);

    if(loading === true || currentContract === null) {
        return <h1>로딩중...</h1>
    }

    return (<>
        <Jumbotron title="근로조건 변경"
                content="현재 계약을 보존하고 변경된 조건으로 새 근로계약을 작성합니다"/>

        <Row className="mt-5">
            <Col sm={3} className="fw-bold text-info">현재 계약번호</Col>
            <Col sm={9} className="text-secondary">{currentContract.contractNo}</Col>
        </Row>

        <Row className="mt-4">
            <Col sm={3} className="fw-bold text-info">직원번호</Col>
            <Col sm={9} className="text-secondary">{currentContract.employeeNo}</Col>
        </Row>

        <Row className="mt-4">
            <Col sm={3} className="fw-bold text-info">현재 계약상태</Col>
            <Col sm={9} className="text-secondary">{currentContract.contractStatus}</Col>
        </Row>

        {currentContract.contractStatus !== "active" && (
        <Row className="mt-4">
            <Col>
                <Alert variant="warning">
                    진행 중인 계약만 근로조건을 변경할 수 있습니다.
                </Alert>
            </Col>
        </Row>
        )}

        <Row className="mt-5">
            <Col>
                <Alert variant="info">
                    새 계약 시작일을 기준으로 기존 계약이 종료되고,
                    새 계약은 다시 양측 서명을 진행합니다.
                </Alert>
            </Col>
        </Row>

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
                <Form.Label column sm={3}>새 계약 시작일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date" name="contractStart"
                            value={contract.contractStart}
                            onChange={changeStringValue}/>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>새 계약 종료일</Form.Label>
                <Col sm={9}>
                    <Form.Control type="date" name="contractEnd"
                            value={contract.contractEnd}
                            onChange={changeStringValue}/>
                    <Form.Text className="text-muted">
                        기간의 정함이 없는 계약은 비워두세요
                    </Form.Text>
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

        {/* 변경될 새 계약 미리보기 */}
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
                        disabled={sending === true || currentContract.contractStatus !== "active"}>
                    <FaCheck/>
                    <span className="ms-2">
                        {sending === true ? "작성중..." : "새 계약 작성"}
                    </span>
                </Button>
            </Col>
        </Row>
    </>)
}
