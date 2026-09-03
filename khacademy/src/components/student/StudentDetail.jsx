import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table, InputGroup, Modal } from "react-bootstrap";
import { FaSave, FaComments, FaTrash, FaPlus, FaUserTie, FaSearch } from "react-icons/fa"; 
import { useParams, useNavigate } from "react-router-dom";
import { authClient } from "@utils/reaxios"; 

export default function StudentDetail() {
    const { studentNo } = useParams(); 
    const navigate = useNavigate(); 

    // ==========================================
    // 1. 상태 관리 (State) 구역
    // ==========================================
    // [학생 및 수납]
    const [student, setStudent] = useState(null);
    const [payments, setPayments] = useState([]);
    const [totalUnpaid, setTotalUnpaid] = useState(0);

    // [할인 혜택]
    const [allDiscounts, setAllDiscounts] = useState([]); 
    const [studentDiscounts, setStudentDiscounts] = useState([]); 
    const [selectedDiscountNo, setSelectedDiscountNo] = useState(""); 

    // [다중 학부모 정보]
    const [parentList, setParentList] = useState([]); 

    // [학부모 검색 및 연동 모달]
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedParentNo, setSelectedParentNo] = useState(null);
    const [relationshipInput, setRelationshipInput] = useState("모");


    // ==========================================
    // 2. 데이터 불러오기 (Fetch API) 구역
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
            const response = await authClient.get(`http://localhost:8080/api/parent-student/list/${studentNo}`);
            setParentList(response.data || []);
        } catch (error) {
            console.error("학부모 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    // 화면 첫 렌더링 시 4가지 데이터 동시 호출
    useEffect(() => {
        fetchStudentDetail();
        fetchStudentPayments();
        fetchDiscounts();
        fetchParentInfo();
    }, [fetchStudentDetail, fetchStudentPayments, fetchDiscounts, fetchParentInfo]);


    // ==========================================
    // 3. 이벤트 핸들러 (Action) 구역
    // ==========================================
    // [할인 추가/해제]
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

    // [학생 기본정보 수정]
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

    // [학부모 검색 및 다이렉트 연동]
    const handleSearchParent = async () => {
        if (!searchKeyword.trim()) return alert("검색할 이름이나 전화번호를 입력하세요.");
        try {
            const response = await authClient.get(`http://localhost:8080/api/parent-student/search?keyword=${searchKeyword}`);
            setSearchResults(response.data);
            setSelectedParentNo(null); 
        } catch (error) {
            alert("검색에 실패했습니다.");
        }
    };

    const handleDirectLink = async () => {
        if (!selectedParentNo) return alert("연동할 학부모를 선택해 주세요.");
        try {
            await authClient.post("http://localhost:8080/api/parent-student/direct-link", {
                parentNo: selectedParentNo,
                studentNo: studentNo,
                relationship: relationshipInput
            });
            alert("학부모 연동이 완료되었습니다!");
            setShowLinkModal(false); 
            fetchParentInfo(); 
        } catch (error) {
            alert(error.response?.data || "연동에 실패했습니다.");
        }
    };

    // [보호자 연동 해제 (Delete)]
    const handleRemoveParentLink = async (targetParentNo) => {
        if (!window.confirm("정말 이 보호자와의 연동을 해제하시겠습니까?")) return;
        
        try {
            // 백엔드 컨트롤러에 맞게 파라미터 전송
            await authClient.delete(`http://localhost:8080/api/parent-student/remove-link?parentNo=${targetParentNo}&studentNo=${studentNo}`);
            
            alert("보호자 연동이 해제되었습니다.");
            fetchParentInfo(); // 🌟 삭제 성공 후 리스트 즉시 새로고침
        } catch (error) {
            alert(error.response?.data || "연동 해제에 실패했습니다.");
        }
    };


    // ==========================================
    // 4. 화면 렌더링 (UI) 구역
    // ==========================================
    if (!student) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-primary fw-bold">데이터를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>← 뒤로</Button>
                            <h4 className="fw-bold mb-0 text-primary">학생 상세 정보</h4>
                        </div>
                        <span className="text-muted fw-semibold">SID : {student.studentNo}</span>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    {/* [UI: 종합 개요] */}
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

                    {/* [UI: 최근 수납 내역] */}
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-4">최근 수납 내역</h6>
                    <Card className="border-0 shadow-sm mb-5">
                        <Card.Body className="p-0">
                            {payments.length === 0 ? (
                                <div className="p-4 text-center text-muted small">수납 내역이 없습니다.</div>
                            ) : (
                                <Table hover responsive className="align-middle text-center mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>청구 월</th><th>청구 금액</th><th>납부 상태</th><th>미납액</th>
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

                    {/* [UI: 할인 혜택 관리] */}
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 mt-5">적용 중인 할인 혜택 관리</h6>
                    <Row className="mb-4 align-items-center">
                        <Col md={3} className="text-muted fw-semibold small">새로운 할인 추가</Col>
                        <Col md={6}>
                            <div className="d-flex gap-2">
                                <Form.Select size="sm" value={selectedDiscountNo} onChange={(e) => setSelectedDiscountNo(e.target.value)}>
                                    <option value="">적용할 할인을 선택하세요</option>
                                    {allDiscounts.map(d => {
                                        const isApplied = studentDiscounts.some(sd => sd.discountNo === d.discountNo);
                                        return (
                                            <option key={d.discountNo} value={d.discountNo} disabled={isApplied}>
                                                {d.discountName} ({d.discountType === '비율' ? `${d.discountValue}%` : `₩${d.discountValue.toLocaleString()}`}) {isApplied ? " - 적용완료" : ""}
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
                                    <Badge key={sd.studentDiscountNo} bg="white" text="dark" className="border d-flex align-items-center p-2 shadow-sm">
                                        <span className="me-2 fw-bold text-primary">{sd.discountName}</span>
                                        <span className="me-3 text-muted">({sd.discountType === '비율' ? `${sd.discountValue}%` : `₩${sd.discountValue.toLocaleString()}`})</span>
                                        <FaTrash className="text-danger" style={{ cursor: "pointer" }} onClick={() => handleRemoveDiscount(sd.studentDiscountNo)} title="할인 해제" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* [UI: 학생 정보 폼 및 학부모 정보] */}
                    <Form>
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">기본 인적 사항</h6>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">이름</Form.Label><Form.Control size="sm" type="text" name="studentName" value={student.studentName || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">연락처</Form.Label><Form.Control size="sm" type="text" name="studentPhone" value={student.studentPhone || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">이메일</Form.Label><Form.Control size="sm" type="email" name="studentEmail" value={student.studentEmail || ""} onChange={handleChange} /></Form.Group>
                        </Row>

                        {/* [UI: 다중 학부모 리스트 출력] */}
                        <div className="d-flex justify-content-between align-items-end mb-3 border-bottom pb-2 mt-5">
                            <h6 className="fw-bold text-secondary mb-0">연결된 보호자 정보</h6>
                            <Button variant="outline-primary" size="sm" onClick={() => { setShowLinkModal(true); setSearchResults([]); setSearchKeyword(""); }}>
                                새 보호자 연결/변경
                            </Button>
                        </div>
                        {parentList && parentList.length > 0 ? (
                            parentList.map((parent, index) => (
                                <Row key={parent.parentNo || index} className="mb-3 g-3 bg-light p-3 rounded mx-0 align-items-end shadow-sm">
                                    <Form.Group as={Col} md={3}>
                                        <Form.Label className="small text-muted mb-1">관계</Form.Label>
                                        <InputGroup size="sm">
                                            <InputGroup.Text className="bg-white"><FaUserTie className="text-secondary" /></InputGroup.Text>
                                            <Form.Control type="text" value={parent.relationship || ""} readOnly className="bg-white fw-bold" />
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group as={Col} md={3}><Form.Label className="small text-muted mb-1">보호자 이름</Form.Label><Form.Control size="sm" type="text" value={parent.parentName || ""} readOnly className="bg-white" /></Form.Group>
                                    <Form.Group as={Col} md={3}><Form.Label className="small text-primary fw-bold mb-1">보호자 연락처</Form.Label><Form.Control size="sm" type="text" value={parent.parentPhone || ""} readOnly className="bg-white" /></Form.Group>
                                    <Form.Group as={Col} md={2}><Form.Label className="small text-muted mb-1">보호자 계정(ID)</Form.Label><Form.Control size="sm" type="text" value={parent.parentId || ""} readOnly className="bg-white" /></Form.Group>
                                    <Col md={1} className="text-end">
                                        {/* 🌟 기존 껍데기 버튼을 실제 동작하는 버튼으로 변경! */}
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            title="연동 해제" 
                                            onClick={() => handleRemoveParentLink(parent.parentNo)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </Col>
                                </Row>
                            ))
                        ) : (
                            <div className="text-center text-muted small py-4 bg-light rounded mb-4">현재 연결된 보호자 계정이 없습니다.</div>
                        )}

                        <Row className="mb-3 g-3 mt-4">
                            <Form.Group as={Col} md={12}><Form.Label className="small text-muted mb-1">주소</Form.Label><Form.Control size="sm" type="text" name="address" value={student.address || ""} onChange={handleChange} /></Form.Group>
                        </Row>
                        <Row className="mb-4 g-3">
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">학교</Form.Label><Form.Control size="sm" type="text" name="studentSchool" value={student.studentSchool || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학년</Form.Label>
                                <Form.Select size="sm" name="studentGrade" value={student.studentGrade || ""} onChange={handleChange}>
                                    <option>초등학생</option><option>중학생</option><option>고등학생</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">성별</Form.Label>
                                <Form.Select size="sm" name="studentGender" value={student.studentGender || ""} onChange={handleChange}>
                                    <option>M</option><option>F</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-4">
                            <Form.Label className="small text-muted mb-1">특이사항 (정보)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="studentEtc" value={student.studentEtc || ""} onChange={handleChange} />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-5 border-top pt-3">
                            <Button variant="info" className="text-white d-flex align-items-center"><FaComments className="me-2" /> 피드백 보기/등록</Button>
                            <Button variant="primary" className="d-flex align-items-center" onClick={handleUpdate}><FaSave className="me-2" /> 정보 수정 (저장)</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* ========================================== */}
            {/* [UI: 학부모 직접 연동 모달] */}
            {/* ========================================== */}
            <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5 fw-bold text-primary">학부모 계정 직접 연동</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <p className="text-muted small mb-4">이미 가입된 학부모 계정을 검색하여 현재 학생과 직접 연결합니다.</p>
                    <div className="d-flex gap-2 mb-4">
                        <InputGroup>
                            <InputGroup.Text className="bg-white"><FaSearch className="text-muted" /></InputGroup.Text>
                            <Form.Control type="text" placeholder="학부모 이름 또는 전화번호 검색" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchParent()} />
                        </InputGroup>
                        <Button variant="secondary" onClick={handleSearchParent} style={{ whiteSpace: "nowrap" }}>검색</Button>
                    </div>

                    <div className="border rounded mb-4" style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {searchResults.length === 0 ? (
                            <div className="p-4 text-center text-muted small">검색 결과가 없습니다.</div>
                        ) : (
                            <Table hover className="mb-0 align-middle text-center">
                                <thead className="bg-light sticky-top">
                                    <tr><th>선택</th><th>이름</th><th>연락처</th><th>계정(ID)</th></tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((p) => (
                                        <tr key={p.parentNo} onClick={() => setSelectedParentNo(p.parentNo)} style={{ cursor: "pointer" }}>
                                            <td>
                                                <Form.Check type="radio" name="parentSelect" checked={selectedParentNo === p.parentNo} onChange={() => setSelectedParentNo(p.parentNo)} />
                                            </td>
                                            <td className="fw-bold">{p.accountName}</td>
                                            <td>{p.accountPhone}</td>
                                            <td className="text-muted">{p.accountId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>

                    <div className="d-flex justify-content-end align-items-center gap-3 p-3 bg-light rounded border">
                        <span className="fw-semibold small">학생과의 관계 :</span>
                        <Form.Select size="sm" style={{ width: "120px" }} value={relationshipInput} onChange={(e) => setRelationshipInput(e.target.value)}>
                            <option value="모">모 (어머니)</option>
                            <option value="부">부 (아버지)</option>
                            <option value="조부모">조부모</option>
                            <option value="기타">기타 보호자</option>
                        </Form.Select>
                        <Button variant="primary" onClick={handleDirectLink}>선택 학부모 연동하기</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}