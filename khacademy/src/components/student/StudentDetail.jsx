import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table, InputGroup } from "react-bootstrap";
import { FaSave, FaComments, FaTrash, FaPlus, FaUserTie, FaChevronLeft } from "react-icons/fa"; 
import { useParams, useNavigate } from "react-router-dom";
import { authClient } from "@utils/reaxios"; 

export default function StudentDetail() {
    const { studentNo } = useParams(); 
    const navigate = useNavigate(); 

    // ==========================================
    // 1. 상태 관리 (State) 구역
    // ==========================================
    const [student, setStudent] = useState(null);
    const [payments, setPayments] = useState([]);
    const [totalUnpaid, setTotalUnpaid] = useState(0);

    const [allDiscounts, setAllDiscounts] = useState([]); 
    const [studentDiscounts, setStudentDiscounts] = useState([]); 
    const [selectedDiscountNo, setSelectedDiscountNo] = useState(""); 

    const [parentList, setParentList] = useState([]); 

    // ==========================================
    // 2. 데이터 불러오기 (Fetch API) 구역 (수정 없음)
    // ==========================================
    const fetchStudentDetail = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/student/detail/${studentNo}`);
            setStudent(response.data);
        } catch (error) {
            console.error("학생 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    const fetchStudentPayments = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/payment/student/${studentNo}`);
            setPayments(response.data);
            const unpaidSum = response.data.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
            setTotalUnpaid(unpaidSum);
        } catch (error) {
            console.error("결제 내역 로딩 실패:", error);
        }
    }, [studentNo]);

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

    const fetchParentInfo = useCallback(async () => {
        try {
            const response = await authClient.get(`http://localhost:8080/api/parent/student/${studentNo}`);
            setParentList(response.data || []);
        } catch (error) {
            console.error("학부모 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    useEffect(() => {
        fetchStudentDetail();
        fetchStudentPayments();
        fetchDiscounts();
        fetchParentInfo();
    }, [fetchStudentDetail, fetchStudentPayments, fetchDiscounts, fetchParentInfo]);

    // ==========================================
    // 3. 이벤트 핸들러 (Action) 구역 (수정 없음)
    // ==========================================
    const handleAddDiscount = async () => {
        if (!selectedDiscountNo) return alert("적용할 할인을 선택해 주세요.");
        const isDuplicate = studentDiscounts.some(sd => sd.discountNo.toString() === selectedDiscountNo.toString());
        if (isDuplicate) return alert("이미 적용되어 있는 할인 혜택입니다.");

        try {
            await authClient.post(`http://localhost:8080/api/student/${studentNo}/discount/${selectedDiscountNo}`);
            setSelectedDiscountNo(""); 
            fetchDiscounts(); 
        } catch (error) {
            alert("할인 적용에 실패했습니다.");
        }
    };

    const handleRemoveDiscount = async (studentDiscountNo) => {
        if (!window.confirm("이 할인 혜택을 해제하시겠습니까?")) return;
        try {
            await authClient.delete(`http://localhost:8080/api/student/discount/${studentDiscountNo}`);
            fetchDiscounts(); 
        } catch (error) {
            alert("할인 해제에 실패했습니다.");
        }
    };

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
            alert("정보 수정에 실패했습니다.");
        }
    };

    // 🌟 랠리즈 스타일: 상태별 파스텔 톤 배지 색상 함수 (수납 내역용)
    const getPaymentStatusStyle = (status) => {
        switch(status) {
            case '완납': return { bg: "#E6F4EA", color: "#1E8E3E" };
            case '미납': return { bg: "#FCE8E6", color: "#D93025" };
            case '부분납': return { bg: "#FEF7E0", color: "#E37400" };
            default: return { bg: "#F1F3F4", color: "#5F6368" };
        }
    };

    // ==========================================
    // 4. 화면 렌더링 (UI) 구역
    // ==========================================
    if (!student) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#F8F9FA" }}>
                <Spinner animation="border" style={{ color: "#FF6B00" }} />
                <span className="mt-3 fw-bold" style={{ color: "#202124" }}>학생 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#F8F9FA", minHeight: "100vh", fontFamily: "'Pretendard', sans-serif" }}>
            
            {/* 상단 타이틀 & 뒤로가기 */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
                <div className="d-flex align-items-center gap-3">
                    <Button 
                        onClick={() => navigate(-1)} 
                        className="rounded-circle d-flex justify-content-center align-items-center border-0 shadow-sm"
                        style={{ width: "40px", height: "40px", backgroundColor: "#fff", color: "#202124" }}
                    >
                        <FaChevronLeft />
                    </Button>
                    <div>
                        <h2 className="fw-bolder mb-1" style={{ color: "#202124", letterSpacing: "-0.5px" }}>학생 상세 프로필</h2>
                        <div className="text-muted small fw-semibold">SID : {student.studentNo}</div>
                    </div>
                </div>
                <Button 
                    className="rounded-pill px-4 py-2 fw-bold border-0 shadow-sm d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#FF6B00", color: "#fff" }}
                    onClick={handleUpdate}
                >
                    <FaSave /> 변경사항 저장
                </Button>
            </div>

            <Row className="g-4">
                {/* 왼쪽 열: 요약, 수납 내역, 할인 관리 */}
                <Col lg={4}>
                    {/* 1. 종합 개요 카드 */}
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bolder mb-4" style={{ color: "#202124" }}>학습 및 수납 현황</h5>
                            <Row className="g-3 text-center">
                                <Col xs={6}>
                                    <div className="p-3 rounded" style={{ backgroundColor: "#F8F9FA" }}>
                                        <div className="text-muted small fw-semibold mb-1">출석률(4주)</div>
                                        <h4 className="fw-bolder mb-0 text-success">100%</h4>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="p-3 rounded" style={{ backgroundColor: "#F8F9FA" }}>
                                        <div className="text-muted small fw-semibold mb-1">과제 제출</div>
                                        <h4 className="fw-bolder mb-0 text-dark">- / -</h4>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="p-3 rounded mt-2" style={{ backgroundColor: totalUnpaid > 0 ? "#FFF8F7" : "#E6F4EA" }}>
                                        <div className="text-muted small fw-semibold mb-1">총 미납액</div>
                                        <h3 className={`fw-bolder mb-0 ${totalUnpaid > 0 ? 'text-danger' : 'text-success'}`}>
                                            {totalUnpaid > 0 ? `${totalUnpaid.toLocaleString()}원` : "없음"}
                                        </h3>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 2. 적용 중인 할인 혜택 */}
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bolder mb-3" style={{ color: "#202124" }}>할인 혜택</h5>
                            
                            <div className="mb-4">
                                <InputGroup>
                                    <Form.Select 
                                        value={selectedDiscountNo} 
                                        onChange={(e) => setSelectedDiscountNo(e.target.value)}
                                        className="border-0 bg-light"
                                        style={{ borderRadius: "10px 0 0 10px" }}
                                    >
                                        <option value="">적용할 할인을 선택하세요</option>
                                        {allDiscounts.map(d => {
                                            const isApplied = studentDiscounts.some(sd => sd.discountNo === d.discountNo);
                                            return (
                                                <option key={d.discountNo} value={d.discountNo} disabled={isApplied}>
                                                    {d.discountName} ({d.discountType === '비율' ? `${d.discountValue}%` : `${d.discountValue.toLocaleString()}원`}) {isApplied ? " - 적용됨" : ""}
                                                </option>
                                            )
                                        })}
                                    </Form.Select>
                                    <Button 
                                        className="border-0 fw-bold px-3 d-flex align-items-center"
                                        style={{ backgroundColor: "#202124", color: "#fff", borderRadius: "0 10px 10px 0" }}
                                        onClick={handleAddDiscount}
                                    >
                                        <FaPlus />
                                    </Button>
                                </InputGroup>
                            </div>

                            {studentDiscounts.length === 0 ? (
                                <div className="text-center text-muted small py-3 bg-light rounded" style={{ borderRadius: "10px" }}>
                                    현재 적용 중인 할인 혜택이 없습니다.
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {studentDiscounts.map(sd => (
                                        <div key={sd.studentDiscountNo} className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm" style={{ border: "1px solid #EAEAEA", borderRadius: "12px" }}>
                                            <div>
                                                <div className="fw-bolder" style={{ color: "#FF6B00", fontSize: "0.95rem" }}>{sd.discountName}</div>
                                                <div className="text-muted small">{sd.discountType === '비율' ? `${sd.discountValue}% 할인` : `${sd.discountValue.toLocaleString()}원 할인`}</div>
                                            </div>
                                            <Button 
                                                variant="link" 
                                                className="p-0 text-danger opacity-75"
                                                onClick={() => handleRemoveDiscount(sd.studentDiscountNo)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* 오른쪽 열: 인적사항, 학부모 정보, 수납 테이블 */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                        <Card.Body className="p-4 p-lg-5">
                            
                            <h5 className="fw-bolder mb-4" style={{ color: "#202124" }}>기본 인적 사항</h5>
                            <Form>
                                <Row className="mb-4 g-3">
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">이름</Form.Label>
                                        <Form.Control className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} type="text" name="studentName" value={student.studentName || ""} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">연락처</Form.Label>
                                        <Form.Control className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} type="text" name="studentPhone" value={student.studentPhone || ""} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">이메일</Form.Label>
                                        <Form.Control className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} type="email" name="studentEmail" value={student.studentEmail || ""} onChange={handleChange} />
                                    </Form.Group>
                                </Row>

                                <Row className="mb-4 g-3">
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">학교</Form.Label>
                                        <Form.Control className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} type="text" name="studentSchool" value={student.studentSchool || ""} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">학년</Form.Label>
                                        <Form.Select className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} name="studentGrade" value={student.studentGrade || ""} onChange={handleChange}>
                                            <option>초등학생</option><option>중학생</option><option>고등학생</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group as={Col} md={4}>
                                        <Form.Label className="small fw-semibold text-muted mb-1">성별</Form.Label>
                                        <Form.Select className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} name="studentGender" value={student.studentGender || ""} onChange={handleChange}>
                                            <option>M</option><option>F</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Row>

                                <Form.Group className="mb-5">
                                    <Form.Label className="small fw-semibold text-muted mb-1">주소</Form.Label>
                                    <Form.Control className="border-0 bg-light py-2" style={{ borderRadius: "10px" }} type="text" name="address" value={student.address || ""} onChange={handleChange} />
                                </Form.Group>

                                {/* 🌟 학부모 정보 (앱 프로필 카드 스타일) */}
                                <h5 className="fw-bolder mb-3 mt-4" style={{ color: "#202124" }}>연결된 보호자</h5>
                                <div className="mb-5">
                                    {parentList && parentList.length > 0 ? (
                                        <Row className="g-3">
                                            {parentList.map((parent, index) => (
                                                <Col md={6} key={parent.parentNo || index}>
                                                    <div className="p-3 d-flex align-items-center gap-3" style={{ backgroundColor: "#F4F6F8", borderRadius: "16px" }}>
                                                        <div className="p-2 bg-white rounded-circle shadow-sm text-secondary d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px" }}>
                                                            <FaUserTie size={20} />
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-bolder text-dark" style={{ fontSize: "1.05rem" }}>{parent.accountName}</span>
                                                                <span className="badge" style={{ backgroundColor: "#EAEAEA", color: "#5F6368" }}>{parent.relationship || "관계 미상"}</span>
                                                            </div>
                                                            <div className="text-muted small fw-semibold">{parent.accountPhone}</div>
                                                            <div className="text-muted small">{parent.accountId}</div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <div className="text-center text-muted py-4 rounded" style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}>
                                            현재 연결된 보호자 계정이 없습니다.
                                        </div>
                                    )}
                                </div>

                                <Form.Group className="mb-5">
                                    <Form.Label className="small fw-semibold text-muted mb-1">특이사항 (메모)</Form.Label>
                                    <Form.Control as="textarea" rows={4} name="studentEtc" value={student.studentEtc || ""} onChange={handleChange} className="border-0 bg-light p-3" style={{ borderRadius: "12px" }} placeholder="학생에 대한 특이사항이나 메모를 입력하세요." />
                                </Form.Group>

                                {/* 수납 내역 테이블 (선 없이 깔끔하게) */}
                                <h5 className="fw-bolder mb-3" style={{ color: "#202124" }}>최근 수납 내역 (최대 3건)</h5>
                                {payments.length === 0 ? (
                                    <div className="text-center text-muted py-4 bg-light" style={{ borderRadius: "12px" }}>수납 내역이 없습니다.</div>
                                ) : (
                                    <Table hover className="align-middle text-center mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                        <thead>
                                            <tr>
                                                <th className="border-0 text-muted fw-semibold py-2">청구 월</th>
                                                <th className="border-0 text-muted fw-semibold py-2">청구 금액</th>
                                                <th className="border-0 text-muted fw-semibold py-2">납부 상태</th>
                                                <th className="border-0 text-muted fw-semibold py-2">미납액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.slice(0, 3).map(p => {
                                                const statusStyle = getPaymentStatusStyle(p.paymentStatus);
                                                return (
                                                    <tr key={p.paymentNo} className="shadow-sm">
                                                        <td className="border-0 py-3 fw-bold bg-white" style={{ borderRadius: "12px 0 0 12px" }}>{p.paymentMonth}</td>
                                                        <td className="border-0 py-3 bg-white">{p.totalAmount?.toLocaleString()}원</td>
                                                        <td className="border-0 py-3 bg-white">
                                                            <span className="px-3 py-1 fw-bold rounded-pill" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: "0.85rem" }}>
                                                                {p.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="border-0 py-3 bg-white fw-bold" style={{ borderRadius: "0 12px 12px 0", color: p.remainingAmount > 0 ? "#D93025" : "#A1A5ab" }}>
                                                            {p.remainingAmount > 0 ? `${p.remainingAmount.toLocaleString()}원` : "-"}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* 하단 플로팅 액션 버튼 구역 */}
            <div className="d-flex justify-content-end mt-4">
                <Button 
                    className="rounded-pill px-4 py-2 fw-bold border-0 shadow-sm d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#202124", color: "#fff" }}
                >
                    <FaComments /> 피드백 보기/등록
                </Button>
            </div>
        </div>
    );
}