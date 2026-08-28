import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Modal,
    Row
} from "react-bootstrap";
import { toast } from "react-toastify";

import apiClient from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const ContractDetail = () => {

    const { contractNo } = useParams();
    const navigate = useNavigate();

    const [contract, setContract] = useState(null);

    const [exitModal, setExitModal] = useState(false);


    const loadContract = async () => {

        try {
            const response = await apiClient.get(
                `/contract/detail/${contractNo}`
            );

            setContract(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("계약 정보를 불러오지 못했습니다.");
        }
    };


    useEffect(() => {
        loadContract();
    }, [contractNo]);


    const exitContract = async () => {

        try {
            await apiClient.patch(
                `/contract/${contractNo}/exit`
            );

            toast.success("근로계약이 종료되었습니다.");

            setExitModal(false);

            await loadContract();
        }
        catch (e) {
            console.error(e);
            toast.error("계약 종료에 실패했습니다.");
        }
    };


    if(contract === null) {
        return null;
    }


    return (
        <>
            <Jumbotron
                title="근로계약 상세"
                content="근로계약 내용을 확인할 수 있습니다."
            />

            <Container className="py-4">

                <Card className="mb-4">

                    <Card.Body className="d-flex justify-content-between align-items-center">

                        <div>
                            <h4>
                                근로계약 #{contract.contractNo}
                            </h4>

                            <div className="text-muted">
                                직원번호 #{contract.employeeNo}
                            </div>
                        </div>

                        <Badge bg="secondary">
                            {contract.contractStatus}
                        </Badge>

                    </Card.Body>

                </Card>


                <Card className="mb-4">

                    <Card.Header>
                        계약 조건
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
                                <div>{contract.contractStart}</div>
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

                            <Col md={6}>
                                <strong>서명 완료일시</strong>
                                <div>
                                    {contract.signedTime ?? "서명 미완료"}
                                </div>
                            </Col>

                        </Row>

                    </Card.Body>

                </Card>


                <Card className="mb-4">

                    <Card.Header>
                        근로계약 내용
                    </Card.Header>

                    <Card.Body>

                        <div
                            style={{
                                whiteSpace: "pre-wrap",
                                minHeight: "250px"
                            }}
                        >
                            {contract.contractContent}
                        </div>

                    </Card.Body>

                </Card>


                <div className="d-flex flex-wrap gap-2 justify-content-end">

                    {contract.contractStatus === "pending" && (
                        <>
                            <Button
                                variant="outline-primary"
                                onClick={() =>
                                    navigate(
                                        `/contract/edit/${contractNo}`
                                    )
                                }
                            >
                                서명 전 수정
                            </Button>

                            <Button
                                onClick={() =>
                                    navigate(
                                        `/contract/sign/${contractNo}`
                                    )
                                }
                            >
                                서명
                            </Button>
                        </>
                    )}


                    {contract.contractStatus !== "ended" &&
                        contract.contractEnd != null && (
                            <Button
                                variant="outline-dark"
                                onClick={() =>
                                    navigate(
                                        `/contract/extend/${contractNo}`
                                    )
                                }
                            >
                                기간 연장
                            </Button>
                    )}


                    {contract.contractStatus === "active" && (
                        <>
                            <Button
                                variant="outline-primary"
                                onClick={() =>
                                    navigate(
                                        `/contract/change-condition/${contractNo}`
                                    )
                                }
                            >
                                근로조건 변경
                            </Button>

                            <Button
                                variant="outline-danger"
                                onClick={() =>
                                    setExitModal(true)
                                }
                            >
                                중도 종료
                            </Button>
                        </>
                    )}

                </div>

            </Container>


            <Modal
                show={exitModal}
                onHide={() => setExitModal(false)}
                centered
            >

                <Modal.Header closeButton>
                    <Modal.Title>
                        근로계약 종료
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    해당 근로계약을 중도 종료하시겠습니까?
                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            setExitModal(false)
                        }
                    >
                        취소
                    </Button>

                    <Button
                        variant="danger"
                        onClick={exitContract}
                    >
                        계약 종료
                    </Button>

                </Modal.Footer>

            </Modal>
        </>
    );
};

export default ContractDetail;