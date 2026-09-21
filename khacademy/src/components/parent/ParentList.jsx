import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { FaSearch, FaUserFriends, FaUserClock, FaUserCheck, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import PaginationBar from "@templates/PaginationBar";
import Swal from "sweetalert2";

export default function ParentList() {
    const navigate = useNavigate();

    // 1. 검색 및 필터 상태
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filter, setFilter] = useState("전체");

    // 2. PageResponseVO 규격 상태
    const [pageData, setPageData] = useState({
        list: [],
        page: 1,
        totalPages: 0,
        startBlock: 1,
        endBlock: 0,
        prev: false,
        next: false,
        totalCount: 0
    });
    const [currentPage, setCurrentPage] = useState(1);

    // 3. 우측 Sticky 카드용 선택된 학부모
    const [selectedParent, setSelectedParent] = useState(null);

    // 4. 통계 요약
    const [summary, setSummary] = useState({ total: 0, pendingCount: 0 });

    // 목록 데이터 조회
    const fetchParents = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/parent/list", {
                params: {
                    filter: filter,
                    searchKeyword: searchKeyword,
                    page: currentPage
                }
            });

            const data = response.data;
            setPageData(data);

            const total = data.totalCount || 0;
            const pendingCount = (data.list || []).filter(p => p.accountStatus === 'N').length;
            setSummary({ total, pendingCount });

            // 기존 선택 학부모 유지 또는 첫 번째 항목 기본 선택
            if (data.list && data.list.length > 0) {
                setSelectedParent(prev => {
                    if (!prev) return data.list[0];
                    const found = data.list.find(p => p.parentNo === prev.parentNo);
                    return found || data.list[0];
                });
            } else {
                setSelectedParent(null);
            }
        } catch (error) {
            console.error("학부모 목록 로딩 실패:", error);
        }
    }, [filter, searchKeyword, currentPage]);

    // 필터 변경 시 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // 페이지/필터 변경 시 자동 실행
    useEffect(() => {
        fetchParents();
    }, [fetchParents]);

    // 검색 실행
    const handleSearch = () => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchParents();
        }
    };

    // 학생 클릭 시 쫀득한 애니메이션 후 상세 페이지 이동
    const handleStudentClick = (e, studentNo) => {
        e.stopPropagation(); // 부모 tr 클릭(학부모 선택) 이벤트 전파 방지
        setTimeout(() => {
            navigate(`/employee/student/detail/${studentNo}`);
        }, 120);
    };

    // 학부모 가입 승인 처리 (N -> Y)
    const handleApprove = async (parentNo, parentName) => {
        const result = await Swal.fire({
            title: `${parentName} 학부모를 승인하시겠습니까?`,
            text: "승인 후 학부모 계정으로 로그인이 가능해집니다.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "승인",
            cancelButtonText: "취소",
            confirmButtonColor: "#0d6efd"
        });

        if (!result.isConfirmed) return;

        try {
            await apiClient.patch(`/employee/parent/approve/${parentNo}`);
            await Swal.fire("승인 완료", "학부모 계정이 승인되었습니다.", "success");
            fetchParents();
        } catch (error) {
            console.error("학부모 승인 실패:", error);
            Swal.fire("승인 실패", error.response?.data?.message || "처리 중 오류가 발생했습니다.", "error");
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* 자녀 뱃지 및 인터랙션 전용 CSS */}
            <style>{`
                .student-badge-btn {
                    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex;
                    align-items: center;
                    user-select: none;
                }
                .student-badge-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.25) !important;
                    background-color: #f0f6ff !important;
                    border-color: #0d6efd !important;
                }
                .student-badge-btn:active {
                    transform: translateY(1px) scale(0.97) !important;
                    box-shadow: 0 1px 3px rgba(13, 110, 253, 0.2) !important;
                }
                .kh-table tbody tr:hover {
                    background-color: #f8fafd !important;
                }
            `}</style>

            <h2 className="mb-4 fw-bold">학부모 관리</h2>

            {/* 상단 통계 카드 */}
            <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 text-primary"><FaUserFriends size={32} /></div>
                            <div>
                                <div className="text-muted small fw-bold">총 학부모 회원</div>
                                <h4 className="fw-bold mb-0">{summary.total.toLocaleString()}명</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 text-warning"><FaUserClock size={32} /></div>
                            <div>
                                <div className="text-muted small fw-bold">승인 대기 (현재 페이지)</div>
                                <h4 className="fw-bold mb-0 text-warning">{summary.pendingCount.toLocaleString()}명</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* 좌측 학부모 목록 테이블 */}
                <Col lg={7}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column">
                            {/* 필터 및 검색창 */}
                            <Row className="mb-3">
                                <Col sm={4}>
                                    <Form.Select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="전체">전체 상태</option>
                                        <option value="대기">승인 대기 (N)</option>
                                        <option value="승인">승인 완료 (Y)</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={8}>
                                    <InputGroup>
                                        <Form.Control
                                            placeholder="학부모명, 연락처, 아이디, 자녀명 검색"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <Button variant="outline-secondary" onClick={handleSearch}>
                                            <FaSearch /> 검색
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {/* 테이블 본문 */}
                            <div className="table-responsive flex-grow-1">
                                <Table hover className="kh-table align-middle text-center">
                                    <thead>
                                        <tr>
                                            <th>번호</th>
                                            <th>학부모명</th>
                                            <th>연락처</th>
                                            <th>연동 자녀</th>
                                            <th>상태</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageData.list.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-5 text-muted">등록된 학부모 데이터가 없습니다.</td>
                                            </tr>
                                        ) : (
                                            pageData.list.map((parent) => {
                                                const isSelected = selectedParent?.parentNo === parent.parentNo;

                                                return (
                                                    <tr
                                                        key={parent.parentNo}
                                                        onClick={() => setSelectedParent(parent)}
                                                        style={{
                                                            cursor: "pointer",
                                                            backgroundColor: isSelected ? "#eef4fd" : undefined,
                                                            borderLeft: isSelected ? "4px solid #0d6efd" : "4px solid transparent",
                                                            transition: "background-color 0.15s ease-in-out"
                                                        }}
                                                    >
                                                        <td className={isSelected ? "fw-bold text-primary" : ""}>
                                                            {parent.parentNo}
                                                        </td>
                                                        <td className="fw-semibold text-dark">
                                                            {parent.accountName}
                                                        </td>
                                                        <td className="text-muted">
                                                            {parent.accountPhone}
                                                        </td>
                                                        <td>
                                                            {parent.students && parent.students.length > 0 ? (
                                                                <div className="d-flex justify-content-center flex-wrap gap-1">
                                                                    {parent.students.map((student, idx) => (
                                                                        <Badge
                                                                            key={idx}
                                                                            bg="light"
                                                                            text="dark"
                                                                            className="student-badge-btn border fw-normal shadow-sm px-2 py-1"
                                                                            style={{ cursor: "pointer" }}
                                                                            onClick={(e) => handleStudentClick(e, student.studentNo)}
                                                                            title="클릭하여 학생 상세 정보 보기"
                                                                        >
                                                                            {student.studentName}{" "}
                                                                            <span className="text-primary fw-bold ms-1">({student.relationship})</span>
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted small">미연동</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {parent.accountStatus === 'Y' ? (
                                                                <Badge bg="success">승인</Badge>
                                                            ) : (
                                                                <Badge bg="warning" text="dark">대기</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {/* PaginationBar */}
                            {pageData.totalPages > 1 && (
                                <PaginationBar
                                    page={pageData.page}
                                    totalPages={pageData.totalPages}
                                    startBlock={pageData.startBlock}
                                    endBlock={pageData.endBlock}
                                    prev={pageData.prev}
                                    next={pageData.next}
                                    onChange={(targetPage) => setCurrentPage(targetPage)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* 우측 Sticky 상세 패널 */}
                <Col lg={5} className="align-self-start position-sticky" style={{ top: '2rem' }}>
                    {selectedParent ? (
                        <Card className="shadow-sm border-0 h-100 bg-light">
                            <Card.Body className="d-flex flex-column">

                                {/* 상단 이름 및 승인/상태 뱃지 영역 */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h4 className="fw-bold mb-1">
                                            {selectedParent.accountName}
                                            <span className="fs-6 text-muted ms-2">#{selectedParent.parentNo}</span>
                                        </h4>
                                        <p className="text-muted small mb-0">
                                            <FaEnvelope className="me-1" /> {selectedParent.accountId}
                                        </p>
                                    </div>

                                    {/* 학생 목록 승인 UI와 동일: 대기 상태일 때 즉시 승인 버튼 노출 */}
                                    <div className="text-end">
                                        {selectedParent.accountStatus === 'N' ? (
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="fw-bold shadow-sm"
                                                onClick={() => handleApprove(selectedParent.parentNo, selectedParent.accountName)}
                                                title="학부모 가입 승인"
                                            >
                                                <FaUserCheck className="me-1" /> 승인 처리
                                            </Button>
                                        ) : (
                                            <Badge bg="success" className="px-2 py-1">승인완료</Badge>
                                        )}
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3">계정 기본 정보</h6>
                                <Row className="g-2 mb-4">
                                    <Col xs={6}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                    <FaPhoneAlt className="me-1" /> 연락처
                                                </div>
                                                <div className="fw-bold text-dark mt-1">{selectedParent.accountPhone}</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={6}>
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                    <FaCalendarAlt className="me-1" /> 생년월일
                                                </div>
                                                <div className="fw-bold text-dark mt-1">
                                                    {selectedParent.accountBirth || "미등록"}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold mb-0">연동 자녀 목록</h6>
                                    <span className="badge bg-primary rounded-pill">
                                        {selectedParent.students ? selectedParent.students.length : 0}명
                                    </span>
                                </div>

                                {/* 연동 자녀 목록 카드 */}
                                <Card className="border-0 shadow-sm mb-4 flex-grow-1">
                                    <Card.Body className="p-3">
                                        {!selectedParent.students || selectedParent.students.length === 0 ? (
                                            <div className="text-center py-4 text-muted small">
                                                현재 연동된 자녀(학생)가 없습니다.
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-2">
                                                {selectedParent.students.map((student, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="d-flex justify-content-between align-items-center p-2 rounded bg-white border"
                                                    >
                                                        <div>
                                                            <strong className="text-dark me-2">{student.studentName}</strong>
                                                            <Badge bg="info" text="dark" className="me-2">
                                                                {student.relationship}
                                                            </Badge>
                                                            <span className="text-muted small">#{student.studentNo}</span>
                                                        </div>

                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="student-badge-btn"
                                                            style={{ fontSize: "11px", padding: "3px 10px" }}
                                                            onClick={(e) => handleStudentClick(e, student.studentNo)}
                                                        >
                                                            학생 보기 →
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* 🌟 학생 목록의 [학생 상세 정보 및 수정하기]와 완벽히 동일한 이동 버튼 */}
                                <Button
                                    as={Link}
                                    to={`/employee/parent/detail/${selectedParent.parentNo}`}
                                    variant="primary"
                                    className="w-100 py-2 fw-bold mt-auto"
                                >
                                    학부모 상세 정보 및 수정하기
                                </Button>

                            </Card.Body>
                        </Card>
                    ) : (
                        <Card className="shadow-sm border-0 h-100 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                            <span className="text-muted">좌측 목록에서 학부모를 선택해주세요.</span>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}