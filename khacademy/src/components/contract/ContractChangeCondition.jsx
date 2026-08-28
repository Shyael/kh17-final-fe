import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
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

const ContractChangeCondition = () => {

    const { contractNo } = useParams();
    const navigate = useNavigate();


    const [contract, setContract] = useState({

        wageType: "",
        baseWage: "",

        dailyWorkHours: "",
        weeklyWorkHours: "",

        contractStart: "",
        contractEnd: "",

        payday: "",

        contractContent: ""
    });


    const loadContract = async () => {

        try {
            const response = await apiClient.get(
                `/contract/detail/${contractNo}`
            );

            const data = response.data;

            setContract({

                wageType: data.wageType ?? "",
                baseWage: data.baseWage ?? "",

                dailyWorkHours:
                    data.dailyWorkHours ?? "",

                weeklyWorkHours:
                    data.weeklyWorkHours ?? "",

                contractStart: "",

                contractEnd:
                    data.contractEnd
                        ? data.contractEnd.substring(0, 10)
                        : "",

                payday:
                    data.payday ?? "",

                contractContent:
                    data.contractContent ?? ""
            });

        }
        catch (e) {
            console.error(e);
            toast.error("기존 계약을 불러오지 못했습니다.");
        }
    };


    useEffect(() => {
        loadContract();
    }, [contractNo]);


    const changeInput = e => {

        const {
            name,
            value
        } = e.target;

        setContract(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const makeContractContent = () => {

        return `
근로계약서

1. 임금 형태
${contract.wageType}

2. 기본 임금
${contract.baseWage}원

3. 1일 근로시간
${contract.dailyWorkHours}시간

4. 주 근로시간
${contract.weeklyWorkHours}시간

5. 계약기간
${contract.contractStart}
~
${contract.contractEnd || "기간의 정함 없음"}

6. 급여 지급일
매월 ${contract.payday}일
        `.trim();
    };


    const changeWorkCondition = async () => {

        if(!contract.contractStart) {
            toast.warning("변경 적용일을 입력해주세요.");
            return;
        }


        if(
            contract.contractEnd &&
            contract.contractStart >= contract.contractEnd
        ) {
            toast.warning(
                "계약 종료일은 시작일보다 뒤여야 합니다."
            );

            return;
        }


        try {

            const contractContent =
                makeContractContent();


            const response = await apiClient.post(
                `/contract/${contractNo}/changeWorkCondition`,
                {
                    wageType:
                        contract.wageType,

                    baseWage:
                        contract.baseWage,

                    dailyWorkHours:
                        contract.dailyWorkHours,

                    weeklyWorkHours:
                        contract.weeklyWorkHours,

                    contractStart:
                        contract.contractStart,

                    contractEnd:
                        contract.contractEnd || null,

                    payday:
                        contract.payday,

                    contractContent
                }
            );


            toast.success(
                "변경된 근로조건으로 새 계약이 작성되었습니다."
            );


            navigate(
                `/contract/detail/${response.data.contractNo}`
            );

        }
        catch (e) {
            console.error(e);

            toast.error(
                "근로조건 변경에 실패했습니다."
            );
        }
    };


    return (
        <>
            <Jumbotron
                title="근로조건 변경"
                content="변경된 조건으로 새로운 근로계약을 작성합니다."
            />

            <Container className="py-4">

                <Card>

                    <Card.Body>

                        <Row className="mb-4">

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        임금 형태
                                    </Form.Label>

                                    <Form.Select
                                        name="wageType"
                                        value={contract.wageType}
                                        onChange={changeInput}
                                    >
                                        <option value="monthly">
                                            월급
                                        </option>

                                        <option value="hourly">
                                            시급
                                        </option>

                                        <option value="daily">
                                            일급
                                        </option>
                                    </Form.Select>

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        기본 임금
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="baseWage"
                                        value={contract.baseWage}
                                        onChange={changeInput}
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        <Row className="mb-4">

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        1일 근로시간
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        step="0.5"
                                        name="dailyWorkHours"
                                        value={contract.dailyWorkHours}
                                        onChange={changeInput}
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        주 근로시간
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        step="0.5"
                                        name="weeklyWorkHours"
                                        value={contract.weeklyWorkHours}
                                        onChange={changeInput}
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        <Row className="mb-4">

                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        변경 적용일
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="contractStart"
                                        value={contract.contractStart}
                                        onChange={changeInput}
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group>

                                    <Form.Label>
                                        계약 종료일
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="contractEnd"
                                        value={contract.contractEnd}
                                        onChange={changeInput}
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        <Form.Group className="mb-4">

                            <Form.Label>
                                급여 지급일
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min="1"
                                max="31"
                                name="payday"
                                value={contract.payday}
                                onChange={changeInput}
                            />

                        </Form.Group>


                        <Card className="mb-4">

                            <Card.Header>
                                변경 계약 미리보기
                            </Card.Header>

                            <Card.Body>

                                <div
                                    style={{
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {makeContractContent()}
                                </div>

                            </Card.Body>

                        </Card>


                        <div className="d-flex justify-content-end gap-2">

                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(-1)
                                }
                            >
                                취소
                            </Button>

                            <Button
                                onClick={changeWorkCondition}
                            >
                                변경 계약 작성
                            </Button>

                        </div>

                    </Card.Body>

                </Card>

            </Container>
        </>
    );
};

export default ContractChangeCondition;