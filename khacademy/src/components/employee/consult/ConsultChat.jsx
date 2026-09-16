import Jumbotron from "@templates/Jumbotron";
import { Client } from "@stomp/stompjs";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { apiClient } from "@utils/reaxios";
import { loginUserState, isLoginState } from "@utils/storage";
import { Badge, Button, Card, Col, Container, Form, ListGroup, Modal, Row } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa6";
import Swal from "sweetalert2";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");//한국어로 설정

import './ConsultChat.css'

const badgeColorMap = {
    '학생': 'info',
    '학부모': 'success',
    '직원': 'warning'
};

export default function ConsultChat() {

    // 메시지 입력 상태
    const [input, setInput] = useState('');
    
    const loginUser = useAtomValue(loginUserState);
    const [client, setClient] = useState(null);//서버와의 연결정보를 가진 객체
    const isLogin = useAtomValue(isLoginState);
    const [room, setRoom] = useState(null);
    const [rooms, setRooms] = useState([]);//채팅방 목록
    const [roomCount, setRoomCount] = useState(0);//채팅방 개수
    const [users, setUsers] = useState([]);//참여자 목록
    const [history, setHistory] = useState([]);//메세지 이력

    const totalUnreadCount = useMemo(() => {
        return rooms.reduce((sum, currentRoom) => sum + (currentRoom.unreadCnt || 0), 0);
    }, [rooms]);

    const roomsRef = useRef([]);
    useEffect(() => {
        roomsRef.current = rooms;
    }, [rooms]);

    useEffect(()=>{
        loadRooms();//시작하자마자 방 목록을 불러온다
    }, []);
    const loadRooms = useCallback(async ()=>{
        const { data } = await apiClient.get("/employee/room/")
        setRooms(data.rooms);
        setRoomCount(data.count);
        // console.log(data);
    }, []);

    /////////////////
    const [activeRoomNo, setActiveRoomNo] = useState(null);
    const [messages, setMessages] = useState([]);
    const sockRef = useRef(null);
    const messagesEndRef = useRef(null); // 스크롤 자동 이동을 위한 Ref

    useEffect(() => {
        sockRef.current = activeRoomNo;
    }, [activeRoomNo]);

    //연결 함수
    const connectToServer = useCallback(()=>{
        //연결을 관리할 도구(client) 생성하여 반환
        const client = new Client({
            webSocketFactory : () => new SockJS(`${import.meta.env.VITE_SERVER_URL}/ws-member`), 
            reconnectDelay: 5000,
            heartbeatIncoming: 10000, // 서버로부터 10초마다 하트비트를 수신할 것으로 기대
            heartbeatOutgoing: 10000, // 서버로 10초마다 하트비트를 발송

            onConnect: ()=>{//연결되었을 때
                //채널구독 및 수신작업 안내
                
                //모든 상담채팅방 구독
                rooms.forEach((r) => {
                    client.subscribe(`/public/${r.roomNo}/chat`, (message) => {
                        const json = JSON.parse(message.body);
                        const currentActive = sockRef.current; // 현재 보고 있는 방 번호

                        // 1. 방 목록 갱신 (마지막 메세지, 시간, 안읽음 숫자)
                        setRooms(prevRooms => {
                            const updatedRooms = prevRooms.map(room => {
                                if (room.roomNo === r.roomNo) {
                                    return { 
                                        ...room, 
                                        lastContent: json.content,
                                        lastTime: json.time || dayjs().format(), // 백엔드 시간 필드명에 맞추세요
                                        // ✨ 내가 지금 보고 있는 방이 아니면 숫자 1 증가
                                        unreadCnt: currentActive === r.roomNo ? 0 : (room.unreadCnt || 0) + 1
                                    };
                                }
                                return room;
                            });

                            // (선택사항) 메세지가 온 방을 목록 맨 위로 끌어올리기
                            return updatedRooms.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
                        });

                        // 2. 만약 메세지가 온 방을 지금 열어놓고 있다면 채팅창 내역에도 바로 추가
                        if (currentActive === r.roomNo) {
                            setHistory(prev => [...(prev || []), json]);

                            updateLastReadTime(r.roomNo);
                        }
                    });
                    client.subscribe(`/public/${r.roomNo}/read`, (message) => {
                        const json = JSON.parse(message.body);
                        // 1. 방 안읽음 숫자 갱신
                        setRooms(prevRooms => {
                            const updatedRooms = prevRooms.map(room => {
                                if (room.roomNo === r.roomNo) {
                                    return { 
                                        ...room, 
                                        unreadCnt: 0
                                    };
                                }
                                return room;
                            });

                            // (선택사항) 메세지가 온 방을 목록 맨 위로 끌어올리기
                            return updatedRooms.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
                        });
                    });
                    client.subscribe(`/public/${r.roomNo}/users`, (message) => {
                        // 1. 서버에서 보낸 참여자 목록(배열) 파싱
                        const updatedUsers = JSON.parse(message.body);
                        
                        // 2. 현재 내가 화면에 열어두고 있는 방 번호 확인 (오래된 클로저 방지용 ref 사용)
                        const currentActive = sockRef.current; 

                        // 3. 누군가 참가/퇴장한 방이 '현재 내가 보고 있는 방'일 때만 참여자 목록 즉시 갱신
                        if (currentActive === r.roomNo) {
                            setUsers(updatedUsers);
                        }

                        const isEnter = updatedUsers.some(user => user.accountNo === loginUser.accountNo) ? 'Y' : 'N';
                        // 4. 좌측 채팅방 목록(rooms)의 해당 방 cnt와 enter 값 실시간 갱신
                        setRooms(prevRooms => 
                            prevRooms.map(room => 
                                room.roomNo === r.roomNo 
                                    ? { ...room, cnt: updatedUsers.length, enter: isEnter } // 👈 enter 값도 함께 덮어씌움
                                    : room
                            )
                        );
                    });
                    client.subscribe(`/private/${r.roomNo}/action/${loginUser.accountNo}`, (message) => {
                        const json = JSON.parse(message.body);
                        switch(json) {
                            case "leave":
                                leaveRoom();
                                break;
                        }
                    });
                });

                //신규채팅방 체크
                client.subscribe(`/public/room/check`, (message)=>{
                    const json = JSON.parse(message.body);
                    
                    // 현재 내가 목록에 가지고 있는 방인지 검사
                    const isKnownRoom = roomsRef.current.some(r => r.roomNo === json.roomNo);

                    if (!isKnownRoom) {
                        console.log("신규 활성 채팅방 감지! 목록을 갱신합니다.");
                        loadRooms(); // 목록 재조회 API 호출
                    }
                });
            },
            onDisconnect: () => {
                console.log('연결 끊김');
            },
            onWebSocketClose: async (event) => {
                console.log("웹소켓 연결 종료 이벤트 발생:", event);

                try {
                    await apiClient.get("/employee/room/");
                } catch (error) {
                    // 401 에러(인증 실패)가 떨어졌다면 세션이 만료된 것!
                    if (error.response?.status === 401) {
                        client.deactivate(); // 무한 재연결 시도 중지

                        // 알림창을 띄우고 로그인 페이지로 강제 이동
                        Swal.fire({
                            title: "세션 만료",
                            text: "오랜 시간 응답이 없어 연결이 끊어졌습니다. 다시 로그인해 주세요.",
                            icon: "warning",
                            confirmButtonText: "확인",
                            allowOutsideClick: false // 바깥 클릭 방지
                        }).then(() => {
                            // 로컬 스토리지 등에 저장된 만료 정보 삭제 (프로젝트 환경에 맞게 수정)
                            localStorage.removeItem("loginUserState");
                            
                            // 로그인 페이지로 튕겨냄 (새로고침 효과)
                            window.location.href = "/employee/login"; 
                        });
                    }
                }
            },
            //디버깅 설정(옵션)
            debug: (str)=>console.log(str)
        });

        //클라이언트 활성화
        client.activate();
        return client;
    }, [rooms, loginUser, loadRooms]);
    //연결 종료 함수
    const disconnectFromServer = useCallback((client)=>{
        if(client) {//client가 존재한다면
            client.deactivate();//비활성화
        }
    }, []);

    //연결 및 해제
    useEffect(()=>{
        if(rooms.length === 0) return;//방 정보가 존재하지 않으면 연결을 하지마라! (기존과 차이점)

        //최초 1회 실행해야할 작업
        const client = connectToServer();
        setClient(client);

        //페이지 이탈 시 해야할 작업
        return ()=>{
            disconnectFromServer(client);
            setClient(null);
        };
    }, [rooms, connectToServer, loginUser]);

    const checkDateVisible = useCallback((curr, prev) => {
        if(!curr) return false;
        if(!prev) return true; // 이전 메세지가 없는 첫 메세지면 무조건 표시

        const currDate = dayjs(curr.time);
        const prevDate = dayjs(prev.time);
        
        // 두 메세지의 날짜(day)가 다르면 true 반환
        return currDate.isSame(prevDate, 'day') === false; 
    }, []);

    //시간을 표시해야 되는 상황인지 판정하는 함수
    const checkTimeVisible = useCallback((curr, next)=>{
        if(!curr) return false;//null, undefined 모두 제거
        if(!next) return true;//null, undefined 모두 제거

        if(curr.senderNo !== next.senderNo) return true;//작성자 ID가 다르면 시간 표시
        if(curr.type !== next.type) return true;//메세지 유형이 다르면 시간 표시
        
        const currTime = dayjs(curr.time);
        const nextTime = dayjs(next.time);
        const isSameTime = currTime.isSame(nextTime, "minute");
        return isSameTime === false;//작성시각이 다르면 시간 표시
    }, []);

    //작성자와 프로필을 표시해야 하는 상황인지 판정하는 함수
    const checkSenderVisible = useCallback((curr, prev)=>{
        if(!curr) return false;//null, undefined 제거
        if(!prev) return true;//null, undefined 제거
    
        if(curr.senderNo !== prev.senderNo) return true;//작성자가 다르면 표시
        if(curr.type !== prev.type) return true;//메세지 유형이 다르면 시간 표시

        // 시간 비교: 같은 사람이 연속해서 보냈더라도, 시간이(분이) 바뀌었다면 새로 프로필 표시
        const currTime = dayjs(curr.time);
        const prevTime = dayjs(prev.time);
        const isSameTime = currTime.isSame(prevTime, "minute");

        return isSameTime === false;
    }, []);

    // 스크롤 맨 아래로 이동
    useEffect(() => {
        if(messagesEndRef.current) {
            messagesEndRef.current.scrollTo({
                top: messagesEndRef.current.scrollHeight,
                behavior: 'auto' // 'smooth' (스르륵 이동), 'auto' (즉시 이동)
            });
        }
    }, [history]);

    // 방 선택 시 해당 방의 채팅 내역 조회
    const handleRoomSelect = useCallback(async (selectedRoom) => {
        setRoom(selectedRoom);
        setActiveRoomNo(selectedRoom.roomNo);
        
        const { data } = await apiClient.get(`/employee/room/${selectedRoom.roomNo}`);
        setUsers(data.users);
        setHistory(data.history);
        
        // 안읽음 카운트 초기화
        setRooms(prev => prev.map(r => r.roomNo === selectedRoom.roomNo ? { ...r, unreadCnt: 0 } : r));
    }, []);

    //연결 상태 확인
    const isConnect = useMemo(()=>{
        if(client === null) return false;//client가 없는 경우
        if(client.active === false) return false;//deactivate() 상태인 경우
        return true;
    }, [client]);

    // 메시지 전송
    const sendMessage = useCallback(()=>{
        //보낼 수 있는 상태인지를 검증
        if(isConnect === false) return;
        if(input.trim() === "") return;

        //메세지 전송을 위한 JSON 데이터 생성
        const json = { content : input };

        //STOMP 규격에 맞는 메세지 생성
        const stompMessage = {
            destination: `/app/${room.roomNo}/chat`,//서버로 보낼 목적지
            body: JSON.stringify(json),//전송할 내용 (직렬화된 JSON)
        };

        //전송
        client.publish(stompMessage);
        setInput("");//입력값 청소
    }, [client, input, isConnect, room]);

    // 채팅방 목록용 시간 포맷 함수 (오늘이면 시간, 과거면 날짜 표시)
    const formatRoomTime = useCallback((timeString) => {
        if (!timeString) return "";
        
        const time = dayjs(timeString);
        const today = dayjs();
        
        if (time.isSame(today, 'day')) {
            return time.format('a h:mm'); // 오늘: "오후 4:17"
        } else if (time.isSame(today.subtract(1, 'day'), 'day')) {
            return '어제'; // 어제
        } else {
            return time.format('M월 D일'); // 그 외: "10월 24일"
        }
    }, []);

    const updateLastReadTime = useCallback(async (targetRoomNo) => {
        if (!targetRoomNo) return;
        try {
            // 백엔드에 읽음 처리 요청
            await apiClient.put(`/employee/room/${targetRoomNo}/read`);
            
            // 프론트엔드 화면의 안읽음 뱃지도 0으로 즉시 초기화
            setRooms(prevRooms => 
                prevRooms.map(r => 
                    r.roomNo === targetRoomNo
                        ? { ...r, unreadCnt: 0 } 
                        : r
                )
            );
        } catch (error) {
            console.error("읽음 처리 실패", error);
        }
    }, []);

    const enterRoom = useCallback(async (targetRoomNo) => {
        try {
            await apiClient.post(`/employee/room/${targetRoomNo}/enter`);
            // 2. 요청 성공 시, 해당 방의 정보를 즉시 다시 불러옴
            const { data } = await apiClient.get(`/employee/room/${targetRoomNo}`);
            // 3. 참여자 목록(users) 상태를 업데이트 -> 화면(UI) 즉시 변경됨!
            setUsers(data.users);
            loadRooms();
        } catch (error) {
            console.error("참여 처리 실패", error);
        }
    }, []);
    
    const leaveRoom = useCallback(async (targetRoomNo) => {
        try {
            await apiClient.post(`/employee/room/${targetRoomNo}/leave`);
            // 2. 요청 성공 시, 방 정보 다시 불러오기
            const { data } = await apiClient.get(`/employee/room/${targetRoomNo}`);
            // 3. 참여자 목록 갱신 -> 내가 빠진 목록이 세팅되므로 화면이 즉시 바뀜!
            setUsers(data.users);
            loadRooms();
        } catch (error) {
            console.error("퇴장 처리 실패", error);
        }
    }, []);
    
    // 🔴 관리자 전용: 특정 직원 강제 퇴장 처리
    const kickEmployee = useCallback(async (targetRoomNo, targetAccountNo) => {
        const result = await Swal.fire({
            title: "직원 내보내기",
            text: "해당 직원을 채팅방에서 내보내시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "내보내기",
            confirmButtonColor: "#d33",
            cancelButtonText: "취소"
        });

        if (!result.isConfirmed) return;

        try {
            await apiClient.post(`/employee/room/${targetRoomNo}/leave/${targetAccountNo}`);
            
            // 요청 성공 시, 방 정보 다시 불러오기
            const { data } = await apiClient.get(`/employee/room/${targetRoomNo}`);
            setUsers(data.users);
            loadRooms(); // 목록 갱신
        } catch (error) {
            console.error("강제 퇴장 처리 실패", error);
            Swal.fire("오류", "내보내기 처리에 실패했습니다.", "error");
        }
    }, [loadRooms]);

    const consultEmployee = users?.find(user => user.accountType === '직원');

    return(<>
        {/* <Jumbotron title="채팅 관리" /> */}

        <Container fluid className="p-3 bg-light">
            <Row className="bg-white shadow-sm rounded overflow-hidden">
                
                {/* 좌측: 채팅방 목록 */}
                <Col xs={12} md={5} lg={4} className="p-0 border-end d-flex flex-column chat-col-height">
                <div className="p-3 bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">채팅 목록</h5>
                    {totalUnreadCount > 0 && (
                        <Badge bg="danger" pill className="fs-6">
                            새 메시지 {totalUnreadCount}
                        </Badge>
                    )}
                </div>
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                    {rooms.map((room) => (
                    <ListGroup.Item
                        key={room.roomNo}
                        action
                        active={activeRoomNo === room.roomNo}
                        onClick={() => handleRoomSelect(room)}
                        className="p-3 border-bottom"
                    >
                        {/* 상단: 이름과 마지막 채팅 시간 */}
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center gap-2 text-truncate pe-2">
                                <Badge bg={badgeColorMap[room.accountType] || 'secondary'} className="px-2 py-1">
                                    {room.accountType}
                                </Badge>
                                <h6 className="mb-0 fw-bold text-truncate">
                                    {room.accountName}
                                </h6>

                                {room.enter === 'Y' ? (
                                    <Badge 
                                        bg="primary" 
                                        className="d-flex align-items-center justify-content-center rounded-pill bg-opacity-10 text-primary border border-primary-subtle fw-bold px-2"
                                        style={{ fontSize: '0.65rem', height: '20px', lineHeight: '1' }}
                                    >
                                        참여중
                                    </Badge>
                                ) : (
                                    room.cnt > 1 && (
                                    <Badge 
                                        bg="success" 
                                        className="d-flex align-items-center justify-content-center rounded-pill bg-opacity-10 text-success border border-success-subtle fw-bold px-2"
                                        style={{ fontSize: '0.65rem', height: '20px', lineHeight: '1' }}
                                    >
                                        상담중
                                    </Badge>
                                    )
                                )
                                }
                            </div>
                            
                            {/* ✨ 마지막 채팅 시간 표시 (VO의 필드명이 chatTime인지 lastTime인지 맞춰서 수정) */}
                            <span className={`small text-nowrap ${activeRoomNo === room.roomNo ? 'text-white' : 'text-muted'}`}>
                                {formatRoomTime(room.lastTime)}
                            </span>
                        </div>

                        {/* 하단: 마지막 대화 내용과 안읽음 뱃지 */}
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <p className={`mb-0 small text-truncate pe-2 ${activeRoomNo === room.roomNo ? 'text-white' : 'text-muted'}`}>
                                {room.lastContent}
                            </p>
                            {room.unreadCnt > 0 && (
                                <Badge bg="danger" pill>{room.unreadCnt}</Badge>
                            )}
                        </div>
                    </ListGroup.Item>
                    ))}
                </ListGroup>
                </Col>

                {/* 우측: 채팅 내용 */}
                <Col xs={12} md={7} lg={8} className="p-0 d-flex flex-column bg-light chat-col-height">
                {activeRoomNo ? (
                    <>
                    {/* 👇 1. 상단 회원 정보 카드 헤더 영역 변경 */}
                    <div className="p-4 bg-white border-bottom shadow-sm z-1">
                        <div className="d-flex justify-content-between align-items-center">
                            
                            {/* 좌측: 프로필 아이콘 및 회원 정보 */}
                            <div className="d-flex align-items-center gap-3">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Badge bg={badgeColorMap[room.accountType] || 'secondary'} className="px-2 py-1">
                                            {room.accountType}
                                        </Badge>
                                        <h5 className="mb-0 fw-bold">{room?.accountName}</h5>
                                    </div>
                                    {/* <div className="text-muted small">
                                        채팅방 번호: {room?.roomNo} | 최근 접속: {formatRoomTime(room?.lastTime)}
                                    </div> */}
                                </div>
                            </div>

                            {consultEmployee ? (
                                /* 누군가(직원) 이미 참가 중인 경우 보여줄 UI */
                                consultEmployee.accountNo === loginUser.accountNo ? (
                                    <Button 
                                        variant="outline-danger" 
                                        className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm hover-elevate transition-all"
                                        onClick={() => leaveRoom(room.roomNo)}
                                    >
                                        <span>나가기</span>
                                    </Button>
                                ) : (
                                    <div 
                                        className="d-flex align-items-center bg-white border border-light-subtle rounded-pill shadow-sm" 
                                        style={{ padding: '4px 6px 4px 16px' }}
                                    >
                                        {/* 1. 직원 뱃지 및 이름 (내보내기가 있을 때만 조건부로 border-end 적용) */}
                                        <div className={`d-flex align-items-center gap-2 py-1 ${loginUser?.roleNames?.includes('ADMIN') ? 'border-end border-light-subtle pe-3' : 'pe-2'}`}>
                                            <Badge bg={badgeColorMap[consultEmployee.accountType] || 'secondary'} className="px-2 py-1 rounded-pill fw-normal">
                                                {consultEmployee.accountType}
                                            </Badge>
                                            <div className="d-flex flex-column justify-content-center">
                                                <span className="fw-bold text-dark fs-6" style={{ letterSpacing: '-0.5px' }}>
                                                    {consultEmployee.accountName}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* 2. 관리자 전용 '내보내기' 영역 */}
                                        {loginUser?.roleNames?.includes('ADMIN') && (
                                            <Button 
                                                variant="outline-danger" 
                                                className="border-0 rounded-pill fw-bold ms-2 px-3 d-flex align-items-center transition-all"
                                                style={{ fontSize: '0.75rem', height: '30px' }}
                                                onClick={() => kickEmployee(room.roomNo, consultEmployee.accountNo)}
                                            >
                                                내보내기
                                            </Button>
                                        )}
                                    </div>
                                )
                            ) : (
                                /* 아무도 참가하지 않은 경우 (기존 참가 버튼) */
                                <Button 
                                    variant="primary" 
                                    className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm hover-elevate transition-all"
                                    onClick={() => enterRoom(room.roomNo)}
                                >
                                    <FaPaperPlane size={14} />
                                    <span>참가하기</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-3"
                        ref={messagesEndRef}>
                        {history.map((message, index) => {
                        //내 메세지인지 판정
                        const my = loginUser.accountNo === message.senderNo;
                        const isDiffSender = checkSenderVisible(history[index], history[index-1]);
                        const isDiffTime = checkTimeVisible(history[index], history[index+1]);
                        const isDiffDate = checkDateVisible(history[index], history[index-1]);

                        return (
                            <div key={index} className="d-flex flex-column gap-3">
                            {isDiffDate && (
                                <div className="d-flex justify-content-center my-2">
                                    <div className="bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1" style={{ fontSize: "0.8rem" }}>
                                        {dayjs(message.time).format("YYYY년 M월 D일 dddd")}
                                    </div>
                                </div>
                            )}
                            {my ? (
                                <div className="d-flex justify-content-end">
                                    <div className="d-flex flex-column align-items-end">
                                        <div className="d-flex align-items-end gap-2">
                                            <span className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                                {isDiffTime && dayjs(message.time).format("a h:mm")}
                                            </span>
                                            <div className="bg-primary text-white rounded-3 p-2 px-3 shadow-sm">
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex justify-content-start">
                                    <div className="d-flex flex-column align-items-start">
                                        {(!my && isDiffSender) && (
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Badge bg={badgeColorMap[message.senderType] || 'secondary'} className="px-2 py-1">
                                                    {message.senderType}
                                                </Badge>
                                                <span className="small text-muted fw-bold">
                                                    {message.senderName}
                                                </span>
                                            </div>
                                        )}
                                        <div className="d-flex align-items-end gap-2">
                                            <div className="bg-white border rounded-3 p-2 px-3 shadow-sm">
                                                {message.content}
                                            </div>
                                            <span className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                                {isDiffTime && dayjs(message.time).format("a h:mm")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}, [history])}
                    </div>

                    <div className="p-3 bg-white border-top">
                        {!consultEmployee ? (
                            <div className="d-flex align-items-center justify-content-center bg-light border border-secondary-subtle rounded-3 p-2 text-muted shadow-sm" style={{ height: "42px" }}>
                                <span className="small">
                                    대화중인 직원이 없습니다. 상단의 <strong>참가하기</strong> 버튼을 눌러 대화를 시작해 주세요.
                                </span>
                            </div>
                        ) : consultEmployee.accountNo !== loginUser.accountNo ? (
                            /* 다른 직원이 상담 중일 때 보여줄 대체 UI */
                            <div className="d-flex align-items-center justify-content-center bg-light border border-secondary-subtle rounded-3 p-2 text-muted shadow-sm" style={{ height: "42px" }}>
                                <span className="small">
                                    현재 <strong>{consultEmployee.accountName}</strong> 직원이 대화 중입니다.
                                </span>
                            </div>
                        ) : (
                            /* 내가 상담 중이거나 아직 담당자가 없을 때 보여줄 입력창 (기존 코드) */
                            <div className="d-flex gap-2">
                                <Form.Control 
                                    type="text" 
                                    placeholder="메시지를 입력하세요"
                                    name="chatContent"
                                    value={input}
                                    onKeyUp={e=>{
                                        if(e.key === "Enter") sendMessage();
                                    }}
                                    onChange={(e)=>setInput(e.target.value)}
                                    className="bg-light border-secondary-subtle"
                                />
                                <Button type="button" variant="primary" className="d-flex align-items-center justify-content-center text-nowrap fw-bold px-3"
                                    disabled={isConnect === false} onClick={sendMessage}>
                                    <FaPaperPlane />
                                    <span className="d-none d-md-inline ms-1">전송</span>
                                </Button>
                            </div>
                        )}
                    </div>
                    </>
                ) : (
                    <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                    <h4>채팅방을 선택해주세요.</h4>
                    </div>
                )}
                </Col>

            </Row>
            </Container>
    </>)
}