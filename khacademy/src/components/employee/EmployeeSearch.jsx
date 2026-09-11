import { useState } from "react";
import {
    Form,
    InputGroup,
    Table,
    Badge,
    Button
} from "react-bootstrap";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { apiClient } from "@utils/reaxios";
import "@templates/searchBar.css";

export default function EmployeeSearch() {

    const navigate = useNavigate();

    const [employeeType, setEmployeeType] =
        useState("");

    const [accountName, setAccountName] =
        useState("");

    const [employeeList, setEmployeeList] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


    const searchEmployee = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await apiClient.get(
                "/admin/employee/search",
                {
                    params: {
                        accountName,
                        employeeType
                    }
                }
            );

            setEmployeeList(response.data);

        }
        catch (err) {

            console.error(err);

            setEmployeeList([]);

        }
        finally {

            setLoading(false);

        }

    };


    const employeeStatusColor = (status) => {

        switch (status) {

            case "재직":
                return "success";

            case "대기":
                return "secondary";

            case "휴직":
                return "warning";

            case "퇴사":
                return "danger";

            default:
                return "secondary";
        }

    };


    return (
        <div className="p-3">

            {/* 검색 영역 */}
            <Form
                onSubmit={searchEmployee}
                className="employee-search-wrap"
            >

                <Form.Select
                    className="employee-type-select"
                    value={employeeType}
                    onChange={(e) =>
                        setEmployeeType(e.target.value)
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
                        value={accountName}
                        onChange={(e) =>
                            setAccountName(e.target.value)
                        }
                        placeholder="직원 이름을 검색하세요"
                        className="gemini-search-input"
                    />

                </InputGroup>


                <Button
                    type="submit"
                    variant="primary"
                    className="employee-search-button"
                    disabled={loading}
                >
                    {loading ? "검색 중..." : "검색"}
                </Button>

            </Form>


            {/* 검색 결과 */}
            <div className="mt-4">

                <Table
                    hover
                    responsive
                    className="align-middle"
                >

                    <thead>
                        <tr>
                            <th>직원번호</th>
                            <th>이름</th>
                            <th>직원구분</th>
                            <th>연락처</th>
                            <th>이메일</th>
                            <th>상태</th>
                            <th>최초 출근일</th>
                        </tr>
                    </thead>


                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-5"
                                >
                                    조회 중...
                                </td>
                            </tr>

                        ) : employeeList.length === 0 ? (

                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-5 text-muted"
                                >
                                    조회된 직원이 없습니다.
                                </td>
                            </tr>

                        ) : (

                            employeeList.map(employee => (

                                <tr
                                    key={employee.employeeNo}
                                    style={{
                                        cursor: "pointer"
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/employee/search/detail/${employee.employeeNo}`
                                        )
                                    }
                                >

                                    <td>
                                        {employee.employeeNo}
                                    </td>

                                    <td>
                                        <strong>
                                            {employee.accountName}
                                        </strong>
                                    </td>

                                    <td>
                                        {employee.employeeType}
                                    </td>

                                    <td>
                                        {employee.accountPhone}
                                    </td>

                                    <td>
                                        {employee.accountId}
                                    </td>

                                    <td>
                                        <Badge
                                            bg={
                                                employeeStatusColor(
                                                    employee.employeeStatus
                                                )
                                            }
                                        >
                                            {employee.employeeStatus}
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

                            ))

                        )}

                    </tbody>

                </Table>

            </div>

        </div>
    );
}