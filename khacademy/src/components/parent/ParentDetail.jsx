import React, { useState, useEffect, useCallback } from "react";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaSave, FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";

export default function ParentDetail() {
    const { parentNo } = useParams();
    const navigate = useNavigate();

    // 학부모 폼 데이터 상태
    const [formData, setFormData] = useState({
        parentNo: 0,
        accountNo: 0,
        accountId: "",
        accountName: "",
        accountPhone: "",
        accountBirth: "",
        accountStatus: "N",
        students: []
    });
    const [loading, setLoading] = useState(true);

    // 상세 데이터 로딩
    const loadDetail = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/employee/parent/detail/${parentNo}`);
            setFormData({
                parentNo: data.parentNo,
                accountNo: data.accountNo,
                accountId: data.accountId || "",
                accountName: data.accountName || "",
                accountPhone: data.accountPhone || "",
                accountBirth: data.accountBirth || "",
                accountStatus: data.accountStatus || "N",
                students: data.students || []
            });
        } catch (error) {
            console.error("학부모 상세 로딩 실패", error);
            Swal.fire("오류", "학부모 정보를 불러오지 못했습니다.", "error");
            navigate("/employee/parent/list");
        } finally {
            setLoading(false);
        }
    }, [parentNo, navigate]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    // 입력 필드 체인지
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 수정 완료 제출
    const handleUpdate = async (e) => {
        e.preventDefault();

        // 유효성 검사 (휴대폰 번호 11자리 정규식 방어)
        if (!formData.accountName.trim()) {
            return Swal.fire("경고", "이름을 입력해주세요.", "warning");
        }
        if (!/^010[1-9][0-9]{7}$/.test(formData.accountPhone)) {
            return Swal.fire("경고", "연락처는 010으로 시작하는 11자리 숫자여야 합니다. (예: 01012345678)", "warning");
        }

        const confirmResult = await Swal.fire({
            title: "학부모 정보를 수정하시겠습니까?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "수정",
            cancelButtonText: "취소"
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await apiClient.put("/employee/parent/update", {
                parentNo: formData.parentNo,
                accountNo: formData.accountNo,
                accountName: formData.accountName,
                accountPhone: formData.accountPhone,
                accountBirth: formData.accountBirth || null,
                accountStatus: formData.accountStatus
            });
            await Swal.fire("수정 완료", "학부모 정보가 정상적으로 수정되었습니다.", "success");
            loadDetail();
        } catch (error) {
            console.error("수정 실패", error);
            Swal.fire("수정 실패", error.response?.data?.message || "수정 중 오류가 발생했습니다.", "error");
        }
    };

    if (loading) {
        return <div className="container py-5 text-center text-muted">데이터를 불러오는 중입니다...</div>;
    }

    return (
        <div className="container py-4" style={{ maxWidth: "900px" }}>
            {/* 상단 네비게이션 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="me-1" /> 목록으로 돌아가기
                </Button>
                <Badge bg={formData.accountStatus === "Y" ? "success" : "warning"} className="px-3 py-2 fs-6">
                    {formData.accountStatus === "Y" ? "승인 완료 계정" : "승인 대기 계정"}
                </Badge>
            </div>

            <Row className="g-4">
                {/* 왼쪽: 기본 정보 수정 카드 */}
                <Col lg={7}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold">
                                <FaUser className="me-2 text-primary" /> 학부모 기본 정보
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleUpdate}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-muted small">계정 ID (이메일)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.accountId}
                                        disabled
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">아이디(이메일)는 변경할 수 없습니다.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-muted small">학부모 이름</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="accountName"
                                        value={formData.accountName}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-muted small">연락처 (- 없이 입력)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="accountPhone"
                                        value={formData.accountPhone}
                                        onChange={handleChange}
                                        maxLength={11}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-muted small">생년월일 (YYYY-MM-DD)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="accountBirth"
                                        value={formData.accountBirth}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold text-muted small">가입 승인 상태</Form.Label>
                                    <Form.Select
                                        name="accountStatus"
                                        value={formData.accountStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="Y">승인 (Y)</option>
                                        <option value="N">대기 (N)</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="w-100 py-2 fw-bold">
                                    <FaSave className="me-2" /> 수정사항 저장
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 오른쪽: 연동된 자녀 현황 카드 */}
                <Col lg={5}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">연동 자녀 목록</h5>
                            <Badge bg="primary" pill>{formData.students.length}명</Badge>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {formData.students.length === 0 ? (
                                <div className="text-center py-5 text-muted small">
                                    연동된 자녀(학생) 정보가 없습니다.
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {formData.students.map((student, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 border rounded bg-white d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-bold text-dark">{student.studentName}</div>
                                                <small className="text-muted">학번: #{student.studentNo}</small>
                                                <div className="mt-1">
                                                    <Badge bg="info" text="dark" className="me-1">
                                                        관계: {student.relationship}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                as={Link}
                                                to={`/student/detail/${student.studentNo}`}
                                                variant="outline-secondary"
                                                size="sm"
                                                title="학생 상세 페이지로 이동"
                                            >
                                                학생 보기 <FaExternalLinkAlt size={11} className="ms-1" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}