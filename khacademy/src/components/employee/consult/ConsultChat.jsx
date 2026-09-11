import Jumbotron from "@templates/Jumbotron";
import { Client } from "@stomp/stompjs";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { apiClient } from "@utils/reaxios";
import { loginUserState, isLoginState } from "@utils/storage";
import { Badge, Button, Card, Col, Container, Form, ListGroup, Modal, Row } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa6";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");//한국어로 설정

export default function ConsultChat() {

    // 메시지 입력 상태
    const [input, setInput] = useState('');
    
    const loginUser = useAtomValue(loginUserState);
    const [client, setClient] = useState(null);//서버와의 연결정보를 가진 객체
    const isLogin = useAtomValue(isLoginState);
    const [room, setRoom] = useState(null);
    const [rooms, setRooms] = useState([]);//채팅방 목록
    const [roomCount, setRoomCount] = useState(0);//채팅방 개수
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
        //연결(socket) 생성
        const socket = new SockJS(`${import.meta.env.VITE_SERVER_URL}/ws-member`);

        //연결을 관리할 도구(client) 생성하여 반환
        const client = new Client({
            webSocketFactory : () => socket , 
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

    return(<>
        <Jumbotron title="상담 채팅 관리" />

        <Container fluid className="p-3 bg-light">
            <Row className="bg-white shadow-sm rounded overflow-hidden">
                
                {/* 좌측: 채팅방 목록 */}
                <Col xs={12} md={5} lg={4} className="p-0 border-end d-flex flex-column " style={{ height: "550px" }}>
                <div className="p-3 bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">상담 채팅 목록</h5>
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
                            <h6 className="mb-0 fw-bold text-truncate pe-2">
                                [{room.accountType}] {room.accountName}
                            </h6>
                            
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
                <Col xs={12} md={7} lg={8} className="p-0 d-flex flex-column bg-light" style={{ height: "550px" }}>
                {activeRoomNo ? (
                    <>
                    <div className="p-3 bg-white border-bottom shadow-sm">
                        <h5 className="mb-0">[{room?.accountType}] {room?.accountName}</h5>
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
                                            <span className="small text-muted mb-1 fw-bold">
                                                [{message.senderType}] {message.senderName}
                                            </span>
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
                        <div className="d-flex gap-2">
                            <Form.Control 
                                type="text" 
                                placeholder="메시지를 입력하세요"
                                name="chatContent"
                                value={input}
                                onKeyUp={e=>{
                                    //엔터를 누르면 전송버튼과 동일한 기능을 실행
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