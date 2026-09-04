import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Col, Form, InputGroup, ProgressBar, Row, Table } from "react-bootstrap";
import { FaSearch, FaUserPlus, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { authClient } from "@utils/reaxios";
import { Link } from "react-router-dom";

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [filter, setFilter] = useState("전체");
    const [summary, setSummary] = useState({ total: 0, riskCount: 0 });

    const fetchStudents = useCallback(async () => {
        try {
            const response = await authClient.get("http://localhost:8080/api/student/list");
            const data = response.data;
            setStudents(data); 

            const total = data.length;
            const riskCount = data.filter(s => s.riskLevel === '위험' || s.riskLevel === '주의').length;
            setSummary({ total, riskCount });
        } catch (error) {
            console.error("학생 목록 로딩 실패:", error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // 🌟 CSS 변수 팔레트를 활용한 위험도 뱃지 디자인
    const getRiskStyle = (risk) => {
        if (risk === "주의" || risk === "위험") {
            // Point Pink 컬러 사용
            return { bg: "rgba(232, 93, 117, 0.1)", color: "var(--color-point-pink)", border: "1px solid rgba(232, 93, 117, 0.3)" }; 
        }
        if (risk === "낮음" || risk === "안전") {
            // 안전할 땐 골드/뮤트톤 사용
            return { bg: "var(--color-surface)", color: "var(--color-accent-gold)", border: "1px solid var(--color-border)" }; 
        }
        return { bg: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" };
    };

    return (
        // 사이드바 너비(260px)만큼 컨텐츠 전체에 좌측 마진 적용
        <div className="container-fluid py-4 px-4 px-lg-5" style={{ backgroundColor: "var(--color-bg-base)", minHeight: "calc(100vh - 64px)", marginLeft: "260px", width: "calc(100% - 260px)", fontFamily: "'Pretendard', sans-serif" }}>
            
            {/* 상단 헤더 & 요약 카드 영역 */}
            <Row className="mb-4 align-items-end gy-3">
                <Col lg={5}>
                    <h3 className="fw-bolder mb-2" style={{ color: "var(--color-text-main)", letterSpacing: "-0.5px" }}>학생 관리</h3>
                    <p className="mb-0" style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>원생 목록을 조회하고 상세 정보를 관리하세요.</p>
                </Col>
                
                <Col lg={7} className="d-flex justify-content-lg-end gap-3">
                    {/* 요약 카드 1: 총 수강생 */}
                    <div className="px-4 py-3 d-flex align-items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--color-surface-white)", borderRadius: "12px", border: "1px solid var(--color-border)", minWidth: "200px" }}>
                        <div className="p-2 rounded-circle" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-accent-gold)" }}>
                            <FaUserShield size={20} />
                        </div>
                        <div>
                            <div className="small fw-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>총 수강생</div>
                            <h4 className="fw-bolder mb-0" style={{ color: "var(--color-text-main)" }}>
                                {summary.total.toLocaleString()}<span className="fs-6 ms-1 fw-normal" style={{ color: "var(--color-text-muted)" }}>명</span>
                            </h4>
                        </div>
                    </div>

                    {/* 요약 카드 2: 집중 관리 대상 */}
                    <div className="px-4 py-3 d-flex align-items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--color-surface-white)", borderRadius: "12px", border: `1px solid var(--color-point-pink)`, minWidth: "200px" }}>
                        <div className="p-2 rounded-circle" style={{ backgroundColor: "rgba(232, 93, 117, 0.1)", color: "var(--color-point-pink)" }}>
                            <FaExclamationTriangle size={20} />
                        </div>
                        <div>
                            <div className="small fw-semibold mb-1" style={{ color: "var(--color-point-pink)" }}>집중 관리 대상</div>
                            <h4 className="fw-bolder mb-0" style={{ color: "var(--color-point-pink)" }}>
                                {summary.riskCount.toLocaleString()}<span className="fs-6 ms-1 fw-normal opacity-75">명</span>
                            </h4>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="g-4">
                {/* ==========================================
                    좌측 패널: 학생 목록 및 검색
                ========================================== */}
                <Col lg={7}>
                    <Card className="shadow-sm h-100" style={{ borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-white)" }}>
                        <Card.Body className="p-4 d-flex flex-column">
                            
                            {/* 검색 및 필터 */}
                            <Row className="mb-4 gy-2">
                                <Col sm={4}>
                                    <Form.Select 
                                        value={filter} 
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="shadow-none fw-semibold"
                                        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-main)", borderRadius: "8px", height: "45px" }}
                                    >
                                        <option value="전체">전체 (재원)</option>
                                        <option value="미납">미납자</option>
                                        <option value="휴원">휴원/퇴원</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={8}>
                                    <InputGroup>
                                        <Form.Control 
                                            placeholder="학생 이름 또는 학교명 검색" 
                                            className="shadow-none"
                                            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-main)", borderRadius: "8px 0 0 8px", height: "45px" }}
                                        />
                                        <Button 
                                            className="px-4 fw-bold shadow-none"
                                            style={{ backgroundColor: "var(--color-text-main)", borderColor: "var(--color-text-main)", color: "var(--color-surface-white)", borderRadius: "0 8px 8px 0" }} 
                                        >
                                            <FaSearch />
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {/* 리스트 테이블 */}
                            <div className="table-responsive flex-grow-1">
                                <Table hover className="align-middle text-center mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                                    <thead>
                                        <tr>
                                            <th className="fw-semibold py-3 border-0" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", borderBottom: "2px solid var(--color-border) !important" }}>이름</th>
                                            <th className="fw-semibold py-3 border-0" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", borderBottom: "2px solid var(--color-border) !important" }}>학교</th>
                                            <th className="fw-semibold py-3 border-0" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", borderBottom: "2px solid var(--color-border) !important" }}>출석률(4주)</th>
                                            <th className="fw-semibold py-3 border-0" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", borderBottom: "2px solid var(--color-border) !important" }}>미납액</th>
                                            <th className="fw-semibold py-3 border-0" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", borderBottom: "2px solid var(--color-border) !important" }}>이탈위험</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-5 border-0" style={{ color: "var(--color-text-muted)" }}>등록된 학생 데이터가 없습니다.</td>
                                            </tr>
                                        ) : (
                                            students.map((student) => {
                                                const riskStyle = getRiskStyle(student.riskLevel);
                                                const isSelected = selectedStudent?.studentNo === student.studentNo;
                                                
                                                return (
                                                    <tr 
                                                        key={student.studentNo}
                                                        onClick={() => setSelectedStudent(student)}
                                                        style={{ 
                                                            cursor: "pointer", 
                                                            transition: "all 0.2s",
                                                            // 선택된 행은 Surface 배경과 Gold 테두리로 하이라이트
                                                            backgroundColor: isSelected ? "var(--color-surface)" : "transparent",
                                                            borderLeft: isSelected ? "4px solid var(--color-accent-gold)" : "4px solid transparent"
                                                        }}
                                                    >
                                                        <td className="border-0 py-3 fw-bolder" style={{ color: isSelected ? "var(--color-accent-gold)" : "var(--color-text-main)" }}>
                                                            {student.studentName}
                                                        </td>
                                                        <td className="border-0 py-3" style={{ color: "var(--color-text-muted)" }}>{student.studentSchool}</td>
                                                        <td className="border-0 py-3" style={{ width: "25%" }}>
                                                            {/* 부트스트랩 프로그레스바 컬러 오버라이딩 (인라인 강제 적용) */}
                                                            <div className="progress" style={{ height: "6px", backgroundColor: "var(--color-border-subtle)" }}>
                                                                <div className="progress-bar" role="progressbar" 
                                                                    style={{ 
                                                                        width: `${student.attendanceRate}%`, 
                                                                        backgroundColor: student.attendanceRate < 80 ? "var(--color-point-pink)" : "var(--color-accent-gold)" 
                                                                    }}>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="border-0 py-3">
                                                            {student.unpaidAmount > 0 ? (
                                                                <span className="fw-bold" style={{ color: "var(--color-point-pink)" }}>{student.unpaidAmount.toLocaleString()}원</span>
                                                            ) : (
                                                                <span style={{ color: "var(--color-text-muted)" }}>-</span>
                                                            )}
                                                        </td>
                                                        <td className="border-0 py-3">
                                                            <span 
                                                                className="px-3 py-1 fw-bold rounded-pill" 
                                                                style={{ backgroundColor: riskStyle.bg, color: riskStyle.color, border: riskStyle.border, fontSize: "0.8rem" }}
                                                            >
                                                                {student.riskLevel}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                                <Button 
                                    className="px-4 py-2 fw-bold shadow-none d-flex align-items-center gap-2"
                                    style={{ backgroundColor: "var(--color-accent-gold)", borderColor: "var(--color-accent-gold)", color: "var(--color-surface-white)", borderRadius: "8px" }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = "var(--color-accent-gold-hover)"}
                                    onMouseOut={(e) => e.target.style.backgroundColor = "var(--color-accent-gold)"}
                                >
                                    <FaUserPlus /> 신규 등록
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ==========================================
                    우측 패널: 선택된 학생 상세 정보
                ========================================== */}
                <Col lg={5}>
                    {selectedStudent ? (
                        <Card className="shadow-sm h-100" style={{ borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-white)" }}>
                            <Card.Body className="p-4 p-lg-5 d-flex flex-column">
                                
                                <div className="mb-4 pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <h3 className="fw-bolder mb-1" style={{ color: "var(--color-text-main)" }}>
                                        {selectedStudent.studentName} <span className="fs-6 fw-semibold ms-1" style={{ color: "var(--color-text-muted)" }}>{selectedStudent.studentGrade}</span>
                                    </h3>
                                    <p className="mb-0 mt-2" style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                                        수강 강좌 : <strong style={{ color: "var(--color-text-main)" }}>정보 없음</strong>
                                    </p>
                                </div>

                                <h6 className="fw-bold mb-3" style={{ color: "var(--color-text-muted)" }}>종합 개요</h6>
                                <Row className="g-3 mb-5 text-center">
                                    <Col xs={4}>
                                        <Card className="border-0" style={{ backgroundColor: "var(--color-surface)", borderRadius: "8px" }}>
                                            <Card.Body className="p-3">
                                                <div className="fw-semibold mb-2" style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>출석률(4주)</div>
                                                <div className="fs-4 fw-bolder" style={{ color: selectedStudent.attendanceRate < 80 ? "var(--color-point-pink)" : "var(--color-text-main)" }}>
                                                    {selectedStudent.attendanceRate}%
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0" style={{ backgroundColor: selectedStudent.unpaidAmount > 0 ? "rgba(232, 93, 117, 0.05)" : "var(--color-surface)", borderRadius: "8px" }}>
                                            <Card.Body className="p-3">
                                                <div className="fw-semibold mb-2" style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>미납액</div>
                                                <div className="fs-5 fw-bolder" style={{ color: selectedStudent.unpaidAmount > 0 ? "var(--color-point-pink)" : "var(--color-text-main)" }}>
                                                    {selectedStudent.unpaidAmount > 0 ? `${selectedStudent.unpaidAmount.toLocaleString()}` : '없음'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0" style={{ backgroundColor: "var(--color-surface)", borderRadius: "8px" }}>
                                            <Card.Body className="p-3">
                                                <div className="fw-semibold mb-2" style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>과제 제출</div>
                                                <div className="fs-4 fw-bolder" style={{ color: "var(--color-text-main)" }}>
                                                    -<span className="fs-6 fw-normal" style={{ color: "var(--color-text-muted)" }}>/ -</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mb-3" style={{ color: "var(--color-text-muted)" }}>최근 과제 제출 내역</h6>
                                <Card className="border-0 flex-grow-1 mb-4" style={{ backgroundColor: "var(--color-surface)", border: "1px dashed var(--color-border) !important", borderRadius: "8px" }}>
                                    <Card.Body className="d-flex align-items-center justify-content-center">
                                        <p className="small mb-0" style={{ color: "var(--color-text-muted)" }}>아직 제출된 과제 상세 데이터가 없습니다.</p>
                                    </Card.Body>
                                </Card>

                                <Button 
                                    as={Link} 
                                    to={`/student/detail/${selectedStudent.studentNo}`}
                                    className="w-100 py-3 fw-bold shadow-none mt-auto"
                                    style={{ backgroundColor: "var(--color-text-main)", borderColor: "var(--color-text-main)", color: "var(--color-surface-white)", borderRadius: "8px", fontSize: "1.05rem" }}
                                >
                                    상세 정보 및 수정
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        // 빈 상태 화면
                        <Card className="shadow-sm border-0 h-100 d-flex align-items-center justify-content-center" style={{ borderRadius: "12px", backgroundColor: "var(--color-surface-white)", border: "1px solid var(--color-border)" }}>
                            <div className="text-center">
                                <div className="mb-3" style={{ color: "var(--color-border)" }}>
                                    <FaSearch size={50} />
                                </div>
                                <h5 className="fw-bold mb-1" style={{ color: "var(--color-text-main)" }}>학생을 선택해주세요</h5>
                                <p className="small" style={{ color: "var(--color-text-muted)" }}>좌측 목록에서 학생을 클릭하면 상세 정보를 볼 수 있습니다.</p>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}