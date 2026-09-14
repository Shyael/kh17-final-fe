import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Badge, Button, Row, Col, Spinner, Form } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";

export default function PaymentDetail() {
    const { paymentNo } = useParams(); 
    const navigate = useNavigate();

    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payAmount, setPayAmount] = useState("");

    const fetchPaymentDetail = useCallback(async () => {
        try {
            const response = await apiClient.get(`/payment/detail/${paymentNo}`);
            setPaymentData(response.data);
        } catch (error) {
            console.error("수납 상세 정보 로딩 실패:", error);
            alert("정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [paymentNo]);

    // 수납 처리 함수
    const handlePay = async () => {
        // 방어 로직: 숫자 미입력 또는 0원 이하 결제 방지
        const amount = parseInt(payAmount, 10);
        if (!amount || amount <= 0) {
            return alert("올바른 수납 금액을 입력해 주세요.");
        }

        if (!window.confirm(`₩${amount.toLocaleString()}원을 수납 처리하시겠습니까?`)) return;

        try {
            // x-www-form-urlencoded 형식으로 쿼리 파라미터 전송
            await apiClient.post(`/payment/pay?paymentNo=${paymentNo}&payAmount=${amount}`);
            alert("수납이 완료되었습니다.");
            setPayAmount(""); // 인풋창 비우기
            fetchPaymentDetail(); // 화면 새로고침하여 바뀐 상태(완납/부분납)와 이력 표시
        } catch (error) {
            alert("수납 처리에 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchPaymentDetail();
    }, [fetchPaymentDetail]);

    if (loading || !paymentData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-primary fw-bold">영수증 데이터를 불러오는 중입니다...</span>
            </div>
        );
    }

    const { payment, details, discounts, historys } = paymentData;

    return (
        <div className="container-fluid py-4">
            {/* 1. 상단 헤더 영역 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                        ← 뒤로가기
                    </Button>
                    <h4 className="fw-bold mb-0 text-primary">
                        수납 상세 내역
                    </h4>
                </div>
                <span className="text-muted fw-semibold">수납 번호 : #{payment.paymentNo}</span>
            </div>

            <Row className="g-4">
                {/* 2. 좌측: 결제 종합 정보 (Master) */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                            <h6 className="fw-bold text-secondary mb-0">결제 요약</h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="text-center mb-4 pb-4 border-bottom">
                                {/* 🌟 변수 매핑: paymentMonth */}
                                <div className="text-muted small fw-bold mb-2">{payment.paymentMonth} 청구분</div>
                                {/* 🌟 변수 매핑: paymentAmount */}
                                <h2 className="fw-bold mb-3">₩{payment.paymentAmount?.toLocaleString()}</h2>
                                
                                {/* 🌟 변수 매핑: paymentStatus */}
                                {payment.paymentStatus === '완납' ? (
                                    <Badge bg="success" className="p-2 fs-6">완납됨</Badge>
                                ) : payment.paymentStatus === '부분납' ? (
                                    <Badge bg="warning" text="dark" className="p-2 fs-6">부분납 진행중</Badge>
                                ) : (
                                    <Badge bg="danger" className="p-2 fs-6">미납</Badge>
                                )}
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">학생 번호</span>
                                <span className="fw-bold">{payment.studentNo}번</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">청구 발행일</span>
                                {/* 🌟 변수 매핑: paymentCtime (날짜 형식 자르기) */}
                                <span className="fw-bold">{payment.paymentCtime ? payment.paymentCtime.substring(0, 10) : '-'}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 3. 우측: 청구 상세 (Details) 및 할인 (Discounts) */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white pt-4 pb-2 px-4">
                            <h6 className="fw-bold text-secondary mb-0">청구 상세 항목</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="align-middle text-center mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>상세 번호</th>
                                        <th>과정 번호 (내용)</th>
                                        <th className="text-end pe-4">금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details && details.length > 0 ? (
                                        details.map((detail, idx) => (
                                            <tr key={idx}>
                                                {/* 🌟 변수 매핑: paymentDetailNo */}
                                                <td className="text-muted small">#{detail.paymentDetailNo}</td>
                                                {/* 🌟 변수 매핑: courseNo */}
                                                <td className="fw-bold text-start ps-4">수강료 (과정번호: {detail.courseNo})</td>
                                                {/* 🌟 변수 매핑: courseFee */}
                                                <td className="text-end pe-4">₩{detail.courseFee?.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-muted py-4">상세 청구 내역이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Header className="bg-light pt-4 pb-2 px-4 border-bottom-0">
                            <h6 className="fw-bold text-secondary mb-0">적용된 할인 내역</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="align-middle text-center mb-0 border-transparent">
                                <tbody>
                                    {discounts && discounts.length > 0 ? (
                                        discounts.map((discount, idx) => (
                                            <tr key={idx}>
                                                {/* 나중에 discount 데이터가 들어올 때를 대비한 임시 변수 매핑 */}
                                                <td className="fw-bold text-start ps-4 text-primary">
                                                    {discount.discountName || "할인 적용"}
                                                </td>
                                                <td className="text-end pe-4 text-danger fw-bold">
                                                    - ₩{discount.discountValue?.toLocaleString() || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="text-muted py-3">적용된 할인 혜택이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                    {/* ===================================== */}
                    {/* 4. 납부 이력 (Payment History) 영역 */}
                    {/* ===================================== */}
                    <Card className="shadow-sm border-0 mt-4">
                        {/* 🌟 카드 헤더를 입력창 + 버튼 구조로 변경 */}
                        <Card.Header className="bg-white pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-secondary mb-0">납부 이력 (결제 내역)</h6>
                            
                            {/* 완납 상태가 아닐 때만 수납 입력창 표시 */}
                            {payment.paymentStatus !== '완납' && (
                                <div className="d-flex gap-2" style={{ width: "250px" }}>
                                    <Form.Control 
                                        type="number" 
                                        size="sm" 
                                        placeholder="수납 금액 입력"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                    />
                                    <Button variant="primary" size="sm" className="flex-shrink-0 fw-bold" onClick={handlePay}>
                                        납부 확인
                                    </Button>
                                </div>
                            )}
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="align-middle text-center mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>납부 번호</th>
                                        <th>납부 일시</th>
                                        <th className="text-end pe-4">납부 금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historys && historys.length > 0 ? (
                                        historys.map((history, idx) => (
                                            <tr key={idx}>
                                                <td className="text-muted small">#{history.paymentHistoryNo}</td>
                                                {/* 날짜 형식 예쁘게 다듬기 (T를 공백으로 바꾸고 초 단위 절삭) */}
                                                <td>
                                                    {history.paymentHistoryAt 
                                                        ? history.paymentHistoryAt.replace("T", " ").substring(0, 16) 
                                                        : '-'}
                                                </td>
                                                <td className="text-end pe-4 text-success fw-bold">
                                                    + ₩{history.paymentHistoryAmount?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-muted py-4">납부 이력이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}