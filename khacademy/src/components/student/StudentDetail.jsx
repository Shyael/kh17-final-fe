import React, { useState, useEffect, useCallback } from "react";
// 🌟 InputGroup 임포트 추가
import { Badge, Button, Card, Col, Form, Row, Spinner, Table, InputGroup } from "react-bootstrap";
// 🌟 FaUserTie 아이콘 임포트 추가
import { FaSave, FaComments, FaTrash, FaPlus, FaUserTie } from "react-icons/fa"; 
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

    // 학부모 정보 State
    const [parentInfo, setParentInfo] = useState(null);

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

    // ==========================================
    // 🌟 학부모 정보 불러오기 (useEffect 밖으로 빼냈습니다!)
    // ==========================================
    const fetchParentInfo = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/parent/student/${studentNo}`);
            if (response.data) {
                setParentInfo(response.data);
            } else {
                setParentInfo(null);
            }
        } catch (error) {
            console.error("학부모 정보 로딩 실패:", error);
        }
    }, [studentNo]);


    // 학생에게 할인 혜택 추가하기
    const handleAddDiscount = async () => {
        if (!selectedDiscountNo) {
            alert("적용할 할인을 선택해 주세요.");
            return;
        }
        
        const isDuplicate = studentDiscounts.some(
            (sd) => sd.discountNo.toString() === selectedDiscountNo.toString()
        );
        if (isDuplicate) {
            alert("이미 적용되어 있는 할인 혜택입니다.");
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


    // ==========================================
    // 🌟 화면 켜질 때 동시 호출 (여기서는 깔끔하게 실행만 합니다!)
    // ==========================================
    useEffect(() => {
        fetchStudentDetail();
        fetchStudentPayments();
        fetchDiscounts();
        fetchParentInfo(); // 학부모 정보 호출 추가!
    }, [fetchStudentDetail, fetchStudentPayments, fetchDiscounts, fetchParentInfo]);


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

                    {/* 3. 할인 혜택 관리 영역 */}
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
                                    {allDiscounts.map(d => {
                                        const isApplied = studentDiscounts.some(sd => sd.discountNo === d.discountNo);
                                        
                                        return (
                                            <option 
                                                key={d.discountNo} 
                                                value={d.discountNo}
                                                disabled={isApplied} 
                                            >
                                                {d.discountName} ({d.discountType === '비율' ? `${d.discountValue}%` : `₩${d.discountValue.toLocaleString()}`}) 
                                                {isApplied ? " - 적용완료" : ""}
                                            </option>
                                        )
                                    })}
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

                        {/* 🌟 5. 보호자 정보 출력 영역 */}
                        <div className="d-flex justify-content-between align-items-end mb-3 border-bottom pb-2">
                            <h6 className="fw-bold text-secondary mb-0">연결된 보호자 정보</h6>
                            <Button variant="outline-primary" size="sm" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}>
                                보호자 연결/변경
                            </Button>
                        </div>
                        
                        {parentInfo ? (
                            <Row className="mb-4 g-3 bg-light p-3 rounded mx-0">
                                <Form.Group as={Col} md={3}>
                                    <Form.Label className="small text-muted mb-1">관계</Form.Label>
                                    <InputGroup size="sm">
                                        <InputGroup.Text className="bg-white"><FaUserTie className="text-secondary" /></InputGroup.Text>
                                        <Form.Control type="text" value={parentInfo.relationship || ""} readOnly className="bg-white fw-bold" />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md={3}>
                                    <Form.Label className="small text-muted mb-1">보호자 이름</Form.Label>
                                    <Form.Control size="sm" type="text" value={parentInfo.accountName || ""} readOnly className="bg-white" />
                                </Form.Group>
                                <Form.Group as={Col} md={3}>
                                    <Form.Label className="small text-primary fw-bold mb-1">보호자 연락처</Form.Label>
                                    <Form.Control size="sm" type="text" value={parentInfo.accountPhone || ""} readOnly className="bg-white" />
                                </Form.Group>
                                <Form.Group as={Col} md={3}>
                                    <Form.Label className="small text-muted mb-1">보호자 계정(ID)</Form.Label>
                                    <Form.Control size="sm" type="text" value={parentInfo.accountId || ""} readOnly className="bg-white" />
                                </Form.Group>
                            </Row>
                        ) : (
                            <div className="text-center text-muted small py-4 bg-light rounded mb-4">
                                현재 연결된 보호자 계정이 없습니다. 우측 상단의 버튼을 통해 매핑해주세요.
                            </div>
                        )}

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