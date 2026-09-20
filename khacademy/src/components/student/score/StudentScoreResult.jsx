import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@utils/reaxios"; 
import { useAtomValue } from "jotai";
import { isParentState, selectedChildState, selectedChildNoState } from "@utils/storage";

export default function StudentScoreResult({ targetStudentNo }) {
    
    const userStateStr = localStorage.getItem("loginUserState");
    const userInfo = userStateStr ? JSON.parse(userStateStr) : null;
    const loginAccountNo = userInfo ? userInfo.accountNo : null;
    const selectedChildNo = useAtomValue(selectedChildNoState);
    
    // 🌟 1. 최종 학생 번호를 '상태(State)'로 관리합니다! (처음엔 비워둠)
    const [currentStudentNo, setCurrentStudentNo] = useState(null);

    const [examList, setExamList] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [scoreResult, setScoreResult] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [trendData, setTrendData] = useState([]);
    const [allScores, setAllScores] = useState([]);

    useEffect(() => {
        const initStudentNo = async () => {
            // 🏆 0순위: 로컬 스토리지에 '선택된 자녀 번호'가 있다면 무조건 최우선 적용!
            if (selectedChildNo) {
                // 스토리지 값은 문자열일 수 있으므로 확실하게 숫자(Number)로 변환해 줍니다.
                setCurrentStudentNo(Number(selectedChildNo));
                return;
            }

            // 1순위: 상위 화면에서(Props) 찔러준 번호가 있다면 사용
            if (targetStudentNo) {
                setCurrentStudentNo(targetStudentNo);
                return;
            }

            // 2순위: 학생 본인 로그인 (studentNo가 바로 있을 때)
            if (userInfo?.studentNo) {
                setCurrentStudentNo(userInfo.studentNo);
                return;
            }

            // 3순위: 학부모 로그인인데 아직 아무 자녀도 선택 안 했을 때 -> 첫째를 기본값으로!
            if (userInfo?.accountType === "학부모" && userInfo?.children?.length > 0) {
                setCurrentStudentNo(userInfo.children[0].studentNo);
                return;
            }

            // 4순위: 학생 본인인데 로컬 스토리지에 accountNo밖에 없는 경우 (API 호출)
            const isStudent = userInfo?.accountType !== "학부모" && !userInfo?.roleNames?.includes("PARENT");
            
            if (loginAccountNo && isStudent) {
                try {
                    const res = await apiClient.get('/academy/score/student-no', {
                        params: { accountNo: loginAccountNo }
                    });
                    
                    if (res.data) {
                        setCurrentStudentNo(res.data);
                    }
                } catch (error) {
                    console.error("학생 번호를 가져오는데 실패했습니다.", error);
                }
            }
        };

        initStudentNo();
    }, [targetStudentNo, loginAccountNo, selectedChildNo]);

    // 🌟 3. 2단계: 번호를 찾았으면(currentStudentNo가 세팅되면) 그때 시험 목록을 부른다!
    useEffect(() => {
        const fetchExamList = async () => {
            if (!currentStudentNo) return; // 번호 못 찾았으면 대기!
            
            try {
                // 아까 수정한 /student 없는 깔끔한 주소!
                const response = await apiClient.get('/academy/score/exams', {
                    params: { studentNo: currentStudentNo } 
                });
                
                const examDataList = response.data.list || response.data || [];
                setExamList(examDataList); 
                
                if (examDataList.length > 0) {
                    setSelectedExam(examDataList[0]);
                }
            } catch (error) {
                console.error("시험 목록을 불러오는데 실패했습니다.", error);
            }
        };

        fetchExamList();
    }, [currentStudentNo]); // currentStudentNo가 바뀔 때만(번호를 찾았을 때만) 실행됨!

    // 드롭다운 변경 감지 & 성적 리스트 불러오기 (여기는 아까 수정한 대로 유지!)
    useEffect(() => {
        if (!selectedExam || !currentStudentNo) {
            setScoreResult([]); 
            return;
        }

        const fetchScoreList = async () => {
            try {
                const response = await apiClient.get('/academy/score/list', {
                    params: {
                        studentNo: currentStudentNo, 
                        scoreName: selectedExam.scoreName,
                        scoreType: selectedExam.scoreType
                    }
                });
                const scoreDataList = response.data.list || response.data || [];
                setScoreResult(scoreDataList);
            } catch (error) {
                console.error("성적 데이터를 불러오는데 실패했습니다.", error);
            }
        };

        fetchScoreList();
    }, [selectedExam, currentStudentNo]);

    useEffect(() => {
        const fetchAllScores = async () => {
            if (!currentStudentNo) return;

            try {
                // 방금 만든 전체 성적 조회 API 호출
                const response = await apiClient.get('/academy/score/history', {
                    params: { studentNo: currentStudentNo }
                });
                
                const data = response.data || [];
                setAllScores(data); // 원본 데이터 저장

                // 💡 마법의 로직: 전체 데이터에서 '과목명'만 쏙 뽑아서 중복 제거! (Set 활용)
                const uniqueSubjects = [...new Set(data.map(item => item.scoreSubject))].filter(Boolean);
                
                setSubjectList(uniqueSubjects); // 드롭다운에 과목 목록 세팅!
                
                // 만약 과목이 존재하면, 첫 번째 과목을 기본으로 선택해둠
                if (uniqueSubjects.length > 0) {
                    setSelectedSubject(uniqueSubjects[0]);
                }

            } catch (error) {
                console.error("차트용 데이터를 불러오는데 실패했습니다.", error);
            }
        };

        fetchAllScores();
    }, [currentStudentNo]);


    useEffect(() => {
        if (!selectedSubject || allScores.length === 0 || !selectedExam) {
            setTrendData([]);
            return;
        }

        const isMockExam = selectedExam.scoreType === '모의고사' || selectedExam.scoreType === '수능';

        const chartData = allScores
            .filter(item => item.scoreSubject === selectedSubject)
            .filter(item => {
                if (isMockExam) {
                    return item.scoreType === '모의고사' || item.scoreType === '수능';
                } else {
                    return item.scoreType === '내신';
                }
            })
            // 🌟 [해결 2] 날짜(scoreDate)를 기준으로 과거 -> 최신순으로 오름차순 정렬!
            .sort((a, b) => new Date(a.scoreDate) - new Date(b.scoreDate))
            .map(item => ({
                // 🌟 [해결 1] JSON 스펙에 맞게 다시 scoreName으로 롤백!
                month: item.scoreName, 
                score: item.scoreScore
            }));

        setTrendData(chartData); 
        
    }, [selectedSubject, allScores, selectedExam]);

    // ... (renderDiff 및 하단 HTML/return 영역은 기존과 100% 동일하게 두시면 됩니다!) ...

    // 등락(rankDiff)에 따른 텍스트 색상 및 기호 처리 함수
    const renderDiff = (diff) => {
        if (diff === null || diff === undefined || diff === 0) return <span className="text-muted">-</span>;
        
        // 등급은 작아질수록 좋은 것이므로 마이너스일 때 상승(▲)으로 표시
        if (diff < 0) return <span className="text-success fw-bold">{Math.abs(diff)}▲</span>;
        return <span className="text-danger fw-bold">+{diff}▼</span>;
    };

    return (
        <div className="container-fluid py-4">
            <h3 className="fw-bold mb-4">내 성적</h3>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    {/* 1번 영역: 시험 종류 선택 */}
                    {/* 1번 영역: 시험 종류 선택 */}
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h5 className="fw-bold mb-0">시험 결과</h5>
                        
                        {/* 🌟 JSON 방식을 버리고, 아주 안전한 '배열 인덱스(idx)' 방식으로 변경! */}
                        <Form.Select 
                            style={{ width: "250px" }} 
                            // 현재 선택된 시험이 examList의 몇 번째(idx)인지 찾아서 세팅
                            value={examList.findIndex(exam => exam.scoreName === selectedExam?.scoreName && exam.scoreType === selectedExam?.scoreType)} 
                            onChange={(e) => {
                                const idx = e.target.value;
                                if (idx !== "" && idx !== "-1") {
                                    // 선택한 인덱스의 객체를 원본 배열에서 쏙 뽑아서 세팅!
                                    setSelectedExam(examList[idx]); 
                                } else {
                                    setSelectedExam(null);
                                }
                            }}
                        >
                            <option value="-1">시험을 선택하세요</option>
                            {examList.map((exam, idx) => (
                                // value를 복잡한 객체가 아니라 0, 1, 2 같은 깔끔한 숫자로!
                                <option key={idx} value={idx}>
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
                                    <Col xs={3} className="fw-semibold fs-5">{item.scoreSubject}</Col>
                                    <Col xs={3}>{item.scoreScore}점</Col>
                                    <Col xs={3}>{item.scoreRank ? `${item.scoreRank}등급` : '-'}</Col>
                                    <Col xs={3} className="text-end">{renderDiff(item.rankDiff)}</Col>
                                </Row>
                            ))
                        )}
                    </div>

                    {/* 3, 4번 영역: 과목별 추이 선택 및 차트 */}
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
                                <LineChart 
                                    data={trendData} 
                                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="month" 
                                        padding={{ left: 40, right: 40 }}
                                        interval={0}
                                        tickMargin={15} 
                                        tick={{ fontSize: 13, fill: '#666' }}
                                    />
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