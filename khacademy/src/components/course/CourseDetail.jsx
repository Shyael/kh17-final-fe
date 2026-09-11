import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Container, Form, Nav, Row, Table } from "react-bootstrap";
import {
    FaPlay,
    FaStop,
    FaUsers,
    FaClock,
    FaChalkboardUser,
    FaLocationDot,
    FaPenRuler,
    FaClipboardQuestion,
    FaArrowLeft,
    FaUserGraduate,
    FaEnvelope,
    FaPhone
} from "react-icons/fa6";
import Swal from "sweetalert2";

import { apiClient } from "@utils/reaxios";
import Jumbotron from "@templates/Jumbotron";

export default function CourseDetail() {
    const { courseNo } = useParams();
    const navigate = useNavigate();

    // 탭 상태: 'attendance' | 'students' | 'assignment' | 'exam'
    const [activeTab, setActiveTab] = useState("attendance");
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "-";
        const d = new Date(timestamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const todayKorean = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

    const loadCourseDetail = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/employee/course/${courseNo}`);
            setDetail(data);
        } catch (e) {
            console.error("강좌 상세 조회 오류:", e);
            await Swal.fire("오류", e.response?.data?.message || "강좌 상세 정보를 불러오지 못했습니다.", "error");
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

    const handleStartClass = useCallback(async () => {
        if (!detail?.scheduleList || detail.scheduleList.length === 0) {
            await Swal.fire("경고", "연결된 수업 스케줄이 없습니다.", "warning");
            return;
        }

        const todaySchedule = detail.scheduleList.find(sc => sc.scheduleWeek === todayKorean);
        if (!todaySchedule) {
            await Swal.fire("확인", `오늘은 수업 요일(${todayKorean}요일)이 아닙니다.`, "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "수업을 시작하시겠습니까?",
            text: "수강생 출석부가 자동으로 생성됩니다.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "수업 시작",
            cancelButtonText: "취소",
            confirmButtonColor: "#0d6efd"
        });

        if (!confirm.isConfirmed) return;

        try {
            await apiClient.post("/employee/class-session/start", {
                scheduleNo: todaySchedule.scheduleNo
            });
            await Swal.fire("완료", "수업 세션이 시작되었습니다.", "success");
            loadCourseDetail();
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "수업 시작에 실패했습니다.", "error");
        }
    }, [detail, todayKorean, loadCourseDetail]);

    const isEndTimePassed = () => {
        if (!detail?.todaySession?.sessionEnd) return false;
        return new Date().getTime() >= new Date(detail.todaySession.sessionEnd).getTime();
    };

    const handleEndClass = useCallback(async (sessionNo) => {
        const confirm = await Swal.fire({
            title: "수업을 종료하시겠습니까?",
            text: "미출결 수강생은 자동으로 '결석' 처리됩니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "수업 종료",
            cancelButtonText: "취소",
            confirmButtonColor: "#dc3545"
        });

        if (!confirm.isConfirmed) return;

        try {
            const { data } = await apiClient.post(`/employee/class-session/end/${sessionNo}`);
            await Swal.fire("종료 완료", data || "수업이 성공적으로 종료되었습니다.", "success");
            loadCourseDetail();
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "수업 종료 처리에 실패했습니다.", "error");
        }
    }, [loadCourseDetail]);

    const handleAttendanceChange = useCallback(async (attendanceNo, newState) => {
        try {
            await apiClient.patch(`/employee/attendance/${attendanceNo}`, {
                attendanceNo,
                attendanceState: newState
            });
            loadCourseDetail();
        } catch (e) {
            await Swal.fire("오류", e.response?.data?.message || "출결 상태 변경에 실패했습니다.", "error");
        }
    }, [loadCourseDetail]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">강좌 상세 정보를 불러오는 중입니다...</p>
            </Container>
        );
    }

    if (!detail) return null;

    const { courseInfo, tutorName, scheduleList, todaySession, attendanceDetail, assignmentList, examList, studentList } = detail;
    const isTodayClassDay = scheduleList?.some(sc => sc.scheduleWeek === todayKorean);

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="me-1" /> 목록으로
                </Button>
            </div>

            <Jumbotron
                title={courseInfo.courseTitle}
                content={`담당 강사: ${tutorName || "미지정"} | 과목: ${courseInfo.courseSubject} | 상태: ${courseInfo.courseStatus}`}
            />

            {/* 강좌 기본 정보 및 일정 요약 */}
            <div className="border rounded p-4 mt-4 bg-white shadow-sm">
                <Row className="align-items-center mb-3">
                    <Col md={8}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <h4 className="fw-bold mb-0">{courseInfo.courseTitle}</h4>
                            <Badge bg={
                                courseInfo.courseStatus === "진행중" ? "success" :
                                    courseInfo.courseStatus === "모집중" ? "primary" : "secondary"
                            }>
                                {courseInfo.courseStatus}
                            </Badge>
                            <Badge bg="info" text="dark">{courseInfo.courseType}</Badge>
                        </div>
                        <div className="text-muted small mb-2">{courseInfo.courseInfo || "강좌 설명이 등록되지 않았습니다."}</div>
                        <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span><FaChalkboardUser className="me-1" /> 강사: <strong>{tutorName || "미지정"}</strong></span>
                            <span><FaUsers className="me-1" /> 수강 인원: <strong>{studentList?.length || courseInfo.courseCurrentCount} / {courseInfo.courseLimit}명</strong></span>
                            <span>수강료: <strong>{Number(courseInfo.courseFee).toLocaleString()}원</strong></span>
                        </div>
                    </Col>
                    <Col md={4} className="mt-3 mt-md-0">
                        <div className="p-3 bg-light rounded border">
                            <div className="fw-semibold small mb-1 text-muted">등록된 강의 일정</div>
                            {scheduleList && scheduleList.length > 0 ? (
                                scheduleList.map(sc => (
                                    <div key={sc.scheduleNo} className="small py-1 border-bottom last-border-0">
                                        <FaClock className="me-1 text-primary" />
                                        <b>{sc.scheduleWeek}요일</b> ({sc.scheduleStart} ~ {sc.scheduleEnd})
                                        <span className="ms-2 text-muted"><FaLocationDot className="me-1" />{sc.classroomNo}호</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted small">등록된 시간표가 없습니다.</div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* 오늘 수업 세션 제어 바 */}
                <div className="d-flex flex-wrap justify-content-between align-items-center p-3 rounded mt-3" style={{ backgroundColor: "#f1f5f9" }}>
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-block rounded-circle"
                            style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: !todaySession ? "#94a3b8" : todaySession.sessionStatus === "진행중" ? "#198754" : "#6c757d"
                            }}
                        />
                        <span className="fw-semibold">
                            {!todaySession && "오늘 생성된 수업 세션이 없습니다."}
                            {todaySession && todaySession.sessionStatus === "진행중" && "● 현재 실시간 수업이 진행 중입니다."}
                            {todaySession && todaySession.sessionStatus === "종료" && "오늘 수업 세션이 정상 종료되었습니다."}
                        </span>
                        {!isTodayClassDay && !todaySession && (
                            <span className="text-muted small ms-2">(오늘은 수업 요일이 아닙니다: {todayKorean}요일)</span>
                        )}
                    </div>

                    <div>
                        {!todaySession && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="fw-bold px-3"
                                onClick={handleStartClass}
                                disabled={!isTodayClassDay}
                            >
                                <FaPlay className="me-1" /> 수업 시작
                            </Button>
                        )}
                        {todaySession && todaySession.sessionStatus === "진행중" && (
                            <Button
                                variant="danger"
                                size="sm"
                                className="fw-bold px-3"
                                onClick={() => handleEndClass(todaySession.sessionNo)}
                                disabled={!isEndTimePassed()}
                                title={!isEndTimePassed() ? "수업 종료 시간 이후에 종료할 수 있습니다." : "수업 종료"}
                            >
                                <FaStop className="me-1" /> 수업 종료
                            </Button>
                        )}
                        {todaySession && todaySession.sessionStatus === "종료" && (
                            <Button variant="secondary" size="sm" className="fw-bold px-3" disabled>
                                수업 종료됨
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 네비게이션 탭 바 */}
            <Nav variant="tabs" className="mt-4">
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "attendance"}
                        onClick={() => setActiveTab("attendance")}
                        className="fw-bold"
                        style={{ cursor: "pointer" }}
                    >
                        <FaUsers className="me-1" /> 오늘 출결 현황
                    </Nav.Link>
                </Nav.Item>

                {/* [수강생 목록 탭] */}
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "students"}
                        onClick={() => setActiveTab("students")}
                        className="fw-bold"
                        style={{ cursor: "pointer" }}
                    >
                        <FaUserGraduate className="me-1" /> 수강생 목록
                        <Badge bg="primary" className="ms-2">
                            {studentList?.length || 0}
                        </Badge>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "assignment"}
                        onClick={() => setActiveTab("assignment")}
                        className="fw-bold"
                        style={{ cursor: "pointer" }}
                    >
                        <FaPenRuler className="me-1" /> 과제 관리
                        <Badge bg="secondary" className="ms-2">
                            {assignmentList?.length || 0}
                        </Badge>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        active={activeTab === "exam"}
                        onClick={() => setActiveTab("exam")}
                        className="fw-bold"
                        style={{ cursor: "pointer" }}
                    >
                        <FaClipboardQuestion className="me-1" /> 시험 관리
                        <Badge bg="secondary" className="ms-2">
                            {examList?.length || 0}
                        </Badge>
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* [탭 1] 오늘 출결 현황 */}
            {activeTab === "attendance" && (
                <div className="border border-top-0 rounded-bottom p-4 bg-white shadow-sm">
                    {attendanceDetail && attendanceDetail.studentList && attendanceDetail.studentList.length > 0 ? (
                        <>
                            <Row className="g-2 text-center mb-4">
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-muted small">총원</div><div className="fs-5 fw-bold">{attendanceDetail.totalCount}명</div></div></Col>
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-success small">출석</div><div className="fs-5 fw-bold text-success">{attendanceDetail.presentCount}명</div></div></Col>
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-warning small">지각</div><div className="fs-5 fw-bold text-warning">{attendanceDetail.lateCount}명</div></div></Col>
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-secondary small">조퇴</div><div className="fs-5 fw-bold">{attendanceDetail.earlyLeaveCount}명</div></div></Col>
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-danger small">결석</div><div className="fs-5 fw-bold text-danger">{attendanceDetail.absentCount}명</div></div></Col>
                                <Col xs={4} md={2}><div className="p-3 bg-light rounded border"><div className="text-muted small">미출결</div><div className="fs-5 fw-bold text-muted">{attendanceDetail.uncheckedCount}명</div></div></Col>
                            </Row>

                            <Table bordered hover responsive className="text-center align-middle mb-0">
                                <thead>
                                    <tr className="table-light">
                                        <th>학생명 (학번)</th>
                                        <th>연락처</th>
                                        <th>태그 시각</th>
                                        <th>현재 상태</th>
                                        <th style={{ width: "160px" }}>수동 정정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceDetail.studentList.map(st => (
                                        <tr key={st.attendanceNo}>
                                            <td className="fw-semibold">{st.studentName} ({st.studentNo})</td>
                                            <td className="text-muted">{st.studentPhone || "-"}</td>
                                            <td className="text-muted">{st.attendanceAt ? formatDateTime(st.attendanceAt) : "-"}</td>
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
                        </>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <FaUsers size={36} className="mb-2 opacity-50" />
                            <p className="mb-1">오늘 생성된 수업 세션 및 출결 데이터가 없습니다.</p>
                            <p className="small">수업 요일인 경우 상단의 <b>[수업 시작]</b> 버튼을 눌러 출석부를 생성할 수 있습니다.</p>
                        </div>
                    )}
                </div>
            )}

            {/* [탭 2] 수강생 목록 (신청일자 컬럼 제외, 상시 조회) */}
            {activeTab === "students" && (
                <div className="border border-top-0 rounded-bottom p-4 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                            강좌 등록 수강생 목록 ({studentList?.length || 0}명)
                        </h6>
                    </div>
                    <Table bordered hover responsive className="text-center align-middle mb-0">
                        <thead>
                            <tr className="table-light">
                                <th style={{ width: "60px" }}>No</th>
                                <th style={{ width: "90px" }}>학번</th>
                                <th>이름</th>
                                <th>연락처</th>
                                <th style={{ width: "110px" }}>수강 상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!studentList || studentList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-4 text-muted">
                                        등록된 수강생이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                studentList.map((st, idx) => (
                                    <tr key={st.studentNo}>
                                        <td className="text-muted small">{idx + 1}</td>
                                        <td className="fw-bold text-secondary">#{st.studentNo}</td>
                                        <td className="fw-semibold text-dark">{st.studentName}</td>
                                        <td>
                                            {st.studentPhone ? (
                                                <span><FaPhone className="me-1 text-muted small" />{st.studentPhone}</span>
                                            ) : "-"}
                                        </td>
                                        <td>
                                            <Badge bg={st.studentStatus === "수강중" ? "primary" : "secondary"}>
                                                {st.studentStatus || "수강중"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* [탭 3] 과제 관리 */}
            {activeTab === "assignment" && (
                <div className="border border-top-0 rounded-bottom p-4 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">등록된 과제 목록 ({assignmentList?.length || 0}건)</h6>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate("/student/assignment")}
                        >
                            과제 전체 목록 가기 &rarr;
                        </Button>
                    </div>
                    <Table bordered hover responsive className="text-center align-middle mb-0">
                        <thead>
                            <tr className="table-light">
                                <th>번호</th>
                                <th>과제 제목</th>
                                <th>출제자</th>
                                <th>마감 기한</th>
                                <th>등록일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!assignmentList || assignmentList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-4 text-muted">등록된 과제가 없습니다.</td>
                                </tr>
                            ) : (
                                assignmentList.map(item => (
                                    <tr key={item.assignmentNo}>
                                        <td>{item.assignmentNo}</td>
                                        <td className="text-start fw-semibold">{item.assignmentTitle}</td>
                                        <td>{item.accountName || "담당 강사"}</td>
                                        <td>{formatDateTime(item.assignmentDueDate)}</td>
                                        <td className="text-muted small">{formatDateTime(item.assignmentWtime)}</td>
                                        <td>
                                            <Badge bg={
                                                item.assignmentStatus === "게시" ? "primary" :
                                                    item.assignmentStatus === "마감" ? "secondary" : "warning"
                                            }>
                                                {item.assignmentStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* [탭 4] 시험 관리 */}
            {activeTab === "exam" && (
                <div className="border border-top-0 rounded-bottom p-4 bg-white shadow-sm">
                    <h6 className="fw-bold mb-3">등록된 시험 목록 ({examList?.length || 0}건)</h6>
                    <Table bordered hover responsive className="text-center align-middle mb-0">
                        <thead>
                            <tr className="table-light">
                                <th>번호</th>
                                <th>시험명</th>
                                <th>출제자</th>
                                <th>시험 일정</th>
                                <th>제한 시간</th>
                                <th>등록일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!examList || examList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-4 text-muted">등록된 시험이 없습니다.</td>
                                </tr>
                            ) : (
                                examList.map(item => (
                                    <tr key={item.examNo}>
                                        <td>{item.examNo}</td>
                                        <td className="text-start fw-semibold">{item.examTitle}</td>
                                        <td>{item.accountName || "담당 강사"}</td>
                                        <td className="small">
                                            {formatDateTime(item.examStart)} ~ <br />
                                            {formatDateTime(item.examEnd)}
                                        </td>
                                        <td>{item.examLimit ? `${item.examLimit}분` : "제한 없음"}</td>
                                        <td className="text-muted small">{formatDateTime(item.examWtime)}</td>
                                        <td>
                                            <Badge bg={
                                                item.examStatus === "공개" ? "danger" :
                                                    item.examStatus === "마감" ? "secondary" : "warning"
                                            }>
                                                {item.examStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
}