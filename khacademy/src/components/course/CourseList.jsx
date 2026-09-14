import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- 추가
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { FaMagnifyingGlass, FaPlus, FaRotate } from "react-icons/fa6";
import Swal from "sweetalert2";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const initialSearchState = {
    courseTitle: "",
    courseSubject: "",
    gradeNo: "",
    courseStatus: "",
    page: 1,
    size: 20
};

export default function CourseList() {
    const navigate = useNavigate();
    // 검색 조건
    const [search, setSearch] = useState(initialSearchState);

    // PageResponseVO
    const [pageData, setPageData] = useState({
        list: [],
        totalCount: 0,
        page: 1,
        size: 20,
        totalPages: 0,
        startBlock: 1,
        endBlock: 1,
        prev: false,
        next: false
    });

    //학년 그룹
    const gradeGroups = {
        초등학교: [
            { gradeNo: 1, label: "초1" },
            { gradeNo: 2, label: "초2" },
            { gradeNo: 3, label: "초3" },
            { gradeNo: 4, label: "초4" },
            { gradeNo: 5, label: "초5" },
            { gradeNo: 6, label: "초6" }
        ],
        중학교: [
            { gradeNo: 7, label: "중1" },
            { gradeNo: 8, label: "중2" },
            { gradeNo: 9, label: "중3" },
        ],
        고등학교: [
            { gradeNo: 10, label: "고1" },
            { gradeNo: 11, label: "고2" },
            { gradeNo: 12, label: "고3" }
        ],
        일반: [{ gradeNo: 13, label: "일반" }]
    }
    const [selectedGradeGroup, setSelectedGradeGroup] = useState("");


    // 검색 조건 입력
    const changeSearchValue = useCallback((e) => {
        const { name, value } = e.target;
        setSearch(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 강좌 목록 조회
    const loadCourseList = useCallback(async (
        targetPage = 1,
        targetSize = search.size,
        customSearch = search
    ) => {
        try {
            const params = {
                courseTitle: customSearch.courseTitle || null,
                courseSubject: customSearch.courseSubject || null,
                gradeNo: customSearch.gradeNo === "" ? null : Number(customSearch.gradeNo),
                courseStatus: customSearch.courseStatus || null,
                page: targetPage,
                size: targetSize
            };

            const { data } = await apiClient.get(
                "/employee/course/list",
                { params }
            );

            setPageData(data);

            setSearch(prev => ({
                ...prev,
                page: data.page,
                size: data.size
            }));

        } catch (e) {
            console.error("강좌 목록 조회 오류:", e);
            await Swal.fire(
                "오류",
                "강좌 목록을 불러오지 못했습니다.",
                "error"
            );
        }
    }, [search]);

    // 최초 목록 조회
    useEffect(() => {
        loadCourseList(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 검색 실행 (무조건 1페이지부터)
    const searchCourse = useCallback(() => {
        loadCourseList(1, search.size);
    }, [loadCourseList, search.size]);

    // 검색 조건 초기화
    const resetSearch = useCallback(() => {
        setSearch(initialSearchState);
        // 초기화된 기본 조건 객체를 직접 넘겨 즉시 호출
        loadCourseList(1, initialSearchState.size, initialSearchState);
    }, [loadCourseList]);

    // 페이지 이동
    const changePage = useCallback((page) => {
        if (page < 1 || page > pageData.totalPages) {
            return;
        }
        loadCourseList(page, search.size);
    }, [pageData.totalPages, search.size, loadCourseList]);

    // 페이지당 개수 변경
    const changeSize = useCallback((e) => {
        const newSize = Number(e.target.value);
        setSearch(prev => ({ ...prev, size: newSize }));
        loadCourseList(1, newSize);
    }, [loadCourseList]);

    return (
        <>
            <Jumbotron
                title="강좌 목록"
                content="등록된 강좌를 조회합니다."
            />

            {/* 검색 영역 */}
            <div className="border rounded p-4 mt-4">
                <Row className="mb-3">
                    {/* 강좌명 */}
                    <Col md={5}>
                        <Form.Label>강좌명</Form.Label>
                        <Form.Control
                            type="text"
                            name="courseTitle"
                            value={search.courseTitle}
                            onChange={changeSearchValue}
                            placeholder="강좌명을 입력하세요"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchCourse();
                                }
                            }}
                        />
                    </Col>

                    {/* 과목 */}
                    <Col md={3}>
                        <Form.Label>과목</Form.Label>
                        <Form.Select
                            name="courseSubject"
                            value={search.courseSubject}
                            onChange={changeSearchValue}
                        >
                            <option value="">전체</option>
                            <option value="국어">국어</option>
                            <option value="영어">영어</option>
                            <option value="수학">수학</option>
                            <option value="과학">과학</option>
                            <option value="사회">사회</option>
                        </Form.Select>
                    </Col>

                    {/* 상태 */}
                    <Col md={4}>
                        <Form.Label>상태</Form.Label>
                        <Form.Select
                            name="courseStatus"
                            value={search.courseStatus}
                            onChange={changeSearchValue}
                        >
                            <option value="">전체</option>
                            <option value="모집중">모집중</option>
                            <option value="대기">대기</option>
                            <option value="진행중">진행중</option>
                            <option value="마감">마감</option>
                            <option value="종료">종료</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* 학년 - 별도 줄 */}
                <Row className="mb-3">
                    <Col>
                        <Form.Label>학년</Form.Label>

                        {/* 1차 학년 분류 */}
                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={
                                    selectedGradeGroup === ""
                                        ? "primary"
                                        : "outline-primary"
                                }
                                className="text-nowrap"
                                onClick={() => {
                                    setSelectedGradeGroup("");
                                    setSearch(prev => ({
                                        ...prev,
                                        gradeNo: ""
                                    }));
                                }}
                            >
                                전체
                            </Button>

                            {Object.keys(gradeGroups).map(group => (
                                <Button
                                    key={group}
                                    size="sm"
                                    variant={
                                        selectedGradeGroup === group
                                            ? "primary"
                                            : "outline-primary"
                                    }
                                    className="text-nowrap"
                                    onClick={() => {
                                        setSelectedGradeGroup(group);
                                        setSearch(prev => ({
                                            ...prev,
                                            gradeNo: ""
                                        }));
                                    }}
                                >
                                    {group}
                                </Button>
                            ))}
                        </div>

                        {/* 2차 세부 학년 */}
                        {selectedGradeGroup !== "" && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {gradeGroups[selectedGradeGroup].map(grade => (
                                    <Button
                                        key={grade.gradeNo}
                                        size="sm"
                                        className="text-nowrap"
                                        variant={
                                            String(search.gradeNo) ===
                                                String(grade.gradeNo)
                                                ? "primary"
                                                : "outline-secondary"
                                        }
                                        onClick={() =>
                                            setSearch(prev => ({
                                                ...prev,
                                                gradeNo: String(grade.gradeNo)
                                            }))
                                        }
                                    >
                                        {grade.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </Col>
                </Row>

                {/* 검색 / 초기화 버튼 */}
                <Row>
                    <Col className="d-flex justify-content-between align-items-center">
                        {/* 왼쪽: 강좌 등록 버튼 */}
                        <Button
                            variant="success"
                            onClick={() => navigate("/employee/course/create")} // 보통 등록 페이지는 insert/add 등을 사용합니다.
                        >
                            <FaPlus />
                            <span className="ms-2">강좌 등록</span>
                        </Button>

                        {/* 오른쪽: 초기화 및 검색 버튼 */}
                        <div>
                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={resetSearch}
                            >
                                <FaRotate />
                                <span className="ms-2">초기화</span>
                            </Button>

                            <Button
                                variant="primary"
                                onClick={searchCourse}
                            >
                                <FaMagnifyingGlass />
                                <span className="ms-2">검색</span>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* 목록 상단 카운트 및 Size 선택 */}
            <Row className="mt-4 align-items-center">
                <Col>
                    <span>
                        총 <strong>{pageData.totalCount}</strong> 개의 강좌
                    </span>
                </Col>

                <Col className="text-end">
                    <Form.Select
                        style={{ width: "120px", display: "inline-block" }}
                        value={search.size}
                        onChange={changeSize}
                    >
                        <option value="10">10개</option>
                        <option value="20">20개</option>
                        <option value="50">50개</option>
                        <option value="100">100개</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* 강좌 목록 테이블 */}
            {/* 강좌 목록 테이블 */}
            <Table
                bordered
                hover
                responsive
                className="mt-2 text-center align-middle"
            >
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>강좌명</th>
                        <th>과목</th>
                        <th>학년</th>
                        <th>강사</th>
                        <th>수강인원</th>
                        <th>수업시간</th>
                        <th>상태</th>
                    </tr>
                </thead>

                <tbody>
                    {pageData.list.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="py-5">
                                조회된 강좌가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        pageData.list.map((course, index) => (
                            <tr
                                key={course.courseNo}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/employee/course/detail/${course.courseNo}`)}
                            >
                                <td>{pageData.totalCount - ((pageData.page - 1) * pageData.size) - index}</td>
                                <td className="text-start fw-semibold text-primary">{course.courseTitle}</td>
                                <td>{course.courseSubject}</td>
                                <td>{course.gradeLevel}</td>
                                <td>{course.tutorName}</td>
                                <td>{course.courseCurrentCount} / {course.courseLimit}</td>
                                <td>{course.scheduleInfo || "-"}</td>
                                <td>{course.courseStatus}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* 페이지네이션 버튼 */}
            {pageData.totalPages > 0 && (
                <div className="d-flex justify-content-center mt-4">
                    {/* 이전 버튼 */}
                    {pageData.prev && (
                        <Button
                            variant="outline-secondary"
                            className="me-1"
                            disabled={!pageData.prev}
                            onClick={() => changePage(pageData.startBlock - 1)}
                        >
                            이전
                        </Button>
                    )}

                    {/* 페이지 번호 */}
                    {Array.from(
                        { length: pageData.endBlock - pageData.startBlock + 1 },
                        (_, index) => {
                            const pageNum = pageData.startBlock + index;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === pageData.page ? "primary" : "outline-primary"}
                                    className="me-1"
                                    onClick={() => changePage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        }
                    )}

                    {/* 다음 버튼 */}
                    {pageData.next && (
                        <Button
                            variant="outline-secondary"
                            disabled={!pageData.next}
                            onClick={() => changePage(pageData.endBlock + 1)}
                        >
                            다음
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}