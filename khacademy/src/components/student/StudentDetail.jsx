import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
// 🌟 1. 누락되었던 FaPlus, FaTrash 아이콘 추가 완료!
import { FaSave, FaComments, FaTrash, FaPlus } from "react-icons/fa"; 
import { useParams, useNavigate } from "react-router-dom";
import { authClient } from "@utils/reaxios"; 

export default function StudentDetail() {
    const { studentNo } = useParams(); 
    const navigate = useNavigate(); 
    const [student, setStudent] = useState(null);
    
    // 결제 데이터 State 
    const [payments, setPayments] = useState([]);
    const [totalUnpaid, setTotalUnpaid] = useState(0);

    // 할인 혜택 관련 State
    const [allDiscounts, setAllDiscounts] = useState([]); 
    const [studentDiscounts, setStudentDiscounts] = useState([]); 
    const [selectedDiscountNo, setSelectedDiscountNo] = useState(""); 

    // 학생 기본 정보 불러오기
    const fetchStudentDetail = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/student/detail/${studentNo}`);
            setStudent(response.data);
        } catch (error) {
            console.error("학생 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    // 학생 결제 내역 불러오기
    const fetchStudentPayments = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/payment/student/${studentNo}`);
            const paymentData = response.data;
            setPayments(paymentData);

            const unpaidSum = paymentData.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
            setTotalUnpaid(unpaidSum);
        } catch (error) {
            console.error("결제 내역 로딩 실패:", error);
        }
    }, [studentNo]);

    // 할인 정보 불러오기
    const fetchDiscounts = useCallback(async () => {
        try {
            const allRes = await authClient.get("http://localhost:8080/api/payment/discount/list");
            setAllDiscounts(allRes.data.filter(d => d.discountStatus === 'Y'));
            
            const studentRes = await authClient.get(`http://localhost:8080/api/student/${studentNo}/discount`);
            setStudentDiscounts(studentRes.data);
        } catch (error) {
            console.error("할인 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    // 학생에게 할인 혜택 추가하기
    const handleAddDiscount = async () => {
        if (!selectedDiscountNo) {
            alert("적용할 할인을 선택해 주세요.");
            return;
        }
        try {
            await authClient.post(`http://localhost:8080/api/student/${studentNo}/discount/${selectedDiscountNo}`);
            setSelectedDiscountNo(""); 
            fetchDiscounts(); 
        } catch (error) {
            console.error("할인 적용 실패:", error);
            alert("할인 적용에 실패했습니다.");
        }
    };

    // 학생의 할인 혜택 해제하기
    const handleRemoveDiscount = async (studentDiscountNo) => {
        if (!window.confirm("이 할인 혜택을 해제하시겠습니까?")) return;
        try {
            await authClient.delete(`http://localhost:8080/api/student/discount/${studentDiscountNo}`);
            fetchDiscounts(); 
        } catch (error) {
            console.error("할인 해제 실패:", error);
            alert("할인 해제에 실패했습니다.");
        }
    };

    // 화면 켜질 때 동시 호출
    useEffect(() => {
        fetchStudentDetail();
        fetchStudentPayments();
        fetchDiscounts(); 
    }, [fetchStudentDetail, fetchStudentPayments, fetchDiscounts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!window.confirm("학생 정보를 이대로 수정하시겠습니까?")) return;
        try {
            const response = await authClient.put("http://localhost:8080/api/student/edit", student);
            alert(response.data); 
            fetchStudentDetail(); 
        } catch (error) {
            console.error("수정 실패:", error);
            alert("정보 수정에 실패했습니다.");
        }
    };

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
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                                ← 뒤로
                            </Button>
                            <h4 className="fw-bold mb-0 text-primary">학생 상세 정보</h4>
                        </div>
                        <span className="text-muted fw-semibold">SID : {student.studentNo}</span>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    {/* 1. 종합 개요 대시보드 */}
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">종합 개요</h6>
                    <Row className="g-3 mb-4 text-center">
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100 p-3">
                                <div className="text-muted small fw-bold mb-2">출석률 (4주)</div>
                                <h4 className="fw-bold mb-0">100%</h4>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100 p-3 bg-light">
                                <div className="text-muted small fw-bold mb-2">총 미납액</div>
                                <h4 className={`fw-bold mb-0 ${totalUnpaid > 0 ? 'text-danger' : 'text-success'}`}>
                                    {totalUnpaid > 0 ? `₩${totalUnpaid.toLocaleString()}` : "없음"}
                                </h4>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100 p-3">
                                <div className="text-muted small fw-bold mb-2">과제 제출</div>
                                <h4 className="fw-bold mb-0">- / -</h4>
                            </Card>
                        </Col>
                    </Row>

                    {/* 2. 최근 수납 내역 테이블 */}
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-4">최근 수납 내역</h6>
                    <Card className="border-0 shadow-sm mb-5">
                        <Card.Body className="p-0">
                            {payments.length === 0 ? (
                                <div className="p-4 text-center text-muted small">수납 내역이 없습니다.</div>
                            ) : (
                                <Table hover responsive className="align-middle text-center mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>청구 월</th>
                                            <th>청구 금액</th>
                                            <th>납부 상태</th>
                                            <th>미납액</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.slice(0, 3).map(p => (
                                            <tr key={p.paymentNo}>
                                                <td className="fw-bold">{p.paymentMonth}</td>
                                                <td>₩{p.totalAmount?.toLocaleString()}</td>
                                                <td>
                                                    <Badge bg={p.paymentStatus === '완납' ? 'success' : p.paymentStatus === '미납' ? 'danger' : 'warning'}>
                                                        {p.paymentStatus}
                                                    </Badge>
                                                </td>
                                                <td className={p.remainingAmount > 0 ? "text-danger fw-bold" : "text-muted"}>
                                                    {p.remainingAmount > 0 ? `₩${p.remainingAmount.toLocaleString()}` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    {/* 🌟 3. 할인 혜택 관리 영역 (위치 교정됨: 폼 바깥으로 분리) */}
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-5">적용 중인 할인 혜택 관리</h6>
                    <Row className="mb-4 align-items-center">
                        <Col md={3} className="text-muted fw-semibold small">새로운 할인 추가</Col>
                        <Col md={6}>
                            <div className="d-flex gap-2">
                                <Form.Select 
                                    size="sm" 
                                    value={selectedDiscountNo} 
                                    onChange={(e) => setSelectedDiscountNo(e.target.value)}
                                >
                                    <option value="">적용할 할인을 선택하세요</option>
                                    {allDiscounts.map(d => (
                                        <option key={d.discountNo} value={d.discountNo}>
                                            {d.discountName} ({d.discountType === '비율' ? `${d.discountValue}%` : `₩${d.discountValue.toLocaleString()}`})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Button variant="primary" size="sm" className="d-flex align-items-center flex-shrink-0" onClick={handleAddDiscount}>
                                    <FaPlus className="me-1" /> 추가
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <div className="border rounded bg-light p-3 mb-5">
                        {studentDiscounts.length === 0 ? (
                            <div className="text-center text-muted small py-2">현재 적용 중인 할인 혜택이 없습니다.</div>
                        ) : (
                            <div className="d-flex flex-wrap gap-2">
                                {studentDiscounts.map(sd => (
                                    <Badge 
                                        key={sd.studentDiscountNo} 
                                        bg="white" 
                                        text="dark" 
                                        className="border d-flex align-items-center p-2 shadow-sm"
                                    >
                                        <span className="me-2 fw-bold text-primary">{sd.discountName}</span>
                                        <span className="me-3 text-muted">
                                            ({sd.discountType === '비율' ? `${sd.discountValue}%` : `₩${sd.discountValue.toLocaleString()}`})
                                        </span>
                                        <FaTrash 
                                            className="text-danger" 
                                            style={{ cursor: "pointer" }} 
                                            onClick={() => handleRemoveDiscount(sd.studentDiscountNo)}
                                            title="할인 해제"
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. 정보 수정 Form 영역 */}
                    <Form>
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">기본 인적 사항</h6>
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

                        <Form.Group className="mb-4">
                            <Form.Label className="small text-muted mb-1">특이사항 (정보)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="studentEtc" value={student.studentEtc || ""} onChange={handleChange} />
                        </Form.Group>

                        {/* 버튼 영역 위치 고정 */}
                        <div className="d-flex justify-content-end gap-2 mt-5 border-top pt-3">
                            <Button variant="info" className="text-white d-flex align-items-center">
                                <FaComments className="me-2" /> 피드백 보기/등록
                            </Button>
                            <Button variant="primary" className="d-flex align-items-center" onClick={handleUpdate}>
                                <FaSave className="me-2" /> 정보 수정 (저장)
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}