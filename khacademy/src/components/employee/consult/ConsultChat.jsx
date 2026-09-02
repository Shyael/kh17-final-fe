import Jumbotron from "@templates/Jumbotron";
import { Client } from "@stomp/stompjs";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { apiClient } from "@utils/reaxios";
import { loginUserState, isLoginState } from "@utils/storage";
import { Badge, Button, Card, Col, Container, Form, ListGroup, Modal, Row } from "react-bootstrap";

// 테스트용 더미 데이터
const DUMMY_ROOMS = [
  { id: 1, name: '개발팀 전체방', lastMessage: '내일 배포 일정 확인 부탁드립니다.' },
  { id: 2, name: '디자인 리소스 공유', lastMessage: '시안 전달드렸습니다.' },
  { id: 3, name: '점심 메뉴 원정대', lastMessage: '오늘 마라탕 어떠신가요?' },
];

const DUMMY_MESSAGES = {
  1: [
    { id: 1, sender: '김개발', text: '이번 주 스프린트 리뷰 언제인가요?' },
    { id: 2, sender: '이팀장', text: '금요일 오후 3시입니다.' },
    { id: 3, sender: '박사원', text: '내일 배포 일정 확인 부탁드립니다.' }
  ],
  2: [
    { id: 1, sender: '최디쟌', text: '메인 페이지 시안 전달드렸습니다.' },
    { id: 2, sender: '김개발', text: '확인해보겠습니다. 감사합니다!' }
  ],
  3: [
    { id: 1, sender: '밥돌이', text: '오늘 마라탕 어떠신가요?' }
  ]
};

export default function ConsultChat() {

    // 현재 선택된 채팅방 ID 상태 관리
    const [activeRoomId, setActiveRoomId] = useState(null);

    // 메시지 입력 상태 (UI 구성을 위한 더미)
    const [inputText, setInputText] = useState('');
    
    const loginUser = useAtomValue(loginUserState);
    const isLogin = useAtomValue(isLoginState);
    const [rooms, setRooms] = useState([]);//채팅방 목록
    const [roomCount, setRoomCount] = useState(0);//채팅방 개수

    useEffect(()=>{
        loadRooms();//시작하자마자 방 목록을 불러온다
    }, []);
    const loadRooms = useCallback(async ()=>{
        const { data } = await apiClient.get("/room/")
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
        // 1. 방 목록 초기 조회 (REST API)
        // fetch('/api/chat/rooms').then(res => res.json()).then(setRooms);
        
        // 테스트용 초기 더미 데이터 (DB 스키마 기준)
        setRooms([
        { roomNo: 1, lastChatContent: '안녕하세요.', chatTime: '2026-09-02T10:00:00', unreadCount: 1 },
        { roomNo: 2, lastChatContent: '회의 언제인가요?', chatTime: '2026-09-01T15:00:00', unreadCount: 0 }
        ]);

        // 2. SockJS 연결
        const sock = new SockJS('http://localhost:8080/ws-chat');
        sockRef.current = sock;

        sock.onmessage = (e) => {
        const payload = JSON.parse(e.data);

        if (payload.type === 'NEW_CHAT') {
            const newChat = payload.chat; // DB의 chat 테이블 기준 데이터

            // 현재 보고 있는 방에 새 메시지가 온 경우 채팅창 업데이트
            if (activeRoomNo === newChat.roomNo) {
            setMessages(prev => [...prev, newChat]);
            }

            // 방 목록의 마지막 메시지 및 시간 업데이트
            setRooms(prevRooms => {
            const updatedRooms = prevRooms.map(room => {
                if (room.roomNo === newChat.roomNo) {
                return { 
                    ...room, 
                    lastChatContent: newChat.chatContent, 
                    chatTime: newChat.chatTime,
                    // 현재 보고 있는 방이 아니면 안읽음 카운트 증가
                    unreadCount: activeRoomNo === newChat.roomNo ? 0 : (room.unreadCount || 0) + 1
                };
                }
                return room;
            });
            // 최근 메시지가 온 방을 맨 위로 정렬
            return updatedRooms.sort((a, b) => new Date(b.chatTime) - new Date(a.chatTime));
            });
        }
        };

        return () => {
        if (sockRef.current) sockRef.current.close();
        };
    }, [activeRoomNo]);

    // 스크롤 맨 아래로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 방 선택 시 해당 방의 채팅 내역 조회
    const handleRoomSelect = (roomNo) => {
        setActiveRoomNo(roomNo);
        
        // REST API로 해당 roomNo의 과거 채팅 내역(chat 테이블) 불러오기
        // fetch(`/api/chat/rooms/${roomNo}/messages`).then(res => res.json()).then(setMessages);
        
        // 더미 데이터 세팅
        setMessages([
        { chatNo: 1, roomNo: roomNo, accountNo: 2, chatContent: '안녕하세요', chatTime: '2026-09-02T09:50:00' },
        { chatNo: 2, roomNo: roomNo, accountNo: myAccountNo, chatContent: '네 반갑습니다.', chatTime: '2026-09-02T10:00:00' }
        ]);

        // 안읽음 카운트 초기화
        setRooms(prev => prev.map(r => r.roomNo === roomNo ? { ...r, unreadCount: 0 } : r));
    };

    // 메시지 전송
    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeRoomNo) return;

        const chatData = {
        type: 'SEND_CHAT',
        roomNo: activeRoomNo,
        accountNo: myAccountNo,
        chatContent: inputText
        };

        sockRef.current.send(JSON.stringify(chatData));
        setInputText('');
    };

    return(<>
        <Jumbotron title="채팅 관리" content="학생 및 학부모와의 채팅공간"/>
        
        <Container fluid className="vh-100 p-3 bg-light">
            <Row className="h-100 bg-white shadow-sm rounded overflow-hidden">
                
                {/* 좌측: 채팅방 목록 */}
                <Col md={4} lg={3} className="p-0 border-end d-flex flex-column h-100">
                <div className="p-3 bg-primary text-white font-weight-bold">
                    <h5 className="mb-0">채팅방 목록</h5>
                </div>
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                    {DUMMY_ROOMS.map((room) => (
                    <ListGroup.Item
                        key={room.id}
                        action
                        active={activeRoomId === room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className="p-3 border-bottom"
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1 fw-bold">{room.name}</h6>
                        </div>
                        <p className="mb-0 text-muted small text-truncate">
                        {room.lastMessage}
                        </p>
                    </ListGroup.Item>
                    ))}
                </ListGroup>
                </Col>

                {/* 우측: 채팅 내용 영역 */}
                <Col md={8} lg={9} className="p-0 d-flex flex-column h-100 bg-light">
                {activeRoomId ? (
                    <>
                    {/* 채팅방 헤더 */}
                    <div className="p-3 bg-white border-bottom shadow-sm">
                        <h5 className="mb-0">
                        {DUMMY_ROOMS.find(r => r.id === activeRoomId)?.name}
                        </h5>
                    </div>

                    {/* 채팅 대화 내용 (스크롤 영역) */}
                    <div className="p-4 flex-grow-1 overflow-auto">
                        {DUMMY_MESSAGES[activeRoomId]?.map((msg) => (
                        <div key={msg.id} className="mb-3">
                            <div className="small text-muted mb-1">{msg.sender}</div>
                            <Card body className="d-inline-block p-2 shadow-sm border-0">
                            {msg.text}
                            </Card>
                        </div>
                        ))}
                    </div>

                    {/* 메시지 입력창 */}
                    <div className="p-3 bg-white border-top">
                        <Form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                        <Form.Control
                            type="text"
                            placeholder="메시지를 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="me-2"
                        />
                        <Button variant="primary" type="submit">전송</Button>
                        </Form>
                    </div>
                    </>
                ) : (
                    /* 채팅방을 선택하지 않았을 때의 빈 화면 */
                    <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                    <h4>채팅방을 선택해주세요.</h4>
                    </div>
                )}
                </Col>

            </Row>
        </Container>

        <Container fluid className="vh-100 p-3 bg-light">
            <Row className="h-100 bg-white shadow-sm rounded overflow-hidden">
                
                {/* 좌측: 채팅방 목록 */}
                <Col md={4} lg={3} className="p-0 border-end d-flex flex-column h-100">
                <div className="p-3 bg-dark text-white">
                    <h5 className="mb-0">내 채팅방</h5>
                </div>
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                    {rooms.map((room) => (
                    <ListGroup.Item
                        key={room.roomNo}
                        action
                        active={activeRoomNo === room.roomNo}
                        onClick={() => handleRoomSelect(room.roomNo)}
                        className="p-3 border-bottom"
                    >
                        <div className="d-flex w-100 justify-content-between align-items-center">
                        <h6 className="mb-1 fw-bold">방 번호: {room.roomNo}</h6>
                        {room.unreadCount > 0 && (
                            <Badge bg="danger" pill>{room.unreadCount}</Badge>
                        )}
                        </div>
                        <p className="mb-0 text-muted small text-truncate">
                        {room.lastChatContent}
                        </p>
                    </ListGroup.Item>
                    ))}
                </ListGroup>
                </Col>

                {/* 우측: 채팅 내용 */}
                <Col md={8} lg={9} className="p-0 d-flex flex-column h-100 bg-light">
                {activeRoomNo ? (
                    <>
                    <div className="p-3 bg-white border-bottom shadow-sm">
                        <h5 className="mb-0">방 번호: {activeRoomNo}</h5>
                    </div>

                    <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column">
                        {messages.map((msg) => {
                        const isMe = msg.accountNo === 1;
                        return (
                            <div key={msg.chatNo} className={`mb-3 d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                            {!isMe && <div className="small text-muted mb-1">회원번호: {msg.accountNo}</div>}
                            <Card 
                                body 
                                className={`d-inline-block p-2 shadow-sm border-0 ${isMe ? 'bg-primary text-white' : 'bg-white'}`}
                                style={{ maxWidth: '70%' }}
                            >
                                {msg.chatContent}
                            </Card>
                            <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                {new Date(msg.chatTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            </div>
                        );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-top">
                        <Form className="d-flex" onSubmit={sendMessage}>
                        <Form.Control
                            type="text"
                            placeholder="메시지를 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="me-2"
                        />
                        <Button variant="primary" type="submit">전송</Button>
                        </Form>
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