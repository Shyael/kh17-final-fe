import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Form,
    InputGroup,
    Table,
    Badge,
    Button
} from "react-bootstrap";

import {
    FaMagnifyingGlass
} from "react-icons/fa6";

import {
    useNavigate
} from "react-router-dom";

import {
    apiClient
} from "@utils/reaxios";

import PaginationBar
    from "@templates/PaginationBar";

import "@templates/searchBar.css";


const PAGE_SIZE = 10;


export default function EmployeeSearch() {

    // =========================================================
    // navigate
    // =========================================================

    const navigate =
        useNavigate();


    // =========================================================
    // 검색 입력값
    // =========================================================

    const [employeeType, setEmployeeType] =
        useState("");


    const [accountName, setAccountName] =
        useState("");


    // =========================================================
    // 실제 조회 파라미터
    //
    // 입력값과 조회조건을 분리
    //
    // 검색 버튼을 눌렀을 때만
    // accountName / employeeType 반영
    // =========================================================

    const [params, setParams] =
        useState({

            page: 1,

            accountName: "",

            employeeType: ""

        });


    // =========================================================
    // loading
    // =========================================================

    const [loading, setLoading] =
        useState(false);


    // =========================================================
    // PageResponseVO
    // =========================================================

    const [pageResponse, setPageResponse] =
        useState({

            list: [],

            totalCount: 0,

            page: 1,

            size: PAGE_SIZE,

            totalPages: 0,

            startBlock: 1,

            endBlock: 0,

            prev: false,

            next: false

        });


    // =========================================================
    // 직원 조회
    // =========================================================

    const loadEmployee =
        useCallback(
            async () => {

                try {

                    setLoading(
                        true
                    );


                    const response =
                        await apiClient.get(
                            "/employee/worker/search",
                            {
                                params: {

                                    page:
                                        params.page,

                                    size:
                                        PAGE_SIZE,

                                    accountName:
                                        params.accountName
                                            || undefined,

                                    employeeType:
                                        params.employeeType
                                            || undefined

                                }
                            }
                        );


                    setPageResponse(
                        response.data
                    );

                }
                catch (err) {

                    console.error(
                        "직원 검색 실패",
                        err
                    );


                    setPageResponse({

                        list: [],

                        totalCount: 0,

                        page: 1,

                        size: PAGE_SIZE,

                        totalPages: 0,

                        startBlock: 1,

                        endBlock: 0,

                        prev: false,

                        next: false

                    });

                }
                finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                params
            ]
        );


    // =========================================================
    // 조회
    // =========================================================

    useEffect(
        () => {

            loadEmployee();

        },
        [
            loadEmployee
        ]
    );


    // =========================================================
    // 검색 실행
    //
    // 검색 조건이 변경되면
    // 무조건 1페이지부터
    // =========================================================

    const searchEmployee =
        useCallback(
            e => {

                e?.preventDefault();


                setParams(
                    {
                        page: 1,

                        accountName:
                            accountName.trim(),

                        employeeType:
                            employeeType
                    }
                );

            },
            [
                accountName,
                employeeType
            ]
        );


    // =========================================================
    // 페이지 이동
    // =========================================================

    const handlePageChange =
        useCallback(
            page => {

                setParams(
                    prev => ({

                        ...prev,

                        page

                    })
                );

            },
            []
        );


    // =========================================================
    // 직원 상태 Badge
    // =========================================================

    const employeeStatusColor =
        status => {

            switch (status) {

                case "재직":
                    return "success";

                case "대기":
                    return "secondary";

                case "휴직":
                    return "warning";

                case "종료":
                    return "danger";

                case "퇴사":
                    return "danger";

                default:
                    return "secondary";

            }

        };


    // =========================================================
    // 목록
    // =========================================================

    const employeeList =
        pageResponse.list
        ?? [];


    return (

        <div className="p-3">


            {/* =====================================================
                검색 영역
            ===================================================== */}

            <Form
                onSubmit={
                    searchEmployee
                }
                className="employee-search-wrap"
            >


                <Form.Select
                    className="employee-type-select"
                    value={
                        employeeType
                    }
                    onChange={
                        e =>
                            setEmployeeType(
                                e.target.value
                            )
                    }
                >

                    <option value="">
                        전체
                    </option>

                    <option value="데스크">
                        데스크
                    </option>

                    <option value="강사">
                        강사
                    </option>

                </Form.Select>


                <InputGroup className="gemini-search">

                    <InputGroup.Text
                        className="gemini-search-icon"
                    >

                        <FaMagnifyingGlass />

                    </InputGroup.Text>


                    <Form.Control
                        type="text"
                        value={
                            accountName
                        }
                        onChange={
                            e =>
                                setAccountName(
                                    e.target.value
                                )
                        }
                        placeholder="직원 이름을 검색하세요"
                        className="gemini-search-input"
                    />

                </InputGroup>


                <Button
                    type="submit"
                    variant="primary"
                    className="employee-search-button"
                    disabled={
                        loading
                    }
                >

                    {
                        loading
                            ? "검색 중..."
                            : "검색"
                    }

                </Button>

            </Form>


            {/* =====================================================
                검색 결과 개수
            ===================================================== */}

            <div className="mt-3">

                총{" "}
                <strong>
                    {
                        pageResponse.totalCount
                    }
                </strong>
                명의 직원

            </div>


            {/* =====================================================
                검색 결과
            ===================================================== */}

            <div className="mt-3">


                <Table
                    hover
                    responsive
                    className="kh-table align-middle"
                >


                    <thead>

                        <tr>

                            <th>
                                직원번호
                            </th>

                            <th>
                                이름
                            </th>

                            <th>
                                직원구분
                            </th>

                            <th>
                                연락처
                            </th>

                            <th>
                                이메일
                            </th>

                            <th>
                                상태
                            </th>

                            <th>
                                최초 출근일
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {
                            loading
                                ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="
                                                text-center
                                                py-5
                                            "
                                        >

                                            조회 중...

                                        </td>

                                    </tr>

                                )
                                : employeeList.length
                                === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                className="
                                                    text-center
                                                    py-5
                                                    text-muted
                                                "
                                            >

                                                조회된 직원이 없습니다.

                                            </td>

                                        </tr>

                                    )
                                    : (

                                        employeeList.map(
                                            employee => (

                                                <tr
                                                    key={
                                                        employee.employeeNo
                                                    }
                                                    style={{
                                                        cursor:
                                                            "pointer"
                                                    }}
                                                    onClick={
                                                        () =>
                                                            navigate(
                                                                `/employee/search/detail/${employee.employeeNo}`
                                                            )
                                                    }
                                                >


                                                    <td>

                                                        {
                                                            employee.employeeNo
                                                        }

                                                    </td>


                                                    <td>

                                                        <strong>

                                                            {
                                                                employee.accountName
                                                            }

                                                        </strong>

                                                    </td>


                                                    <td>

                                                        {
                                                            employee.employeeType
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            employee.accountPhone
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            employee.accountId
                                                        }

                                                    </td>


                                                    <td>

                                                        <Badge
                                                            bg={
                                                                employeeStatusColor(
                                                                    employee.employeeStatus
                                                                )
                                                            }
                                                        >

                                                            {
                                                                employee.employeeStatus
                                                            }

                                                        </Badge>

                                                    </td>


                                                    <td>

                                                        {
                                                            employee.employeeHtime
                                                                ? new Date(
                                                                    employee.employeeHtime
                                                                ).toLocaleDateString()
                                                                : "-"
                                                        }

                                                    </td>


                                                </tr>

                                            )
                                        )

                                    )
                        }


                    </tbody>


                </Table>


            </div>


            {/* =====================================================
                페이지네이션
            ===================================================== */}

            <PaginationBar
                page={
                    pageResponse.page
                }
                totalPages={
                    pageResponse.totalPages
                }
                startBlock={
                    pageResponse.startBlock
                }
                endBlock={
                    pageResponse.endBlock
                }
                prev={
                    pageResponse.prev
                }
                next={
                    pageResponse.next
                }
                onChange={
                    handlePageChange
                }
            />


        </div>

    );

}