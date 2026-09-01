import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Form } from "react-bootstrap";
import { authClient } from "@utils/reaxios";

export default function DiscountList() {
    // 1. 할인 목록 State
    const [discounts, setDiscounts] = useState([]);
    
    // 2. '추가' 폼 열기/닫기 State
    const [showAddForm, setShowAddForm] = useState(false);
    
    // 3. 신규 등록할 할인 데이터 State
    const [newDiscount, setNewDiscount] = useState({
        discountName: "",
        discountType: "비율", // 기본값
        discountValue: 0
    });

    // 🌟 백엔드에서 할인 목록 가져오기 (GET)
    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await authClient.get("http://localhost:8080/api/payment/discount/list");
            setDiscounts(response.data);
        } catch (error) {
            console.error("할인 목록 로딩 실패:", error);
        }
    }, []);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    // 🌟 신규 할인 등록 처리 (POST)
    const handleAddSubmit = async () => {
        if (!newDiscount.discountName || newDiscount.discountValue <= 0) {
            alert("할인명과 올바른 할인율(금액)을 입력해 주세요.");
            return;
        }

        try {
            const response = await authClient.post("http://localhost:8080/api/payment/discount/add", newDiscount);
            alert(response.data);
            
            // 등록 성공 시 폼 초기화 및 닫기, 목록 새로고침
            setNewDiscount({ discountName: "", discountType: "비율", discountValue: 0 });
            setShowAddForm(false);
            fetchDiscounts(); 
        } catch (error) {
            console.error("할인 등록 실패:", error);
        }
    };

    // 🌟 활성화/비활성화 스위치(수정) 토글 처리 (PUT)
    const handleToggleStatus = async (discount) => {
        const updatedStatus = discount.discountStatus === "Y" ? "N" : "Y";
        
        // 백엔드로 보낼 수정 데이터 조립 (기존 데이터 유지, 상태만 변경)
        const updateData = {
            ...discount,
            discountStatus: updatedStatus
        };

        try {
            await authClient.put("http://localhost:8080/api/payment/discount/edit", updateData);
            fetchDiscounts(); // 수정 후 즉시 목록 새로고침
        } catch (error) {
            console.error("할인 상태 변경 실패:", error);
            alert("상태 변경 중 오류가 발생했습니다.");
        }
    };

    // 신규 입력 폼 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDiscount(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-1">할인 관리</h2>
            <p className="text-muted mb-4">할인목록을 추가, 수정, 관리합니다.</p>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="align-middle text-center mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>할인번호</th>
                                <th>할인명</th>
                                <th>할인종류</th>
                                <th>할인율/금액</th>
                                <th>활성화</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 기존 할인 목록 출력 */}
                            {discounts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 text-muted">등록된 할인이 없습니다.</td>
                                </tr>
                            ) : (
                                discounts.map((d) => (
                                    <tr key={d.discountNo}>
                                        <td className="text-muted">DC-{d.discountNo}</td>
                                        <td className="fw-bold">{d.discountName}</td>
                                        <td>{d.discountType}</td>
                                        <td>
                                            {d.discountType === "비율" 
                                                ? `${d.discountValue}%` 
                                                : `₩${d.discountValue.toLocaleString()}`}
                                        </td>
                                        <td>
                                            {/* 활성화 스위치 (클릭 시 Y/N 즉시 변경) */}
                                            <Form.Check 
                                                type="switch"
                                                id={`switch-${d.discountNo}`}
                                                checked={d.discountStatus === 'Y'}
                                                onChange={() => handleToggleStatus(d)}
                                                className="d-flex justify-content-center"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}

                            {/* '추가' 버튼을 누르면 열리는 입력 폼 (스토리보드 반영) */}
                            {showAddForm && (
                                <tr className="table-primary border-primary">
                                    <td className="text-primary fw-bold align-middle">NEW</td>
                                    <td>
                                        <Form.Control size="sm" type="text" name="discountName" placeholder="할인명 입력" value={newDiscount.discountName} onChange={handleInputChange} />
                                    </td>
                                    <td>
                                        <Form.Select size="sm" name="discountType" value={newDiscount.discountType} onChange={handleInputChange}>
                                            <option value="비율">비율(%)</option>
                                            <option value="금액">금액(₩)</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control size="sm" type="number" name="discountValue" placeholder="숫자 입력" value={newDiscount.discountValue} onChange={handleInputChange} />
                                    </td>
                                    <td>
                                        <Button size="sm" variant="primary" className="w-100 fw-bold" onClick={handleAddSubmit}>
                                            등록
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                
                {/* 하단 컨트롤 영역 */}
                <Card.Footer className="bg-white d-flex justify-content-end gap-2 p-3 border-top-0">
                    <Button 
                        variant={showAddForm ? "secondary" : "outline-primary"} 
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? "추가 취소" : "할인 추가"}
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
}