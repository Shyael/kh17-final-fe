import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row
} from "react-bootstrap";
import { toast } from "react-toastify";

import apiClient from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const ContractSign = () => {

    const { contractNo } = useParams();
    const navigate = useNavigate();

    const [contract, setContract] = useState(null);

    const [employeeSignature, setEmployeeSignature] = useState("");
    const [employerSignature, setEmployerSignature] = useState("");

    const [signatureInfo, setSignatureInfo] = useState(null);

    const [loading, setLoading] = useState(false);


    // 서명할 계약 내용 조회
    const loadContract = async () => {

        try {
            setLoading(true);

            const response = await apiClient.patch(
                `/contract/recallBefore/${contractNo}`
            );

            setContract(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("계약 정보를 불러오지 못했습니다.");
        }
        finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadContract();
    }, [contractNo]);


    // 직원 서명
    const employeeSign = async () => {

        if(!employeeSignature.trim()) {
            toast.warning("직원 서명을 입력해주세요.");
            return;
        }

        try {
            await apiClient.patch(
                `/contract/${contractNo}/employeeSign`,
                {
                    contractNo,
                    employeeSignature
                }
            );

            toast.success("직원 서명이 저장되었습니다.");

            setEmployeeSignature("");

            await loadContract();
        }
        catch (e) {
            console.error(e);
            toast.error("직원 서명에 실패했습니다.");
        }
    };


    // 원장 서명
    const employerSign = async () => {

        if(!employerSignature.trim()) {
            toast.warning("원장 서명을 입력해주세요.");
            return;
        }

        try {
            await apiClient.patch(
                `/contract/${contractNo}/employerSign`,
                {
                    contractNo,
                    employerSignature
                }
            );

            toast.success("원장 서명이 저장되었습니다.");

            setEmployerSignature("");

            await loadContract();
        }
        catch (e) {
            console.error(e);
            toast.error("원장 서명에 실패했습니다.");
        }
    };


    // 실제 서명 조회
    const loadSignature = async () => {

        try {
            const response = await apiClient.get(
                `/contract/${contractNo}/findSignature`
            );

            setSignatureInfo(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("서명 정보를 불러오지 못했습니다.");
        }
    };


    if(loading && contract === null) {
        return (
            <Container className="py-5 text-center">
                계약 정보를 불러오는 중입니다.
            </Container>
        );
    }


    if(contract === null) {
        return null;
    }


    return (
        <>
            <Jumbotron
                title="근로계약 서명"
                content="계약 내용을 확인한 뒤 서명해주세요."
            />

            <Container className="py-4">

                <Card className="mb-4">
                    <Card.Body className="d-flex justify-content-between">

                        <div>
                            <h5>
                                근로계약 #{contract.contractNo}
                            </h5>

                            <div className="text-muted">
                                계약 내용을 모두 확인해주세요.
                            </div>
                        </div>

                        <div>
                            <Badge bg="secondary">
                                {contract.contractStatus}
                            </Badge>
                        </div>

                    </Card.Body>
                </Card>


                <Card className="mb-4">
                    <Card.Header>
                        근로 조건
                    </Card.Header>

                    <Card.Body>

                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>임금 형태</strong>
                                <div>{contract.wageType}</div>
                            </Col>

                            <Col md={6}>
                                <strong>기본 임금</strong>
                                <div>
                                    {contract.baseWage?.toLocaleString()}원
                                </div>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>1일 근로시간</strong>
                                <div>
                                    {contract.dailyWorkHours}시간
                                </div>
                            </Col>

                            <Col md={6}>
                                <strong>주 근로시간</strong>
                                <div>
                                    {contract.weeklyWorkHours}시간
                                </div>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>계약 시작일</strong>
                                <div>
                                    {contract.contractStart}
                                </div>
                            </Col>

                            <Col md={6}>
                                <strong>계약 종료일</strong>
                                <div>
                                    {contract.contractEnd ?? "기간의 정함 없음"}
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <strong>급여 지급일</strong>
                                <div>
                                    매월 {contract.payday}일
                                </div>
                            </Col>
                        </Row>

                    </Card.Body>
                </Card>


                <Card className="mb-4">
                    <Card.Header>
                        계약 내용
                    </Card.Header>

                    <Card.Body>
                        <div
                            style={{
                                whiteSpace: "pre-wrap",
                                minHeight: "200px"
                            }}
                        >
                            {contract.contractContent}
                        </div>
                    </Card.Body>
                </Card>


                <Row>

                    <Col md={6}>
                        <Card className="mb-4">

                            <Card.Header>
                                을(직원) 서명
                            </Card.Header>

                            <Card.Body>

                                <Form.Control
                                    value={employeeSignature}
                                    onChange={e =>
                                        setEmployeeSignature(e.target.value)
                                    }
                                    disabled={contract.signedTime != null}
                                    placeholder="직원 서명"
                                />

                                <Button
                                    className="mt-3"
                                    onClick={employeeSign}
                                    disabled={contract.signedTime != null}
                                >
                                    직원 서명
                                </Button>

                            </Card.Body>
                        </Card>
                    </Col>


                    <Col md={6}>
                        <Card className="mb-4">

                            <Card.Header>
                                갑(원장) 서명
                            </Card.Header>

                            <Card.Body>

                                <Form.Control
                                    value={employerSignature}
                                    onChange={e =>
                                        setEmployerSignature(e.target.value)
                                    }
                                    disabled={contract.signedTime != null}
                                    placeholder="원장 서명"
                                />

                                <Button
                                    variant="dark"
                                    className="mt-3"
                                    onClick={employerSign}
                                    disabled={contract.signedTime != null}
                                >
                                    원장 서명
                                </Button>

                            </Card.Body>
                        </Card>
                    </Col>

                </Row>


                {contract.signedTime != null && (
                    <Card className="mb-4">
                        <Card.Body>

                            <strong>
                                양측 서명이 완료되었습니다.
                            </strong>

                            <div className="mt-2">
                                체결일시 : {contract.signedTime}
                            </div>

                        </Card.Body>
                    </Card>
                )}


                <div className="d-flex gap-2 justify-content-end">

                    <Button
                        variant="outline-dark"
                        onClick={loadSignature}
                    >
                        서명 보기
                    </Button>

                    <Button
                        variant="outline-secondary"
                        onClick={() =>
                            navigate(`/contract/detail/${contractNo}`)
                        }
                    >
                        계약 상세
                    </Button>

                </div>


                {signatureInfo && (
                    <Card className="mt-4">

                        <Card.Header>
                            저장된 서명
                        </Card.Header>

                        <Card.Body>

                            <div className="mb-3">
                                <strong>직원 서명</strong>

                                <div>
                                    {signatureInfo.employeeSignature ?? "미서명"}
                                </div>
                            </div>

                            <div>
                                <strong>원장 서명</strong>

                                <div>
                                    {signatureInfo.employerSignature ?? "미서명"}
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                )}

            </Container>
        </>
    );
};

export default ContractSign;