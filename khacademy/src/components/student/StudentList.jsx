import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, ProgressBar, Row, Table } from "react-bootstrap";
import { FaSearch, FaUserPlus, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { apiClient } from "@utils/reaxios";
import { Link } from "react-router-dom";

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [filter, setFilter] = useState("전체");
    
    // 추가되었던 요약 데이터 state 유지
    const [summary, setSummary] = useState({ total: 0, riskCount: 0 });

    const fetchStudents = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/student/list");
            const data = response.data;
            setStudents(data); 

            // 요약 데이터 계산 로직 유지
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

    // 원래 있던 기본 부트스트랩 뱃지 색상 함수로 복구
    const getRiskBadgeVariant = (risk) => {
        if (risk === "주의" || risk === "위험") return "danger";
        if (risk === "낮음" || risk === "안전") return "success";
        return "secondary";
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4 fw-bold">학생 관리</h2>

            {/* 원래 스타일에 맞춘 상단 요약 카드 (기본 부트스트랩 클래스 사용) */}
            <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 text-primary"><FaUserShield size={32} /></div>
                            <div>
                                <div className="text-muted small fw-bold">총 수강생</div>
                                <h4 className="fw-bold mb-0">{summary.total.toLocaleString()}명</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 text-danger"><FaExclamationTriangle size={32} /></div>
                            <div>
                                <div className="text-muted small fw-bold">집중 관리 대상</div>
                                <h4 className="fw-bold mb-0 text-danger">{summary.riskCount.toLocaleString()}명</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* ==========================================
                    좌측 패널: 학생 목록 및 검색
                ========================================== */}
                <Col lg={7}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column">
                            
                            <Row className="mb-3">
                                <Col sm={4}>
                                    <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                        <option value="전체">전체 (재원)</option>
                                        <option value="미납">미납자</option>
                                        <option value="휴원">휴원/퇴원</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={8}>
                                    <InputGroup>
                                        <Form.Control placeholder="학생 이름 또는 학교명 검색" />
                                        <Button variant="outline-secondary">
                                            <FaSearch /> 검색
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <div className="table-responsive flex-grow-1">
                                <Table hover className="align-middle text-center border-top mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>이름</th>
                                            <th>학교</th>
                                            <th>출석률(4주)</th>
                                            <th>미납액</th>
                                            <th>이탈위험</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-4 text-muted">등록된 학생 데이터가 없습니다.</td>
                                            </tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr 
                                                    key={student.studentNo}
                                                    onClick={() => setSelectedStudent(student)}
                                                    style={{ cursor: "pointer" }}
                                                    className={selectedStudent?.studentNo === student.studentNo ? "table-primary" : ""}
                                                >
                                                    <td className="fw-semibold">
                                                        {student.studentName}
                                                        {/* 추가하셨던 대기 상태 뱃지 유지 */}
                                                        {student.studentAcademicStatus === '대기' && (
                                                            <Badge bg="warning" text="dark" className="ms-2">대기</Badge>
                                                        )}
                                                    </td>
                                                    <td className="text-muted">{student.studentSchool}</td>
                                                    <td style={{ width: "20%" }}>
                                                        <ProgressBar 
                                                            now={student.attendanceRate} 
                                                            variant={student.attendanceRate < 50 ? "danger" : "primary"} 
                                                            style={{ height: "8px" }} 
                                                        />
                                                    </td>
                                                    <td>
                                                        {student.unpaidAmount > 0 ? (
                                                            <span className="text-danger fw-bold">{student.unpaidAmount.toLocaleString()}원</span>
                                                        ) : (
                                                            <span className="text-muted">없음</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge bg={getRiskBadgeVariant(student.riskLevel)}>
                                                            {student.riskLevel}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                <Button variant="primary">
                                    <FaUserPlus className="me-2" /> 수강생 신규 등록
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
                        <Card className="shadow-sm border-0 h-100 bg-light">
                            <Card.Body className="d-flex flex-column">
                                
                                <div className="mb-4">
                                    <h4 className="fw-bold mb-1">
                                        {selectedStudent.studentName} <span className="fs-6 text-muted ms-2">{selectedStudent.studentGrade}</span>
                                    </h4>
                                    <p className="text-muted mb-0">
                                        수강 강좌 : <strong>정보 없음</strong>
                                    </p>
                                </div>

                                <h6 className="fw-bold mb-3">종합 개요</h6>
                                <Row className="g-2 mb-4 text-center">
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>출석률(4주)</div>
                                                <div className="fs-4 fw-bold text-primary">{selectedStudent.attendanceRate}%</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>미납액</div>
                                                <div className={`fs-5 fw-bold mt-1 ${selectedStudent.unpaidAmount > 0 ? 'text-danger' : 'text-dark'}`}>
                                                    {selectedStudent.unpaidAmount > 0 ? `${selectedStudent.unpaidAmount.toLocaleString()}원` : '없음'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>과제 제출</div>
                                                <div className="fs-4 fw-bold text-dark">
                                                    -<span className="fs-6 text-muted">/-</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mb-2">최근 과제 제출 내역</h6>
                                <Card className="border-0 shadow-sm mb-4 flex-grow-1">
                                    <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: "100px" }}>
                                        <p className="text-muted small mb-0">아직 제출된 과제 상세 데이터가 없습니다.</p>
                                    </Card.Body>
                                </Card>

                                <Button 
                                    as={Link} 
                                    to={`/student/detail/${selectedStudent.studentNo}`}
                                    variant="primary" 
                                    className="w-100 py-2 fw-bold mt-auto"
                                >
                                    학생 상세 정보 및 수정하기
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card className="shadow-sm border-0 h-100 bg-light d-flex align-items-center justify-content-center">
                            <span className="text-muted">좌측 목록에서 학생을 선택해주세요.</span>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}