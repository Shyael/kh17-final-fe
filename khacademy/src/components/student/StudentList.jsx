import React, { useState } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, ProgressBar, Row, Table } from "react-bootstrap";
import { FaSearch, FaUserPlus } from "react-icons/fa";

// 테스트용 임시 데이터 (실제로는 axios로 백엔드에서 받아올 데이터)
const mockStudents = [
    { id: 1, name: "김학생", school: "서울초등학교", grade: "초5", attendance: 72, unpaid: 0, risk: "낮음", courses: ["영어", "수학"], assignDone: 1, assignTotal: 2 },
    { id: 2, name: "박학생", school: "한국중학교", grade: "중2", attendance: 45, unpaid: 130000, risk: "주의", courses: ["영어"], assignDone: 0, assignTotal: 3 },
    { id: 3, name: "이학생", school: "우주초등학교", grade: "초3", attendance: 90, unpaid: 0, risk: "안전", courses: ["수학", "과학"], assignDone: 5, assignTotal: 5 },
];

export default function StudentList() {
    // 상태 관리
    const [students, setStudents] = useState(mockStudents);
    const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]); // 기본 선택
    const [filter, setFilter] = useState("전체");

    // 위험도에 따른 뱃지 색상 반환 함수
    const getRiskBadgeVariant = (risk) => {
        if (risk === "주의" || risk === "위험") return "danger";
        if (risk === "낮음" || risk === "안전") return "success";
        return "secondary";
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4 fw-bold">학생 관리</h2>

            <Row className="g-4">
                {/* ==========================================
                    좌측 패널: 학생 목록 및 검색
                ========================================== */}
                <Col lg={7}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            {/* 검색 및 필터 영역 */}
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

                            {/* 학생 목록 테이블 */}
                            <div className="table-responsive">
                                <Table hover className="align-middle text-center border-top">
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
                                        {students.map((student) => (
                                            <tr 
                                                key={student.id} 
                                                onClick={() => setSelectedStudent(student)}
                                                style={{ cursor: "pointer" }}
                                                className={selectedStudent?.id === student.id ? "table-primary" : ""}
                                            >
                                                <td className="fw-semibold">{student.name}</td>
                                                <td className="text-muted">{student.school}</td>
                                                <td style={{ width: "20%" }}>
                                                    <ProgressBar 
                                                        now={student.attendance} 
                                                        variant={student.attendance < 50 ? "danger" : "primary"} 
                                                        style={{ height: "8px" }} 
                                                    />
                                                </td>
                                                <td>
                                                    {student.unpaid > 0 ? (
                                                        <span className="text-danger fw-bold">{student.unpaid.toLocaleString()}원</span>
                                                    ) : (
                                                        <span className="text-muted">없음</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge bg={getRiskBadgeVariant(student.risk)}>{student.risk}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {/* 등록 버튼 */}
                            <div className="d-flex justify-content-end mt-3">
                                <Button variant="primary">
                                    <FaUserPlus className="me-2" /> 수강생 신규 등록
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ==========================================
                    우측 패널: 선택된 학생 상세 정보 (대시보드)
                ========================================== */}
                <Col lg={5}>
                    {selectedStudent ? (
                        <Card className="shadow-sm border-0 h-100 bg-light">
                            <Card.Body>
                                {/* 헤더 정보 */}
                                <div className="mb-4">
                                    <h4 className="fw-bold mb-1">
                                        {selectedStudent.name} <span className="fs-6 text-muted ms-2">{selectedStudent.grade}</span>
                                    </h4>
                                    <p className="text-muted mb-0">
                                        수강 강좌 : <strong>{selectedStudent.courses.join(", ")}</strong>
                                    </p>
                                </div>

                                {/* 요약 지표 (Cards) */}
                                <h6 className="fw-bold mb-3">종합 개요</h6>
                                <Row className="g-2 mb-4 text-center">
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>출석률(4주)</div>
                                                <div className="fs-4 fw-bold text-primary">{selectedStudent.attendance}%</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>미납액</div>
                                                <div className={`fs-5 fw-bold mt-1 ${selectedStudent.unpaid > 0 ? 'text-danger' : 'text-dark'}`}>
                                                    {selectedStudent.unpaid > 0 ? `${selectedStudent.unpaid.toLocaleString()}원` : '없음'}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={4}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>과제 제출</div>
                                                <div className="fs-4 fw-bold text-dark">
                                                    {selectedStudent.assignDone}<span className="fs-6 text-muted">/{selectedStudent.assignTotal}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* 상세 섹션 1: 과제 제출 내역 */}
                                <h6 className="fw-bold mb-2">최근 과제 제출 내역</h6>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body style={{ minHeight: "100px" }}>
                                        <p className="text-muted small mb-0">아직 제출된 과제 상세 데이터가 없습니다.</p>
                                    </Card.Body>
                                </Card>

                                {/* 상세 섹션 2: 강사별 코멘트/관리 */}
                                <h6 className="fw-bold mb-2">강사별 학생 관리 노트</h6>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body style={{ minHeight: "120px" }}>
                                        <p className="text-muted small mb-0">작성된 관리 노트가 없습니다.</p>
                                    </Card.Body>
                                </Card>
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