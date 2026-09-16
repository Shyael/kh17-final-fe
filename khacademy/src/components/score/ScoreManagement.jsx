import React, { useState, useCallback } from "react";
import { Button, Card, Col, Form, Row, Table, Modal, Badge, InputGroup } from "react-bootstrap";
import { FaSearch, FaList, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import { apiClient } from "@utils/reaxios"; 
import Swal from 'sweetalert2';
import PaginationBar from "@templates/PaginationBar";

export default function ScoreManagement() {
    // ==========================================
    // 1. 상태 관리 (State)
    // ==========================================
    const [searchKeyword, setSearchKeyword] = useState("");
    const [student, setStudent] = useState(null); 
    const [pageData, setPageData] = useState({
        list: [], page: 1, totalPages: 0, startBlock: 1, endBlock: 0, prev: false, next: false, totalCount: 0
    }); 
    const [showSearchModal, setShowSearchModal] = useState(false);

    const [scoreForm, setScoreForm] = useState({
        scoreNo: null, 
        scoreType: "내신",
        scoreSubject: "수학",
        scoreName: "",
        scoreScore: "",
        scoreRank: "",
        scoreDate: ""
    });

    const [rawScores, setRawScores] = useState([]); 
    
    const [showModal, setShowModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null); 

    // ==========================================
    // 2. API 호출 및 이벤트 핸들러
    // ==========================================
    // 🌟 매개변수로 targetPage를 받습니다. (기본값 1)
    // 🌟 1. 매개변수로 targetPage를 받습니다. 기본값은 1페이지입니다.
    const handleSearchStudent = async (targetPage = 1) => { 
        try {
            const response = await apiClient.get("/employee/student/list", {
                params: {
                    filter: '전체', 
                    searchKeyword: searchKeyword.trim(),
                    // 🌟 2. 백엔드로 현재 클릭한 페이지 번호를 함께 보냅니다!
                    page: targetPage 
                }
            });

            if (response.data && response.data.list && response.data.list.length > 0) {
                // 🌟 3. 기존 setSearchResults 대신, 페이지 정보 전체를 담는 setSearchPageData 사용!
                setPageData(response.data); 
                setShowSearchModal(true); 
            } else {
                Swal.fire({ icon: 'info', title: '검색 결과 없음', text: '검색된 학생이 없습니다.', confirmButtonColor: '#3085d6' });
                // 🌟 4. 데이터가 없으면 빈 리스트로 초기화
                setPageData({ list: [], totalPages: 0, totalCount: 0 }); 
            }
        } catch (error) {
            console.error("학생 검색 실패:", error);
            Swal.fire({ icon: 'error', title: '검색 실패', text: '학생 검색 중 오류가 발생했습니다.', confirmButtonColor: '#d33' });
        }
    };


    const handleSelectStudent = (selected) => {
        setStudent(selected);            
        fetchScores(selected.studentNo); 
        resetForm();                     
        setShowSearchModal(false);       
    };

    const fetchScores = useCallback(async (studentNo) => {
        try {
            const response = await apiClient.get(`/employee/score/list/${studentNo}`); 
            setRawScores(response.data || []);
        } catch (error) {
            console.error("성적 로딩 실패:", error);
        }
    }, []);

    const resetForm = () => {
        setScoreForm({
            scoreNo: null,
            scoreType: "내신",
            scoreSubject: "수학",
            scoreName: "",
            scoreScore: "",
            scoreRank: "",
            scoreDate: ""
        });
    };

    const handleSaveScore = async () => {
        if (!student) {
            Swal.fire({ icon: 'warning', text: '먼저 학생을 검색하고 선택해주세요.', confirmButtonColor: '#3085d6' });
            return;
        }
        if (!scoreForm.scoreName || !scoreForm.scoreScore || !scoreForm.scoreDate) {
            Swal.fire({ icon: 'warning', text: '시험명, 점수, 시험일은 필수 입력값입니다.', confirmButtonColor: '#3085d6' });
            return;
        }

        const scoreNum = Number(scoreForm.scoreScore);
        if (scoreNum < 0 || scoreNum > 100) {
            Swal.fire({ icon: 'warning', text: '점수는 0점에서 100점 사이로 입력해주세요.', confirmButtonColor: '#3085d6' });
            return;
        }

        if (scoreForm.scoreRank) {
            const rankNum = Number(scoreForm.scoreRank);
            if (rankNum < 1 || rankNum > 9) {
                Swal.fire({ icon: 'warning', text: '등급은 1등급에서 9등급 사이로 입력해주세요.', confirmButtonColor: '#3085d6' });
                return;
            }
        }

        const isEditMode = scoreForm.scoreNo !== null; 
        const apiUrl = isEditMode ? "/employee/score/edit" : "/employee/score/add";
        const method = isEditMode ? "put" : "post";

        try {
            await apiClient[method](apiUrl, {
                studentNo: student.studentNo,
                ...scoreForm
            });
            
            // 🌟 성공 alert 교체
            Swal.fire({ 
                icon: 'success', 
                title: '성공', 
                text: isEditMode ? "성적이 성공적으로 수정되었습니다." : "성적이 성공적으로 등록되었습니다.", 
                confirmButtonColor: '#3085d6' 
            });
            
            if (isEditMode) {
                resetForm();
            } else {
                setScoreForm(prev => ({ ...prev, scoreSubject: "수학", scoreScore: "", scoreRank: "" }));
            }
            
            fetchScores(student.studentNo); 
        } catch (error) {
            // 🌟 실패 alert 교체
            Swal.fire({ 
                icon: 'error', 
                title: '실패', 
                text: isEditMode ? "성적 수정에 실패했습니다." : "성적 등록에 실패했습니다.", 
                confirmButtonColor: '#d33' 
            });
        }
    };

    const handleEditClick = (subjectData) => {
        setScoreForm({
            scoreNo: subjectData.scoreNo,
            scoreType: subjectData.scoreType,
            scoreSubject: subjectData.scoreSubject,
            scoreName: subjectData.scoreName,
            scoreScore: subjectData.scoreScore,
            scoreRank: subjectData.scoreRank || "",
            scoreDate: subjectData.scoreDate ? subjectData.scoreDate.substring(0, 10) : ""
        });
        
        setShowModal(false); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🌟 window.confirm 대신 Swal.fire 적용! (비동기 처리 구조 변경)
    const handleDeleteScore = (scoreNo) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제한 성적 데이터는 복구할 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', // Danger 색상
            cancelButtonColor: '#6c757d',  // Secondary 색상
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then(async (result) => {
            // '삭제' 버튼을 눌렀을 때만 아래 로직 실행
            if (result.isConfirmed) {
                try {
                    await apiClient.delete(`/employee/score/delete/${scoreNo}`);
                    fetchScores(student.studentNo);
                    
                    if (selectedExam) {
                        setSelectedExam(prev => ({
                            ...prev,
                            subjects: prev.subjects.filter(s => s.scoreNo !== scoreNo)
                        }));
                    }
                    
                    Swal.fire({ icon: 'success', title: '삭제 완료', text: '성적이 성공적으로 삭제되었습니다.', confirmButtonColor: '#3085d6' });
                } catch (error) {
                    Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 오류가 발생했습니다.', confirmButtonColor: '#3085d6' });
                }
            }
        });
    };

    

    // ==========================================
    // 3. 데이터 가공 (시험별 그룹화)
    // ==========================================
    const groupedScores = rawScores.reduce((acc, curr) => {
        if (!acc[curr.scoreName]) {
            acc[curr.scoreName] = { 
                examName: curr.scoreName, 
                examDate: curr.scoreDate ? curr.scoreDate.substring(0, 10) : "", 
                examType: curr.scoreType,
                subjects: [] 
            };
        }
        acc[curr.scoreName].subjects.push(curr);
        return acc;
    }, {});

    const examList = Object.values(groupedScores).sort((a, b) => new Date(b.examDate) - new Date(a.examDate));

    const handleOpenModal = (exam) => {
        setSelectedExam(exam);
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setScoreForm(prev => ({ ...prev, [name]: value }));
    };


    // ==========================================
    // 4. 화면 렌더링
    // ==========================================
    const isEditMode = scoreForm.scoreNo !== null;

    return (
        <div className="container-fluid py-4">
            <h4 className="fw-bold mb-1">학생 성적 관리</h4>
            <p className="text-muted small mb-4">학생을 검색하고 성적을 등록 및 조회하는 화면입니다.</p>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="d-flex align-items-center justify-content-between p-3">
                    <div className="d-flex w-50">
                        <InputGroup>
                            <Form.Control 
                                placeholder="이름 또는 학생번호 입력" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent(1)}
                            />
                            <Button variant="primary" onClick={()=>handleSearchStudent(1)}>
                                <FaSearch className="me-1" /> 검색
                            </Button>
                        </InputGroup>
                    </div>
                    
                    {student ? (
                        <div className="bg-light px-4 py-2 rounded text-primary fw-bold d-flex align-items-center gap-3">
                            <span className="fs-5">{student.studentName}</span>
                            <Badge bg="secondary" className="fw-normal">{student.studentNo}</Badge>
                            <Badge bg="info" className="fw-normal">{student.studentGrade}</Badge>
                        </div>
                    ) : (
                        <div className="text-muted small">학생을 검색해주세요.</div>
                    )}
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col lg={5}>
                    <Card className={`shadow-sm border-0 h-100 ${isEditMode ? 'border border-primary' : ''}`}>
                        <Card.Header className={`bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center`}>
                            <h6 className="fw-bold text-secondary mb-0">
                                {isEditMode ? <span className="text-primary">성적 수정 모드</span> : "성적 입력"}
                            </h6>
                            {isEditMode && (
                                <Button variant="outline-secondary" size="sm" onClick={resetForm}>
                                    <FaTimes className="me-1"/> 수정 취소
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-3">
                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="small text-muted fw-bold mb-1">시험 유형 <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="scoreType" value={scoreForm.scoreType} onChange={handleChange}>
                                        <option value="내신">내신</option>
                                        <option value="모의고사">모의고사</option>
                                        <option value="수능">수능</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="small text-muted fw-bold mb-1">과목 <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="scoreSubject" value={scoreForm.scoreSubject} onChange={handleChange}>
                                        <option value="국어">국어</option>
                                        <option value="수학">수학</option>
                                        <option value="영어">영어</option>
                                        <option value="과학">과학</option>
                                        <option value="사회">사회</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted fw-bold mb-1">시험명 <span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="예) 1학기 중간고사, 6월 모의평가" 
                                    name="scoreName" 
                                    value={scoreForm.scoreName} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>

                            <Row className="g-3 mb-4">
                                <Form.Group as={Col} md={4}>
                                    <Form.Label className="small text-muted fw-bold mb-1">점수 <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="scoreScore" 
                                        value={scoreForm.scoreScore} 
                                        onChange={handleChange} 
                                        min="0" 
                                        max="100" 
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md={4}>
                                    <Form.Label className="small text-muted fw-bold mb-1">등급/석차</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="scoreRank" 
                                        value={scoreForm.scoreRank} 
                                        onChange={handleChange} 
                                        placeholder="숫자만" 
                                        min="1" 
                                        max="9" 
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md={4}>
                                    <Form.Label className="small text-muted fw-bold mb-1">시험일 <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" name="scoreDate" value={scoreForm.scoreDate} onChange={handleChange} />
                                </Form.Group>
                            </Row>

                            <div className="d-grid mt-4">
                                <Button 
                                    variant={isEditMode ? "success" : "primary"} 
                                    size="lg" 
                                    className="fw-bold fs-6" 
                                    onClick={handleSaveScore} 
                                    disabled={!student}
                                >
                                    {isEditMode ? "성적 수정 완료" : "성적 등록"}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={7}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-end">
                            <h6 className="fw-bold text-secondary mb-0">시험별 성적 목록</h6>
                            <span className="small text-muted">총 {examList.length}건의 시험</span>
                        </Card.Header>
                        <Card.Body>
                            <Table hover responsive className="kh-table align-middle text-center">
                                <thead>
                                    <tr>
                                        <th>유형</th>
                                        <th className="text-start">시험명</th>
                                        <th>응시 과목 수</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!student ? (
                                        <tr><td colSpan="5" className="py-5 text-muted">학생을 검색하면 성적이 표시됩니다.</td></tr>
                                    ) : examList.length === 0 ? (
                                        <tr><td colSpan="5" className="py-5 text-muted">등록된 성적 데이터가 없습니다.</td></tr>
                                    ) : (
                                        examList.map((exam, idx) => (
                                            <tr key={idx}>
                                                <td><Badge bg="secondary">{exam.examType}</Badge></td>
                                                <td className="fw-bold text-start">{exam.examName}</td>
                                                <td>{exam.subjects.length}과목</td>
                                                <td>
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(exam)}>
                                                        <FaList className="me-1" /> 세부 조회
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5 text-primary">
                        {selectedExam?.examName} <span className="text-muted fs-6 ms-2">세부 성적</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <Table hover responsive className="kh-table kh-table-flat align-middle text-center">
                        <thead>
                            <tr>
                                <th>시험일</th>
                                <th>과목</th>
                                <th>점수</th>
                                <th>등급/석차</th>
                                <th>관리 (수정/삭제)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedExam?.subjects.map(subject => (
                                <tr key={subject.scoreNo}>
                                    <td className="text-muted small">{subject.scoreDate}</td>
                                    <td className="fw-bold text-dark">{subject.scoreSubject}</td>
                                    <td className="text-primary fw-bold">{subject.scoreScore}점</td>
                                    <td>{subject.scoreRank ? `${subject.scoreRank}` : '-'}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-secondary" size="sm" title="수정" onClick={() => handleEditClick(subject)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" title="삭제" onClick={() => handleDeleteScore(subject.scoreNo)}>
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
                </Modal.Footer>
            </Modal>
            {/* ... 기존 세부 성적 조회 모달 코드 ... */}

            {/* 🌟 5. 학생 검색 결과 모달 (새로 추가!) */}
            <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5 text-dark">
                        {/* 🌟 searchPageData.totalCount 로 진짜 전체 검색 건수를 표시합니다! */}
                        [{searchKeyword}] 검색 결과 목록 ({pageData.totalCount || 0}건)
                    </Modal.Title>
                </Modal.Header>
                
                {/* 🌟 d-flex flex-column 을 줘서 테이블과 페이지네이션 바를 위아래로 분리 */}
                <Modal.Body className="p-0 d-flex flex-column" style={{ maxHeight: '70vh' }}>
                    <div style={{ overflowY: 'auto' }}>
                        <Table hover responsive className="kh-table kh-table-flat align-middle text-center mb-0">
                            <thead className="sticky-top bg-white">
                                <tr>
                                    <th>번호</th>
                                    <th>이름</th>
                                    <th>학교</th>
                                    <th>학년</th>
                                    <th>상태</th>
                                    <th>선택</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 🌟 searchResults 대신 searchPageData.list 사용! */}
                                {pageData.list.map(res => (
                                    <tr key={res.studentNo}>
                                        <td className="text-muted">{res.studentNo}</td>
                                        <td className="fw-bold text-dark">{res.studentName}</td>
                                        <td>{res.studentSchool || '-'}</td>
                                        <td>{res.studentGrade || '-'}</td>
                                        <td>
                                            <Badge bg={res.studentAcademicStatus === '재원' ? 'success' : 'secondary'}>
                                                {res.studentAcademicStatus}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="outline-primary" size="sm" onClick={() => handleSelectStudent(res)}>
                                                선택
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {/* 🌟 페이지네이션 바 부착 영역 (2페이지 이상일 때만 표시) */}
                    {pageData.totalPages > 1 && (
                        <div className="py-3 bg-white border-top d-flex justify-content-center mt-auto">
                            <PaginationBar 
                                page={pageData.page}
                                totalPages={pageData.totalPages}
                                startBlock={pageData.startBlock}
                                endBlock={pageData.endBlock}
                                prev={pageData.prev}
                                next={pageData.next}
                                // 🌟 번호를 누르면 해당 번호를 넣어서 검색 함수를 다시 실행!
                                onChange={(targetPage) => handleSearchStudent(targetPage)} 
                            />
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="border-0 bg-light">
                    <Button variant="secondary" onClick={() => setShowSearchModal(false)}>닫기</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}