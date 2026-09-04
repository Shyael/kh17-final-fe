import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Table, Row, Col, Badge, InputGroup } from "react-bootstrap";
import { FaSearch, FaRegBell } from "react-icons/fa";
import { authClient } from "@utils/reaxios"; // 통신 모듈
import { useNavigate } from "react-router-dom";

export default function PaymentList() {
    const navigate = useNavigate();

    // 1. 진짜 데이터를 담을 State
    const [payments, setPayments] = useState([]);
    
    // 2. 검색 조건 State
    const [filters, setFilters] = useState({
        searchMonth: "2026-08",
        searchStatus: "전체",
        searchName: ""
    });

    // 3. 상단 요약 금액 State
    const [summary, setSummary] = useState({ totalPaid: 0, totalUnpaid: 0 });

    // 🌟 데이터 가져오기 로직 (수정 없음)
    const fetchPayments = useCallback(async () => {
        try {
            const response = await authClient.get("http://localhost:8080/api/payment/list", {
                params: filters
            });
            
            const data = response.data;
            setPayments(data);

            const paid = data.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
            const unpaid = data.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
            setSummary({ totalPaid: paid, totalUnpaid: unpaid });

        } catch (error) {
            console.error("수납 목록 로딩 실패:", error);
        }
    }, [filters]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // 상태별 배지(Badge) 스타일링 함수
    const getStatusStyle = (status) => {
        switch(status) {
            case '완납':
                return { bg: "#E6F4EA", color: "#1E8E3E" }; // 연한 초록
            case '미납':
                return { bg: "#FCE8E6", color: "#D93025" }; // 연한 빨강
            case '부분납':
                return { bg: "#FEF7E0", color: "#E37400" }; // 연한 노랑/오렌지
            default:
                return { bg: "#F1F3F4", color: "#5F6368" }; // 회색
        }
    };

    return (
        // 배경을 아주 연한 회색으로 주어 흰색 카드가 돋보이게 함
        <div className="container-fluid py-5" style={{ backgroundColor: "#F8F9FA", minHeight: "100vh", fontFamily: "'Pretendard', sans-serif" }}>
            
            {/* 타이틀 영역 */}
            <div className="mb-4">
                <h2 className="fw-bolder mb-2" style={{ color: "#202124", letterSpacing: "-0.5px" }}>수납 관리</h2>
                <p className="text-muted" style={{ fontSize: "0.95rem" }}>이번 달 학원비 수납 현황을 한눈에 확인하세요.</p>
            </div>

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4 p-lg-5">
                    
                    {/* 상단: 요약 금액 & 검색 필터 영역 */}
                    <Row className="align-items-center mb-5 gy-4">
                        
                        {/* 검색 필터 (좌측) */}
                        <Col lg={7}>
                            <div className="d-flex flex-wrap gap-3 p-3" style={{ backgroundColor: "#F8F9FA", borderRadius: "16px" }}>
                                <Form.Group style={{ flex: "1", minWidth: "140px" }}>
                                    <Form.Label className="small text-muted fw-semibold mb-2">청구 월</Form.Label>
                                    <Form.Control 
                                        type="month" 
                                        name="searchMonth" 
                                        value={filters.searchMonth} 
                                        onChange={handleFilterChange} 
                                        className="border-0 shadow-none"
                                        style={{ borderRadius: "10px" }}
                                    />
                                </Form.Group>
                                
                                <Form.Group style={{ flex: "1", minWidth: "120px" }}>
                                    <Form.Label className="small text-muted fw-semibold mb-2">수납 상태</Form.Label>
                                    <Form.Select 
                                        name="searchStatus" 
                                        value={filters.searchStatus} 
                                        onChange={handleFilterChange}
                                        className="border-0 shadow-none"
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="전체">전체 상태</option>
                                        <option value="완납">완납</option>
                                        <option value="미납">미납</option>
                                        <option value="부분납">부분납</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group style={{ flex: "1.5", minWidth: "160px" }}>
                                    <Form.Label className="small text-muted fw-semibold mb-2">원생 검색</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type="text" 
                                            name="searchName" 
                                            value={filters.searchName} 
                                            onChange={handleFilterChange} 
                                            placeholder="이름을 입력하세요" 
                                            className="border-0 shadow-none border-end-0"
                                            style={{ borderRadius: "10px 0 0 10px" }}
                                        />
                                        <Button 
                                            onClick={fetchPayments}
                                            className="border-0 d-flex justify-content-center align-items-center px-3"
                                            style={{ backgroundColor: "#FF6B00", color: "#fff", borderRadius: "0 10px 10px 0" }} // 랠리즈 스타일 오렌지 포인트
                                        >
                                            <FaSearch />
                                        </Button>
                                    </InputGroup>
                                </Form.Group>
                            </div>
                        </Col>

                        {/* 요약 금액 카드 (우측) */}
                        <Col lg={5} className="d-flex gap-3 justify-content-lg-end">
                            <div className="p-4 flex-fill text-end shadow-sm" style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #EAEAEA" }}>
                                <div className="small text-muted fw-semibold mb-1">총 수납 완료</div>
                                <h3 className="fw-bolder mb-0" style={{ color: "#1E8E3E" }}>
                                    {summary.totalPaid.toLocaleString()}<span className="fs-5 ms-1 fw-normal text-muted">원</span>
                                </h3>
                            </div>
                            <div className="p-4 flex-fill text-end shadow-sm" style={{ backgroundColor: "#FFF8F7", borderRadius: "16px", border: "1px solid #FCE8E6" }}>
                                <div className="small text-danger fw-semibold mb-1">총 미납 금액</div>
                                <h3 className="fw-bolder mb-0" style={{ color: "#D93025" }}>
                                    {summary.totalUnpaid.toLocaleString()}<span className="fs-5 ms-1 fw-normal text-danger opacity-75">원</span>
                                </h3>
                            </div>
                        </Col>
                    </Row>

                    {/* 데이터 테이블 영역 */}
                    <div className="table-responsive">
                        <Table hover className="align-middle text-center mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                            <thead>
                                <tr>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>No</th>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>학생명</th>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>청구월</th>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>상태</th>
                                    <th className="border-0 text-muted fw-semibold py-3 text-end" style={{ fontSize: "0.9rem" }}>총 청구액</th>
                                    <th className="border-0 text-muted fw-semibold py-3 text-end" style={{ fontSize: "0.9rem" }}>수납액</th>
                                    <th className="border-0 text-muted fw-semibold py-3 text-end" style={{ fontSize: "0.9rem" }}>미납액</th>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>최근 납부일</th>
                                    <th className="border-0 text-muted fw-semibold py-3" style={{ fontSize: "0.9rem" }}>알림</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="py-5 text-muted border-0">
                                            조회된 수납 내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((p, idx) => {
                                        const statusStyle = getStatusStyle(p.paymentStatus);
                                        return (
                                            <tr key={p.paymentNo} 
                                                onClick={() => navigate(`/payment/detail/${p.paymentNo}`)} 
                                                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                                className="shadow-sm"
                                            >
                                                {/* 테이블 테두리 제거 및 둥근 모서리 효과를 위한 인라인 스타일 */}
                                                <td className="border-0 py-3 text-muted" style={{ borderRadius: "12px 0 0 12px" }}>{idx + 1}</td>
                                                <td className="border-0 py-3 fw-bolder" style={{ fontSize: "1.05rem", color: "#202124" }}>{p.studentName}</td>
                                                <td className="border-0 py-3 text-muted">{p.paymentMonth}</td>
                                                <td className="border-0 py-3">
                                                    <span 
                                                        className="px-3 py-1 fw-bold rounded-pill" 
                                                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: "0.85rem" }}
                                                    >
                                                        {p.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="border-0 py-3 text-end text-muted">{p.totalAmount?.toLocaleString()}원</td>
                                                <td className="border-0 py-3 text-end fw-semibold text-dark">{p.paidAmount?.toLocaleString()}원</td>
                                                <td className="border-0 py-3 text-end">
                                                    <span className={p.remainingAmount > 0 ? "text-danger fw-bold" : "text-muted"}>
                                                        {p.remainingAmount?.toLocaleString()}원
                                                    </span>
                                                </td>
                                                <td className="border-0 py-3 text-muted small">{p.lastPaidDate ? p.lastPaidDate.substring(0, 10) : "-"}</td>
                                                <td className="border-0 py-3" style={{ borderRadius: "0 12px 12px 0" }}>
                                                    {p.paymentStatus !== "완납" ? (
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="rounded-pill px-3 d-flex align-items-center justify-content-center gap-1 mx-auto" 
                                                            style={{ border: "1px solid #FCE8E6", backgroundColor: "#FFF8F7", color: "#D93025", fontWeight: "600" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert(`${p.studentName} 학부모님께 수납 요청 알림을 발송합니다.`);
                                                            }}>
                                                            <FaRegBell /> 요청
                                                        </Button>
                                                    ) : (
                                                        <span className="text-light opacity-50">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>

                </Card.Body>
            </Card>
        </div>
    );
}