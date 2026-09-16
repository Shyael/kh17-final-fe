import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Table, Row, Col, Badge } from "react-bootstrap";
import { apiClient } from "@utils/reaxios"; 
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai"; 
import { isParentState, selectedChildState, selectedChildNoState } from "@utils/storage";
import Swal from 'sweetalert2';

export default function ParentPaymentList({ targetStudentNo }) {
    const navigate = useNavigate();

    // 🌟 1. 로그인 및 학생 번호 세팅 (성적 페이지와 완벽히 동일!)
    const userStateStr = localStorage.getItem("loginUserState");
    const userInfo = userStateStr ? JSON.parse(userStateStr) : null;
    const loginAccountNo = userInfo ? userInfo.accountNo : null;
    const selectedChildNo = useAtomValue(selectedChildNoState);
    
    const [currentStudentNo, setCurrentStudentNo] = useState(null);

    // 🌟 1. 상태(State) 수정: 백엔드에서 받은 '원본 데이터'를 저장할 State로 변경
    const [allPayments, setAllPayments] = useState([]); 
    const [searchStatus, setSearchStatus] = useState("전체"); 
    const [summary, setSummary] = useState({ totalPaid: 0, totalUnpaid: 0 });

    // ----------------------------------------------------
    // 번호 세팅 로직
    useEffect(() => {
        const initStudentNo = async () => {
            if (selectedChildNo) { setCurrentStudentNo(Number(selectedChildNo)); return; }
            if (targetStudentNo) { setCurrentStudentNo(targetStudentNo); return; }
            if (userInfo?.studentNo) { setCurrentStudentNo(userInfo.studentNo); return; }
            if (userInfo?.accountType === "학부모" && userInfo?.children?.length > 0) {
                setCurrentStudentNo(userInfo.children[0].studentNo); return;
            }

            const isStudent = userInfo?.accountType !== "학부모" && !userInfo?.roleNames?.includes("PARENT");
            if (loginAccountNo && isStudent) {
                try {
                    const res = await apiClient.get('/academy/score/student-no', {
                        params: { accountNo: loginAccountNo }
                    });
                    if (res.data) setCurrentStudentNo(res.data);
                } catch (error) {
                    console.error("학생 번호를 가져오는데 실패했습니다.", error);
                }
            }
        };
        initStudentNo();
    }, [targetStudentNo, loginAccountNo, selectedChildNo]);

    // ----------------------------------------------------
    const fetchPayments = useCallback(async () => {
        if (!currentStudentNo) return;

        try {
            const response = await apiClient.get("/academy/payment/list", {
                params: { 
                    studentNo: currentStudentNo
                    // searchStatus 파라미터 삭제! (어차피 백엔드에서 전체를 다 줌)
                }
            });
            
            const data = response.data.list || response.data || [];
            
            // 가져온 전체 데이터를 allPayments에 저장!
            setAllPayments(data);

            // 요약(총액)은 필터와 상관없이 '학생의 전체 기준'으로 보여주는 것이 좋습니다.
            const paid = data.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
            const unpaid = data.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
            setSummary({ totalPaid: paid, totalUnpaid: unpaid });

        } catch (error) {
            console.error("수납 목록 로딩 실패:", error);
        }
    }, [currentStudentNo]); // searchStatus 의존성 제거

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // 🌟 3. 리액트에서 실시간 필터링! (searchStatus가 바뀔 때마다 즉시 계산)
    const filteredPayments = allPayments.filter(p => {
        if (searchStatus === "전체") return true;
        
        // "미납"을 선택하면 상태가 '미납'이거나 '부분납'인 것을 모두 보여줌!
        if (searchStatus === "미납") {
            return p.paymentStatus === "미납" || p.paymentStatus === "부분납";
        }
        
        // "완납"을 선택하면 완납만!
        if (searchStatus === "완납") {
            return p.paymentStatus === "완납";
        }
        
        return true;
    });

    // ----------------------------------------------------
    const handleKakaoPay = async (e, payment) => {
        e.stopPropagation(); 
        try {
            const response = await apiClient.post('/academy/payment/kakaopay/ready', null, {
                params: {
                    accountNo: loginAccountNo,
                    itemName: `${payment.paymentMonth} 학원비`,
                    totalAmount: payment.remainingAmount,
                    paymentNo: payment.paymentNo // 🌟 백엔드에 결제번호(PK) 넘겨주기!
                }
            });

            // 승인(Approve) 화면에서 쓸 수 있게 스토리지에 3종 세트 꽉꽉 담아두기
            localStorage.setItem("kakao_tid", response.data.tid);
            localStorage.setItem("kakao_payment_no", payment.paymentNo); 
            localStorage.setItem("kakao_payment_amount", payment.remainingAmount); 

            window.location.href = response.data.next_redirect_pc_url;
        } catch (error) {
            console.error("결제 준비 실패", error);
            
            // 🌟 기존 alert 대신 Swal 적용!
            Swal.fire({
                icon: 'error',
                title: '결제 준비 실패',
                text: '카카오페이 결제창을 여는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
                confirmButtonColor: '#d33', // 에러에 어울리는 빨간색 버튼
                confirmButtonText: '확인'
            });
        }
    };

    const getBadgeVariant = (status) => {
        switch(status) {
            case '완납': return 'success';
            case '미납': return 'danger';
            case '부분납': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <div className="container-fluid py-4">
            <h3 className="fw-bold mb-1">내 수납 내역</h3>
            <p className="text-muted mb-4">학원비 청구 및 납부 내역을 확인하고 결제할 수 있습니다.</p>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                    <Row className="align-items-end mb-4 border-bottom pb-4">
                        <Col lg={4}>
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">수납 상태 필터</Form.Label>
                                <Form.Select 
                                    style={{ width: '200px' }}
                                    value={searchStatus} 
                                    onChange={(e) => setSearchStatus(e.target.value)}
                                >
                                    <option value="전체">전체 내역 보기</option>
                                    <option value="미납">미납/부분납만 보기</option>
                                    <option value="완납">완납 내역만 보기</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col lg={8} className="d-flex justify-content-end gap-4 text-end mt-3 mt-lg-0">
                            <div>
                                <div className="small text-muted fw-bold mb-1">총 납부 금액</div>
                                <h4 className="fw-bold text-success mb-0">₩{summary.totalPaid.toLocaleString()}</h4>
                            </div>
                            <div>
                                <div className="small text-muted fw-bold mb-1">결제 필요 금액 (미납)</div>
                                <h4 className="fw-bold text-danger mb-0">₩{summary.totalUnpaid.toLocaleString()}</h4>
                            </div>
                        </Col>
                    </Row>

                    <Table hover responsive className="align-middle text-center">
                        <thead className="table-light">
                            <tr>
                                <th>청구월</th>
                                <th>상태</th>
                                <th>총 청구액</th>
                                <th>미납액</th>
                                <th>최근 납부일</th>
                                <th>결제하기</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 🌟 payments -> filteredPayments 로 변경! */}
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-5 text-muted">
                                        조회된 수납 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p.paymentNo} style={{ cursor: "pointer" }}>
                                        <td className="fw-bold">{p.paymentMonth}</td>
                                        <td><Badge bg={getBadgeVariant(p.paymentStatus)}>{p.paymentStatus}</Badge></td>
                                        <td>{p.totalAmount?.toLocaleString()}원</td>
                                        <td className={p.remainingAmount > 0 ? "text-danger fw-bold" : "text-muted"}>
                                            {p.remainingAmount > 0 ? `${p.remainingAmount.toLocaleString()}원` : "-"}
                                        </td>
                                        <td className="text-muted">{p.lastPaidDate ? p.lastPaidDate.substring(0, 10) : "-"}</td>
                                        
                                        {/* 🌟 기존 알림 버튼 자리에 카카오페이 결제 버튼 투입! */}
                                        <td>
                                            {p.paymentStatus !== "완납" ? (
                                                <Button 
                                                    variant="warning" // 카카오 고유의 노란색 느낌
                                                    size="sm" 
                                                    className="fw-bold text-dark px-3 shadow-sm"
                                                    onClick={(e) => handleKakaoPay(e, p)}
                                                >
                                                    결제하기
                                                </Button>
                                            ) : (
                                                <span className="text-muted small">결제완료</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
}