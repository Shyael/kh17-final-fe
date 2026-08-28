import React, { useState } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, Row, Modal, Table } from "react-bootstrap";
import { FaSave, FaComments, FaCog, FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";

export default function StudentDetail() {
    // 임시 학생 데이터
    const [student, setStudent] = useState({
        sid: 127, name: "김학생", phone: "010-1234-5678", email: "kh@kh.com",
        guardianName: "김엄마", guardianPhone: "010-2222-3333", guardianEmail: "kh2@kh.com",
        address: "서울특별시 마포구 공덕동 29-6",
        school: "마포고", grade: "2학년", gender: "남자",
        remarks: "학구열이 뛰어나며 성적이 우수하여 조기 졸업에 관심이 있음",
        tuition: 350000, isPaid: false
    });

    // 어떤 모달이 열려있는지 관리하는 상태 (null, 'COURSE', 'GRADE', 'ATTENDANCE', 'PAYMENT', 'FEEDBACK')
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-fluid py-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold mb-0 text-primary">학생 상세 정보</h4>
                        <span className="text-muted fw-semibold">SID : {student.sid}</span>
                    </div>
                {/* 1. 기본 인적 사항 */}
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">기본 정보</h6>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">이름</Form.Label>
                                <Form.Control size="sm" type="text" name="name" value={student.name} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">연락처</Form.Label>
                                <Form.Control size="sm" type="text" name="phone" value={student.phone} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">이메일</Form.Label>
                                <Form.Control size="sm" type="email" name="email" value={student.email} onChange={handleChange} />
                            </Form.Group>
                        </Row>

                        {/* 2. 보호자 정보 */}
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">보호자 이름</Form.Label>
                                <Form.Control size="sm" type="text" name="guardianName" value={student.guardianName} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-primary fw-bold mb-1">보호자 연락처</Form.Label>
                                <Form.Control size="sm" type="text" name="guardianPhone" value={student.guardianPhone} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">보호자 이메일</Form.Label>
                                <Form.Control size="sm" type="email" name="guardianEmail" value={student.guardianEmail} onChange={handleChange} />
                            </Form.Group>
                        </Row>

                        {/* 3. 주소 및 학교 정보 */}
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={12}>
                                <Form.Label className="small text-muted mb-1">주소</Form.Label>
                                <Form.Control size="sm" type="text" name="address" value={student.address} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-4 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학교</Form.Label>
                                <Form.Control size="sm" type="text" name="school" value={student.school} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학년</Form.Label>
                                <Form.Select size="sm" name="grade" value={student.grade} onChange={handleChange}>
                                    <option>1학년</option>
                                    <option>2학년</option>
                                    <option>3학년</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">성별</Form.Label>
                                <Form.Select size="sm" name="gender" value={student.gender} onChange={handleChange}>
                                    <option>남자</option>
                                    <option>여자</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        {/* 4. 특이사항 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="small text-muted mb-1">특이사항 (정보)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="remarks" value={student.remarks} onChange={handleChange} />
                        </Form.Group>
                </Card.Header>

                <Card.Body className="p-4">
                    <Form>
                        {/* 5. 학원 관리 정보 (버튼에 onClick 이벤트 추가) */}
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-4">학사 및 수납 관리</h6>
                        
                        <Row className="mb-3 align-items-center">
                            <Col md={2} className="text-muted fw-semibold small">수강 과목</Col>
                            <Col md={10} className="d-flex align-items-center gap-2">
                                <Badge bg="light" text="dark" className="border px-2 py-1">영어 (심화)</Badge>
                                <Badge bg="light" text="dark" className="border px-2 py-1">수학 (선행)</Badge>
                                <Button variant="outline-secondary" size="sm" className="ms-2 py-0" onClick={() => setActiveModal('COURSE')}>
                                    <FaCog className="me-1"/>변경/등록
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-3 align-items-center">
                            <Col md={2} className="text-muted fw-semibold small">성적 조회</Col>
                            <Col md={10} className="d-flex align-items-center gap-2">
                                <span className="small text-secondary">최근 시험: 중간고사 (평균 92점)</span>
                                <Button variant="outline-secondary" size="sm" className="ms-2 py-0" onClick={() => setActiveModal('GRADE')}>
                                    <FaCog className="me-1"/>상세 조회/수정
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-3 align-items-center">
                            <Col md={2} className="text-muted fw-semibold small">최근 출석</Col>
                            <Col md={10} className="d-flex align-items-center gap-2">
                                <Badge bg="success" className="px-2 py-1"><FaCheckCircle className="me-1"/>영어 (출석)</Badge>
                                <Badge bg="danger" className="px-2 py-1"><FaTimesCircle className="me-1"/>수학 (미출석)</Badge>
                                <Button variant="outline-secondary" size="sm" className="ms-2 py-0" onClick={() => setActiveModal('ATTENDANCE')}>
                                    <FaCog className="me-1"/>전체 조회/수정
                                </Button>
                            </Col>
                        </Row>

                        <Row className="mb-4 align-items-center">
                            <Col md={2} className="text-muted fw-semibold small">이번 달 수강료</Col>
                            <Col md={6}>
                                <InputGroup size="sm">
                                    <Form.Control type="text" value={student.tuition.toLocaleString()} readOnly className="text-end bg-white" />
                                    <InputGroup.Text>원</InputGroup.Text>
                                    <InputGroup.Text className={student.isPaid ? "bg-success text-white fw-bold" : "bg-danger text-white fw-bold"}>
                                        {student.isPaid ? "완납" : "미납"}
                                    </InputGroup.Text>
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Button variant="outline-secondary" size="sm" onClick={() => setActiveModal('PAYMENT')}>
                                    <FaCog className="me-1"/>청구/수납 관리
                                </Button>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-5 border-top pt-3">
                            <Button variant="info" className="text-white d-flex align-items-center" onClick={() => setActiveModal('FEEDBACK')}>
                                <FaComments className="me-2" /> 피드백 보기/등록
                            </Button>
                            <Button variant="primary" className="d-flex align-items-center">
                                <FaSave className="me-2" /> 전체 정보 저장
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* =======================================================
                모달 컴포넌트 구역 (열린 상태값에 따라 렌더링)
            ======================================================= */}
            
            {/* 1. 수강 과목 관리 모달 */}
            <Modal show={activeModal === 'COURSE'} onHide={closeModal} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fs-5 fw-bold text-dark">수강 과목 변경/등록</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between mb-3">
                        <span className="fw-semibold">현재 수강 목록</span>
                        <Button variant="outline-primary" size="sm"><FaPlus className="me-1"/>새 과목 등록</Button>
                    </div>
                    <Table bordered hover size="sm" className="text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>과목명</th>
                                <th>강사명</th>
                                <th>수강료</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>영어 (심화)</td>
                                <td>이강사</td>
                                <td>200,000원</td>
                                <td><Badge bg="success">수강중</Badge></td>
                                <td><Button variant="danger" size="sm" className="py-0">수강 취소</Button></td>
                            </tr>
                            <tr>
                                <td>수학 (선행)</td>
                                <td>박강사</td>
                                <td>150,000원</td>
                                <td><Badge bg="success">수강중</Badge></td>
                                <td><Button variant="danger" size="sm" className="py-0">수강 취소</Button></td>
                            </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>닫기</Button>
                    <Button variant="primary">변경사항 저장</Button>
                </Modal.Footer>
            </Modal>

            {/* 2. 청구/수납 관리 모달 (이전에 설계했던 할인 적용 등 구현) */}
            <Modal show={activeModal === 'PAYMENT'} onHide={closeModal} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fs-5 fw-bold text-dark">청구 및 수납 관리 (8월)</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Card className="bg-light border-0">
                                <Card.Body className="py-2">
                                    <small className="text-muted">기본 총 수강료</small>
                                    <h5 className="mb-0">350,000원</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="bg-light border-0">
                                <Card.Body className="py-2">
                                    <small className="text-muted">적용된 할인 금액</small>
                                    <h5 className="text-danger mb-0">- 0원</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <hr />
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">할인 혜택 적용</Form.Label>
                        <div className="d-flex gap-3">
                            <Form.Check type="checkbox" label="형제/자매 할인 (5%)" />
                            <Form.Check type="checkbox" label="기초생활수급자 할인 (10%)" />
                            <Form.Check type="checkbox" label="장기수강 할인 (정액 2만 원)" />
                        </div>
                    </Form.Group>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center px-2">
                        <span className="fw-bold fs-5">최종 청구 금액</span>
                        <span className="fw-bold fs-4 text-primary">350,000원</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>닫기</Button>
                    <Button variant="success">수납(결제) 완료 처리</Button>
                </Modal.Footer>
            </Modal>

            {/* 추후 GRADE, ATTENDANCE, FEEDBACK 모달도 이 아래에 같은 패턴으로 추가하시면 됩니다! */}
        </div>
    );
}