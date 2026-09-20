import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Card, Table, Button, Form } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import Swal from 'sweetalert2';

export default function DiscountList() {
    // 1. 할인 목록 State
    const [discounts, setDiscounts] = useState([]);
    
    // 2. '추가' 폼 관련 State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDiscount, setNewDiscount] = useState({
        discountName: "",
        discountType: "비율", 
        discountValue: 0
    });

    // 🌟 3. 아코디언(수정/삭제) 패널 열림 상태를 관리할 State
    const [expandedRow, setExpandedRow] = useState(null);
    const [editDiscount, setEditDiscount] = useState(null); // 수정 중인 데이터 임시 저장

    // 백엔드에서 할인 목록 가져오기
    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/payment/discount/list");
            setDiscounts(response.data);
        } catch (error) {
            console.error("할인 목록 로딩 실패:", error);
        }
    }, []);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    // 신규 할인 등록 처리
    const handleAddSubmit = async () => {
        if (!newDiscount.discountName || newDiscount.discountValue <= 0) {
            // 🌟 alert 대체 및 return 분리
            Swal.fire({ icon: 'warning', text: '할인명과 올바른 할인율(금액)을 입력해 주세요.', confirmButtonColor: '#3085d6' });
            return;
        }
        try {
            const response = await apiClient.post("/employee/payment/discount/add", newDiscount);
            
            // 🌟 성공 알림 (타이머 적용)
            Swal.fire({ icon: 'success', title: '등록 완료', text: response.data || '할인이 성공적으로 등록되었습니다.', confirmButtonColor: '#3085d6', timer: 1500 });
            
            setNewDiscount({ discountName: "", discountType: "비율", discountValue: 0 });
            setShowAddForm(false);
            fetchDiscounts(); 
        } catch (error) {
            console.error("할인 등록 실패:", error);
            Swal.fire({ icon: 'error', title: '등록 실패', text: '할인 등록 중 오류가 발생했습니다.', confirmButtonColor: '#d33' });
        }
    };

    // 활성화/비활성화 스위치 토글 처리 (PUT)
    const handleToggleStatus = async (discount) => {
        const updatedStatus = discount.discountStatus === "Y" ? "N" : "Y";
        const updateData = { ...discount, discountStatus: updatedStatus };

        try {
            await apiClient.put("/employee/payment/discount/edit", updateData);
            fetchDiscounts(); 
            // 토글은 화면에서 즉각적으로 스위치가 바뀌므로 굳이 알림창을 띄우지 않아도 좋습니다.
        } catch (error) {
            console.error("할인 정보 변경 실패:", error);
            // 🌟 에러 발생 시 알림
            Swal.fire({ icon: 'error', title: '변경 실패', text: '정보 변경 중 오류가 발생했습니다.', confirmButtonColor: '#d33' });
        }
    };

    // 🌟 4. 줄(Row) 클릭 시 아코디언 메뉴 열기/닫기 (이벤트 버블링 활용)
    const handleRowClick = (discount) => {
        if (expandedRow === discount.discountNo) {
            setExpandedRow(null);
            setEditDiscount(null);
        } else {
            setExpandedRow(discount.discountNo);
            setEditDiscount({ ...discount });
        }
    };

    // 🌟 5. 수정 폼 입력 핸들러
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditDiscount(prev => ({ ...prev, [name]: value }));
    };

    // 🌟 6. 기존 edit 매핑을 재활용한 '수정 완료' 처리
    const handleEditSubmit = async () => {
        if (!editDiscount.discountName || editDiscount.discountValue <= 0) {
            Swal.fire({ icon: 'warning', text: '올바른 값을 입력해 주세요.', confirmButtonColor: '#3085d6' });
            return;
        }
        try {
            await apiClient.put("/employee/payment/discount/edit", editDiscount);
            
            // 🌟 성공 알림 (타이머 적용)
            Swal.fire({ icon: 'success', title: '수정 완료', text: '성공적으로 수정되었습니다.', confirmButtonColor: '#3085d6', timer: 1500 });
            
            setExpandedRow(null); // 패널 닫기
            fetchDiscounts(); // 목록 갱신
        } catch (error) {
            console.error("할인 수정 실패:", error);
            Swal.fire({ icon: 'error', title: '수정 실패', text: '수정에 실패했습니다.', confirmButtonColor: '#d33' });
        }
    };

    // 🌟 7. 삭제 처리 (DELETE 매핑)
    const handleDelete = (discountNo) => { // 🌟 비동기는 then 안으로 넘김
        // 🌟 window.confirm 대체
        Swal.fire({
            title: '할인 혜택 삭제',
            text: "정말 이 할인을 삭제하시겠습니까? (이미 적용 중인 학생의 데이터에는 영향을 주지 않습니다)",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', // 삭제는 빨간색!
            cancelButtonColor: '#6c757d',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiClient.delete("/employee/payment/discount/delete", {
                        params: { discountNo }
                    });
                    
                    Swal.fire({ icon: 'success', title: '삭제 완료', text: '정상적으로 삭제되었습니다.', confirmButtonColor: '#3085d6', timer: 1500 });
                    
                    setExpandedRow(null);
                    fetchDiscounts();
                } catch (error) {
                    console.error("할인 삭제 실패:", error);
                    Swal.fire({ icon: 'error', title: '삭제 실패', text: '삭제 중 오류가 발생했습니다.', confirmButtonColor: '#d33' });
                }
            }
        });
    };

    // 신규 추가 폼 입력 핸들러
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
                    <Table hover responsive className="kh-table align-middle text-center">
                        <thead>
                            <tr>
                                <th>할인번호</th>
                                <th>할인명</th>
                                <th>할인종류</th>
                                <th>할인율/금액</th>
                                <th>활성화</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 text-muted">등록된 할인이 없습니다.</td>
                                </tr>
                            ) : (
                                discounts.map((d) => (
                                    // 🌟 Fragment를 써서 메인 줄과 확장 패널(수정폼)을 하나의 논리적 묶음으로 처리
                                    <Fragment key={d.discountNo}>
                                        <tr 
                                            onClick={() => handleRowClick(d)} 
                                            style={{ cursor: "pointer" }}
                                            className={expandedRow === d.discountNo ? "table-active" : ""}
                                        >
                                            <td className="text-muted">DC-{d.discountNo}</td>
                                            <td className="fw-bold">{d.discountName}</td>
                                            <td>{d.discountType}</td>
                                            <td>
                                                {d.discountType === "비율" 
                                                    ? `${d.discountValue}%` 
                                                    : `₩${d.discountValue?.toLocaleString()}`}
                                            </td>
                                            {/* 🌟 중요: 이벤트 버블링(전파) 차단! 
                                                여기를 누르면 줄(Row) 전체 클릭 이벤트가 발동하지 않도록 e.stopPropagation() 사용 */}
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <Form.Check 
                                                    type="switch"
                                                    id={`switch-${d.discountNo}`}
                                                    checked={d.discountStatus === 'Y'}
                                                    onChange={() => handleToggleStatus(d)}
                                                    className="d-flex justify-content-center m-0"
                                                />
                                            </td>
                                        </tr>

                                        {/* 🌟 확장(아코디언) 패널: 이 줄이 클릭되었을 때만 렌더링됨 */}
                                        {expandedRow === d.discountNo && (
                                            <tr className="bg-light border-bottom">
                                                <td colSpan="5" className="py-3">
                                                    <div className="d-flex gap-2 align-items-center justify-content-center">
                                                        <span className="fw-bold text-secondary me-2">할인 수정</span>
                                                        <Form.Control size="sm" name="discountName" value={editDiscount.discountName} onChange={handleEditChange} style={{ width: '200px' }} />
                                                        <Form.Select size="sm" name="discountType" value={editDiscount.discountType} onChange={handleEditChange} style={{ width: '120px' }}>
                                                            <option value="비율">비율(%)</option>
                                                            <option value="금액">금액(₩)</option>
                                                        </Form.Select>
                                                        <Form.Control size="sm" type="number" name="discountValue" value={editDiscount.discountValue} onChange={handleEditChange} style={{ width: '150px' }} />
                                                        
                                                        <Button size="sm" variant="success" className="fw-bold ms-2" onClick={handleEditSubmit}>
                                                            수정 저장
                                                        </Button>
                                                        <Button size="sm" variant="danger" className="fw-bold" onClick={() => handleDelete(d.discountNo)}>
                                                            삭제
                                                        </Button>
                                                        <Button size="sm" variant="secondary" className="fw-bold" onClick={() => setExpandedRow(null)}>
                                                            닫기
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}

                            {/* '추가' 버튼 폼 */}
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