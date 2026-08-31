import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, ProgressBar, Row, Table } from "react-bootstrap";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import { authClient } from "@utils/reaxios"; // 통신 모듈
import { Link } from "react-router-dom";

export default function StudentList() {
    // 1. 진짜 백엔드 데이터를 담을 state (가짜 데이터 지우고 빈 배열로 시작)
    const [students, setStudents] = useState([]);
    
    // 2. 우측 화면에 띄울 선택된 학생 (처음엔 아무도 선택 안 했으니 null)
    const [selectedStudent, setSelectedStudent] = useState(null); 
    
    const [filter, setFilter] = useState("전체");

    // 3. 백엔드 API 호출 함수
    const fetchStudents = useCallback(async () => {
        try {
            const response = await authClient.get("http://localhost:8080/api/student/list");
            setStudents(response.data); // 성공하면 받아온 List를 state에 쏙 넣습니다.
        } catch (error) {
            console.error("학생 목록 로딩 실패:", error);
        }
    }, []);

    // 4. 화면이 켜질 때 자동으로 1번 실행
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // 위험도 뱃지 색상 함수
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
                                        {/* 5. 맵핑된 백엔드 데이터(students)를 화면에 뿌려줍니다 */}
                                        {students.map((student) => (
                                            <tr 
                                                key={student.studentNo}
                                                onClick={() => setSelectedStudent(student)} // 🌟 클릭하면 우측 패널로 데이터 전달
                                                style={{ cursor: "pointer" }}
                                                className={selectedStudent?.studentNo === student.studentNo ? "table-primary" : ""}
                                            >
                                                <td className="fw-semibold">{student.studentName}</td>
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
                                                    <Badge bg={getRiskBadgeVariant(student.riskLevel)}>{student.riskLevel}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
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
                    {/* 6. 선택된 학생이 있을 때만 상세 카드를 보여줍니다 */}
                    {selectedStudent ? (
                        <Card className="shadow-sm border-0 h-100 bg-light">
                            <Card.Body>
                                <div className="mb-4">
                                    <h4 className="fw-bold mb-1">
                                        {/* VO 변수명에 맞게 studentName, studentGrade로 수정 완료 */}
                                        {selectedStudent.studentName} <span className="fs-6 text-muted ms-2">{selectedStudent.studentGrade}</span>
                                    </h4>
                                    <p className="text-muted mb-0">
                                        수강 강좌 : <strong>정보 없음</strong> {/* DB에서 아직 안가져온 데이터는 임시 처리 */}
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
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body style={{ minHeight: "100px" }}>
                                        <p className="text-muted small mb-0">아직 제출된 과제 상세 데이터가 없습니다.</p>
                                    </Card.Body>
                                </Card>
                                {/* 🌟 3. 상세 페이지로 이동하는 버튼 추가 */}
                                <Button 
                                    as={Link} 
                                    to={`/student/detail/${selectedStudent.studentNo}`}
                                    variant="primary" 
                                    className="w-100 mt-4 py-2 fw-bold"
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