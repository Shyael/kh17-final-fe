import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, Row, Modal, Table, Spinner } from "react-bootstrap";
import { FaSave, FaComments, FaCog, FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import { authClient } from "@utils/reaxios"; // 통신 모듈 가져오기
import { useParams, useNavigate } from "react-router-dom";

export default function StudentDetail() {
    // 2. 🌟 주소창(URL)에서 studentNo 뽑아내기! (아까 임시로 적었던 const studentNo = 6; 은 삭제)
    const { studentNo } = useParams(); 
    const navigate = useNavigate(); // 뒤로 가기용

    const [student, setStudent] = useState(null);

    // 3. fetchStudentDetail 함수는 그대로 둡니다. 
    // 이제 위에서 뽑은 진짜 studentNo가 백엔드로 날아갑니다!
    const fetchStudentDetail = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/student/${studentNo}`);
            setStudent(response.data);
        } catch (error) {
            console.error("학생 상세 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    // 🌟 2. 진짜 백엔드 데이터를 담을 state (데이터가 오기 전까지는 null 상태)
    const [activeModal, setActiveModal] = useState(null);

    const closeModal = () => setActiveModal(null);


    // 🌟 4. 컴포넌트가 켜질 때 한 번 데이터 불러오기
    useEffect(() => {
        fetchStudentDetail();
    }, [fetchStudentDetail]);

    // 입력값 변경 핸들러 (수정 기능을 위해 남겨둡니다)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        // 실수로 누를 수도 있으니 확인 창 띄우기
        if (!window.confirm("학생 정보를 이대로 수정하시겠습니까?")) return;

        try {
            // 현재 Form에 입력된 상태(student)를 그대로 통째로 백엔드에 쏴줍니다.
            // (화면의 tuition 같은 쓸데없는 데이터가 섞여 있어도, 백엔드 VO가 알아서 필요한 것만 걸러 받습니다!)
            const response = await authClient.put("http://localhost:8080/api/student/edit", student);
            
            // 백엔드 컨트롤러가 보낸 성공 메시지 띄우기 ("학생 정보가 성공적으로 수정되었습니다.")
            alert(response.data); 
            
            // 수정 완료 후 목록으로 돌려보내거나, 다시 최신 데이터를 불러옵니다.
            // 여기서는 최신 데이터로 다시 덮어씌워 봅니다.
            fetchStudentDetail(); 
            
        } catch (error) {
            console.error("수정 실패:", error);
            alert("정보 수정에 실패했습니다. 관리자에게 문의하세요.");
        }
    };

    // 🌟 5. 데이터가 아직 안 왔으면 로딩 스피너 보여주기 (에러 방지)
    if (!student) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-primary fw-bold">학생 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            {/* 🌟 4. 목록으로 돌아가기 버튼 추가 */}
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                                ← 뒤로
                            </Button>
                            <h4 className="fw-bold mb-0 text-primary">학생 상세 정보</h4>
                        </div>
                        <span className="text-muted fw-semibold">SID : {student.studentNo}</span>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    <Form>
                        {/* 1. 기본 인적 사항 */}
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">기본 정보</h6>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">이름</Form.Label>
                                <Form.Control size="sm" type="text" name="studentName" value={student.studentName || ""} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">연락처</Form.Label>
                                <Form.Control size="sm" type="text" name="studentPhone" value={student.studentPhone || ""} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">이메일</Form.Label>
                                <Form.Control size="sm" type="email" name="studentEmail" value={student.studentEmail || ""} onChange={handleChange} />
                            </Form.Group>
                        </Row>

                        {/* 2. 보호자 정보 */}
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">보호자 이름</Form.Label>
                                <Form.Control size="sm" type="text" name="guardianName" value={student.guardianName || ""} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-primary fw-bold mb-1">보호자 연락처</Form.Label>
                                <Form.Control size="sm" type="text" name="guardianPhone" value={student.guardianPhone || ""} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">보호자 이메일</Form.Label>
                                <Form.Control size="sm" type="email" name="guardianEmail" value={student.guardianEmail || ""} onChange={handleChange} />
                            </Form.Group>
                        </Row>

                        {/* 3. 주소 및 학교 정보 */}
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={12}>
                                <Form.Label className="small text-muted mb-1">주소</Form.Label>
                                <Form.Control size="sm" type="text" name="address" value={student.address || ""} onChange={handleChange} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-4 g-3">
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학교</Form.Label>
                                <Form.Control size="sm" type="text" name="studentSchool" value={student.studentSchool || ""} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학년</Form.Label>
                                <Form.Select size="sm" name="studentGrade" value={student.studentGrade || ""} onChange={handleChange}>
                                    <option>초등학생</option>
                                    <option>중학생</option>
                                    <option>고등학생</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">성별</Form.Label>
                                <Form.Select size="sm" name="studentGender" value={student.studentGender || ""} onChange={handleChange}>
                                    <option>M</option>
                                    <option>F</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        {/* 4. 특이사항 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="small text-muted mb-1">특이사항 (정보)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="studentEtc" value={student.studentEtc || ""} onChange={handleChange} />
                        </Form.Group>

                        {/* 5. 하단 학사 관리 및 버튼 영역 */}
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-4">학사 및 수납 관리</h6>
                        <Row className="mb-4 align-items-center">
                            <Col md={2} className="text-muted fw-semibold small">이번 달 수강료</Col>
                            <Col md={6}>
                                <InputGroup size="sm">
                                    <Form.Control type="text" value={student.tuition ? student.tuition.toLocaleString() : "0"} readOnly className="text-end bg-white" />
                                    <InputGroup.Text>원</InputGroup.Text>
                                    <InputGroup.Text className={student.isPaid ? "bg-success text-white fw-bold" : "bg-danger text-white fw-bold"}>
                                        {student.isPaid ? "완납" : "미납"}
                                    </InputGroup.Text>
                                </InputGroup>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-5 border-top pt-3">
                            <Button variant="info" className="text-white d-flex align-items-center">
                                <FaComments className="me-2" /> 피드백 보기/등록
                            </Button>
                            <Button 
                                variant="primary" 
                                className="d-flex align-items-center"
                                onClick={handleUpdate} 
                            >
                                <FaSave className="me-2" /> 정보 수정 (저장)
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}