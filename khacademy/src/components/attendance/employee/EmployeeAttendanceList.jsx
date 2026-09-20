import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row, Table, Badge } from "react-bootstrap";
import { FaMagnifyingGlass, FaRotate } from "react-icons/fa6";
import Swal from "sweetalert2";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

const initialSearchState = {
    courseNo: "",          // 선택된 강의 번호 (핵심)
    studentName: "",       // 학생명
    startDate: "",         // 날짜
    endDate: "",
    attendanceState: "",   // 출결 상태
    sessionStatus: ""
};

export default function EmployeeAttendanceList() {
    // 1. 진행 중인 강의 드롭다운 목록 State
    const [courses, setCourses] = useState([]);
    
    // 2. 검색 조건 State
    const [search, setSearch] = useState(initialSearchState);

    // 3. 출결 목록 결과 State
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);

    // [초기 로딩] 진행 중인 강의 셀렉트 박스 목록 가져오기
    useEffect(() => {
        const loadActiveCourses = async () => {
            try {
                // 프로젝트의 실제 강의 옵션 조회 URL로 지정해주세요.
                const { data } = await apiClient.get("/employee/attendance/active-courses");
                setCourses(data);
                
                // 만약 첫 번째 강의를 기본 선택하고 싶다면:
                // if (data && data.length > 0) {
                //     setSearch(prev => ({ ...prev, courseNo: data[0].courseNo }));
                // }
            } catch (e) {
                console.error("진행 중 강의 목록 로드 실패:", e);
            }
        };
        loadActiveCourses();
    }, []);

    // 검색 조건 변경
    const changeSearchValue = useCallback((e) => {
        const { name, value } = e.target;
        setSearch(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 출결 목록 조회 (POST /employee/attendance/list)
    const loadAttendanceList = useCallback(async (customSearch = search) => {
        setLoading(true);
        try {
            const payload = {
                courseNo: customSearch.courseNo ? Number(customSearch.courseNo) : null,
                studentName: customSearch.studentName || null,
                startDate: customSearch.startDate || null,
                endDate: customSearch.endDate || null,
                attendanceState: customSearch.attendanceState || null,
                sessionStatus: customSearch.sessionStatus || null
            };

            const { data } = await apiClient.post(
                "/employee/attendance/list",
                payload
            );

            setAttendanceList(data);
        } catch (e) {
            console.error("출결 목록 조회 오류:", e);
            await Swal.fire("오류", "출결 목록을 불러오지 못했습니다.", "error");
        } finally {
            setLoading(false);
        }
    }, [search]);

    // 강의 셀렉트 박스를 바꾸면 자동으로 해당 강의 기준 목록 새로고침
    const handleCourseChange = (e) => {
        const selectedNo = e.target.value;
        const nextSearch = {
            ...search,
            courseNo: selectedNo
        };
        setSearch(nextSearch);
        loadAttendanceList(nextSearch);
    };

    // 검색 버튼 클릭 (세부 조건 필터링 실행)
    const searchAttendance = useCallback(() => {
        loadAttendanceList();
    }, [loadAttendanceList]);

    // 필터 조건 초기화 (강의 선택은 유지할지 여부에 따라 조정 가능)
    const resetSearch = useCallback(() => {
        setSearch(initialSearchState);
        loadAttendanceList(initialSearchState);
    }, [loadAttendanceList]);

    // 날짜 포맷팅
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    // 출결 상태 배지
    const renderAttendanceBadge = (state) => {
        switch (state) {
            case "출석":
                return <Badge bg="success">출석</Badge>;
            case "지각":
                return <Badge bg="warning" text="dark">지각</Badge>;
            case "조퇴":
                return <Badge bg="danger">조퇴</Badge>;
            case "결석":
                return <Badge bg="dark">결석</Badge>;
            default:
                return <Badge bg="secondary">미출결</Badge>;
        }
    };

    return (
        <>
            <Jumbotron
                title="출결 관리"
                content="진행 중인 강의를 선택하고 수강생 출결 현황을 조회 및 필터링합니다."
            />

            {/* 필터 및 검색 바 */}
            <div className="border rounded p-4 mt-4 bg-light shadow-sm">
                {/* 1열: 강의 선택 (메인 드롭다운) */}
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">진행 중인 강의 선택</Form.Label>
                        <Form.Select
                            name="courseNo"
                            value={search.courseNo}
                            onChange={handleCourseChange}
                            className="form-select"
                        >
                            <option value="">-- 진행 중인 전체 강의 보기 --</option>
                            {courses.map(c => (
                                <option key={c.courseNo} value={c.courseNo}>
                                    [{c.courseNo}] {c.courseTitle}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold">출결 상태</Form.Label>
                        <Form.Select
                            name="attendanceState"
                            value={search.attendanceState}
                            onChange={changeSearchValue}
                        >
                            <option value="">전체 상태</option>
                            <option value="출석">출석</option>
                            <option value="지각">지각</option>
                            <option value="조퇴">조퇴</option>
                            <option value="결석">결석</option>
                            <option value="미출결">미출결</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold">세션 진행 상태</Form.Label>
                        <Form.Select
                            name="sessionStatus"
                            value={search.sessionStatus}
                            onChange={changeSearchValue}
                        >
                            <option value="">전체 세션</option>
                            <option value="진행중">진행중</option>
                            <option value="종료">종료</option>
                            <option value="취소">취소</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* 2열: 학생명 + 날짜 범위 필터 */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Label className="fw-bold">수강생 이름</Form.Label>
                        <Form.Control
                            type="text"
                            name="studentName"
                            value={search.studentName}
                            onChange={changeSearchValue}
                            placeholder="학생명 입력 (엔터)"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") searchAttendance();
                            }}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="fw-bold">시작일</Form.Label>
                        <Form.Control
                            type="date"
                            name="startDate"
                            value={search.startDate}
                            onChange={changeSearchValue}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="fw-bold">종료일</Form.Label>
                        <Form.Control
                            type="date"
                            name="endDate"
                            value={search.endDate}
                            onChange={changeSearchValue}
                        />
                    </Col>
                </Row>

                {/* 버튼 영역 */}
                <Row>
                    <Col className="d-flex justify-content-end">
                        <Button
                            variant="secondary"
                            className="me-2"
                            onClick={resetSearch}
                        >
                            <FaRotate className="me-1" /> 필터 초기화
                        </Button>
                        <Button
                            variant="primary"
                            onClick={searchAttendance}
                        >
                            <FaMagnifyingGlass className="me-1" /> 조건 검색
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* 결과 통계 영역 */}
            <Row className="mt-4 align-items-center">
                <Col>
                    <span>
                        총 <strong>{attendanceList.length}</strong> 건의 출결 기록
                    </span>
                </Col>
            </Row>

            {/* 목록 테이블 */}
            <Table
                hover
                responsive
                className="kh-table mt-2 text-center align-middle"
            >
                <thead>
                    <tr>
                        <th>출결번호</th>
                        <th>세션번호</th>
                        <th>강의명</th>
                        <th>과목</th>
                        <th>학생명(번호)</th>
                        <th>수업일시</th>
                        <th>세션상태</th>
                        <th>체크시간</th>
                        <th>출결상태</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="py-5">
                                출결 목록을 불러오는 중입니다...
                            </td>
                        </tr>
                    ) : attendanceList.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="py-5 text-muted">
                                조회된 출결 내역이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        attendanceList.map((item, index) => (
                            <tr key={item.attendanceNo || index}>
                                <td>{item.attendanceNo || "-"}</td>
                                <td>{item.sessionNo}</td>
                                <td className="text-start fw-semibold">{item.courseTitle}</td>
                                <td>{item.courseSubject}</td>
                                <td>
                                    {item.studentName ? `${item.studentName} (${item.studentNo})` : "-"}
                                </td>
                                <td>
                                    {formatDateTime(item.sessionStart)} ~{" "}
                                    {item.sessionEnd ? formatDateTime(item.sessionEnd).split(" ")[1] : ""}
                                </td>
                                <td>{item.sessionStatus}</td>
                                <td>{formatDateTime(item.attendanceAt)}</td>
                                <td>{renderAttendanceBadge(item.attendanceState)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </>
    );
}