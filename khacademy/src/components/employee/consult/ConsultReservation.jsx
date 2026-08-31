import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Jumbotron from "@templates/Jumbotron";

import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
dayjs.locale(ko);

export default function ConsultReservation() {

    const [search, setSearch] = useState({
        searchName : "",
        searchPhone : "",
        searchType : "",
        searchStatus : "",
    });

    const [reservationList, setReservationList] = useState([]);

    const loadList = useCallback(async ()=>{
        const { data } = await apiClient.post("/employee/consult/reservationList", search);
        setReservationList(data.items);
    }, [search]);
    useEffect(()=>{
        loadList();
    }, []);

    const changeStringValue = useCallback((e)=>{
        const { name, value } = e.target;
        setSearch(prev=>({
            ...prev,
            [name] : value
        }));
    }, []);
    const changeNumericValue = useCallback((e)=>{
        const { name, value } = e.target;
        const replacement = value.replace(/[^0-9]+/g, "");
        //const result = replacement.length === 0 ? "" : parseInt(replacement);
        if (value !== replacement) {
            e.target.value = replacement; // DOM의 입력창 값을 즉시 강제로 되돌림
        }
        setSearch(prev=>({
            ...prev,
            [name] : replacement
        }));
    }, []);

    // 예약상태에 따른 UI를 객체로 정의
    const statusMap = {
        //상담대기
        0: (item) => (
            <>
                <Button variant="success" onClick={()=>changeStatus("1", item)}>예약확정</Button>
                <Button variant="danger" onClick={()=>changeStatus("9", item)}>예약취소</Button>
            </>
        ),
        //예약확정
        1: (item) => (
            <>
                <Button variant="info" onClick={()=>changeStatus("2", item)}>상담완료</Button>
                <Button variant="danger" onClick={()=>changeStatus("9", item)}>예약취소</Button>
            </>
        ),
        //상담완료
        2: (item) => <><span className="text-info">상담결과 : {item.reservationComment}</span></>,
        //예약취소
        9: (item) => <><span className="text-danger">취소사유 : {item.reservationComment}</span></>
    };

    const classMap = {
        0: "justify-content-center",
        1: "justify-content-center",
        2: "",
        9: "",
    }

    const changeStatus = useCallback(async (status, item)=> {
        // 1. 상태별로 달라지는 값만 객체로 정의
        const swalOptions = {
            1: { 
                title: "예약확정 처리하시겠습니까?",
                icon: "question",
                confirmButtonText:"예약확정",
                confirmButtonColor: "#18bc9c"
            },
            2: { 
                title: "상담완료 처리하시겠습니까?", 
                icon: "question",
                confirmButtonText:"상담완료",
                confirmButtonColor: "#3085d6", 
                input: "textarea", 
                inputPlaceholder: "상담결과" 
            },
            9: { 
                title: "예약취소 처리하시겠습니까?", 
                icon: "warning", 
                confirmButtonText:"예약취소",
                confirmButtonColor: "#d63031", 
                input: "textarea", 
                inputPlaceholder: "취소사유" 
            }
        };
        const currentOption = swalOptions[status];
        const result = await Swal.fire({
            ...currentOption,
            showCancelButton:true,
            cancelButtonText:"취소",
            cancelButtonColor:"#b2bec3"
        });
        if(!result.isConfirmed) return;//취소
        if((status === "2" || status === "9") && !result.value?.trim()) {
            Swal.fire("입력 오류", "내용을 입력해주세요", "error");
            return;
        }
        const sendItem = {
            reservationStatus : status,
            reservationComment : result.value || "",
        };

        try {
            const { data } = await apiClient.put(`/employee/consult/reservation/${item.reservationNo}`, sendItem);
            loadList();
            toast.success("상태 변경 완료");
        } catch (error) {
            Swal.fire("오류", "처리 중 문제가 발생했습니다.", "error");
        }
    }, []);

    return (<>
        <Jumbotron title="상담 예약 목록" content="고객이 신청한 상담 예약 목록" />
        <Container className="p-4">
            {/* 1. 상단 검색 및 필터 영역 */}
            <Row className="mb-4 align-items-end">
                <Col xs="auto" className="pe-0">
                    <Form.Group>
                        <Form.Label >이름</Form.Label>
                        <Form.Control type="text" name="searchName"
                            value={search.searchName}
                            onChange={changeStringValue} />
                    </Form.Group>
                </Col>
                <Col xs="auto" className="pe-0">
                    <Form.Group>
                        <Form.Label >연락처</Form.Label>
                        <Form.Control type="tel" name="searchPhone"
                            value={search.searchPhone}
                            onChange={changeNumericValue} />
                    </Form.Group>
                </Col>
                <Col xs="auto" className="pe-0">
                    <Form.Group>
                        <Form.Label >상담 방식</Form.Label>
                        <Form.Select
                            name="searchType"
                            value={search.searchType}
                            onChange={changeStringValue} >
                            <option value="">전체</option>
                            <option>방문</option>
                            <option>통화</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col xs="auto" className="pe-0">
                    <Form.Group>
                        <Form.Label >진행 상태</Form.Label>
                        <Form.Select
                            name="searchStatus"
                            value={search.searchStatus}
                            onChange={changeStringValue} >
                            <option value="">전체</option>
                            <option value="0">상담 대기</option>
                            <option value="1">예약 확정</option>
                            <option value="2">상담 완료</option>
                            <option value="9">예약 취소</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                <Button variant="info"
                    onClick={loadList}>
                    조회
                </Button>
                </Col>
            </Row>

            {/* 2. 데이터 테이블 영역 */}
            <Table bordered hover responsive>
                <thead>
                <tr>
                    <th className="py-3">No.</th>
                    <th className="py-3">신청자명</th>
                    <th className="py-3">연락처</th>
                    <th className="py-3">상담 방식</th>
                    <th className="py-3">희망 상담 일시</th>
                    <th className="py-3">진행 상태</th>
                    <th className="py-3">관리</th>
                </tr>
                </thead>
                <tbody>
                    {reservationList.map(reservation=>{
                    return (
                    <tr key={reservation.reservationNo}>
                        <td>{reservation.reservationNo}</td>
                        <td>{reservation.reservationName}</td>
                        <td>{reservation.reservationPhone}</td>
                        <td>{reservation.reservationType}</td>
                        <td>
                            <span>{dayjs(reservation.reservationTime).format('YYYY-MM-DD')}</span><br/>
                            <span>{dayjs(reservation.reservationTime).format('A hh시 mm분')}</span>
                        </td>
                        <td>{reservation.reservationStatusString}</td>
                        <td>
                            <div className={`d-flex ${classMap[reservation.reservationStatus] || ""} gap-2`}>
                                {statusMap[reservation.reservationStatus]?.(reservation) || null}
                            </div>
                        </td>
                    </tr>
                    )})}
                </tbody>
            </Table>
        </Container>
    </>)
}