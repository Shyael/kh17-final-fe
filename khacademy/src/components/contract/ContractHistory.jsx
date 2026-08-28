import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Badge,
    Button,
    Card,
    Container,
    Table
} from "react-bootstrap";
import { toast } from "react-toastify";

import apiClient from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const ContractHistory = () => {

    const { employeeNo } = useParams();
    const navigate = useNavigate();

    const [contractList, setContractList] = useState([]);


    const loadContracts = async () => {

        try {
            const response = await apiClient.get(
                `/contract/${employeeNo}`
            );

            setContractList(response.data);
        }
        catch (e) {
            console.error(e);
            toast.error("근로계약 이력을 불러오지 못했습니다.");
        }
    };


    useEffect(() => {
        loadContracts();
    }, [employeeNo]);


    return (
        <>
            <Jumbotron
                title="근로계약 이력"
                content="직원의 현재 및 과거 근로계약을 확인할 수 있습니다."
            />

            <Container className="py-4">

                <Card>

                    <Card.Header>
                        직원 #{employeeNo} 근로계약
                    </Card.Header>

                    <Card.Body>

                        {contractList.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                등록된 근로계약이 없습니다.
                            </div>
                        ) : (
                            <Table
                                hover
                                responsive
                                className="align-middle"
                            >

                                <thead>
                                    <tr>
                                        <th>계약번호</th>
                                        <th>임금형태</th>
                                        <th>기본임금</th>
                                        <th>계약 시작일</th>
                                        <th>계약 종료일</th>
                                        <th>상태</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {contractList.map(contract => (
                                        <tr key={contract.contractNo}>

                                            <td>
                                                {contract.contractNo}
                                            </td>

                                            <td>
                                                {contract.wageType}
                                            </td>

                                            <td>
                                                {contract.baseWage?.toLocaleString()}원
                                            </td>

                                            <td>
                                                {contract.contractStart}
                                            </td>

                                            <td>
                                                {contract.contractEnd ?? "무기한"}
                                            </td>

                                            <td>
                                                <Badge bg="secondary">
                                                    {contract.contractStatus}
                                                </Badge>
                                            </td>

                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/contract/detail/${contract.contractNo}`
                                                        )
                                                    }
                                                >
                                                    상세
                                                </Button>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </Table>
                        )}

                    </Card.Body>

                </Card>

            </Container>
        </>
    );
};

export default ContractHistory;