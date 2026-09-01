import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { authClient } from "@utils/reaxios"; // 통신 모듈

export default function PaymentList() {
    // 1. 진짜 데이터를 담을 State
    const [payments, setPayments] = useState([]);
    
    // 2. 검색 조건 State
    const [filters, setFilters] = useState({
        searchMonth: "2026-08", // 기본값 세팅
        searchStatus: "전체",
        searchName: ""
    });

    // 3. 상단 요약 금액 State (리스트를 기반으로 자동 계산)
    const [summary, setSummary] = useState({ totalPaid: 0, totalUnpaid: 0 });

    // 🌟 핵심 기능: 백엔드에서 데이터 가져오기
    const fetchPayments = useCallback(async () => {
        try {
            // 필터 조건을 쿼리 스트링으로 변환하여 요청
            const response = await authClient.get("http://localhost:8080/api/payment/list", {
                params: filters
            });
            
            const data = response.data;
            setPayments(data);

            // 받아온 데이터로 상단 총 납부금액, 미납금액 실시간 계산
            const paid = data.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
            const unpaid = data.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
            setSummary({ totalPaid: paid, totalUnpaid: unpaid });

        } catch (error) {
            console.error("수납 목록 로딩 실패:", error);
        }
    }, [filters]);

    // 화면 켜질 때 & 검색 버튼 누를 때마다 실행
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // 검색 조건 입력 핸들러
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-1">수납 목록</h2>
            <p className="text-muted mb-4">기능 우선 구현 버전입니다.</p>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                    <Row className="align-items-end mb-4">
                        <Col lg={7} className="d-flex gap-3">
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">월 선택</Form.Label>
                                <Form.Control type="month" name="searchMonth" value={filters.searchMonth} onChange={handleFilterChange} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">납부 상태</Form.Label>
                                <Form.Select name="searchStatus" value={filters.searchStatus} onChange={handleFilterChange}>
                                    <option value="전체">전체</option>
                                    <option value="완납">완납</option>
                                    <option value="미납">미납</option>
                                    <option value="부분납">부분납</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="small text-muted fw-bold mb-1">학생명</Form.Label>
                                <Form.Control type="text" name="searchName" value={filters.searchName} onChange={handleFilterChange} placeholder="이름 검색" />
                            </Form.Group>
                            {/* 버튼 클릭 시 별도 함수 없이 useEffect 의존성(filters)으로 인해 자동 조회되거나, 명시적으로 fetchPayments 호출 */}
                            <Button variant="primary" className="mb-0 d-flex align-items-center gap-2" style={{ height: "38px" }} onClick={fetchPayments}>
                                <FaSearch /> 조회
                            </Button>
                        </Col>

                        {/* 실시간 계산된 금액 출력 */}
                        <Col lg={5} className="d-flex justify-content-end gap-4 text-end">
                            <div>
                                <div className="small text-muted fw-bold mb-1">납부 금액</div>
                                <h4 className="fw-bold text-success mb-0">₩{summary.totalPaid.toLocaleString()}</h4>
                            </div>
                            <div>
                                <div className="small text-muted fw-bold mb-1">미납 금액</div>
                                <h4 className="fw-bold text-danger mb-0">₩{summary.totalUnpaid.toLocaleString()}</h4>
                            </div>
                        </Col>
                    </Row>

                    <Table hover responsive className="align-middle text-center border-top">
                        <thead className="bg-light">
                            <tr>
                                <th>수납번호</th>
                                <th>학생명</th>
                                <th>월</th>
                                <th>상태</th>
                                <th>총 학원비</th>
                                <th>납부금액</th>
                                <th>남은금액</th>
                                <th>최근납부일</th>
                                <th>알림</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr><td colSpan="9">조회된 데이터가 없습니다.</td></tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.paymentNo}>
                                        <td>PAY-{p.paymentNo}</td>
                                        <td className="fw-bold">{p.studentName}</td>
                                        <td>{p.paymentMonth}</td>
                                        <td className={`fw-bold ${p.paymentStatus === '완납' ? 'text-success' : p.paymentStatus === '미납' ? 'text-danger' : 'text-warning'}`}>
                                            {p.paymentStatus}
                                        </td>
                                        <td>{p.totalAmount?.toLocaleString()}</td>
                                        <td>{p.paidAmount?.toLocaleString()}</td>
                                        <td className={p.remainingAmount > 0 ? "text-danger fw-bold" : ""}>
                                            {p.remainingAmount?.toLocaleString()}
                                        </td>
                                        <td>{p.lastPaidDate ? p.lastPaidDate.substring(0, 10) : "-"}</td>
                                        <td>
                                            {p.paymentStatus !== "완납" ? (
                                                <Button variant="primary" size="sm" className="fw-bold w-100" onClick={() => alert(`${p.studentName} 학생에게 독촉 알림을 발송합니다!`)}>
                                                    보내기
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