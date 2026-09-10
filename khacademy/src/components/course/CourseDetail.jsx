import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Container, Form, Nav, Row, Table, Badge } from "react-bootstrap";
import {
    FaPlay,
    FaStop,
    FaUsers,
    FaClock,
    FaChalkboardUser,
    FaLocationDot,
    FaBookOpen,
    FaPenRuler,
    FaClipboardQuestion
} from "react-icons/fa6";
import Swal from "sweetalert2";
import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";

export default function CourseDetail() {
    // 1. params & navigate
    const { courseNo } = useParams();
    const navigate = useNavigate();

    // 2. State
    const [activeTab, setActiveTab] = useState("attendance"); // 'attendance' | 'assignment' | 'exam'
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);

    // 3. 강좌 상세 데이터 조회 (1번 강좌/스케줄 + 2번 출결 통합)
    const loadCourseDetail = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/employee/course/${courseNo}`);
            setDetail(data);
        } catch (e) {
            console.error("강좌 조회 실패:", e);
            await Swal.fire({
                icon: "error",
                title: "조회 실패",
                text: e.response?.data?.message || "강좌 정보를 불러올 수 없습니다.",
                confirmButtonColor: "#2563eb"
            });
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [courseNo, navigate]);

    useEffect(() => {
        if (courseNo) {
            loadCourseDetail();
        }
    }, [courseNo, loadCourseDetail]);

    // 4. 세션 시작 (StartClass)
    const handleStartClass = useCallback(async () => {
        if (!detail?.scheduleList || detail.scheduleList.length === 0) {
            await Swal.fire("경고", "연결된 수업 스케줄이 없습니다.", "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "수업을 시작하시겠습니까?",
            text: "수강생 출석부가 자동으로 '미출결' 상태로 생성됩니다.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "수업 시작",
            cancelButtonText: "취소",
            confirmButtonColor: "#2563eb"
        });

        if (!confirm.isConfirmed) return;

        try {
            const scheduleNo = detail.scheduleList[0].scheduleNo;
            await apiClient.post("/employee/class-session/start", { scheduleNo });
            await Swal.fire("시작 완료", "수업이 시작되었습니다.", "success");
            loadCourseDetail(); // 화면 데이터 리프레시
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "수업 시작에 실패했습니다.", "error");
        }
    }, [detail, loadCourseDetail]);

    // 5. 세션 종료 (EndClass)
    const handleEndClass = useCallback(async (sessionNo) => {
        const confirm = await Swal.fire({
            title: "수업을 종료하시겠습니까?",
            text: "체크되지 않은 '미출결' 학생들은 자동으로 '결석' 처리됩니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "수업 종료",
            cancelButtonText: "취소",
            confirmButtonColor: "#dc2626"
        });

        if (!confirm.isConfirmed) return;

        try {
            const { data } = await apiClient.post(`/employee/class-session/end/${sessionNo}`);
            await Swal.fire("종료 완료", data || "수업이 성공적으로 종료되었습니다.", "success");
            loadCourseDetail(); // 화면 데이터 리프레시
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "수업 종료 처리에 실패했습니다.", "error");
        }
    }, [loadCourseDetail]);

    // 6. 강사/관리자 출결 수동 정정
    const handleAttendanceChange = useCallback(async (attendanceNo, newState) => {
        try {
            await apiClient.patch(`/employee/attendance/${attendanceNo}`, {
                attendanceNo: attendanceNo,
                attendanceState: newState
            });
            // 변경 후 통계 재계산을 위해 다시 조회
            loadCourseDetail();
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "출결 상태 변경에 실패했습니다.", "error");
        }
    }, [loadCourseDetail]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                </div>
                <p className="mt-3 text-muted">강좌 및 출결 정보를 불러오는 중입니다...</p>
            </Container>
        );
    }

    if (!detail) return null;

    const { courseInfo, tutorName, scheduleList, todaySession, attendanceDetail } = detail;
    const schedule = scheduleList && scheduleList.length > 0 ? scheduleList[0] : null;

    // 1. 오늘 요일(한 글자: '월', '화', '수', '목', '금', '토', '일') 구하기
    const todayKorean = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

    // 2. 해당 강좌의 스케줄 목록 중 오늘 요일에 해당하는 스케줄이 있는지 확인
    const isTodayClassDay = scheduleList?.some(sc => sc.scheduleWeek === todayKorean);

    // 3. 버튼 렌더링 영역
    {
        !todaySession && (
            <div className="d-flex align-items-center gap-2">
                <Button
                    variant="primary"
                    className="fw-bold px-3 py-2"
                    onClick={handleStartClass}
                    disabled={!isTodayClassDay} // 오늘 요일이 아니면 비활성화!
                >
                    <FaPlay className="me-2" size={12} />
                    수업 시작
                </Button>

                {/* 요일이 아닐 때 안내 뱃지/문구 */}
                {!isTodayClassDay && (
                    <span className="text-muted small">
                        (오늘은 수업 요일이 아닙니다: <b>{todayKorean}요일</b>)
                    </span>
                )}
            </div>
        )
    }

    return (
        <Container className="py-4" style={{ maxWidth: "1100px" }}>
            {/* 상단 점보트론 */}
            <Jumbotron
                title={courseInfo.courseName}
                content={`담당 강사: ${tutorName || "미지정"} | 상태: ${courseInfo.courseStatus}`}
            />

            {/* [1번 영역] 강좌 기본 정보 및 세션 제어 바 */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "14px" }}>
                <Card.Body className="p-4">
                    <Row className="align-items-center mb-3">
                        <Col md={8}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <h4 className="fw-bold mb-0">{courseInfo.courseName}</h4>
                                <Badge bg={courseInfo.courseStatus === "진행중" ? "success" : "secondary"}>
                                    {courseInfo.courseStatus}
                                </Badge>
                            </div>
                            <div className="d-flex flex-wrap gap-3 text-muted small">
                                <span><FaChalkboardUser className="me-1" /> 강사: <b>{tutorName || "미지정"}</b></span>
                                {schedule && (
                                    <>
                                        <span><FaClock className="me-1" /> 일정: <b>{schedule.scheduleWeek}요일 ({schedule.scheduleStart} ~ {schedule.scheduleEnd})</b></span>
                                        <span><FaLocationDot className="me-1" /> 강의실: <b>{schedule.classroomNo}호</b></span>
                                    </>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* 오늘 세션 제어 액션 박스 */}
                    <div
                        className="d-flex flex-wrap justify-content-between align-items-center p-3 rounded-3"
                        style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <span
                                className="d-inline-block rounded-circle"
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: !todaySession ? "#94a3b8" : todaySession.sessionStatus === "진행중" ? "#16a34a" : "#64748b"
                                }}
                            />
                            <span className="fw-semibold text-primary">
                                {!todaySession && "오늘 수업이 아직 시작되지 않았습니다."}
                                {todaySession && todaySession.sessionStatus === "진행중" && "● 현재 실시간 수업이 진행 중입니다."}
                                {todaySession && todaySession.sessionStatus === "종료" && "오늘 수업 세션이 정상 종료되었습니다."}
                            </span>
                        </div>

                        <div>
                            {!todaySession && (
                                <Button variant="primary" className="fw-bold px-3 py-2" onClick={handleStartClass}>
                                    <FaPlay className="me-2" size={12} />
                                    수업 시작
                                </Button>
                            )}
                            {todaySession && todaySession.sessionStatus === "진행중" && (
                                <Button
                                    variant="danger"
                                    className="fw-bold px-3 py-2"
                                    onClick={() => handleEndClass(todaySession.sessionNo)}
                                >
                                    <FaStop className="me-2" size={12} />
                                    수업 종료
                                </Button>
                            )}
                            {todaySession && todaySession.sessionStatus === "종료" && (
                                <Button variant="secondary" className="fw-bold px-3 py-2" disabled>
                                    수업 종료됨
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* 네비게이션 탭 (1, 2번 완성 + 3, 4번 팀원 영역) */}
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Nav.Item>
                    <Nav.Link eventKey="attendance" className="fw-bold">
                        <FaUsers className="me-2" />
                        출결 현황 (오늘)
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="assignment" className="fw-bold text-secondary">
                        <FaPenRuler className="me-2" />
                        과제 관리
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="exam" className="fw-bold text-secondary">
                        <FaClipboardQuestion className="me-2" />
                        시험 관리
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* 탭 내용 영역 */}
            {/* [2번 영역] 출결 현황 탭 */}
            {activeTab === "attendance" && (
                <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
                    <Card.Body className="p-4">
                        {attendanceDetail && attendanceDetail.studentList && attendanceDetail.studentList.length > 0 ? (
                            <>
                                {/* 통계 요약 카드 6종 */}
                                <Row className="g-2 text-center mb-4">
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-muted small fw-semibold">총원</div>
                                            <div className="fs-4 fw-bold mt-1">{attendanceDetail.totalCount}명</div>
                                        </div>
                                    </Col>
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-success small fw-semibold">출석</div>
                                            <div className="fs-4 fw-bold text-success mt-1">{attendanceDetail.presentCount}명</div>
                                        </div>
                                    </Col>
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-warning small fw-semibold">지각</div>
                                            <div className="fs-4 fw-bold text-warning mt-1">{attendanceDetail.lateCount}명</div>
                                        </div>
                                    </Col>
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-secondary small fw-semibold">조퇴</div>
                                            <div className="fs-4 fw-bold mt-1">{attendanceDetail.earlyLeaveCount}명</div>
                                        </div>
                                    </Col>
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-danger small fw-semibold">결석</div>
                                            <div className="fs-4 fw-bold text-danger mt-1">{attendanceDetail.absentCount}명</div>
                                        </div>
                                    </Col>
                                    <Col xs={4} md={2}>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <div className="text-muted small fw-semibold">미출결</div>
                                            <div className="fs-4 fw-bold text-muted mt-1">{attendanceDetail.uncheckedCount}명</div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* 수강생 출석부 테이블 */}
                                <div className="table-responsive">
                                    <Table hover align="middle" className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>학생명 (학번)</th>
                                                <th>연락처</th>
                                                <th>태그 시각</th>
                                                <th>출결 상태</th>
                                                <th style={{ width: "160px" }}>수동 정정</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceDetail.studentList.map(st => (
                                                <tr key={st.attendanceNo}>
                                                    <td className="fw-semibold">{st.studentName} ({st.studentNo})</td>
                                                    <td className="text-muted">{st.studentPhone || "-"}</td>
                                                    <td className="text-muted">
                                                        {st.attendanceAt
                                                            ? new Date(st.attendanceAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                            : "-"}
                                                    </td>
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
                                                            className="fw-medium"
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
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <FaUsers size={40} className="mb-3 opacity-50" />
                                <h5>오늘 활성화된 출석부가 없습니다.</h5>
                                <p className="small mb-0">상단의 <b>[수업 시작]</b> 버튼을 누르면 실시간 출석부가 열립니다.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* [3번 영역] 과제 관리 탭 (팀원 작업 대기용 빈 껍데기) */}
            {activeTab === "assignment" && (
                <Card className="border-0 shadow-sm text-center py-5" style={{ borderRadius: "14px" }}>
                    <Card.Body>
                        <FaBookOpen size={48} className="text-muted mb-3 opacity-50" />
                        <h5 className="fw-bold">강좌 과제 관리</h5>
                        <p className="text-muted small">해당 강좌에 배정된 과제 목록 및 제출 현황 영역입니다. (팀원 개발 중)</p>
                    </Card.Body>
                </Card>
            )}

            {/* [4번 영역] 시험 관리 탭 (팀원 작업 대기용 빈 껍데기) */}
            {activeTab === "exam" && (
                <Card className="border-0 shadow-sm text-center py-5" style={{ borderRadius: "14px" }}>
                    <Card.Body>
                        <FaClipboardQuestion size={48} className="text-muted mb-3 opacity-50" />
                        <h5 className="fw-bold">강좌 시험 관리</h5>
                        <p className="text-muted small">해당 강좌의 정기/수시 시험 일정 및 채점 관리 영역입니다. (팀원 개발 중)</p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}