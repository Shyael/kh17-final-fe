import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Table, Row, Col, Badge, InputGroup } from "react-bootstrap";
import { FaSearch, FaRegBell } from "react-icons/fa";
import { apiClient } from "@utils/reaxios"; 
import { useNavigate } from "react-router-dom";

export default function PaymentList() {
    const navigate = useNavigate();

    // 오늘 날짜를 기준으로 'YYYY-MM' 포맷을 자동으로 만들어주는 함수
    const getCurrentMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); 
        return `${year}-${month}`;
    };

    // 1. 진짜 데이터를 담을 State
    const [payments, setPayments] = useState([]);
    
    // 2. 검색 조건 State
    const [filters, setFilters] = useState({
        searchMonth: getCurrentMonth(),
        searchStatus: "전체",
        searchName: ""
    });

    // 3. 상단 요약 금액 State
    const [summary, setSummary] = useState({ totalPaid: 0, totalUnpaid: 0 });

    // 🌟 데이터 가져오기 로직 
    const fetchPayments = useCallback(async () => {
        try {
            const response = await apiClient.get("/payment/list", {
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

    // 상태별 기본 부트스트랩 Badge variant 리턴 함수
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
            
            <h2 className="fw-bold mb-1">수납 관리</h2>
            <p className="text-muted mb-4">이번 달 학원비 수납 현황을 한눈에 확인하세요.</p>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                    
                    <Row className="align-items-end mb-4">
                        {/* 검색 필터 (좌측) */}
                        <Col lg={7} className="d-flex gap-3">
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">청구 월</Form.Label>
                                <Form.Control 
                                    type="month" 
                                    name="searchMonth" 
                                    value={filters.searchMonth} 
                                    onChange={handleFilterChange} 
                                />
                            </Form.Group>
                            
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">수납 상태</Form.Label>
                                <Form.Select 
                                    name="searchStatus" 
                                    value={filters.searchStatus} 
                                    onChange={handleFilterChange}
                                >
                                    <option value="전체">전체 상태</option>
                                    <option value="완납">완납</option>
                                    <option value="미납">미납</option>
                                    <option value="부분납">부분납</option>
                                </Form.Select>
                            </Form.Group>
                            
                            <Form.Group style={{ flexGrow: 1, maxWidth: "300px" }}>
                                <Form.Label className="small text-muted fw-bold mb-1">원생 검색</Form.Label>
                                <InputGroup>
                                    <Form.Control 
                                        type="text" 
                                        name="searchName" 
                                        value={filters.searchName} 
                                        onChange={handleFilterChange} 
                                        placeholder="이름 검색" 
                                    />
                                    <Button variant="primary" onClick={fetchPayments}>
                                        <FaSearch />
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* 요약 금액 (우측) */}
                        <Col lg={5} className="d-flex justify-content-end gap-4 text-end mt-3 mt-lg-0">
                            <div>
                                <div className="small text-muted fw-bold mb-1">총 수납 완료</div>
                                <h4 className="fw-bold text-success mb-0">
                                    ₩{summary.totalPaid.toLocaleString()}
                                </h4>
                            </div>
                            <div>
                                <div className="small text-muted fw-bold mb-1">총 미납 금액</div>
                                <h4 className="fw-bold text-danger mb-0">
                                    ₩{summary.totalUnpaid.toLocaleString()}
                                </h4>
                            </div>
                        </Col>
                    </Row>

                    {/* 데이터 테이블 영역 */}
                    <Table hover responsive className="align-middle text-center border-top">
                        <thead className="table-light">
                            <tr>
                                <th>No</th>
                                <th>학생명</th>
                                <th>청구월</th>
                                <th>상태</th>
                                <th>총 청구액</th>
                                <th>수납액</th>
                                <th>미납액</th>
                                <th>최근 납부일</th>
                                <th>알림</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-4 text-muted">
                                        조회된 수납 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p, idx) => (
                                    <tr key={p.paymentNo} 
                                        onClick={() => navigate(`/payment/detail/${p.paymentNo}`)} 
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td className="text-muted">{idx + 1}</td>
                                        <td className="fw-bold">{p.studentName}</td>
                                        <td>{p.paymentMonth}</td>
                                        <td>
                                            <Badge bg={getBadgeVariant(p.paymentStatus)}>
                                                {p.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td>{p.totalAmount?.toLocaleString()}원</td>
                                        <td className="fw-semibold text-dark">{p.paidAmount?.toLocaleString()}원</td>
                                        <td className={p.remainingAmount > 0 ? "text-danger fw-bold" : "text-muted"}>
                                            {p.remainingAmount > 0 ? `${p.remainingAmount.toLocaleString()}원` : "-"}
                                        </td>
                                        <td className="text-muted">{p.lastPaidDate ? p.lastPaidDate.substring(0, 10) : "-"}</td>
                                        <td>
                                            {p.paymentStatus !== "완납" ? (
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    className="d-flex align-items-center gap-1 mx-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert(`${p.studentName} 학부모님께 수납 요청 알림을 발송합니다.`);
                                                    }}>
                                                    <FaRegBell /> 요청
                                                </Button>
                                            ) : (
                                                <span className="text-muted">-</span>
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