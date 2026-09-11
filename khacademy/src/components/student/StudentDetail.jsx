import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner, Table, InputGroup, Modal } from "react-bootstrap";
import { FaSave, FaComments, FaTrash, FaPlus, FaUserTie } from "react-icons/fa"; 
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios"; 

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
    const [payAmount, setPayAmount] = useState(""); 

    // 수강 중인 강의 목록과 전체 강의 목록을 담을 State
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);

    // ==========================================
    // 1. 수강 신청 모달용 필터 상태 추가
    // ==========================================
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseFilter, setCourseFilter] = useState({ grade: '전체', subject: '전체' });
    const [selectedCourseNo, setSelectedCourseNo] = useState(""); // 선택한 강의 번호

    // ==========================================
    // 🌟 2. 필터 옵션(학년, 과목) 중복 제거해서 뽑아내기
    // ==========================================
    // 백엔드에서 가져온 availableCourses 목록을 싹 뒤져서 존재하는 학년과 과목만 골라냅니다.
    const uniqueGrades = ['전체', ...new Set(availableCourses.map(c => c.gradeLevel))];
    const uniqueSubjects = ['전체', ...new Set(availableCourses.map(c => c.courseSubject))];

    // ==========================================
    // 🌟 3. 선택된 필터에 맞게 화면에 보여줄 리스트 계산
    // ==========================================
    const filteredCourses = availableCourses.filter(course => {
        const matchGrade = courseFilter.grade === '전체' || course.gradeLevel === courseFilter.grade;
        const matchSubject = courseFilter.subject === '전체' || course.courseSubject === courseFilter.subject;
        return matchGrade && matchSubject;
    });

    // (모달이 닫힐 때 필터와 선택값을 초기화하는 함수가 있다면 추가해 주시면 좋습니다)
    const resetCourseModal = () => {
        setCourseFilter({ grade: '전체', subject: '전체' });
        setSelectedCourseNo("");
    };

    // ==========================================
    // 2. 데이터 불러오기 (Fetch API) 구역
    // ==========================================
    const fetchStudentDetail = useCallback(async () => {
        try {
            const response = await apiClient.get(`/employee/student/detail/${studentNo}`);
            setStudent(response.data);
        } catch (error) {
            console.error("학생 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    const fetchStudentPayments = useCallback(async () => {
        try {
            const response = await apiClient.get(`/payment/student/${studentNo}`);
            setPayments(response.data);
            const unpaidSum = response.data.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
            setTotalUnpaid(unpaidSum);
        } catch (error) {
            console.error("결제 내역 로딩 실패:", error);
        }
    }, [studentNo]);

    const fetchDiscounts = useCallback(async () => {
        try {
            const allRes = await apiClient.get("/payment/discount/list");
            setAllDiscounts(allRes.data.filter(d => d.discountStatus === 'Y'));
            const studentRes = await apiClient.get(`/employee/student/${studentNo}/discount`);
            setStudentDiscounts(studentRes.data);
        } catch (error) {
            console.error("할인 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    const fetchParentInfo = useCallback(async () => {
        try {
            const response = await apiClient.get(`/employee/parent/student/${studentNo}`);
            setParentList(response.data || []);
        } catch (error) {
            console.error("학부모 정보 로딩 실패:", error);
        }
    }, [studentNo]);

    // 🌟 수정: 전체 조회 대신 학생 번호를 주소에 넣어서 '겹치지 않는 강의'만 가져옴
    const fetchAvailableCourses = useCallback(async () => {
        try {
            const response = await apiClient.get(`/employee/student/course/list/${studentNo}`);
            setAvailableCourses(response.data || []);
        } catch (error) {
            console.error("개설된 강의 목록 로딩 실패:", error);
        }
    }, [studentNo]);

    // 🌟 추가: 수강 취소 기능
    const handleCancelCourse = async (courseNo) => {
        if (!window.confirm("정말로 이 강의의 수강을 취소하시겠습니까?")) return;
        
        try {
            await apiClient.delete(`/employee/student/course/cancel/${studentNo}/${courseNo}`);
            alert("수강이 취소되었습니다.");
            
            // 삭제 후 화면의 수강 중인 목록과 모달의 강의 목록을 동시에 갱신!
            fetchEnrolledCourses(); 
            fetchAvailableCourses(); 
        } catch (error) {
            alert("수강 취소에 실패했습니다.");
        }
    };

    // [추가] 현재 학생이 수강 중인 강의 목록
    const fetchEnrolledCourses = useCallback(async () => {
        try {
            // 백엔드 컨트롤러 주소에 맞게 수정 필요 시 변경
            const response = await apiClient.get(`/employee/student/course/enrolled/${studentNo}`);
            setEnrolledCourses(response.data || []);
        } catch (error) {
            console.error("수강 중인 강의 로딩 실패:", error);
        }
    }, [studentNo]);


    // 수강 신청 실행 함수 (백엔드 에러 핸들링 포함)
    const handleCourseEnrollSubmit = async () => {
        if (!selectedCourseNo) {
            return alert("신청할 강의를 선택해주세요.");
        }

        try {
            const response = await apiClient.post("/employee/student/course/add", {
                studentNo: student.studentNo,
                courseNo: selectedCourseNo
            });
            
            alert(response.data); 
            setShowCourseModal(false);
            setSelectedCourseNo("");
            fetchEnrolledCourses(); // 등록 성공 시 목록 갱신
            
        } catch (error) {
            if (error.response && error.response.data) {
                alert(error.response.data); 
            } else {
                alert("수강 신청 중 오류가 발생했습니다.");
            }
        }
    };

    
    
    // useEffect에 새로운 fetch 함수들 추가
    useEffect(() => {
        fetchStudentDetail();
        fetchStudentPayments();
        fetchDiscounts();
        fetchParentInfo();
        fetchAvailableCourses();
        fetchEnrolledCourses();
    }, [
        fetchStudentDetail, 
        fetchStudentPayments, 
        fetchDiscounts, 
        fetchParentInfo, 
        fetchAvailableCourses, 
        fetchEnrolledCourses
    ]);

    // ==========================================
    // 3. 이벤트 핸들러 (Action) 구역
    // ==========================================
    const handleAddDiscount = async () => {
        if (!selectedDiscountNo) return alert("적용할 할인을 선택해 주세요.");
        const isDuplicate = studentDiscounts.some(sd => sd.discountNo.toString() === selectedDiscountNo.toString());
        if (isDuplicate) return alert("이미 적용되어 있는 할인 혜택입니다.");

        try {
            await apiClient.post(`/employee/student/${studentNo}/discount/${selectedDiscountNo}`);
            setSelectedDiscountNo(""); 
            fetchDiscounts(); 
        } catch (error) {
            alert("할인 적용에 실패했습니다.");
        }
    };

    const handleRemoveDiscount = async (studentDiscountNo) => {
        if (!window.confirm("이 할인 혜택을 해제하시겠습니까?")) return;
        try {
            await apiClient.delete(`/employee/student/discount/${studentDiscountNo}`);
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
            const response = await apiClient.put("/employee/student/edit", student);
            alert(response.data); 
            fetchStudentDetail(); 
        } catch (error) {
            alert("정보 수정에 실패했습니다.");
        }
    };

    const handleApproveStudent = async () => {
        if (!window.confirm("이 학생을 '재원' 상태로 승인하시겠습니까? (승인 시 청구 대상이 됩니다)")) return;
        
        try {
            await apiClient.patch(`/employee/student/approve/${studentNo}`);
            alert("재원 처리가 완료되었습니다.");
            fetchStudentDetail(); 
        } catch (error) {
            alert("승인 처리에 실패했습니다.");
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
                            
                            <Badge bg={student.studentAcademicStatus === '재원' ? 'success' : 'warning'} text={student.studentAcademicStatus === '대기' ? 'dark' : ''} className="fs-6 ms-2">
                                {student.studentAcademicStatus}
                            </Badge>

                            {student.studentAcademicStatus === '대기' && (
                                <Button variant="primary" size="sm" onClick={handleApproveStudent} className="ms-2 fw-bold">
                                    재원 승인
                                </Button>
                            )}
                        </div>
                        <span className="text-muted fw-semibold">SID : {student.studentNo}</span>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">종합 개요</h6>
                    <Row className="g-3 mb-4 text-center">
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100 p-3">
                                <div className="text-muted small fw-bold mb-2">출석률 (4주)</div>
                                <h4 className="fw-bold mb-0">{student.attendanceRate}%</h4>
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

                    {/* 수강 중인 강의 관리 */}
                    <div className="mt-5">
                        <h6 className="fw-bold mb-3 text-secondary border-bottom pb-2">수강 중인 강의 관리</h6>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <p className="text-muted mb-0 small">현재 수강 중이거나 신청한 강의 목록입니다.</p>
                            <Button variant="dark" size="sm" onClick={() => setShowCourseModal(true)}>
                                + 수강 신청
                            </Button>
                        </div>
                        
                        <Table bordered hover responsive className="text-center align-middle bg-white">
                            <thead className="table-light">
                                <tr>
                                    <th>강의명</th>
                                    <th>과목</th>
                                    <th>강의 유형</th>
                                    <th>상태</th>
                                    <th>관리</th> {/* 🌟 수강료 -> 관리 로 변경 */}
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-4 text-muted bg-light">수강 중인 강의가 없습니다.</td>
                                    </tr>
                                ) : (
                                    enrolledCourses.map(course => (
                                        <tr key={course.courseNo}>
                                            <td className="fw-bold">{course.courseTitle}</td>
                                            <td>{course.courseSubject}</td>
                                            <td>{course.courseType}</td>
                                            <td>
                                                <Badge bg={course.studentCourseStatus === '수강중' ? 'success' : 'secondary'}>
                                                    {course.studentCourseStatus}
                                                </Badge>
                                            </td>
                                            <td>
                                                {/* 🌟 취소 버튼 추가 */}
                                                <Button variant="outline-danger" size="sm" onClick={() => handleCancelCourse(course.courseNo)}>
                                                    취소
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <Form>
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">기본 인적 사항</h6>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">이름</Form.Label><Form.Control size="sm" type="text" name="studentName" value={student.studentName || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">연락처</Form.Label><Form.Control size="sm" type="text" name="studentPhone" value={student.studentPhone || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">이메일</Form.Label><Form.Control size="sm" type="email" name="studentEmail" value={student.studentEmail || ""} readOnly /></Form.Group>
                        </Row>

                        <div className="d-flex justify-content-between align-items-end mb-3 border-bottom pb-2 mt-5">
                            <h6 className="fw-bold text-secondary mb-0">연결된 보호자 정보</h6>
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
                                    <Form.Group as={Col} md={3}>
                                        <Form.Label className="small text-muted mb-1">보호자 이름</Form.Label>
                                        <Form.Control size="sm" type="text" value={parent.accountName || ""} readOnly className="bg-white" />
                                    </Form.Group>
                                    <Form.Group as={Col} md={3}>
                                        <Form.Label className="small text-primary fw-bold mb-1">보호자 연락처</Form.Label>
                                        <Form.Control size="sm" type="text" value={parent.accountPhone || ""} readOnly className="bg-white" />
                                    </Form.Group>
                                    <Form.Group as={Col} md={3}>
                                        <Form.Label className="small text-muted mb-1">보호자 계정(ID)</Form.Label>
                                        <Form.Control size="sm" type="text" value={parent.accountId || ""} readOnly className="bg-white" />
                                    </Form.Group>
                                </Row>
                            ))
                        ) : (
                            <div className="text-center text-muted small py-4 bg-light rounded mb-4">현재 연결된 보호자 계정이 없습니다.</div>
                        )}

                        <Row className="mb-4 g-3">
                            <Form.Group as={Col} md={4}><Form.Label className="small text-muted mb-1">학교</Form.Label><Form.Control size="sm" type="text" name="studentSchool" value={student.studentSchool || ""} onChange={handleChange} /></Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">학년</Form.Label>
                                <Form.Select size="sm" name="studentGrade" value={student.studentGrade || ""} onChange={handleChange}>
                                    <option>초1</option>
                                    <option>초2</option>
                                    <option>초3</option>
                                    <option>초4</option>
                                    <option>초5</option>
                                    <option>초6</option>
                                    <option>중1</option>
                                    <option>중2</option>
                                    <option>중3</option>
                                    <option>고1</option>
                                    <option>고2</option>
                                    <option>고3</option>
                                    <option>졸업</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={4}>
                                <Form.Label className="small text-muted mb-1">성별</Form.Label>
                                <Form.Select size="sm" name="studentGender" value={student.studentGender || ""} onChange={handleChange}>
                                    <option>남</option><option>여</option>
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
            
            {/* 수강 신청 모달 창 */}
            <Modal show={showCourseModal} onHide={() => { setShowCourseModal(false); resetCourseModal(); }} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5">신규 수강 신청</Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    {/* 🌟 새로 추가된 필터 영역 (학년, 과목 2칸으로 나눔) */}
                    <Row className="g-2 mb-3">
                        <Col>
                            <Form.Select 
                                value={courseFilter.grade} 
                                onChange={(e) => setCourseFilter(prev => ({ ...prev, grade: e.target.value }))}
                            >
                                {uniqueGrades.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select 
                                value={courseFilter.subject} 
                                onChange={(e) => setCourseFilter(prev => ({ ...prev, subject: e.target.value }))}
                            >
                                {uniqueSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    {/* 기존에 있던 메인 강의 선택 영역 */}
                    <Form.Group>
                        <Form.Label className="small text-muted fw-bold">개설된 강의 목록</Form.Label>
                        <Form.Select 
                            value={selectedCourseNo} 
                            onChange={(e) => setSelectedCourseNo(e.target.value)}
                        >
                            <option value="">수강할 강의를 선택하세요</option>
                            
                            {/* 🌟 availableCourses 대신 filteredCourses로 매핑! */}
                            {filteredCourses.map(course => (
                                <option key={course.courseNo} value={course.courseNo}>
                                    [{course.courseSubject} / {course.gradeLevel}] {course.courseTitle} - {course.teacherName} 강사
                                </option>
                            ))}
                        </Form.Select>
                        
                        <Form.Text className="text-muted d-block mt-2">
                            * 학생의 기존 시간표와 겹치지 않는 강의만 노출됩니다.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => { setShowCourseModal(false); resetCourseModal(); }}>
                        취소
                    </Button>
                    <Button variant="dark" disabled={!selectedCourseNo} onClick={handleCourseEnrollSubmit}>
                        신청하기
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}