import { useCallback, useEffect, useState } from "react";
import { Button, Col, Row, Modal, Badge, Card } from "react-bootstrap";
import { 
    FaCheck, 
    FaClock, 
    FaDeleteLeft, 
    FaRotateLeft, 
    FaUserCheck, 
    FaArrowRightFromBracket,
    FaCircleCheck,
    FaTriangleExclamation,
    FaIdCard,
    FaSchool,
    FaKeyboard,
    FaCircleInfo
} from "react-icons/fa6";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";

export default function KioskAttendance() {
    const [phoneTail, setPhoneTail] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // 최근 출결 완료 기록
    const [recentAttendance, setRecentAttendance] = useState(null);

    // 중복 번호 선택 모달
    const [candidateModal, setCandidateModal] = useState(false);
    const [candidates, setCandidates] = useState([]);

    const navigate = useNavigate();

    // 1초 주기 실시간 시계
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 키패드 입력
    const handleKeyClick = useCallback((digit) => {
        setPhoneTail(prev => {
            if (prev.length >= 4) return prev;
            return prev + digit;
        });
    }, []);

    // 지우기
    const handleDelete = useCallback(() => {
        setPhoneTail(prev => prev.slice(0, -1));
    }, []);

    // 전체 리셋
    const handleClear = useCallback(() => {
        setPhoneTail("");
    }, []);

    // 출결 확인 API 전송
    const submitAttendance = useCallback(async (tailNumber, selectedNo = null) => {
        try {
            setLoading(true);

            const { data } = await apiClient.post("/employee/kiosk/check", {
                phoneTail: tailNumber,
                selectedStudentNo: selectedNo
            });

            if (data.actionType === "MULTIPLE_CANDIDATES") {
                setCandidates(data.candidateList || []);
                setCandidateModal(true);
                return;
            }

            // 우측(또는 하단) 카드 실시간 갱신
            setRecentAttendance({
                studentName: data.studentName,
                courseTitle: data.courseTitle,
                attendanceState: data.attendanceState,
                attendanceTime: data.attendanceTime,
                message: data.message
            });

            setPhoneTail("");
            setCandidateModal(false);

        } catch (e) {
            const status = e.response?.status;
            console.error("키오스크 통신 오류:", e);

            if (status === 401 || status === 403) {
                await Swal.fire({
                    icon: "error",
                    title: "인증 만료",
                    text: "직원 계정 로그인이 만료되었습니다. 다시 로그인해 주세요."
                });
                navigate("/employee/login");
                return;
            }

            const errorMsg = e.response?.data?.message || "현재 출석 가능한 수업이 없습니다.";
            await Swal.fire({
                icon: "error",
                title: "출결 체크 실패",
                text: errorMsg,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });

            setPhoneTail("");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // 확인 제출
    const sendAttendance = useCallback(() => {
        if (phoneTail.length !== 4) {
            Swal.fire({ icon: "warning", title: "알림", text: "휴대폰 번호 뒷자리 4자리를 모두 입력하세요.", timer: 1500, showConfirmButton: false });
            return;
        }
        submitAttendance(phoneTail);
    }, [phoneTail, submitAttendance]);

    // 키보드 전역 리스너
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (candidateModal || loading) return;

            if (/^[0-9]$/.test(e.key)) {
                handleKeyClick(e.key);
            } else if (e.key === "Backspace") {
                handleDelete();
            } else if (e.key === "Escape") {
                handleClear();
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (phoneTail.length === 4) {
                    submitAttendance(phoneTail);
                } else {
                    Swal.fire({ icon: "warning", title: "알림", text: "휴대폰 번호 뒷자리 4자리를 모두 입력하세요.", timer: 1500, showConfirmButton: false });
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [candidateModal, loading, phoneTail, handleKeyClick, handleDelete, handleClear, submitAttendance]);

    const selectCandidate = useCallback((studentNo) => {
        submitAttendance(null, studentNo);
    }, [submitAttendance]);

    return (
        <div className="container py-4" style={{ maxWidth: "960px" }}>
            
            {/* 상단 통합 헤더바 */}
            <div className="d-flex align-items-center justify-content-between p-3 mb-4 rounded bg-white shadow-sm border">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary fs-4">
                        <FaSchool />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0 text-dark">KH 로비 출결 키오스크</h4>
                        <div className="text-muted small d-flex align-items-center gap-2 mt-1">
                            <FaClock />
                            <span>
                                {currentTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}{" "}
                                {currentTime.toLocaleTimeString("ko-KR", { hour12: false })}
                            </span>
                            <span className="text-secondary opacity-50">|</span>
                            <span className="d-none d-sm-inline-flex align-items-center">
                                <FaKeyboard className="me-1 text-secondary" /> 키보드/키패드(Enter) 지원
                            </span>
                        </div>
                    </div>
                </div>

                <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="d-flex align-items-center gap-1 border-0 py-2 px-3 fw-semibold"
                    onClick={() => navigate("/employeeHome")}
                >
                    <span>직원 화면</span>
                    <FaArrowRightFromBracket className="ms-1" />
                </Button>
            </div>

            {/* 메인 2분할 레이아웃 (PC: 좌측 키패드 / 우측 실시간 정보 카드) */}
            <Row className="g-4">
                
                {/* [좌측 영역] 번호 입력 & 키패드 */}
                <Col xs={12} md={7} lg={6}>
                    <Card className="border-0 shadow-sm p-3 p-sm-4 bg-white" style={{ borderRadius: "20px" }}>
                        <div className="text-center mb-3">
                            <span className="text-secondary small fw-bold">휴대폰 번호 뒷자리 4자리</span>
                        </div>

                        {/* 4자리 입력 디스플레이 */}
                        <div 
                            className="d-flex justify-content-center align-items-center gap-2 p-2 rounded mb-3"
                            style={{ backgroundColor: "#f8fafc", border: "2px solid #dee2e6", minHeight: "76px" }}
                        >
                            {[0, 1, 2, 3].map((idx) => (
                                <div 
                                    key={idx} 
                                    className="d-flex justify-content-center align-items-center fw-bold fs-2 rounded bg-white shadow-sm"
                                    style={{ 
                                        width: "56px", 
                                        height: "56px", 
                                        border: phoneTail[idx] ? "2px solid #0d6efd" : "1px solid #ced4da",
                                        color: "#212529"
                                    }}
                                >
                                    {phoneTail[idx] || ""}
                                </div>
                            ))}
                        </div>

                        {/* 숫자 키패드 */}
                        <Row className="g-2 mb-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <Col xs={4} key={num}>
                                    <Button 
                                        variant="outline-dark" 
                                        className="w-100 py-3 fs-3 fw-bold shadow-xs border-light-subtle"
                                        style={{ minHeight: "68px" }}
                                        onClick={() => handleKeyClick(String(num))}
                                        disabled={loading}
                                    >
                                        {num}
                                    </Button>
                                </Col>
                            ))}
                            <Col xs={4}>
                                <Button 
                                    variant="outline-danger" 
                                    className="w-100 py-3 fs-4 fw-bold shadow-xs d-flex justify-content-center align-items-center border-light-subtle"
                                    style={{ minHeight: "68px" }}
                                    onClick={handleClear}
                                    disabled={loading || !phoneTail}
                                    title="전체 지우기 (Esc)"
                                >
                                    <FaRotateLeft />
                                </Button>
                            </Col>
                            <Col xs={4}>
                                <Button 
                                    variant="outline-dark" 
                                    className="w-100 py-3 fs-3 fw-bold shadow-xs border-light-subtle"
                                    style={{ minHeight: "68px" }}
                                    onClick={() => handleKeyClick("0")}
                                    disabled={loading}
                                >
                                    0
                                </Button>
                            </Col>
                            <Col xs={4}>
                                <Button 
                                    variant="outline-secondary" 
                                    className="w-100 py-3 fs-4 fw-bold shadow-xs d-flex justify-content-center align-items-center border-light-subtle"
                                    style={{ minHeight: "68px" }}
                                    onClick={handleDelete}
                                    disabled={loading || !phoneTail}
                                    title="한 자리 지우기 (Backspace)"
                                >
                                    <FaDeleteLeft />
                                </Button>
                            </Col>
                        </Row>

                        {/* 출결 확인 버튼 */}
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="w-100 py-3 fs-4 fw-bold shadow-sm"
                            onClick={sendAttendance}
                            disabled={loading || phoneTail.length !== 4}
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                                <>
                                    <FaCheck className="me-2" />
                                    출결 확인 (Enter)
                                </>
                            )}
                        </Button>
                    </Card>
                </Col>

                {/* [우측 영역] 실시간 최근 출결 현황 카드 & 이용 안내 */}
                <Col xs={12} md={5} lg={6} className="d-flex flex-column gap-3">
                    
                    {/* 최근 출결 현황 카드 */}
                    <Card className="border-0 shadow-sm flex-grow-1" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
                        <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex align-items-center justify-content-between">
                            <span className="fw-bold text-dark fs-5">
                                <FaIdCard className="me-2 text-primary" /> 최근 출결 처리 내역
                            </span>
                            {recentAttendance && (
                                <Badge 
                                    bg={recentAttendance.attendanceState === "지각" ? "warning" : "success"} 
                                    text={recentAttendance.attendanceState === "지각" ? "dark" : "white"}
                                    className="fs-6 px-3 py-2"
                                >
                                    {recentAttendance.attendanceState}
                                </Badge>
                            )}
                        </Card.Header>
                        
                        <Card.Body className="p-4 d-flex flex-column justify-content-center">
                            {recentAttendance ? (
                                <div className="p-4 rounded-4" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h3 className="fw-bold mb-0 text-dark">
                                            {recentAttendance.studentName} 학생
                                        </h3>
                                        <span className="badge bg-white text-muted border px-2 py-1">
                                            <FaClock className="me-1" />
                                            {recentAttendance.attendanceTime}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="text-secondary small">수강 강좌</div>
                                        <div className="fw-bold fs-5 text-dark mt-1">
                                            {recentAttendance.courseTitle}
                                        </div>
                                    </div>

                                    <hr className="my-3 text-muted" />

                                    <div 
                                        className="d-flex align-items-center fw-semibold" 
                                        style={{ color: recentAttendance.attendanceState === "지각" ? "#d97706" : "#16a34a" }}
                                    >
                                        {recentAttendance.attendanceState === "지각" ? (
                                            <FaTriangleExclamation className="me-2 fs-5" />
                                        ) : (
                                            <FaCircleCheck className="me-2 fs-5" />
                                        )}
                                        <span>{recentAttendance.message}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-5 text-center text-muted">
                                    <div className="fs-1 text-secondary opacity-25 mb-3">
                                        <FaIdCard />
                                    </div>
                                    <h6 className="fw-bold text-secondary">대기 중</h6>
                                    <p className="small mb-0">
                                        좌측 키패드 또는 키보드로 번호를 입력하면<br />
                                        이곳에 출결 결과가 실시간으로 표시됩니다.
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* 하단 가이드 팁 */}
                    <div className="p-3 rounded-3 bg-light border text-secondary small d-flex align-items-start gap-2">
                        <FaCircleInfo className="mt-1 text-primary flex-shrink-0" />
                        <div>
                            <b>출결 안내:</b> 수업 시작 30분 전부터 체크 가능하며, 시작 시간 10분 초과 시 <b>지각</b>으로 자동 처리됩니다. 동일 번호 수강생이 존재할 경우 확인 팝업창이 나타납니다.
                        </div>
                    </div>

                </Col>
            </Row>

            {/* 동일 뒷자리 학생 선택 모달 */}
            <Modal 
                show={candidateModal} 
                onHide={() => setCandidateModal(false)} 
                centered 
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold fs-5">
                        <FaUserCheck className="me-2 text-primary" /> 학생 선택
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    <p className="text-muted small mb-3">
                        동일한 뒷자리 번호의 수강생이 여러 명 있습니다. <b>본인의 이름</b>을 선택하세요.
                    </p>
                    <div className="d-grid gap-2">
                        {candidates.map((cand) => (
                            <Button 
                                key={cand.studentNo} 
                                variant="outline-primary" 
                                size="lg" 
                                className="py-3 text-start d-flex justify-content-between align-items-center"
                                onClick={() => selectCandidate(cand.studentNo)}
                            >
                                <span className="fw-bold fs-5">{cand.studentName} 학생</span>
                                <Badge bg="secondary">학번 #{cand.studentNo}</Badge>
                            </Button>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}