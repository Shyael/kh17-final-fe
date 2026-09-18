import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Form, Button, Spinner, ProgressBar } from "react-bootstrap";
import { FaCalendarCheck, FaChalkboardUser, FaUserTie, FaRegMessage } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAtomValue, useSetAtom } from "jotai";

import { apiClient } from "@utils/reaxios";
import { isParentState, selectedChildNoState, selectedChildState, chatTriggerState } from "@utils/storage";
import Jumbotron from "@templates/Jumbotron";

export default function StudentAttendanceList() {
    const { courseNo } = useParams();
    const navigate = useNavigate();

    // 💡 Jotai에서 학부모 여부 및 선택된 자녀 정보 가져오기
    const isParent = useAtomValue(isParentState);
    const selectedChildNo = useAtomValue(selectedChildNoState);
    const selectedChild = useAtomValue(selectedChildState);

    // ✨ [추가] 채팅창에 명령을 내리기 위한 세터 함수
    const setChatTrigger = useSetAtom(chatTriggerState);

    const [myCourses, setMyCourses] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [filterState, setFilterState] = useState("ALL");

    // 기본 라우팅 접두사
    const basePath = isParent ? "/parent" : "/student";

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "-";
        const d = new Date(timestamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const formatTimeOnly = (timestamp) => {
        if (!timestamp) return "-";
        const d = new Date(timestamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // 1. 강의 목록 조회 (학부모인 경우 자녀 번호가 변경될 때마다 자동 재조회)
    useEffect(() => {
        const loadMyCourses = async () => {
            // 학부모인데 아직 선택된 자녀 번호가 없으면 로딩 중단
            if (isParent && !selectedChildNo) {
                setLoadingCourses(false);
                return;
            }

            try {
                setLoadingCourses(true);

                // 💡 API 엔드포인트 분기
                const apiUrl = isParent
                    ? `/academy/parent/attendance/child/${selectedChildNo}/courses`
                    : `/academy/student/attendance/my-courses`;

                const { data } = await apiClient.get(apiUrl);
                const courseList = data || [];
                setMyCourses(courseList);

                if (courseList.length > 0) {
                    const isExist = courseList.some((c) => String(c.courseNo) === String(courseNo));
                    if (!courseNo || !isExist) {
                        navigate(`${basePath}/attendance/list/${courseList[0].courseNo}`, { replace: true });
                    }
                } else {
                    setAttendanceData(null);
                }
            } catch (e) {
                console.error("수강 강의 목록 조회 실패:", e);
                Swal.fire("오류", "수강 강의 목록을 불러오지 못했습니다.", "error");
            } finally {
                setLoadingCourses(false);
            }
        };

        loadMyCourses();
    }, [courseNo, navigate, isParent, selectedChildNo, basePath]);

    // 2. 출결 상세 조회 함수
    const loadAttendanceData = useCallback(async (cNo) => {
        if (!cNo || isNaN(Number(cNo)) || Number(cNo) <= 0) {
            setAttendanceData(null);
            return;
        }
        if (isParent && !selectedChildNo) return;

        try {
            setLoadingData(true);

            // 💡 출결 상세 API 분기
            const apiUrl = isParent
                ? `/academy/parent/attendance/child/${selectedChildNo}/course/${cNo}`
                : `/academy/student/attendance/course/${cNo}`;

            const { data } = await apiClient.get(apiUrl);
            setAttendanceData(data);
            setFilterState("ALL");
        } catch (e) {
            console.error("출결 상세 조회 실패:", e);
            Swal.fire("오류", e.response?.data?.message || "출결 데이터를 불러오지 못했습니다.", "error");
        } finally {
            setLoadingData(false);
        }
    }, [isParent, selectedChildNo]);

    // 3. courseNo 또는 selectedChildNo 변경 시 상세 데이터 재조회
    useEffect(() => {
        if (courseNo && !isNaN(Number(courseNo)) && Number(courseNo) > 0) {
            loadAttendanceData(courseNo);
        }
    }, [courseNo, loadAttendanceData]);

    // 상담하기 처리
    const chatTutor = useCallback(async (tutorName, employeeNo) => {
        try {
            const { data } = await apiClient.get(`/academy/room/check/${employeeNo}`);

            // AcademyChat 컴포넌트가 감지할 수 있도록 전역 상태에 강사/방 정보 쏘기!
            setChatTrigger({
                type: "tutor",
                tutorInfo: {
                    accountNo: employeeNo,
                    accountName: tutorName,
                    roomNo: data.room.roomNo,
                    unreadCnt: data.room.unreadCnt,
                    lastContent: data.room.lastContent,
                    lastTime: data.room.lastTime
                }
            });
        } catch (error) {
            console.error("참여 처리 실패", error);
        }
    }, []);

    // 4. 셀렉트 박스 강의 변경
    const handleCourseChange = (e) => {
        const nextCourseNo = e.target.value;
        if (nextCourseNo) {
            navigate(`${basePath}/attendance/list/${nextCourseNo}`);
        }
    };

    // 상태 필터링
    const filteredList = useMemo(() => {
        if (!attendanceData?.attendanceList) return [];
        if (filterState === "ALL") return attendanceData.attendanceList;
        if (filterState === "출석") return attendanceData.attendanceList.filter((i) => i.attendanceState === "출석");
        if (filterState === "지각조퇴") return attendanceData.attendanceList.filter((i) => i.attendanceState === "지각" || i.attendanceState === "조퇴");
        if (filterState === "결석") return attendanceData.attendanceList.filter((i) => i.attendanceState === "결석");
        return attendanceData.attendanceList;
    }, [attendanceData, filterState]);

    if (loadingCourses) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted small">수강 강의 정보를 불러오는 중입니다...</p>
            </Container>
        );
    }

    if (myCourses.length === 0) {
        return (
            <Container className="py-4">
                <Jumbotron
                    title={isParent ? `${selectedChild?.studentName ?? "자녀"}의 출결 현황` : "내 출결 현황"}
                    content="수강 중인 강의별 실시간 출결 현황 및 회차별 상세 이력을 확인합니다."
                />
                <Card className="shadow-sm border mt-4 text-center py-5">
                    <Card.Body>
                        <h6 className="fw-bold text-secondary mb-2">현재 수강 중인 강의가 없습니다.</h6>
                        <p className="text-muted small mb-0">학원 데스크를 통해 강의 수강 등록 여부를 확인해 주세요.</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const { summary, courseTitle, studentCourseStatus, tutorName, tutorNo } = attendanceData || {};

    return (
        <Container className="py-4">
            <Jumbotron
                title={isParent ? `${selectedChild?.studentName ?? "자녀"}의 출결 현황` : "내 출결 현황"}
                content="수강 중인 강의별 실시간 출결 현황 및 회차별 상세 이력을 확인합니다."
            />

            {/* 강의 선택 영역 */}
            <Card className="shadow-sm border mb-4 mt-4">
                <Card.Body>
                    <Row className="align-items-center g-3">
                        <Col xs={12} md={7} lg={7}>
                            <Form.Group className="d-flex align-items-center gap-2">
                                <Form.Label className="fw-bold mb-0 text-nowrap" style={{ minWidth: "75px" }}>
                                    <FaChalkboardUser className="me-1 text-primary" /> 강의
                                </Form.Label>
                                <Form.Select
                                    value={courseNo || ""}
                                    onChange={handleCourseChange}
                                    className="fw-semibold text-truncate"
                                >
                                    {myCourses.map((c) => (
                                        <option key={c.courseNo} value={c.courseNo}>
                                            [{c.studentCourseStatus || "수강중"}] {c.courseTitle}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* 강사 배지 & 질문하기 일체형 칩 */}
                        <Col xs={12} md={5} lg={5} className="d-flex justify-content-start justify-content-md-end align-items-center">
                            {tutorName && (
                                <div className="d-inline-flex align-items-center bg-white border rounded-pill p-1 shadow-sm">
                                    <div className="d-flex align-items-center px-2 py-1">
                                        <FaUserTie className="text-primary me-1.5 flex-shrink-0" size={13} />
                                        <span className="text-muted small me-1">담당</span>
                                        <strong 
                                            className="text-dark small text-truncate" 
                                            style={{ maxWidth: "100px" }}
                                            title={tutorName}
                                        >
                                            {tutorName}
                                        </strong>
                                        <span className="small text-secondary ms-0.5">T</span>
                                    </div>

                                    <div className="vr my-1 text-secondary opacity-25" style={{ height: "16px" }}></div>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1 shadow-none ms-1"
                                        style={{ fontSize: "0.78rem" }}
                                        //onClick={() => navigate(`${basePath}/tutor/${tutorNo}/chat`)}
                                        onClick={() => chatTutor(tutorName, tutorNo)}
                                        disabled={!tutorNo}
                                    >
                                        <FaRegMessage size={11} />
                                        <span>질문하기</span>
                                    </Button>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loadingData ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted small">출결 이력을 불러오는 중입니다...</p>
                </div>
            ) : !attendanceData ? (
                <div className="text-center py-5 text-muted">
                    강의를 선택하시면 출결 데이터가 표시됩니다.
                </div>
            ) : (
                <>
                    {/* 선택 강의 요약 통계 */}
                    <Card className="shadow-sm border mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <h6 className="fw-bold mb-0 text-dark">{courseTitle}</h6>
                                    {tutorName && <span className="text-muted small">({tutorName} T)</span>}
                                    <Badge bg={
                                        studentCourseStatus === "수강중" ? "primary" :
                                        studentCourseStatus === "수강완료" ? "secondary" :
                                        studentCourseStatus === "중도퇴원" ? "danger" : "info"
                                    }>
                                        {studentCourseStatus || "수강중"}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted small me-2">누적 출석률:</span>
                                    <span className="fs-5 fw-bold text-primary">
                                        {summary?.attendanceRate || 0}%
                                    </span>
                                </div>
                            </div>

                            <ProgressBar
                                now={summary?.attendanceRate || 0}
                                variant={(summary?.attendanceRate || 0) >= 80 ? "primary" : "danger"}
                                style={{ height: "8px" }}
                                className="mb-4"
                            />

                            <Row className="g-2 text-center">
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-muted small">진행 회차</div><div className="fw-bold">{summary?.totalSessionCount || 0}회</div></div></Col>
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-success small">출석</div><div className="fw-bold text-success">{summary?.presentCount || 0}회</div></div></Col>
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-warning small">지각</div><div className="fw-bold text-warning">{summary?.lateCount || 0}회</div></div></Col>
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-secondary small">조퇴</div><div className="fw-bold">{summary?.earlyLeaveCount || 0}회</div></div></Col>
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-danger small">결석</div><div className="fw-bold text-danger">{summary?.absentCount || 0}회</div></div></Col>
                                <Col xs={4} md={2}><div className="p-2 bg-light rounded border"><div className="text-muted small">미출결</div><div className="fw-bold text-muted">{summary?.uncheckedCount || 0}회</div></div></Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 회차별 상세 이력 테이블 */}
                    <Card className="shadow-sm border">
                        <Card.Header className="bg-white py-3">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div className="fw-bold">
                                    <FaCalendarCheck className="me-1 text-primary" /> 회차별 출결 이력 (최신순)
                                </div>
                                <div className="d-flex gap-1 flex-wrap">
                                    <Button
                                        variant={filterState === "ALL" ? "primary" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setFilterState("ALL")}
                                    >
                                        전체 ({attendanceData.attendanceList.length})
                                    </Button>
                                    <Button
                                        variant={filterState === "출석" ? "success" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setFilterState("출석")}
                                    >
                                        출석 ({summary?.presentCount || 0})
                                    </Button>
                                    <Button
                                        variant={filterState === "지각조퇴" ? "warning" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setFilterState("지각조퇴")}
                                    >
                                        지각·조퇴 ({(summary?.lateCount || 0) + (summary?.earlyLeaveCount || 0)})
                                    </Button>
                                    <Button
                                        variant={filterState === "결석" ? "danger" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setFilterState("결석")}
                                    >
                                        결석 ({summary?.absentCount || 0})
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-0">
                            {filteredList.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    해당 조건에 일치하는 출결 내역이 없습니다.
                                </div>
                            ) : (
                                <Table hover responsive className="kh-table text-center align-middle mb-0">
                                    <thead>
                                        <tr className="table-light text-secondary small">
                                            <th style={{ width: "80px" }}>회차</th>
                                            <th>수업 일시</th>
                                            <th>내 입실(태그) 시각</th>
                                            <th style={{ width: "100px" }}>수업 상태</th>
                                            <th style={{ width: "110px" }}>출결 상태</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.map((item) => (
                                            <tr key={item.sessionNo}>
                                                <td className="fw-bold text-secondary">#{item.roundNo}회</td>
                                                <td>
                                                    <span className="fw-semibold text-dark">
                                                        {formatDateTime(item.sessionStart)} ~ {formatTimeOnly(item.sessionEnd)}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">
                                                    {item.attendanceAt ? formatDateTime(item.attendanceAt) : "-"}
                                                </td>
                                                <td>
                                                    <Badge bg={
                                                        item.sessionStatus === "진행중" ? "success" :
                                                        item.sessionStatus === "종료" ? "secondary" :
                                                        item.sessionStatus === "취소" ? "danger" : "primary"
                                                    }>
                                                        {item.sessionStatus}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={
                                                        item.attendanceState === "출석" ? "success" :
                                                        item.attendanceState === "지각" ? "warning" :
                                                        item.attendanceState === "조퇴" ? "info" :
                                                        item.attendanceState === "결석" ? "danger" : "light"
                                                    } text={item.attendanceState === "미출결" ? "dark" : "white"}>
                                                        {item.attendanceState}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
}