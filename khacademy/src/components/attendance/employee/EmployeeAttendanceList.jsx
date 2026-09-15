import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Form, Button, Spinner, InputGroup } from "react-bootstrap";
import {
    FaArrowLeft,
    FaCalendarCheck,
    FaMagnifyingGlass,
    FaRotateRight
} from "react-icons/fa6";
import Swal from "sweetalert2";

import { apiClient } from "@utils/reaxios";
import { formatDateTime } from "@utils/format";
import Jumbotron from "@templates/Jumbotron";

export default function EmployeeAttendanceList() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // URL 파라미터에서 강좌 번호 획득 (?courseNo=...)
    const defaultCourseNo = searchParams.get("courseNo") || "";

    const [courseList, setCourseList] = useState([]);
    const [selectedCourseNo, setSelectedCourseNo] = useState(defaultCourseNo);
    const [sessionList, setSessionList] = useState([]);
    const [selectedSessionNo, setSelectedSessionNo] = useState("");
    
    // 백엔드 SessionAttendanceDetailVO 응답을 통째로 보관
    const [attendanceDetail, setAttendanceDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterState, setFilterState] = useState("ALL"); // ALL | 출석 | 지각 | 조퇴 | 결석 | 미출결

    // 1. 강좌 셀렉트 박스용 강좌 목록 로드
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { data } = await apiClient.get("/employee/course/list");
                const list = Array.isArray(data) ? data : data.list || [];
                setCourseList(list);
            } catch (e) {
                console.error("강좌 목록 로드 실패:", e);
            }
        };
        loadCourses();
    }, []);

    // 2. 강좌 선택 시 해당 강좌의 전체 세션(회차) 목록 로드
    const loadSessions = useCallback(async (cNo) => {
        if (!cNo) {
            setSessionList([]);
            setSelectedSessionNo("");
            setAttendanceDetail(null);
            return;
        }
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/employee/course/detail/${cNo}`);
            const sessions = data.sessionList || [];
            setSessionList(sessions);

            // 기본값으로 가장 최근 회차 세션 선택
            if (sessions.length > 0) {
                const lastSession = sessions[sessions.length - 1];
                setSelectedSessionNo(lastSession.sessionNo);
            } else {
                setSelectedSessionNo("");
                setAttendanceDetail(null);
            }
        } catch (e) {
            console.error("세션 목록 로드 실패:", e);
            Swal.fire("오류", "수업 회차 목록을 불러오지 못했습니다.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCourseNo) {
            loadSessions(selectedCourseNo);
        }
    }, [selectedCourseNo, loadSessions]);

    // 3. 특정 회차 세션의 출결 상세 데이터(SessionAttendanceDetailVO) 로드
    const loadAttendance = useCallback(async (sNo) => {
        if (!sNo) {
            setAttendanceDetail(null);
            return;
        }
        try {
            setLoading(true);
            // 백엔드의 @GetMapping("/session/{sessionNo}") 호출
            const { data } = await apiClient.get(`/employee/attendance/session/${sNo}`);
            setAttendanceDetail(data || null);
        } catch (e) {
            console.error("출결 데이터 로드 실패:", e);
            Swal.fire("오류", e.response?.data?.message || "출결 데이터를 불러오지 못했습니다.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSessionNo) {
            loadAttendance(selectedSessionNo);
        }
    }, [selectedSessionNo, loadAttendance]);

    // 4. 출결 상태 수동 정정 (AttendanceUpdateByAdminVO 규격에 맞춰 전송)
    const handleAttendanceChange = async (attendanceNo, newState) => {
        try {
            const { data } = await apiClient.patch(`/employee/attendance/${attendanceNo}`, {
                attendanceNo: attendanceNo,
                attendanceState: newState
            });
            await Swal.fire({
                icon: "success",
                title: "변경 완료",
                text: data || `출결 상태가 [${newState}](으)로 변경되었습니다.`,
                timer: 1200,
                showConfirmButton: false
            });
            // 변경 후 최신 데이터로 다시 갱신
            loadAttendance(selectedSessionNo);
        } catch (e) {
            Swal.fire("오류", e.response?.data?.message || "출결 변경 처리에 실패했습니다.", "error");
        }
    };

    // 현재 선택된 세션 정보
    const currentSession = sessionList.find(s => s.sessionNo === Number(selectedSessionNo));

    // 검색 및 상태 필터가 적용된 학생 목록
    const filteredStudentList = useMemo(() => {
        if (!attendanceDetail?.studentList) return [];
        return attendanceDetail.studentList.filter(item => {
            const matchesFilter = filterState === "ALL" || item.attendanceState === filterState;
            const matchesSearch =
                item.studentName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.studentPhone?.includes(searchKeyword) ||
                String(item.studentNo).includes(searchKeyword);
            return matchesFilter && matchesSearch;
        });
    }, [attendanceDetail, filterState, searchKeyword]);

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => (selectedCourseNo ? navigate(`/employee/course/detail/${selectedCourseNo}`) : navigate(-1))}
                >
                    <FaArrowLeft className="me-1" /> 강좌 상세로 돌아가기
                </Button>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => loadAttendance(selectedSessionNo)}
                    disabled={!selectedSessionNo || loading}
                >
                    <FaRotateRight className="me-1" /> 새로고침
                </Button>
            </div>

            <Jumbotron
                title="통합 출결 관리 대장"
                content="강좌 및 회차별 출결 현황을 조회하고 수강생 출결 상태를 수동 정정합니다."
            />

            {/* 강좌 및 회차 선택 필터 */}
            <Card className="shadow-sm border mb-4 mt-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">강좌 선택</Form.Label>
                                <Form.Select
                                    value={selectedCourseNo}
                                    onChange={(e) => setSelectedCourseNo(e.target.value)}
                                >
                                    <option value="">-- 강좌를 선택하세요 --</option>
                                    {courseList.map(c => (
                                        <option key={c.courseNo} value={c.courseNo}>
                                            [{c.courseNo}] {c.courseTitle} ({c.courseStatus})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">회차(수업 날짜) 선택</Form.Label>
                                <Form.Select
                                    value={selectedSessionNo}
                                    onChange={(e) => setSelectedSessionNo(e.target.value)}
                                    disabled={sessionList.length === 0}
                                >
                                    {sessionList.length === 0 ? (
                                        <option value="">등록된 세션 회차가 없습니다</option>
                                    ) : (
                                        sessionList.map((s, idx) => (
                                            <option key={s.sessionNo} value={s.sessionNo}>
                                                #{idx + 1}회차: {formatDateTime(s.sessionStart)} ({s.sessionStatus})
                                            </option>
                                        ))
                                    )}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* 백엔드 SessionAttendanceDetailVO에서 제공하는 출결 통계 카드 */}
            {attendanceDetail && (
                <Row className="g-2 text-center mb-4">
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-muted small">총원</div><div className="fs-5 fw-bold">{attendanceDetail.totalCount || 0}명</div></div></Col>
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-success small">출석</div><div className="fs-5 fw-bold text-success">{attendanceDetail.presentCount || 0}명</div></div></Col>
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-warning small">지각</div><div className="fs-5 fw-bold text-warning">{attendanceDetail.lateCount || 0}명</div></div></Col>
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-secondary small">조퇴</div><div className="fs-5 fw-bold">{attendanceDetail.earlyLeaveCount || 0}명</div></div></Col>
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-danger small">결석</div><div className="fs-5 fw-bold text-danger">{attendanceDetail.absentCount || 0}명</div></div></Col>
                    <Col xs={4} md={2}><div className="p-3 bg-white rounded border shadow-sm"><div className="text-muted small">미출결</div><div className="fs-5 fw-bold text-muted">{attendanceDetail.uncheckedCount || 0}명</div></div></Col>
                </Row>
            )}

            {/* 수강생 출결 상세 테이블 */}
            <Card className="shadow-sm border">
                <Card.Header className="bg-white py-3">
                    <Row className="align-items-center g-2">
                        <Col md={4}>
                            <h6 className="fw-bold mb-0">
                                <FaCalendarCheck className="me-1 text-primary" /> 수강생 출결 상세 명부
                            </h6>
                        </Col>
                        <Col md={8}>
                            <div className="d-flex justify-content-md-end gap-2 flex-wrap">
                                <Form.Select
                                    size="sm"
                                    style={{ width: "120px" }}
                                    value={filterState}
                                    onChange={(e) => setFilterState(e.target.value)}
                                >
                                    <option value="ALL">상태: 전체</option>
                                    <option value="출석">출석</option>
                                    <option value="지각">지각</option>
                                    <option value="조퇴">조퇴</option>
                                    <option value="결석">결석</option>
                                    <option value="미출결">미출결</option>
                                </Form.Select>

                                <InputGroup size="sm" style={{ width: "220px" }}>
                                    <Form.Control
                                        placeholder="이름, 학번, 연락처"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                    <InputGroup.Text><FaMagnifyingGlass /></InputGroup.Text>
                                </InputGroup>
                            </div>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-2 small">출결 명부를 조회 중입니다...</p>
                        </div>
                    ) : !selectedSessionNo ? (
                        <div className="text-center py-5 text-muted">
                            강좌와 회차를 선택하면 출결 명부가 표시됩니다.
                        </div>
                    ) : filteredStudentList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            조회된 수강생 출결 내역이 없습니다.
                        </div>
                    ) : (
                        <Table hover responsive className="kh-table text-center align-middle">
                            <thead>
                                <tr className="table-light text-secondary small">
                                    <th style={{ width: "60px" }}>No</th>
                                    <th style={{ width: "100px" }}>학번</th>
                                    <th>이름</th>
                                    <th>연락처</th>
                                    <th>태그 시각</th>
                                    <th style={{ width: "100px" }}>출결 상태</th>
                                    <th style={{ width: "140px" }}>수동 정정</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudentList.map((st, idx) => (
                                    <tr key={st.attendanceNo}>
                                        <td className="text-muted small">{idx + 1}</td>
                                        <td className="fw-bold text-secondary">#{st.studentNo}</td>
                                        <td className="fw-semibold">{st.studentName}</td>
                                        <td className="text-muted small">{st.studentPhone || "-"}</td>
                                        <td className="text-muted small">{formatDateTime(st.attendanceAt)}</td>
                                        <td>
                                            <Badge bg={
                                                st.attendanceState === "출석" ? "success" :
                                                    st.attendanceState === "지각" ? "warning" :
                                                        st.attendanceState === "결석" ? "danger" : "secondary"
                                            }>
                                                {st.attendanceState}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Form.Select
                                                size="sm"
                                                value={st.attendanceState}
                                                onChange={(e) => handleAttendanceChange(st.attendanceNo, e.target.value)}
                                            >
                                                <option value="미출결">미출결</option>
                                                <option value="출석">출석</option>
                                                <option value="지각">지각</option>
                                                <option value="조퇴">조퇴</option>
                                                <option value="결석">결석</option>
                                            </Form.Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
