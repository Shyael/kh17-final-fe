import React, { useState, useCallback } from "react";
import { Button, Card, Col, Form, Row, Table, Modal, Badge, InputGroup } from "react-bootstrap";
import { FaSearch, FaList, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import { apiClient } from "@utils/reaxios"; 

export default function ScoreManagement() {
    // ==========================================
    // 1. 상태 관리 (State)
    // ==========================================
    const [searchKeyword, setSearchKeyword] = useState("");
    const [student, setStudent] = useState(null); 

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
    const handleSearchStudent = async () => {
        if (!searchKeyword.trim()) return alert("학생 이름이나 번호를 입력해주세요.");
        try {
            // 🌟 /api 제거
            const response = await apiClient.get("/employee/student/list", {
                params: {
                    filter: '재원',
                    searchKeyword: searchKeyword
                }
            });
            if (response.data && response.data.length > 0) {
                const foundStudent = response.data[0]; 
                setStudent(foundStudent);
                fetchScores(foundStudent.studentNo);
                resetForm(); 
            } else {
                alert("검색된 학생이 없습니다.");
                setStudent(null);
                setRawScores([]);
            }
        } catch (error) {
            console.error("학생 검색 실패:", error);
            alert("학생 검색 중 오류가 발생했습니다.");
        }
    };

    const fetchScores = useCallback(async (studentNo) => {
        try {
            // 🌟 /api 제거
            const response = await apiClient.get(`/score/list/${studentNo}`); 
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
        if (!student) return alert("먼저 학생을 검색하고 선택해주세요.");
        if (!scoreForm.scoreName || !scoreForm.scoreScore || !scoreForm.scoreDate) {
            return alert("시험명, 점수, 시험일은 필수 입력값입니다.");
        }

        // 🌟 방어 로직 추가: 점수 검증 (0 ~ 100)
        const scoreNum = Number(scoreForm.scoreScore);
        if (scoreNum < 0 || scoreNum > 100) {
            return alert("점수는 0점에서 100점 사이로 입력해주세요.");
        }

        // 🌟 방어 로직 추가: 등급/석차 검증 (입력된 경우만 1 ~ 9)
        if (scoreForm.scoreRank) {
            const rankNum = Number(scoreForm.scoreRank);
            if (rankNum < 1 || rankNum > 9) {
                return alert("등급은 1등급에서 9등급 사이로 입력해주세요.");
            }
        }

        const isEditMode = scoreForm.scoreNo !== null; 
        // 🌟 /api 제거
        const apiUrl = isEditMode ? "/score/edit" : "/score/add";
        const method = isEditMode ? "put" : "post";

        try {
            await apiClient[method](apiUrl, {
                studentNo: student.studentNo,
                ...scoreForm
            });
            
            alert(isEditMode ? "성적이 성공적으로 수정되었습니다." : "성적이 성공적으로 등록되었습니다.");
            
            if (isEditMode) {
                resetForm();
            } else {
                setScoreForm(prev => ({ ...prev, scoreSubject: "수학", scoreScore: "", scoreRank: "" }));
            }
            
            fetchScores(student.studentNo); 
        } catch (error) {
            alert(isEditMode ? "성적 수정에 실패했습니다." : "성적 등록에 실패했습니다.");
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

    const handleDeleteScore = async (scoreNo) => {
        if (!window.confirm("이 과목 성적을 삭제하시겠습니까?")) return;
        try {
            // 🌟 /api 제거
            await apiClient.delete(`/score/delete/${scoreNo}`);
            fetchScores(student.studentNo);
            
            if (selectedExam) {
                setSelectedExam(prev => ({
                    ...prev,
                    subjects: prev.subjects.filter(s => s.scoreNo !== scoreNo)
                }));
            }
        } catch (error) {
            alert("삭제에 실패했습니다.");
        }
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                            />
                            <Button variant="primary" onClick={handleSearchStudent}>
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
                            <Table hover responsive className="align-middle text-center border-top">
                                <thead className="bg-light">
                                    <tr>
                                        <th>시험일</th>
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
                                                <td className="text-muted small">{exam.examDate}</td>
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
                    <Table hover responsive className="align-middle text-center mb-0">
                        <thead className="bg-white border-bottom">
                            <tr>
                                <th>과목</th>
                                <th>점수</th>
                                <th>등급/석차</th>
                                <th>관리 (수정/삭제)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedExam?.subjects.map(subject => (
                                <tr key={subject.scoreNo}>
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
        </div>
    );
}