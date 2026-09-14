import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@utils/reaxios"; 

export default function StudentScoreResult() {

    const [examList, setExamList] = useState([]);         // 1. 시험 종류 리스트
    const [selectedExam, setSelectedExam] = useState(null); // 선택된 시험 (객체 형태로 저장)
    
    const [scoreResult, setScoreResult] = useState([]);   // 2. 선택된 시험의 성적 결과
    
    const [subjectList, setSubjectList] = useState([]);       // 3. 차트용 과목 리스트
    const [selectedSubject, setSelectedSubject] = useState(""); // 선택된 과목
    const [trendData, setTrendData] = useState([]);           // 4. 차트 데이터

    // 화면이 처음 켜질 때 학생의 실제 시험 목록 불러오기!
    useEffect(() => {
        const fetchExamList = async () => {
            try {
                // 🌟 수정 완료: apiClient 사용
                const response = await apiClient.get('/academy/score/student/exams', {
                    params: { studentNo: loginStudentNo }
                });
                
                setExamList(response.data); 
                
                if (response.data.length > 0) {
                    setSelectedExam(response.data[0]);
                }
            } catch (error) {
                console.error("시험 목록을 불러오는데 실패했습니다.", error);
            }
        };

        fetchExamList();
    }, []);

    // 드롭다운에서 선택한 시험이 바뀔 때마다 성적 리스트를 불러오는 로직
    useEffect(() => {
        if (!selectedExam) {
            setScoreResult([]); 
            return;
        }

        const fetchScoreList = async () => {
            try {
                // 🌟 수정 완료: 주소에 /student/ 추가
                const response = await apiClient.get('/academy/score/student/list', {
                    params: {
                        studentNo: loginStudentNo,
                        scoreName: selectedExam.scoreName,
                        scoreType: selectedExam.scoreType
                    }
                });
                setScoreResult(response.data);
            } catch (error) {
                console.error("성적 데이터를 불러오는데 실패했습니다.", error);
            }
        };

        fetchScoreList();
    }, [selectedExam]);

    // 등락(rankDiff)에 따른 텍스트 색상 및 기호 처리 함수
    const renderDiff = (diff) => {
        // 첫 시험이라 이전 데이터가 없어서 null로 오거나 등락이 0인 경우
        if (diff === null || diff === undefined || diff === 0) return <span className="text-muted">-</span>;
        
        // 등급은 숫자가 '작아질수록' 좋은 거니까 마이너스일 때 상승(▲)으로 표시! (기획에 따라 반대로 하셔도 됩니다)
        if (diff < 0) return <span className="text-success fw-bold">{Math.abs(diff)}▲</span>;
        return <span className="text-danger fw-bold">+{diff}▼</span>;
    };

    return (
        <div className="container-fluid py-4">
            <h3 className="fw-bold mb-4">내 성적</h3>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    {/* 1번 영역: 시험 종류 선택 */}
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h5 className="fw-bold mb-0">시험 결과</h5>
                        
                        {/* JSON.stringify/parse를 활용해서 scoreName과 scoreType을 한 번에 묶어서 넘깁니다! */}
                        <Form.Select 
                            style={{ width: "250px" }} 
                            value={selectedExam ? JSON.stringify(selectedExam) : ""} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedExam(val ? JSON.parse(val) : null);
                            }}
                        >
                            <option value="">시험을 선택하세요</option>
                            {examList.map((exam, idx) => (
                                <option key={idx} value={JSON.stringify(exam)}>
                                    [{exam.scoreType}] {exam.scoreName}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    {/* 2번 영역: 성적 정보 리스트 */}
                    <div className="mb-5">
                        {scoreResult.length === 0 ? (
                            <div className="text-center text-muted py-4">조회된 성적 데이터가 없습니다.</div>
                        ) : (
                            scoreResult.map((item, index) => (
                                <Row key={index} className="align-items-center border-bottom py-3 mb-0">
                                    {/* 🌟 VO 필드명(camelCase)과 완벽하게 일치하게 수정! */}
                                    <Col xs={3} className="fw-semibold fs-5">{item.scoreSubject}</Col>
                                    <Col xs={3}>{item.scoreScore}점</Col>
                                    <Col xs={3}>{item.scoreRank ? `${item.scoreRank}등급` : '-'}</Col>
                                    <Col xs={3} className="text-end">{renderDiff(item.rankDiff)}</Col>
                                </Row>
                            ))
                        )}
                    </div>

                    {/* 3, 4번 영역: 과목별 추이 선택 및 차트는 뼈대 유지 */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0">과목별 성적 추이</h5>
                        <Form.Select 
                            style={{ width: "150px" }} 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">과목 선택</option>
                            {subjectList.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <div style={{ width: '100%', height: 300 }}>
                        {trendData.length === 0 ? (
                            <div className="h-100 d-flex justify-content-center align-items-center text-muted bg-light rounded">
                                데이터를 불러오는 중입니다...
                            </div>
                        ) : (
                            <ResponsiveContainer>
                                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} hide={true} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#111" strokeWidth={3} dot={{ r: 5, fill: "#111" }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}