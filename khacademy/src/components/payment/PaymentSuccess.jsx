import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Card, Spinner } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import Swal from 'sweetalert2';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const approvePayment = async () => {
            // 1. URL에 있는 영수증 교환권(pg_token) 꺼내기
            const pgToken = searchParams.get("pg_token");
            
            // 2. 아까 ready할 때 스토리지에 숨겨둔 정보들 꺼내기
            const tid = localStorage.getItem("kakao_tid");
            const paymentNo = localStorage.getItem("kakao_payment_no");
            const amount = localStorage.getItem("kakao_payment_amount"); // ready할때 이것도 같이 저장해두면 편합니다!
            
            const userStateStr = localStorage.getItem("loginUserState");
            const userInfo = userStateStr ? JSON.parse(userStateStr) : null;

            if (!pgToken || !tid) {
                // 🌟 경고창 띄우고, 확인 버튼 누르면 이동!
                Swal.fire({
                    icon: 'warning',
                    title: '비정상적인 접근',
                    text: '비정상적인 결제 접근입니다.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '확인'
                }).then(() => {
                    navigate("/parent/payment/list", { replace: true });
                });
                return; // 로직 중단은 팝업과 별개로 바로 시켜줘야 함
            }

            try {
                // 3. 백엔드에 최종 승인 및 DB 업데이트 지시!
                await apiClient.post('/academy/payment/kakaopay/approve', null, {
                    params: {
                        pg_token: pgToken,
                        tid: tid,
                        paymentNo: paymentNo,
                        accountNo: userInfo.accountNo,
                        amount: amount // 방금 낸 금액
                    }
                });

                // 4. 결제 끝! 청소하고 수납 목록으로 돌아가기
                localStorage.removeItem("kakao_tid");
                localStorage.removeItem("kakao_payment_no");
                localStorage.removeItem("kakao_payment_amount");
                
                setIsProcessing(false);
                
                setTimeout(() => {
                    navigate("/parent/payment/list", { replace: true });
                }, 2000); // 2초 뒤 목록으로 자동 이동

            } catch (error) {
                console.error("결제 승인 실패:", error);
                
                // 🌟 에러창 띄우고, 확인 버튼 누르면 이동!
                Swal.fire({
                    icon: 'error',
                    title: '결제 승인 오류',
                    text: '결제 승인 중 오류가 발생했습니다.',
                    confirmButtonColor: '#d33',
                    confirmButtonText: '확인'
                }).then(() => {
                    navigate("/parent/payment/list", { replace: true });
                });
            }
        };

        approvePayment();
    }, [navigate, searchParams]);

    return (
        <div className="container-fluid py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Card className="shadow border-0 text-center p-5" style={{ maxWidth: "500px", width: "100%" }}>
                {isProcessing ? (
                    <>
                        <Spinner animation="border" variant="warning" style={{ width: "4rem", height: "4rem" }} className="mx-auto mb-4" />
                        <h4 className="fw-bold">결제를 승인하고 있습니다...</h4>
                        <p className="text-muted">창을 닫거나 새로고침하지 마세요.</p>
                    </>
                ) : (
                    <>
                        <FaCheckCircle className="text-success mx-auto mb-4" style={{ fontSize: "5rem" }} />
                        <h4 className="fw-bold">결제가 완료되었습니다!</h4>
                        <p className="text-muted">수납 목록 페이지로 이동합니다.</p>
                    </>
                )}
            </Card>
        </div>
    );
}