import { useCallback, useRef, useState } from "react";
import { Container, Card, Form, Button, CloseButton, Modal } from 'react-bootstrap';
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

//초기화
const initReservation = {
    reservationName: "",
    reservationPhone: "",
    reservationType: "",
    reservationTime: ""
};
export default function AcademyConsultReservation({ show, handleClose }) {

    const [reservation, setReservation] = useState(initReservation);
    const inputRefs = useRef({});

    const changeStringValue = useCallback((e)=>{
        const { name, value } = e.target;
        setReservation((prev)=>({
            ...prev,
            [name] : value
        }));
    }, []);

    const changeNumericValue = useCallback((e)=>{
        const { name, value } = e.target;
        const replacement = value.replace(/[^0-9]+/g, "");
        if (value !== replacement) {
            e.target.value = replacement; // DOM의 입력창 값을 즉시 강제로 되돌림
        }
        setReservation(prev=>({
            ...prev,
            [name] : replacement
        }));
    }, []);

    //지난 날짜 선택 방지용 코드
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; 
    const minDateTime = new Date(now - tzOffset).toISOString().slice(0, 16);

    const saveReservation = useCallback(async ()=>{
        if((reservation.reservationName || "").trim().length === 0) {
            const result = await Swal.fire({
                title: "이름을 입력하세요",
                returnFocus: false
            });
            if(result.isConfirmed) inputRefs.current.reservationName?.focus();
            return false;
        }

        const regex2 = /^010[1-9][0-9]{7}$/;
        const valid2 = regex2.test(reservation.reservationPhone);
        if(!valid2) {
            const result = await Swal.fire({
                title: "올바른 연락처를 입력하세요",
                returnFocus: false
            });
            if(result.isConfirmed) inputRefs.current.reservationPhone?.focus();
            return false;
        }
        if((reservation.reservationTime || "").trim().length === 0) {
            const result = await Swal.fire({
                title: "상담 희망 일시를 입력하세요",
                returnFocus: false
            });
            if(result.isConfirmed) inputRefs.current.reservationTime?.focus();
            return false;
        }
        if((reservation.reservationType || "").trim().length === 0) {
            Swal.fire("상담 방식을 선택하세요");
            return false;
        }

        const { data } = await apiClient.put("/academy/reservation", reservation);
        if(data.result) {
            toast.success("상담 예약 완료");
            handleClose();
            setReservation(initReservation);
        } else {
            Swal.fire(`상담 예약에 실패했습니다.\n\n${data.errMsg}`);
        }
    }, [reservation]);

    return (<>
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton className="border-bottom pt-4 pb-3 px-4">
                <Modal.Title className="fw-bold fs-5">상담 신청</Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="p-4">
                <Form>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label className="fw-bold small">이름</Form.Label>
                    <Form.Control 
                    type="text" 
                    name="reservationName"
                    ref={(el) => (inputRefs.current.reservationName = el)}
                    placeholder="이름을 입력하세요" 
                    value={reservation.reservationName}
                    maxLength={10}
                    onChange={changeStringValue}
                    className="py-2" 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label className="fw-bold small">연락처</Form.Label>
                    <Form.Control 
                    type="text" 
                    name="reservationPhone"
                    ref={(el) => (inputRefs.current.reservationPhone = el)}
                    placeholder="- 없이 입력" 
                    value={reservation.reservationPhone}
                    maxLength={11}
                    onChange={changeNumericValue}
                    className="py-2" 
                    />
                </Form.Group>

                {/* 상담 희망 시간 선택 */}
                <Form.Group className="mb-4" controlId="formDateTime">
                    <Form.Label className="fw-bold small">상담 희망 일시</Form.Label>
                    <Form.Control 
                        type="datetime-local"
                        name="reservationTime"
                        value={reservation.reservationTime}
                        ref={(el) => (inputRefs.current.reservationTime = el)}
                        onChange={changeStringValue}
                        min={minDateTime}
                        className="py-2"
                        /* 폰트와 줄간격을 시스템 기본으로 강제 초기화하여 내부 블록들의 높이를 맞춤 */
                        style={{ fontFamily: "sans-serif", lineHeight: "normal" }}
                        onKeyDown={(e) => {
                            if (e.key !== 'Tab') {
                                e.preventDefault();
                            }
                        }}
                    />
                </Form.Group>

                {/* 상담 방식 라디오 버튼 */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2 small">상담 방식</Form.Label>
                    <div className="d-flex gap-4">
                    <Form.Check 
                        type="radio" 
                        id="radioPhone" 
                        name="reservationType" 
                        label="전화 상담 희망" 
                        value="통화"
                        onChange={changeStringValue}
                        checked={reservation.reservationType === "통화"}
                        className="small"
                    />
                    <Form.Check 
                        type="radio" 
                        id="radioOffline" 
                        name="reservationType" 
                        label="오프라인 상담 희망" 
                        value="방문"
                        onChange={changeStringValue}
                        checked={reservation.reservationType === "방문"}
                        className="small"
                    />
                    </div>
                </Form.Group>

                {/* 신청하기 버튼 */}
                <Button 
                    type="button"
                    variant="success"
                    className="w-100 py-2 fw-bold border-0 rounded-2" 
                    onClick={() => saveReservation()}
                >
                    신청하기
                </Button>
                </Form>
            </Modal.Body>
            </Modal>
    </>)
}