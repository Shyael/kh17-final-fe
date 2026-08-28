import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Button,
    Card,
    Container,
    Form
} from "react-bootstrap";
import { toast } from "react-toastify";

import apiClient from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const ContractExtend = () => {

    const { contractNo } = useParams();
    const navigate = useNavigate();

    const [contract, setContract] = useState(null);

    const [contractEnd, setContractEnd] = useState("");


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


    const extendContract = async () => {

        if(!contractEnd) {
            toast.warning("새 계약 종료일을 입력해주세요.");
            return;
        }


        const currentEnd =
            contract.contractEnd?.substring(0, 10);


        if(
            currentEnd &&
            contractEnd <= currentEnd
        ) {
            toast.warning(
                "새 종료일은 기존 종료일보다 뒤여야 합니다."
            );

            return;
        }


        try {
            await apiClient.patch(
                `/contract/${contractNo}/extend`,
                {
                    contractNo,
                    contractEnd
                }
            );

            toast.success("근로계약 기간이 연장되었습니다.");

            navigate(
                `/contract/detail/${contractNo}`
            );
        }
        catch (e) {
            console.error(e);
            toast.error("계약 연장에 실패했습니다.");
        }
    };


    if(contract === null) {
        return null;
    }


    return (
        <>
            <Jumbotron
                title="근로계약 기간 연장"
                content="계약 종료일을 연장합니다."
            />

            <Container className="py-4">

                <Card>

                    <Card.Body>

                        <Form.Group className="mb-4">

                            <Form.Label>
                                현재 계약 시작일
                            </Form.Label>

                            <Form.Control
                                value={contract.contractStart}
                                disabled
                            />

                        </Form.Group>


                        <Form.Group className="mb-4">

                            <Form.Label>
                                현재 계약 종료일
                            </Form.Label>

                            <Form.Control
                                value={
                                    contract.contractEnd ??
                                    "기간의 정함 없음"
                                }
                                disabled
                            />

                        </Form.Group>


                        <Form.Group className="mb-4">

                            <Form.Label>
                                새 계약 종료일
                            </Form.Label>

                            <Form.Control
                                type="date"
                                value={contractEnd}
                                onChange={e =>
                                    setContractEnd(e.target.value)
                                }
                            />

                        </Form.Group>


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
                                onClick={extendContract}
                            >
                                기간 연장
                            </Button>

                        </div>

                    </Card.Body>

                </Card>

            </Container>
        </>
    );
};

export default ContractExtend;