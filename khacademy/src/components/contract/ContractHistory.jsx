import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import {
    FaArrowLeft,
    FaArrowRotateRight,
    FaMagnifyingGlass
} from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";


export default function ContractHistory() {
    //parameter
    const { employeeNo } = useParams();

    //navigate
    const navigate = useNavigate();

    //state
    const [contractList, setContractList] = useState([]);
    const [loading, setLoading] = useState(true);


    //계약 이력 조회
    const loadData = useCallback(async ()=>{

        try {
            setLoading(true);

            const {data} = await apiClient.get(
                `/contract/${employeeNo}`
            );

            setContractList(data ?? []);
        }
        catch(e) {
            console.error(e);

            toast.error(
                e?.response?.data?.message
                ?? "근로계약 이력을 불러오지 못했습니다"
            );

            setContractList([]);
        }
        finally {
            setLoading(false);
        }

    }, [employeeNo]);


    useEffect(()=>{
        loadData();
    }, [loadData]);


    //계약상태 한글 표시
    const statusText = useCallback(status=>{

        if(status === "pending") return "서명 대기";
        if(status === "scheduled") return "시작 예정";
        if(status === "active") return "진행 중";
        if(status === "ended") return "종료";

        return status;

    }, []);


    //계약상태 색상
    const statusColor = useCallback(status=>{

        if(status === "pending") return "warning";
        if(status === "scheduled") return "info";
        if(status === "active") return "success";
        if(status === "ended") return "secondary";

        return "dark";

    }, []);


    //임금형태 한글 표시
    const wageTypeText = useCallback(wageType=>{

        if(wageType === "monthly") return "월급";
        if(wageType === "hourly") return "시급";
        if(wageType === "daily") return "일급";

        return wageType;

    }, []);


    //날짜 출력
    const toDate = useCallback(value=>{

        if(value === null || value === undefined) {
            return "기간의 정함 없음";
        }

        return value.substring(0, 10);

    }, []);


    //금액 출력
    const formatMoney = useCallback(value=>{

        if(value === null || value === undefined) {
            return "-";
        }

        const money = parseInt(value, 10);

        if(Number.isNaN(money)) {
            return value;
        }

        return money.toLocaleString();

    }, []);


    //view
    return (<>

        <Jumbotron
            title="근로계약 이력"
            content="직원의 현재 및 과거 근로계약을 확인합니다"
        />


        <Row className="mt-5">

            <Col sm={3} className="fw-bold text-info">
                직원번호
            </Col>

            <Col sm={9} className="text-secondary">
                {employeeNo}
            </Col>

        </Row>


        <Row className="mt-5">

            <Col>
                <h4 className="fw-bold">
                    근로계약 목록
                </h4>
            </Col>

            <Col className="text-end">

                <Button
                    variant="outline-secondary"
                    onClick={loadData}
                    disabled={loading === true}
                >
                    <FaArrowRotateRight/>
                    <span className="ms-2">
                        새로고침
                    </span>
                </Button>

            </Col>

        </Row>


        {/* 로딩 */}
        {loading === true && (

        <Row className="mt-5">

            <Col className="text-center text-secondary">

                <FaMagnifyingGlass className="me-2"/>

                근로계약 이력을 불러오는 중입니다

            </Col>

        </Row>

        )}


        {/* 계약 없음 */}
        {loading === false && contractList.length === 0 && (

        <Row className="mt-5">

            <Col className="text-center text-secondary">

                등록된 근로계약이 없습니다

            </Col>

        </Row>

        )}


        {/* 계약 목록 */}
        {loading === false && contractList.map(contract=>(

        <Row
            className="mt-4 border rounded p-4"
            key={contract.contractNo}
        >

            <Col xs={12}>

                <Row>

                    <Col sm={3} className="fw-bold text-info">
                        계약번호
                    </Col>

                    <Col sm={9} className="text-secondary">
                        {contract.contractNo}
                    </Col>

                </Row>


                <Row className="mt-3">

                    <Col sm={3} className="fw-bold text-info">
                        임금형태
                    </Col>

                    <Col sm={9} className="text-secondary">

                        {wageTypeText(
                            contract.wageType
                        )}

                    </Col>

                </Row>


                <Row className="mt-3">

                    <Col sm={3} className="fw-bold text-info">
                        기본임금
                    </Col>

                    <Col sm={9} className="text-secondary">

                        {formatMoney(
                            contract.baseWage
                        )}원

                    </Col>

                </Row>


                <Row className="mt-3">

                    <Col sm={3} className="fw-bold text-info">
                        계약기간
                    </Col>

                    <Col sm={9} className="text-secondary">

                        {toDate(
                            contract.contractStart
                        )}

                        {" ~ "}

                        {toDate(
                            contract.contractEnd
                        )}

                    </Col>

                </Row>


                <Row className="mt-3">

                    <Col sm={3} className="fw-bold text-info">
                        계약상태
                    </Col>

                    <Col sm={9}>

                        <Badge
                            bg={statusColor(
                                contract.contractStatus
                            )}
                        >

                            {statusText(
                                contract.contractStatus
                            )}

                        </Badge>

                    </Col>

                </Row>


                <Row className="mt-3">

                    <Col sm={3} className="fw-bold text-info">
                        체결일시
                    </Col>

                    <Col sm={9} className="text-secondary">

                        {
                            contract.signedTime
                            ?? "미체결"
                        }

                    </Col>

                </Row>


                <Row className="mt-4">

                    <Col className="text-end">

                        <Button
                            variant="outline-primary"
                            onClick={()=>
                                navigate(
                                    `/contract/detail/${contract.contractNo}`
                                )
                            }
                        >
                            상세보기
                        </Button>

                    </Col>

                </Row>

            </Col>

        </Row>

        ))}


        {/* 이전 화면 */}
        <Row className="mt-5 mb-5">

            <Col className="text-end">

                <Button
                    variant="secondary"
                    onClick={()=>navigate(-1)}
                >

                    <FaArrowLeft/>

                    <span className="ms-2">
                        이전 화면
                    </span>

                </Button>

            </Col>

        </Row>

    </>)
}