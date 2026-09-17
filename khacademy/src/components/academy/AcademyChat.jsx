import { Badge, Button, CloseButton, Form } from "react-bootstrap";
import { FaPaperPlane, FaCommentDots, FaArrowLeft } from "react-icons/fa6";
import { isLoginState, isEmployeeState, loginUserState } from "@utils/storage";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");//한국어로 설정

export default function AcademyChat() {

    //로그인 상태
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);

    //채팅창 상태
    const [consultRoom, setConsultRoom] = useState(null);
    const [room, setRoom] = useState(null);
    const [rooms, setRooms] = useState([]);//채팅방 목록
    const [roomCount, setRoomCount] = useState(0);//채팅방 개수
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isChatOpenRef = useRef(false);
    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    // ✨ [추가] 대화 상대 목록 및 선택된 상대 상태
    //const [tutors, setTutors] = useState([]); // 강사 목록
    const [selectedType, setSelectedType] = useState(null);
    const [selectedTutor, setSelectedTutor] = useState(null); // 현재 선택된 대화 상대
    const [viewMode, setViewMode] = useState("list"); // "list": 목록 화면, "chat": 채팅 화면 (모바일 대응용)

    const [activeRoomNo, setActiveRoomNo] = useState(null);
    const sockRef = useRef(null);

    useEffect(() => {
        sockRef.current = activeRoomNo;
    }, [activeRoomNo]);

    //웹소켓 관련
    const loginUser = useAtomValue(loginUserState);
    const [client, setClient] = useState(null);//서버와의 연결정보를 가진 객체
    const [input, setInput] = useState("");//사용자의 입력
    const [history, setHistory] = useState([]);//메세지 이력
    const inputRef = useRef();//입력창 제어용 리모컨
    const [users, setUsers] = useState([]);//접속한 사용자의 목록

    const navigate = useNavigate();

    const consultRoomId = consultRoom?.roomNo;
    const roomIds = useMemo(() => rooms.map(r => r.roomNo).join(','), [rooms]);

    //상담 방정보 불러오기
    const loadConsultRoom = useCallback(async ()=>{
        if (!loginUser) {
            //setRoom(null); 
            setConsultRoom(null); 
            return;
        }

        try {
            const { data } = await apiClient.get(`/academy/room/check`);
            //setRoom(data.room);
            setConsultRoom(data.room);
            setHistory(data.history);
        }
        catch(e) {
            console.log(e.status);
            if(e.status === 403) {
                //await Swal.fire("당신은 방 참여자가 아닙니다");
                //navigate("/websocket/v4");//목록으로 이동
            }
            else if(e.status === 404) {
                //await Swal.fire("존재하지 않는 방입니다");
                //navigate("/websocket/v4");//목록으로 이동
            }
            else {//500
                //await Swal.fire("일시적인 서버 오류입니다.\n잠시 후 실행해주세요");
                //navigate("/websocket/v4");//목록으로 이동
            }
        }
    }, [loginUser]);
    //채팅방 정보가 변경되면 채팅방 정보 새로고침
    useEffect(()=>{
        loadConsultRoom();
    }, [loadConsultRoom]);

    const loadTutorRoom = useCallback(async (selectedRoom) => {
        setRoom(selectedRoom);
        setActiveRoomNo(selectedRoom.roomNo);
        setViewMode("chat"); // ✨ 방 선택 시 무조건 채팅 화면으로 전환

        try {
            const { data } = await apiClient.get(`/academy/room/${selectedRoom.roomNo}`);
            setUsers(data.users);
            setHistory(data.history);
            
            // 안읽음 카운트 초기화
            setRooms(prev => prev.map(r => r.roomNo === selectedRoom.roomNo ? { ...r, unreadCnt: 0 } : r));
        } catch(error) {
            console.error("방 정보 불러오기 실패", error);
        } finally {
            // ✨ 요청이 끝나면 로딩 끄기
            setIsRoomLoading(false);
        }
    }, []);

    const loadTutorRooms = useCallback(async ()=>{
        const { data } = await apiClient.get("/academy/room/tutor")
        setRooms(data.rooms);
        setRoomCount(data.count);
        // console.log(data);
    }, []);

    useEffect(()=>{
        loadTutorRooms();
    }, [loadTutorRooms]);

    //로그인 정보가 변경되면 채팅창 닫음
    useEffect(()=>{
        setIsChatOpen(false);
    }, [loginUser]);

    const updateLastReadTime = useCallback(async (targetRoomNo, type) => {
        if (!targetRoomNo) return;
        try {
            // 백엔드에 읽음 처리 요청 (예시 URL)
            await apiClient.put(`/academy/room/${targetRoomNo}/read`);
            
            // 프론트엔드 화면의 안읽음 뱃지도 즉시 0으로 초기화
            if (type === 'consult') {
                setConsultRoom(prev => prev ? { ...prev, unreadCnt: 0 } : prev);
            } else if (type === 'tutor') {
                setRooms(prevRooms => prevRooms.map(r => r.roomNo === targetRoomNo ? { ...r, unreadCnt: 0 } : r));
            }
        } catch (error) {
            console.error("읽음 처리 실패", error);
        }
    }, []);

    const chatOpen = useCallback(()=>{
        setIsChatOpen(true);
        if (selectedType === "consult" && consultRoom?.roomNo) {
            updateLastReadTime(consultRoom.roomNo, 'consult');
        } else if (selectedType === "tutor" && activeRoomNo) {
            updateLastReadTime(activeRoomNo, 'tutor');
        }
    }, [updateLastReadTime, selectedType, consultRoom, activeRoomNo]);

    //연결 함수
    const connectToServer = useCallback(()=>{
        //연결을 관리할 도구(client) 생성하여 반환
        const client = new Client({
            //연결 객체를 생성하는 함수
            webSocketFactory : () => new SockJS(`${import.meta.env.VITE_SERVER_URL}/ws-member`), 
            reconnectDelay: 5000,
            heartbeatIncoming: 10000, // 서버로부터 10초마다 하트비트를 수신할 것으로 기대
            heartbeatOutgoing: 10000, // 서버로 10초마다 하트비트를 발송
            onConnect: ()=>{

                const handleMessage = (message, targetRoomNo, isConsult) => {
                    const json = JSON.parse(message.body);
                    // 현재 채팅창이 열려있고, 메세지가 온 방을 보고 있는지 판별 (최신 Ref 참조)
                    const isOpenAndWatching = isChatOpenRef.current && sockRef.current === targetRoomNo;

                    // 1) 내가 보고 있는 방에 메세지가 온 경우: 대화 내역에 바로 추가
                    if (isOpenAndWatching) {
                        setHistory(prev => [...(prev || []), json]);

                        updateLastReadTime(targetRoomNo, isConsult ? 'consult' : 'tutor');
                    }

                    // 2) 목록 갱신: 내가 보고 있는 방이면 뱃지 0, 아니면 +1 증가
                    if (isConsult) {
                        setConsultRoom(prev => prev ? {
                            ...prev,
                            unreadCnt: isOpenAndWatching ? 0 : (prev.unreadCnt || 0) + 1,
                            lastContent: json.content
                        } : prev);
                    } else {
                        setRooms(prev => prev.map(r => r.roomNo === targetRoomNo ? {
                            ...r,
                            unreadCnt: isOpenAndWatching ? 0 : (r.unreadCnt || 0) + 1,
                            lastContent: json.content,
                            lastTime: json.time || dayjs().format()
                        } : r));
                    }
                };

                // ✨ 상담방 구독 (consultRoomId가 존재할 때)
                if (consultRoomId) {
                    client.subscribe(`/public/${consultRoomId}/chat`, (msg) => handleMessage(msg, consultRoomId, true));
                }

                // ✨ 강사방 구독 (roomIds 문자열을 쪼개서 각각 구독)
                if (roomIds) {
                    roomIds.split(',').forEach(id => {
                        const numericId = Number(id);
                        client.subscribe(`/public/${numericId}/chat`, (msg) => handleMessage(msg, numericId, false));
                    });
                }
            
                // client.subscribe(`/public/${room.roomNo}/system`, (message)=>{
                //     const json = JSON.parse(message.body);
                //     setHistory(prev=>[...(prev || []), json]);
                // });
            },
            onDisconnect: () => { console.log('연결 끊김'); },
            debug: (str)=>console.log(str)
        });

        client.activate();
        return client;
    }, [consultRoomId, roomIds, updateLastReadTime]);
    //연결 종료 함수
    const disconnectFromServer = useCallback((client)=>{
        if(client) {//client가 존재한다면
            client.deactivate();//비활성화
        }
    }, []);

    //연결 및 해제
    useEffect(()=>{
        if (!consultRoomId) return;

        //최초 1회 실행해야할 작업
        const client = connectToServer();
        setClient(client);

        //페이지 이탈 시 해야할 작업
        return ()=>{
            disconnectFromServer(client);
            setClient(null);
        };
    }, [consultRoomId, roomIds, connectToServer]);

    //연결 상태 확인
    const isConnect = useMemo(()=>{
        if(client === null) return false;//client가 없는 경우
        if(client.active === false) return false;//deactivate() 상태인 경우
        return true;
    }, [client]);

    //메세지 전송
    const sendMessage = useCallback(()=>{
        //보낼 수 있는 상태인지를 검증
        if (!client || !client.connected) {
            console.warn("STOMP 연결이 끊어져 메세지를 보낼 수 없습니다.");
            // 원한다면 여기에 Swal.fire("연결이 끊어졌습니다. 잠시 후 다시 시도해주세요."); 추가 가능
            return;
        }
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
    }, [client, input, room]);

    //(+추가) 스크롤을 끝으로 갱신시키는 처리 (반대도 가능) , * reverse인 상황
    const messageWrapperRef = useRef();
    useEffect(()=>{
        if(messageWrapperRef.current) {
            //messageWrapperRef.current.scrollTop = 0;//처음으로 (상단)
            messageWrapperRef.current.scrollTop = messageWrapperRef.current.scrollHeight; //마지막으로 (하단)
        }
    }, [history, isChatOpen]); 

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

    // ✨ '학원 상담원' 클릭 핸들러
    const handleSelectConsult = useCallback(async () => {
        setSelectedType("consult");
        setSelectedTutor(null);
        setViewMode("chat");

        setRoom(consultRoom);
        setActiveRoomNo(consultRoom?.roomNo);

        setConsultRoom((prev) => prev ? { ...prev, unreadCnt: 0 } : prev);
        if (consultRoom?.roomNo) {
            updateLastReadTime(consultRoom.roomNo, 'consult');
        }
        await loadConsultRoom();
        setConsultRoom((prev) => prev ? { ...prev, unreadCnt: 0 } : prev);
    }, [consultRoom, updateLastReadTime, loadConsultRoom]);

    // ✨ '강사' 선택 핸들러
    const handleSelectTutor = useCallback(async (tutor) => {
        setSelectedType("tutor");
        setSelectedTutor(tutor);
        setViewMode("chat");
        await loadTutorRoom(tutor);

        // 로드 완료 후 확실하게 읽음 처리
        if (tutor?.roomNo) {
            updateLastReadTime(tutor.roomNo, 'tutor');
        }
    }, [loadTutorRoom, updateLastReadTime]);

    // 목록으로 돌아가기
    const handleBackToList = () => {
        setViewMode("list");
        setSelectedType(null);
        setSelectedTutor(null);
    };

    // ✨ 1. 방 이동 시 깜빡임 방지용 로딩 상태 추가
    const [isRoomLoading, setIsRoomLoading] = useState(false);

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

    const totalUnreadCnt = useMemo(() => {
        let total = 0;
        
        // 1. 상담방(consultRoom) 안읽음 숫자 합산
        if (consultRoom && consultRoom.unreadCnt) {
            total += consultRoom.unreadCnt;
        }
        
        // 2. 강사방(rooms)들의 안읽음 숫자 모두 합산
        if (rooms && rooms.length > 0) {
            total += rooms.reduce((sum, r) => sum + (r.unreadCnt || 0), 0);
        }
        
        return total;
    }, [consultRoom, rooms]);

    return (<>
        {/* 채팅 플로팅 버튼 */}
        {isLogin && !isEmployee && !isChatOpen && (
        <div className="position-fixed bottom-0 end-0 mb-4 me-4 z-3">
            <Button 
                variant="primary" 
                className="position-relative rounded-circle shadow-lg p-3 d-flex justify-content-center align-items-center fab-hover-action"
                onClick={chatOpen}
            >
                <span className="fs-3 fw-bold lh-1">
                    <FaCommentDots/>
                </span>

                {/* ✨ 안읽은 메세지가 있을 때만 우측 상단에 뱃지 표시 */}
                {totalUnreadCnt > 0 && (
                    <span 
                        className="position-absolute badge rounded-pill bg-danger border border-2 border-white"
                        style={{ 
                            top: "0px", 
                            right: "0px", 
                            /* 사각형 모서리가 아닌 둥근 원형 라인에 걸치도록 위치를 미세 조정합니다. */
                            transform: "translate(25%, -25%)", 
                            fontSize: "0.75rem", 
                            padding: "0.4em 0.6em" 
                        }}
                    >
                        {totalUnreadCnt > 99 ? '99+' : totalUnreadCnt}
                    </span>
                )}
            </Button>
        </div>
        )}

        {/* 채팅 영역 */}
        {/* ✨ 확장된 채팅 영역 (좌우 2단 구조) */}
        {isLogin && !isEmployee && isChatOpen && (
        <div 
            className="position-fixed d-flex bg-white border rounded-3 shadow-lg overflow-hidden"
            style={{
                width: "760px",
                height: "600px",    
                maxWidth: "90vw",   
                maxHeight: "85vh",   
                bottom: "24px",
                right: "24px",      
                zIndex: "1021",
            }}>
            
            {/* 좌측 패널: 상담원(고정) + 강사 목록 */}
            <div className={`d-flex flex-column border-end bg-light ${viewMode === 'chat' ? '' : 'w-100'} ${viewMode === 'chat' ? 'd-none d-md-flex' : 'd-flex'}`} 
                style={{ width: "360px", flexShrink: 0 }}
                >
                <div className="p-3 border-bottom bg-white fw-bold d-flex align-items-center justify-content-between">
                    <span>대화 상대</span>
                    {/* ✨ 모바일에서 목록만 볼 때 전체 창을 닫을 수 있는 버튼 */}
                    <CloseButton className={`${viewMode === 'chat' ? 'd-none' : ''}`} onClick={() => setIsChatOpen(false)} data-bs-theme="dark" />
                </div>
                
                <div className="flex-grow-1 overflow-auto p-2 d-flex flex-column gap-3">
                    
                    {/* 1. 상단 고정: 학원 상담원 */}
                    <div>
                        <div className="text-muted fw-bold px-2 mb-1" style={{ fontSize: '0.75rem' }}>상담 센터</div>
                        <div 
                            onClick={handleSelectConsult}
                            className={`p-2 rounded-3 d-flex align-items-center gap-2 cursor-pointer transition-all ${selectedType === 'consult' ? 'bg-primary text-white shadow-sm' : 'bg-white hover-bg-light text-dark border'}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex-grow-1 overflow-hidden">
                                {/* 첫 번째 줄: 이름 & 마지막 대화 시간 */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>상담원</div>
                                    <div className={`small ${selectedType === 'consult' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                        {formatRoomTime(consultRoom.lastTime)}
                                    </div>
                                </div>
                                {/* 두 번째 줄: 최근 대화 내용 & 안읽음 뱃지 */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className={`text-truncate pe-2 ${selectedType === 'consult' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                        {consultRoom.lastContent}
                                    </div>
                                    {consultRoom.unreadCnt > 0 && (
                                        <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>{consultRoom.unreadCnt}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 하단: 강사 목록 */}
                    <div>
                        <div className="text-muted fw-bold px-2 mb-1 d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                            <span>강사 목록</span>
                            <Badge bg="secondary" pill>{rooms.length}</Badge>
                        </div>
                        <div className="d-flex flex-column gap-1">
                            {rooms.map((tutor) => {
                                const isSelected = selectedType === 'tutor' && selectedTutor?.accountNo === tutor.accountNo;
                                return (
                                    <div 
                                        key={tutor.accountNo}
                                        onClick={() => handleSelectTutor(tutor)}
                                        className={`p-2 rounded-3 d-flex align-items-center gap-2 cursor-pointer transition-all ${isSelected ? 'bg-primary text-white shadow-sm' : 'bg-white hover-bg-light text-dark border'}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="flex-grow-1 overflow-hidden">
                                            {/* 첫 번째 줄: 이름 & 마지막 대화 시간 */}
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                                                    {tutor.accountName || tutor.name}
                                                </div>
                                                {/* ✨ 마지막 시간 표시 */}
                                                {tutor.lastTime && (
                                                    <div className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                                        {formatRoomTime(tutor.lastTime)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* 두 번째 줄: 최근 대화 내용 & 안읽음 뱃지 */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className={`text-truncate pe-2 ${isSelected ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                    {tutor.lastContent || '1:1 대화 가능'}
                                                </div>
                                                {/* ✨ 안읽음 뱃지 표시 */}
                                                {tutor.unreadCnt > 0 && (
                                                    <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>
                                                        {tutor.unreadCnt > 99 ? '99+' : tutor.unreadCnt}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* 우측 패널: 실시간 채팅 영역 */}
            <div className={`flex-grow-1 d-flex flex-column bg-light ${viewMode === 'list' ? 'd-none d-md-flex' : 'd-flex'}`}>
                {selectedType ? (
                    <>
                        {/* 상단 헤더 */}
                        <div className="d-flex justify-content-between align-items-center border-bottom p-3 bg-white">
                            <div className="d-flex align-items-center gap-2">
                                {/* 모바일에서 목록으로 돌아가는 뒤로가기 버튼 */}
                                <Button 
                                    variant="light" 
                                    className="d-md-none d-flex align-items-center justify-content-center rounded-circle border-0 me-2 shadow-sm" 
                                    style={{ width: "38px", height: "38px", backgroundColor: "#f1f3f5" }}
                                    onClick={handleBackToList}
                                >
                                    <FaArrowLeft size={18} className="text-dark" />
                                </Button>
                                <h6 className="fw-bold mb-0">{selectedTutor?.accountName || "상담원"}</h6>
                            </div>
                            <CloseButton onClick={() => setIsChatOpen(false)} data-bs-theme="dark" />
                        </div>
                        
                        {/* 중간 대화 내역 영역 */}
                        <div className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-3 message-wrapper"
                            ref={messageWrapperRef}>
                            {history.map((message, index)=>{
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
                                        <div className="d-flex justify-content-end" key={index}>
                                            <div className="d-flex flex-column align-items-end">
                                                <div className="d-flex align-items-end gap-2">
                                                    <span className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                                        { isDiffTime && (
                                                            dayjs(message.time).format("a h:mm")
                                                        )}
                                                    </span>
                                                    <div className="bg-primary text-white rounded-3 p-2 px-3 shadow-sm">
                                                        {message.content}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-start" key={index}>
                                            <div className="d-flex flex-column align-items-start">
                                                { (!my && isDiffSender) && (
                                                <span className="small text-muted mb-1 fw-bold">
                                                    {selectedTutor?.accountName || "상담원"}
                                                </span>
                                                )}
                                                <div className="d-flex align-items-end gap-2">
                                                    <div className="bg-white border rounded-3 p-2 px-3 shadow-sm">
                                                        {message.content}
                                                    </div>
                                                    <span className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                                        { isDiffTime && (
                                                            dayjs(message.time).format("a h:mm")
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* 하단 메시지 입력 및 전송 영역 */}
                        <div className="p-3 border-top bg-white">
                            <div className="d-flex gap-2">
                                <Form.Control 
                                    type="text" 
                                    placeholder="메시지를 입력하세요"
                                    value={input}
                                    onKeyUp={e=>{
                                        if(e.key === "Enter") sendMessage();
                                    }}
                                    onChange={(e)=>setInput(e.target.value)}
                                    className="bg-light border-secondary-subtle"
                                />
                                <Button variant="primary" className="d-flex align-items-center justify-content-center text-nowrap fw-bold px-3"
                                    disabled={isConnect === false} onClick={sendMessage}>
                                    <FaPaperPlane />
                                    <span className="d-none d-md-inline ms-1">전송</span>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* 대화 상대를 선택하지 않았을 때의 빈 화면 안내 */
                    <>
                        {/* ✨ 빈 화면일 때도 상단에 닫기 버튼을 표시하기 위한 헤더 */}
                        <div className="d-flex justify-content-end align-items-center border-bottom p-3 bg-white">
                            <CloseButton onClick={() => setIsChatOpen(false)} data-bs-theme="dark" />
                        </div>
                        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted p-4 text-center">
                            <FaCommentDots className="fs-1 mb-2 opacity-50" />
                            <p className="mb-0 fw-bold">좌측 목록에서 대화 상대를 선택해주세요.</p>
                            <span className="small text-secondary">선택한 상대와 실시간 대화를 시작할 수 있습니다.</span>
                        </div>
                    </>
                )}
            </div>
        </div>
        )}
    </>)
}