import { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "@templates/searchBar.css";
export default function EmployeeSearchBar({
    onSearch
}) {

    const [employeeType, setEmployeeType] =
            useState("");

    const [keyword, setKeyword] =
            useState("");


    const submitSearch = e => {

        e.preventDefault();

        onSearch?.({
            employeeType,
            keyword
        });

    };


    return (
        <Form
            onSubmit={submitSearch}
            className="employee-search-wrap"
        >

            {/* 직원 구분 */}
            <Form.Select
                className="employee-type-select"
                value={employeeType}
                onChange={e =>
                    setEmployeeType(e.target.value)
                }
            >

                <option value="">
                    전체
                </option>

                <option value="DESK">
                    데스크
                </option>

                <option value="INSTRUCTOR">
                    강사
                </option>

            </Form.Select>


            {/* 검색창 */}
            <InputGroup className="gemini-search">

                <InputGroup.Text
                    className="gemini-search-icon"
                >
                    <FaMagnifyingGlass />
                </InputGroup.Text>

                <Form.Control
                    type="text"
                    value={keyword}
                    onChange={e =>
                        setKeyword(e.target.value)
                    }
                    placeholder="직원 이름을 검색하세요"
                    className="gemini-search-input"
                />

            </InputGroup>

        </Form>
    );
}