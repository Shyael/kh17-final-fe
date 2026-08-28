import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Button,
    Col,
    Container,
    Form,
    Row,
    Spinner
} from "react-bootstrap";

import {
    FaFilePen
} from "react-icons/fa6";

import { toast } from "react-toastify";

import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";


export default function ContractEditBeforeSigned() {

    // Router
    const { contractNo } = useParams();
    const navigate = useNavigate();


    // state
    const [contract, setContract] = useState({
        contractNo: contractNo,
        wageType: "",
        baseWage: "",
        dailyWorkHours: "",
        weeklyWorkHours: "",
        contractStart: "",
        contractEnd: "",
        payday: "",
        contractContent: ""
    });


    const [result, setResult] = useState({
        contractStart: "",
        contractEnd: "",
        dailyWorkHours: "",
        weeklyWorkHours: ""
    });


    const [loading, setLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);


    // 날짜 변환
    // 서버 Timestamp → input type="date"
    const toDateInput = useCallback(value => {

        if (value == null)
            return "";

        return value.substring(0, 10);

    }, []);


    // 기존 계약 조회
    const loadData = useCallback(async () => {

        try {

            setLoading(true);

            const { data } = await apiClient.get(
                `/contract/detail/${contractNo}`
            );


            setContract({
                contractNo:
                    data.contractNo,

                wageType:
                    data.wageType ?? "",

                baseWage:
                    data.baseWage ?? "",

                dailyWorkHours:
                    data.dailyWorkHours ?? "",

                weeklyWorkHours:
                    data.weeklyWorkHours ?? "",

                contractStart:
                    toDateInput(
                        data.contractStart
                    ),

                contractEnd:
                    toDateInput(
                        data.contractEnd
                    ),

                payday:
                    data.payday ?? "",

                contractContent:
                    data.contractContent ?? ""
            });

        }
        catch (error) {

            toast.error(
                 "근로계약 조회 중 오류가 발생했습니다"
            );

            

        }
        finally {

            setLoading(false);

        }

    }, [
        contractNo,
       
        toDateInput
    ]);


    useEffect(() => {
        loadData();
    }, [loadData]);


    // 일반 입력
    const changeStringValue = useCallback(e => {

        const { name, value } = e.target;

        setContract(prev => ({
            ...prev,
            [name]: value
        }));

    }, []);


    // 숫자 입력
    const changeNumericValue = useCallback(e => {

        const { name, value } = e.target;

        const onlyNumber =
            value.replace(/[^0-9.]+/g, "");

        setContract(prev => ({
            ...prev,
            [name]: onlyNumber
        }));

    }, []);


    // 계약기간 검사
    useEffect(() => {

        // 시작일 또는 종료일이 없으면 비교 안 함
        // 종료일 null 허용
        if (
            contract.contractStart === ""
            || contract.contractEnd === ""
        ) {

            setResult(prev => ({
                ...prev,
                contractStart: "",
                contractEnd: ""
            }));

            return;
        }


        if (
            contract.contractStart
            > contract.contractEnd
        ) {

            setResult(prev => ({
                ...prev,
                contractStart:
                    "is-invalid",

                contractEnd:
                    "is-invalid"
            }));

        }
        else {

            setResult(prev => ({
                ...prev,
                contractStart:
                    "is-valid",

                contractEnd:
                    "is-valid"
            }));

        }

    }, [
        contract.contractStart,
        contract.contractEnd
    ]);


    // 근로시간 검사
    const validateWorkHours =
        useCallback(() => {

            const daily =
                
                    contract.dailyWorkHours
                ;

            const weekly =
                
                    contract.weeklyWorkHours
                ;


            if (
                contract.dailyWorkHours === ""
                || contract.weeklyWorkHours === ""
            ) {

                setResult(prev => ({
                    ...prev,
                    dailyWorkHours: "",
                    weeklyWorkHours: ""
                }));

                return false;
            }


            if (
                daily <= 0
                || weekly <= 0
                || daily > weekly
            ) {

                setResult(prev => ({
                    ...prev,
                    dailyWorkHours:
                        "is-invalid",

                    weeklyWorkHours:
                        "is-invalid"
                }));

                return false;
            }


            setResult(prev => ({
                ...prev,
                dailyWorkHours:
                    "is-valid",

                weeklyWorkHours:
                    "is-valid"
            }));


            return true;

        }, [
            contract.dailyWorkHours,
            contract.weeklyWorkHours
        ]);


    // 전체 유효성 검사
    const allValid = useMemo(() => {

        const daily =
            
                contract.dailyWorkHours
            ;

        const weekly =
            
                contract.weeklyWorkHours
        ;


        const validDate =
            contract.contractEnd === ""
            || contract.contractStart
            <= contract.contractEnd;


        return contract.wageType !== ""
            && contract.baseWage !== ""
            && contract.dailyWorkHours !== ""
            && contract.weeklyWorkHours !== ""
            && contract.contractStart !== ""
            && contract.payday !== ""
            && contract.contractContent !== ""
            && daily > 0
            && weekly > 0
            && daily <= weekly
            && validDate;

    }, [contract]);


    // 수정 요청
    const sendData =
        useCallback(async e => {

            e.preventDefault();


            if (
                submitting
                || !allValid
            )
                return;


            try {

                setSubmitting(true);


                const request = {

                    // RequestVO에 번호 유지
                    contractNo:
                        contractNo,

                    wageType:
                        contract.wageType,

                    baseWage:
                        
                            contract.baseWage
                        ,

                    dailyWorkHours:
                        
                            contract.dailyWorkHours
                        ,

                    weeklyWorkHours:
                        
                            contract.weeklyWorkHours
                        ,

                    contractStart:
                        contract.contractStart,

                    contractEnd:
                        contract.contractEnd === ""
                            ? null
                            : contract.contractEnd,

                    payday:
                        
                            contract.payday
                        ,

                    contractContent:
                        contract.contractContent
                };


                await apiClient.patch(
                    `/contract/before/${contractNo}`,
                    request
                );

                toast.success(
                    "근로계약이 수정되었습니다"
                );


                navigate(
                    `/contract/detail/${data.contractNo}`
                );

            }
            catch (error) {

                toast.error(
                    error?.response?.data?.message
                    ?? "근로계약 수정 중 오류가 발생했습니다"
                );

            }
            finally {

                setSubmitting(false);

            }

        }, [
            contractNo,
            contract,
            allValid,
            submitting,
            navigate
        ]);


    if (loading) {

        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );

    }


    return (
        <>
            <Jumbotron
                title="근로계약 수정"
                content="서명 전 근로계약 내용을 수정합니다"
            />


            <Container className="my-5">

                <Form onSubmit={sendData}>


                    {/* 제목 */}
                    <div className="text-center my-5">

                        <h2 className="fw-bold">
                            근 로 계 약 서
                        </h2>

                        <div className="text-muted mt-2">
                            계약번호 {contract.contractNo}
                        </div>

                    </div>


                    {/* 1. 근로계약기간 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            1. 근로계약기간
                        </h5>


                        <Row className="align-items-center">

                            <Col md={5}>

                                <Form.Control
                                    type="date"
                                    name="contractStart"
                                    value={
                                        contract.contractStart
                                    }
                                    onChange={
                                        changeStringValue
                                    }
                                    className={
                                        result.contractStart
                                    }
                                />

                                <div className="invalid-feedback">
                                    계약 시작일은 종료일보다 늦을 수 없습니다
                                </div>

                            </Col>


                            <Col
                                md={2}
                                className="text-center"
                            >
                                부터
                            </Col>


                            <Col md={5}>

                                <Form.Control
                                    type="date"
                                    name="contractEnd"
                                    value={
                                        contract.contractEnd
                                    }
                                    onChange={
                                        changeStringValue
                                    }
                                    className={
                                        result.contractEnd
                                    }
                                />

                                <div className="invalid-feedback">
                                    계약 종료일은 시작일보다 빠를 수 없습니다
                                </div>

                                <Form.Text>
                                    기간의 정함이 없는 경우 비워두세요
                                </Form.Text>

                            </Col>

                        </Row>

                    </section>


                    {/* 2. 임금 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            2. 임금
                        </h5>


                        <Row className="align-items-center mb-3">

                            <Col md={2}>
                                임금형태
                            </Col>


                            <Col md={4}>

                                <Form.Select
                                    name="wageType"
                                    value={
                                        contract.wageType
                                    }
                                    onChange={
                                        changeStringValue
                                    }
                                >

                                    <option value="monthly">
                                        월급
                                    </option>

                                    <option value="daily">
                                        일급
                                    </option>

                                    <option value="hourly">
                                        시급
                                    </option>

                                </Form.Select>

                            </Col>

                        </Row>


                        <Row className="align-items-center mb-3">

                            <Col md={2}>
                                기본임금
                            </Col>


                            <Col md={4}>

                                <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    name="baseWage"
                                    value={
                                        contract.baseWage
                                    }
                                    onChange={
                                        changeNumericValue
                                    }
                                />

                            </Col>


                            <Col md="auto">
                                원
                            </Col>

                        </Row>


                        <Row className="align-items-center">

                            <Col md={2}>
                                지급일
                            </Col>


                            <Col md="auto">
                                매월
                            </Col>


                            <Col md={2}>

                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={31}
                                    name="payday"
                                    value={
                                        contract.payday
                                    }
                                    onChange={
                                        changeNumericValue
                                    }
                                />

                            </Col>


                            <Col md="auto">
                                일
                            </Col>

                        </Row>

                    </section>


                    {/* 3. 소정근로시간 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            3. 소정근로시간
                        </h5>


                        <Row className="align-items-center mb-3">

                            <Col md={3}>
                                1일 소정근로시간
                            </Col>


                            <Col md={3}>

                                <Form.Control
                                    type="number"
                                    step="0.5"
                                    name="dailyWorkHours"
                                    value={
                                        contract.dailyWorkHours
                                    }
                                    onChange={
                                        changeNumericValue
                                    }
                                    onBlur={
                                        validateWorkHours
                                    }
                                    className={
                                        result.dailyWorkHours
                                    }
                                />

                                <div className="invalid-feedback">
                                    1일 소정근로시간은 1주 소정근로시간보다 클 수 없습니다
                                </div>

                            </Col>


                            <Col md="auto">
                                시간
                            </Col>

                        </Row>


                        <Row className="align-items-center">

                            <Col md={3}>
                                1주 소정근로시간
                            </Col>


                            <Col md={3}>

                                <Form.Control
                                    type="number"
                                    step="0.5"
                                    name="weeklyWorkHours"
                                    value={
                                        contract.weeklyWorkHours
                                    }
                                    onChange={
                                        changeNumericValue
                                    }
                                    onBlur={
                                        validateWorkHours
                                    }
                                    className={
                                        result.weeklyWorkHours
                                    }
                                />

                                <div className="invalid-feedback">
                                    1주 소정근로시간을 확인하세요
                                </div>

                            </Col>


                            <Col md="auto">
                                시간
                            </Col>

                        </Row>

                    </section>


                    {/* 4. 계약 내용 */}
                    <section className="mb-5">

                        <h5 className="fw-bold mb-4">
                            4. 계약 내용
                        </h5>


                        <Form.Control
                            as="textarea"
                            rows={10}
                            name="contractContent"
                            value={
                                contract.contractContent
                            }
                            onChange={
                                changeStringValue
                            }
                        />

                    </section>


                    {/* 버튼 */}
                    <div className="d-flex justify-content-end gap-2 mb-5">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            취소
                        </Button>


                        <Button
                            type="submit"
                            disabled={
                                !allValid
                                || submitting
                            }
                        >

                            {submitting ? (
                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    데이터 전송 중...
                                </>
                            ) : (
                                <>
                                    <FaFilePen className="me-2" />
                                    수정하기
                                </>
                            )}

                        </Button>

                    </div>

                </Form>

            </Container>
        </>
    );
}