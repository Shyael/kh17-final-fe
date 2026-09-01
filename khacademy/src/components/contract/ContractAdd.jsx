import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import ContractDocument from "./ContractDocument";

export default function ContractAdd() {
    //parameter
    const { employeeNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [employeeType, setEmployeeType] = useState("");
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const [contract, setContract] = useState({
        employeeNo : employeeNo ?? "",
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

    //직원 유형 변경
    const changeEmployeeType = useCallback(e=>{
        setEmployeeType(e.target.value);
        setEmployee(null);
    }, []);

    //계약 입력값 변경
    const changeStringValue = useCallback(e=>{
        const { name, value } = e.target;
        setContract(prev=>({
            ...prev,
            [name] : value
        }));
    }, []);

    //직원 정보 조회
    const loadEmployee = useCallback(async ()=>{
        if(employeeNo === undefined) return;
        if(employeeType === "") return;

        try {
            setLoading(true);

            const { data } = await apiClient.get(
                `/contract/${employeeType}/${employeeNo}`
            );

            setEmployee(data);
        }
        catch(e) {
            console.error(e);
            setEmployee(null);
            toast.error(
                e?.response?.data?.message
                ?? "직원 정보를 불러오지 못했습니다"
            );
        }
        finally {
            setLoading(false);
        }
    }, [employeeNo, employeeType]);

    useEffect(()=>{
        loadEmployee();
    }, [loadEmployee]);

    //입력값 검사
    const checkContract = useCallback(()=>{
        if(employee === null) {
            toast.warning("계약 대상 직원을 확인해주세요");
            return false;
        }

        if(employee.employeeStatus !== "미배정") {
            toast.warning("미배정 상태의 직원만 신규 근로계약을 작성할 수 있습니다");
            return false;
        }

        if(contract.wageType === "") {
            toast.warning("임금 형태를 선택해주세요");
            return false;
        }

        if(contract.baseWage === "") {
            toast.warning("기본 임금을 입력해주세요");
            return false;
        }

        if(contract.dailyWorkHours === "" || contract.weeklyWorkHours === "") {
            toast.warning("소정근로시간을 입력해주세요");
            return false;
        }

        const dailyWorkHours = parseFloat(contract.dailyWorkHours);
        const weeklyWorkHours = parseFloat(contract.weeklyWorkHours);

        if(dailyWorkHours <= 0 || weeklyWorkHours <= 0 || dailyWorkHours > weeklyWorkHours) {
            toast.warning("소정근로시간을 확인해주세요");
            return false;
        }

        if(contract.writtenBreakTimes === "") {
            toast.warning("휴게시간을 입력해주세요");
            return false;
        }

        const writtenBreakTimes = parseInt(contract.writtenBreakTimes, 10);

        if(writtenBreakTimes < 0) {
            toast.warning("휴게시간은 0분 이상이어야 합니다");
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
    }, [employee, contract]);

    //신규 근로계약 작성
    const sendData = useCallback(async ()=>{
        if(checkContract() === false) return;
        if(sending === true) return;

        const result = await Swal.fire({
            title:"근로계약을 작성하시겠습니까?",
            text:"작성 후 직원과 원장의 서명이 필요합니다",
            icon:"question",
            showCancelButton:true,
            confirmButtonText:"작성",
            cancelButtonText:"취소"
        });
        if(result.isConfirmed === false) return;

        const request = {
            ...contract,
            contractEnd : contract.contractEnd === "" ? null : contract.contractEnd
        };

        try {
            setSending(true);

            const { data } = await apiClient.post("/contract/add", request);

            toast.success("근로계약이 작성되었습니다");
            navigate(`/contract/sign/${data.contractNo}`);
        }
        catch(e) {
            console.error(e);
            toast.error(
                e?.response?.data?.message
                ?? "근로계약 작성에 실패했습니다"
            );
        }
        finally {
            setSending(false);
        }
    }, [contract, sending, checkContract, navigate]);

    return (<>
        <Jumbotron title="근로계약 작성" content="계약 대상 직원과 근로조건을 입력해주세요"/>

        {/* 계약 대상 직원 선택 */}
        <Row className="mt-5">
            <Form.Label column sm={3}>직원번호</Form.Label>
            <Col sm={9}>
                <Form.Control type="text" value={employeeNo ?? ""} readOnly/>
            </Col>
        </Row>

        <Row className="mt-4">
            <Form.Label column sm={3}>직원유형</Form.Label>
            <Col sm={9}>
                <Form.Select value={employeeType} onChange={changeEmployeeType}>
                    <option value="">선택</option>
                    <option value="desk">데스크</option>
                    <option value="teacher">강사</option>
                </Form.Select>
            </Col>
        </Row>

        {loading === true && (
        <Row className="mt-4">
            <Col className="text-secondary">
                <FaMagnifyingGlass className="me-2"/>
                직원 정보를 불러오는 중입니다
            </Col>
        </Row>
        )}

        {employee !== null && (
        <>
            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">이름</Col>
                <Col sm={9} className="text-secondary">{employee.accountName}</Col>
            </Row>

            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">연락처</Col>
                <Col sm={9} className="text-secondary">{employee.accountPhone}</Col>
            </Row>

            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">고용형태</Col>
                <Col sm={9} className="text-secondary">{employee.employeeType}</Col>
            </Row>

            <Row className="mt-4">
                <Col sm={3} className="fw-bold text-info">고용상태</Col>
                <Col sm={9} className="text-secondary">{employee.employeeStatus}</Col>
            </Row>

            {employee.employeeStatus !== "미배정" && (
            <Row className="mt-4">
                <Col>
                    <Alert variant="warning">
                        미배정 상태의 직원만 신규 근로계약을 작성할 수 있습니다.
                        재직 중인 직원은 근로조건 변경 기능을 이용해주세요.
                    </Alert>
                </Col>
            </Row>
            )}
        </>
        )}

        {/* 미배정 직원일 때만 계약 입력 */}
        {employee?.employeeStatus === "미배정" && (
        <>
            <Row className="mt-5">
                <Col>
                    <h4 className="fw-bold">근로조건 입력</h4>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>임금형태</Form.Label>
                <Col sm={9}>
                    <Form.Select name="wageType" value={contract.wageType}
                            onChange={changeStringValue}>
                        <option value="">선택</option>
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

            {/* 작성중인 계약서 미리보기 */}
            <ContractDocument contract={contract}/>

            <Row className="mt-5 mb-5">
                <Col className="text-end">
                    <Button variant="secondary" size="lg"
                            onClick={()=>navigate(-1)}
                            disabled={sending === true}>
                        <FaXmark/>
                        <span className="ms-2">취소</span>
                    </Button>

                    <Button variant="success" size="lg" className="ms-2"
                            onClick={sendData}
                            disabled={sending === true}>
                        <FaCheck/>
                        <span className="ms-2">
                            {sending === true ? "작성중..." : "근로계약 작성"}
                        </span>
                    </Button>
                </Col>
            </Row>
        </>
        )}
    </>)
}
