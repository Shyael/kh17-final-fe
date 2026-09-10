import Jumbotron from "@templates/Jumbotron";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Badge,
    Button,
    Col,
    Form,
    Row,
    Table
} from "react-bootstrap";

import {
    FaEraser,
    FaMagnifyingGlass
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";

import { apiClient } from "@utils/reaxios";

import { toast } from "react-toastify";

import PaginationBar
    from "@templates/PaginationBar";


const PAGE_SIZE = 10;


const initialCondition = {

    accountName: "",
    contractStart: "",
    contractEnd: "",
    employeeStatus: ""

};


export default function ContractList() {


    const navigate =
            useNavigate();


    // =========================
    // 검색창 입력값
    // =========================

    const [condition, setCondition] =
            useState({
                ...initialCondition
            });


    // =========================
    // 실제 서버 검색조건
    //
    // 입력할 때마다 조회되는 것을 막기 위해
    // condition과 분리
    // =========================

    const [searchCondition, setSearchCondition] =
            useState({
                ...initialCondition
            });


    // =========================
    // 목록
    // =========================

    const [contractList, setContractList] =
            useState([]);


    // =========================
    // 현재 페이지
    // =========================

    const [page, setPage] =
            useState(1);


    // =========================
    // 페이지 정보
    // =========================

    const [pageInfo, setPageInfo] =
            useState({

                totalCount: 0,
                totalPages: 0,

                startBlock: 0,
                endBlock: 0,

                prev: false,
                next: false

            });


    // =========================
    // 로딩
    // =========================

    const [loading, setLoading] =
            useState(false);


    // =========================
    // 검색조건 입력
    // =========================

    const changeCondition =
            useCallback(e => {


        const {
            name,
            value
        } = e.target;


        setCondition(prev => ({

            ...prev,

            [name]: value

        }));


    }, []);


    // =========================
    // 계약 목록 조회
    // =========================

    const loadData =
            useCallback(async () => {


        try {


            setLoading(true);


            const params = {

                page: page,

                size: PAGE_SIZE

            };


            // =========================
            // 빈 검색조건은 전송하지 않음
            // =========================

            if (searchCondition.accountName !== "") {

                params.accountName =
                        searchCondition.accountName;

            }


            if (searchCondition.contractStart !== "") {

                params.contractStart =
                        searchCondition.contractStart;

            }


            if (searchCondition.contractEnd !== "") {

                params.contractEnd =
                        searchCondition.contractEnd;

            }


            if (searchCondition.employeeStatus !== "") {

                params.employeeStatus =
                        searchCondition.employeeStatus;

            }


            const { data } =
                    await apiClient.get(

                        "/employee/admin/contract/contractList",

                        {
                            params
                        }

                    );


            // =========================
            // 목록
            // =========================

            setContractList(
                    data.list ?? []
            );


            // =========================
            // 페이지 정보
            // =========================

            setPageInfo({

                totalCount:
                        data.totalCount ?? 0,

                totalPages:
                        data.totalPages ?? 0,

                startBlock:
                        data.startBlock ?? 0,

                endBlock:
                        data.endBlock ?? 0,

                prev:
                        data.prev ?? false,

                next:
                        data.next ?? false

            });


            // =========================
            // 서버가 페이지를 보정했다면 반영
            // =========================

            if (
                data.page !== undefined
                &&
                data.page !== null
                &&
                data.page !== page
            ) {


                setPage(
                        data.page
                );


            }


        }
        catch(e) {


            console.error(e);


            toast.error(

                e?.response?.data?.message
                ??
                "근로계약 목록을 불러오지 못했습니다"

            );


            setContractList([]);


            setPageInfo({

                totalCount: 0,

                totalPages: 0,

                startBlock: 0,

                endBlock: 0,

                prev: false,

                next: false

            });


        }
        finally {


            setLoading(false);


        }


    }, [

        page,

        searchCondition

    ]);


    // =========================
    // 페이지 / 검색조건 변경 시 조회
    // =========================

    useEffect(() => {


        loadData();


    }, [loadData]);


    // =========================
    // 검색 실행
    // =========================

    const sendSearch =
            useCallback(e => {


        e.preventDefault();


        // 검색하면 항상 1페이지부터
        setPage(1);


        setSearchCondition({

            ...condition

        });


    }, [condition]);


    // =========================
    // 검색조건 초기화
    // =========================

    const resetSearch =
            useCallback(() => {


        setCondition({

            ...initialCondition

        });


        setPage(1);


        setSearchCondition({

            ...initialCondition

        });


    }, []);


    // =========================
    // 계약 상태 한글
    // =========================

    const statusText =
            useCallback(status => {


        if (status === "pending") {

            return "서명 대기";

        }


        if (status === "scheduled") {

            return "시작 예정";

        }


        if (status === "active") {

            return "진행 중";

        }


        if (status === "ended") {

            return "종료";

        }


        return status;


    }, []);


    // =========================
    // 계약 상태 색상
    // =========================

    const statusColor =
            useCallback(status => {


        if (status === "pending") {

            return "warning";

        }


        if (status === "scheduled") {

            return "info";

        }


        if (status === "active") {

            return "success";

        }


        if (status === "ended") {

            return "secondary";

        }


        return "dark";


    }, []);


    // =========================
    // 임금형태 한글
    // =========================

    const wageTypeText =
            useCallback(wageType => {


        if (wageType === "monthly") {

            return "월급";

        }


        if (wageType === "hourly") {

            return "시급";

        }


        if (wageType === "daily") {

            return "일급";

        }


        return wageType;


    }, []);


    // =========================
    // 주휴일 한글
    // =========================

    const weeklyHolidayDayText =
            useCallback(day => {


        if (
            day === null
            ||
            day === undefined
        ) {

            return "-";

        }


        if (day === "MONDAY") {

            return "월";

        }


        if (day === "TUESDAY") {

            return "화";

        }


        if (day === "WEDNESDAY") {

            return "수";

        }


        if (day === "THURSDAY") {

            return "목";

        }


        if (day === "FRIDAY") {

            return "금";

        }


        if (day === "SATURDAY") {

            return "토";

        }


        if (day === "SUNDAY") {

            return "일";

        }


        return day;


    }, []);


    // =========================
    // 날짜 출력
    // =========================

    const toDate =
            useCallback(value => {


        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return "-";

        }


        return value.substring(
                0,
                10
        );


    }, []);


    // =========================
    // 계약 종료일 출력
    // =========================

    const contractEndText =
            useCallback(value => {


        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return "기간의 정함 없음";

        }


        return value.substring(
                0,
                10
        );


    }, []);


    // =========================
    // 금액 출력
    // =========================

    const formatMoney =
            useCallback(value => {


        if (
            value === null
            ||
            value === undefined
        ) {

            return "-";

        }


        const money =
                Number(value);


        if (Number.isNaN(money)) {

            return value;

        }


        return money.toLocaleString();


    }, []);


    return (
        <>

            <Jumbotron
                title="근로계약 목록"
                content="직원 및 계약기간을 기준으로 근로계약을 조회합니다"
            />


            {/* =========================
                검색조건
            ========================= */}

            <Form
                onSubmit={sendSearch}
                className="mt-5"
            >


                <Row className="g-3">


                    {/* 이름 */}

                    <Col md={3}>

                        <Form.Label>
                            직원 이름
                        </Form.Label>

                        <Form.Control
                            type="text"
                            name="accountName"
                            value={condition.accountName}
                            onChange={changeCondition}
                            placeholder="이름 입력"
                        />

                    </Col>


                    {/* 계약 시작일 */}

                    <Col md={3}>

                        <Form.Label>
                            계약 시작일
                        </Form.Label>

                        <Form.Control
                            type="date"
                            name="contractStart"
                            value={condition.contractStart}
                            onChange={changeCondition}
                        />

                    </Col>


                    {/* 계약 종료일 */}

                    <Col md={3}>

                        <Form.Label>
                            계약 종료일
                        </Form.Label>

                        <Form.Control
                            type="date"
                            name="contractEnd"
                            value={condition.contractEnd}
                            onChange={changeCondition}
                        />

                    </Col>


                    {/* 직원 상태 */}

                    <Col md={3}>

                        <Form.Label>
                            직원 상태
                        </Form.Label>

                        <Form.Select
                            name="employeeStatus"
                            value={condition.employeeStatus}
                            onChange={changeCondition}
                        >

                            <option value="">
                                전체
                            </option>

                            <option value="대기">
                                대기
                            </option>

                            <option value="재직">
                                재직
                            </option>

                            <option value="퇴사">
                                퇴사
                            </option>

                        </Form.Select>

                    </Col>


                </Row>


                {/* 검색 버튼 */}

                <Row className="mt-4">


                    <Col className="text-end">


                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={resetSearch}
                            disabled={loading}
                        >

                            <FaEraser/>

                            <span className="ms-2">
                                초기화
                            </span>

                        </Button>


                        <Button
                            type="submit"
                            variant="primary"
                            className="ms-2"
                            disabled={loading}
                        >

                            <FaMagnifyingGlass/>

                            <span className="ms-2">
                                검색
                            </span>

                        </Button>


                    </Col>


                </Row>


            </Form>


            {/* =========================
                검색결과 정보
            ========================= */}

            <Row className="mt-5">


                <Col>


                    <h4 className="fw-bold">

                        근로계약 조회 결과

                    </h4>


                </Col>


                <Col className="text-end text-secondary">


                    총{" "}

                    <span className="fw-bold text-dark">

                        {pageInfo.totalCount}

                    </span>

                    건


                </Col>


            </Row>


            {/* =========================
                계약 목록
            ========================= */}

            <Row className="mt-3">


                <Col>


                    <div className="table-responsive">


                        <Table
                            hover
                            bordered
                            className="align-middle text-center"
                        >


                            <thead className="table-light">


                                <tr>


                                    <th>
                                        계약번호
                                    </th>


                                    <th>
                                        직원번호
                                    </th>


                                    <th>
                                        직원명
                                    </th>


                                    <th>
                                        임금형태
                                    </th>


                                    <th>
                                        기본임금
                                    </th>


                                    <th>
                                        계약 시작일
                                    </th>


                                    <th>
                                        계약 종료일
                                    </th>


                                    <th>
                                        주휴일
                                    </th>


                                    <th>
                                        계약상태
                                    </th>


                                    <th>
                                        체결일
                                    </th>


                                    <th>
                                        관리
                                    </th>


                                </tr>


                            </thead>


                            <tbody>


                                {/* =========================
                                    로딩
                                ========================= */}

                                {loading === true && (


                                    <tr>


                                        <td
                                            colSpan={11}
                                            className="py-5 text-secondary"
                                        >

                                            근로계약 목록을
                                            불러오는 중입니다

                                        </td>


                                    </tr>


                                )}


                                {/* =========================
                                    검색 결과 없음
                                ========================= */}

                                {
                                    loading === false
                                    &&
                                    contractList.length === 0
                                    &&
                                    (


                                        <tr>


                                            <td
                                                colSpan={11}
                                                className="py-5 text-secondary"
                                            >

                                                검색 조건에 해당하는
                                                근로계약이 없습니다

                                            </td>


                                        </tr>


                                    )
                                }


                                {/* =========================
                                    계약 목록
                                ========================= */}

                                {
                                    loading === false
                                    &&
                                    contractList.map(
                                        contract => (


                                            <tr
                                                key={contract.contractNo}
                                            >


                                                <td>

                                                    {contract.contractNo}

                                                </td>


                                                <td>

                                                    {contract.employeeNo}

                                                </td>


                                                <td>

                                                    {
                                                        contract.accountName
                                                        ??
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        wageTypeText(
                                                            contract.wageType
                                                        )
                                                    }

                                                </td>


                                                <td className="text-end">

                                                    {
                                                        formatMoney(
                                                            contract.baseWage
                                                        )
                                                    }원

                                                </td>


                                                <td>

                                                    {
                                                        toDate(
                                                            contract.contractStart
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        contractEndText(
                                                            contract.contractEnd
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        weeklyHolidayDayText(
                                                            contract.weeklyHolidayDay
                                                        )
                                                    }

                                                </td>


                                                <td>


                                                    <Badge
                                                        bg={
                                                            statusColor(
                                                                contract.contractStatus
                                                            )
                                                        }
                                                    >

                                                        {
                                                            statusText(
                                                                contract.contractStatus
                                                            )
                                                        }

                                                    </Badge>


                                                </td>


                                                <td>

                                                    {
                                                        contract.signedTime
                                                        ?
                                                        toDate(
                                                            contract.signedTime
                                                        )
                                                        :
                                                        "미체결"
                                                    }

                                                </td>


                                                <td>


                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/contract/detail/${contract.contractNo}`
                                                            )
                                                        }
                                                    >

                                                        상세보기

                                                    </Button>


                                                </td>


                                            </tr>


                                        )
                                    )
                                }


                            </tbody>


                        </Table>


                    </div>


                </Col>


            </Row>


            {/* =========================
                공용 페이지네이션
            ========================= */}

            <Row className="mb-5">


                <Col>


                    <PaginationBar
                        page={page}
                        totalPages={pageInfo.totalPages}
                        startBlock={pageInfo.startBlock}
                        endBlock={pageInfo.endBlock}
                        prev={pageInfo.prev}
                        next={pageInfo.next}
                        onChange={setPage}
                    />


                </Col>


            </Row>


        </>
    );

}