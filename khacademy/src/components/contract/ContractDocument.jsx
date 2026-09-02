import { Col, Row } from "react-bootstrap";
import { useMemo } from "react";

export default function ContractDocument({ contract }) {

    //임금형태 한글 표시
    const wageTypeText = useMemo(()=>{
        if(contract === null || contract === undefined) return "";
        if(contract.wageType === "monthly") return "월급";
        if(contract.wageType === "hourly") return "시급";
        if(contract.wageType === "daily") return "일급";
        return contract.wageType ?? "";
    }, [contract]);

    //날짜 출력용
    const startDate = useMemo(()=>{
        if(contract?.contractStart === null || contract?.contractStart === undefined || contract?.contractStart === "") {
            return "________________";
        }
        return contract.contractStart.substring(0, 10);
    }, [contract]);

    const endDate = useMemo(()=>{
        if(contract?.contractEnd === null || contract?.contractEnd === undefined) {
            return "기간의 정함 없음";
        }
        if(contract.contractEnd === "") {
            return "기간의 정함 없음";
        }
        return contract.contractEnd.substring(0, 10);
    }, [contract]);

    //금액 출력용
    const baseWage = useMemo(()=>{
        if(contract?.baseWage === null || contract?.baseWage === undefined || contract?.baseWage === "") {
            return "________________";
        }

        const value = parseInt(contract.baseWage, 10);
        if(Number.isNaN(value)) return contract.baseWage;

        return `${value.toLocaleString()}원`;
    }, [contract]);

    if(contract === null || contract === undefined) return null;

    return (<>
        <Row className="mt-5">
            <Col className="text-center">
                <h3 className="fw-bold">근 로 계 약 서</h3>
            </Col>
        </Row>

        {(contract.contractNo !== undefined || contract.employeeNo !== undefined) && (
        <Row className="mt-5">
            <Col sm={3} className="fw-bold text-info">계약번호</Col>
            <Col sm={3} className="text-secondary">
                {contract.contractNo ?? "신규 작성"}
            </Col>
            <Col sm={3} className="fw-bold text-info">직원번호</Col>
            <Col sm={3} className="text-secondary">
                {contract.employeeNo ?? "-"}
            </Col>
        </Row>
        )}

        <Row className="mt-5">
            <Col>
                <h5 className="fw-bold">제1조 [근로계약기간]</h5>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                근로계약기간은 <b>{startDate}</b> 부터 <b>{endDate}</b> 까지로 한다.
            </Col>
        </Row>

        <Row className="mt-5">
            <Col>
                <h5 className="fw-bold">제2조 [임금]</h5>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                임금형태는 <b>{wageTypeText || "________________"}</b>으로 하며
                기본임금은 <b>{baseWage}</b>으로 한다.
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                급여는 매월 <b>{contract.payday || "________"}일</b>에 지급한다.
            </Col>
        </Row>

        <Row className="mt-5">
            <Col>
                <h5 className="fw-bold">제3조 [소정근로시간]</h5>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                1일 소정근로시간은 <b>{contract.dailyWorkHours || "________"}시간</b>,
                1주 소정근로시간은 <b>{contract.weeklyWorkHours || "________"}시간</b>으로 한다.
            </Col>
        </Row>

        <Row className="mt-5">
            <Col>
                <h5 className="fw-bold">제4조 [휴게시간]</h5>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                근로시간 중 휴게시간은 <b>{contract.writtenBreakMinutes || "________"}분</b>으로 한다.
            </Col>
        </Row>

        <Row className="mt-5">
            <Col>
                <h5 className="fw-bold">제5조 [기타 근로조건]</h5>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                {contract.contractContent || "근로계약 내용을 입력해주세요."}
            </Col>
        </Row>

        <Row className="mt-5">
            <Col>
                <hr/>
            </Col>
        </Row>

        <Row className="mt-4 mb-5">
            <Col className="text-center">
                본 계약의 내용을 확인하고 이에 동의하여 근로계약을 체결한다.
            </Col>
        </Row>
    </>)
}
