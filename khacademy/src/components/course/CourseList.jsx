import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";
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
                    <Col md={4}>
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

                    {/* 학년 */}
                    <Col md={2}>
                        <Form.Label>학년</Form.Label>
                        <Form.Select
                            name="gradeNo"
                            value={search.gradeNo}
                            onChange={changeSearchValue}
                        >
                            <option value="">전체</option>
                            <option value="1">1학년</option>
                            <option value="2">2학년</option>
                            <option value="3">3학년</option>
                            <option value="4">4학년</option>
                            <option value="5">5학년</option>
                            <option value="6">6학년</option>
                        </Form.Select>
                    </Col>

                    {/* 상태 */}
                    <Col md={3}>
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

                {/* 검색 / 초기화 버튼 */}
                <Row>
                    <Col className="text-end">
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
                        pageData.list.map(course => (
                            <tr key={course.courseNo}>
                                <td>{course.courseNo}</td>
                                {/* courseTitle -> courseTitle 수정 */}
                                <td className="text-start">{course.courseTitle}</td>
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
                    <Button
                        variant="outline-secondary"
                        className="me-1"
                        disabled={!pageData.prev}
                        onClick={() => changePage(pageData.startBlock - 1)}
                    >
                        이전
                    </Button>

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

                    <Button
                        variant="outline-secondary"
                        disabled={!pageData.next}
                        onClick={() => changePage(pageData.endBlock + 1)}
                    >
                        다음
                    </Button>
                </div>
            )}
        </>
    );
}