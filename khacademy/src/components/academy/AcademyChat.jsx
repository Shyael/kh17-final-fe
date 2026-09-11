import { Button, CloseButton, Form } from "react-bootstrap";
import { FaPaperPlane, FaCommentDots } from "react-icons/fa6";
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
    const [room, setRoom] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isChatOpenRef = useRef(false);
    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);
    //const [unreadCnt, setUnreadCnt] = useState(0);

    //웹소켓 관련
    const loginUser = useAtomValue(loginUserState);
    const [client, setClient] = useState(null);//서버와의 연결정보를 가진 객체
    const [input, setInput] = useState("");//사용자의 입력
    const [history, setHistory] = useState([]);//메세지 이력
    const inputRef = useRef();//입력창 제어용 리모컨
    const [users, setUsers] = useState([]);//접속한 사용자의 목록

    const navigate = useNavigate();

    //방정보 불러오기
    const loadRoom = useCallback(async ()=>{
        if (!loginUser) {
            setRoom(null); 
            return;
        }

        try {
            const { data } = await apiClient.get(`/academy/room/check`);
            setRoom(data.room);
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
        loadRoom();
    }, [loadRoom]);
    //로그인 정보가 변경되면 채팅창 닫음
    useEffect(()=>{
        setIsChatOpen(false);
    }, [loginUser]);

    const updateLastReadTime = useCallback(async () => {
        if (!room) return;
        try {
            // 백엔드에 읽음 처리 요청 (예시 URL)
            await apiClient.put(`/academy/room/${room.roomNo}/read`);
            
            // 프론트엔드 화면의 안읽음 뱃지도 0으로 즉시 초기화
            setRoom(prev => ({ ...prev, unreadCnt: 0 }));
        } catch (error) {
            console.error("읽음 처리 실패", error);
        }
    }, [room]);

    const chatOpen = useCallback(()=>{
        setIsChatOpen(true);
        updateLastReadTime();
    }, [updateLastReadTime]);

    //연결 함수
    const connectToServer = useCallback(()=>{
        //연결(socket) 생성
        const socket = new SockJS(`${import.meta.env.VITE_SERVER_URL}/ws-member`);

        //연결을 관리할 도구(client) 생성하여 반환
        const client = new Client({
            //연결 객체를 생성하는 함수
            webSocketFactory : () => socket , 
            // 백엔드 설정 시간과 맞춰줍니다 (밀리초 단위)
            heartbeatIncoming: 10000, // 서버로부터 10초마다 하트비트를 수신할 것으로 기대
            heartbeatOutgoing: 10000, // 서버로 10초마다 하트비트를 발송

            //웹소켓의 상황별 Callback 지정
            onConnect: ()=>{//연결되었을 때
                //채널구독 및 수신작업 안내
                client.subscribe(`/public/${room.roomNo}/chat`, (message)=>{
                    const json = JSON.parse(message.body);
                    setHistory(prev => [...prev, json]);
                    if (!isChatOpenRef.current) {
                        // ✨ 채팅창이 닫혀있으면 플로팅 버튼의 안읽음 숫자 + 1
                        setRoom(prev => ({ ...prev, unreadCnt: (prev.unreadCnt || 0) + 1 }));
                    } else {
                        updateLastReadTime();
                    }
                });
                client.subscribe(`/public/${room.roomNo}/system`, (message)=>{
                    const json = JSON.parse(message.body);
                    setHistory(prev=>[...(prev || []), json]);
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
    }, [room?.roomNo, loginUser, updateLastReadTime]);
    //연결 종료 함수
    const disconnectFromServer = useCallback((client)=>{
        if(client) {//client가 존재한다면
            client.deactivate();//비활성화
        }
    }, []);

    //연결 및 해제
    useEffect(()=>{
        if(room === null) return;//방 정보가 존재하지 않으면 연결을 하지마라! (기존과 차이점)

        //최초 1회 실행해야할 작업
        const client = connectToServer();
        setClient(client);

        //페이지 이탈 시 해야할 작업
        return ()=>{
            disconnectFromServer(client);
            setClient(null);
        };
    }, [room, connectToServer, loginUser]);

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

    return (<>
        {/* 채팅 플로팅 버튼 */}
        {isLogin && !isEmployee && room !== null && !isChatOpen && (
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
                {room.unreadCnt > 0 && (
                    // <span 
                    //     className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    //     style={{ fontSize: "0.75rem", padding: "0.4em 0.6em" }}
                    // >
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
                        {room.unreadCnt > 99 ? '99+' : room.unreadCnt}
                    </span>
                )}
            </Button>
        </div>
        )}

        {/* 채팅 영역 */}
        {isLogin && !isEmployee && isChatOpen && (
        <div 
            className="position-fixed d-flex flex-column bg-light border rounded-3 shadow-lg"
            style={{
                width: "360px",      /* 채팅창 고정 너비 (좁아지지 않음) */
                height: "500px",     /* 채팅창 고정 높이 */
                maxWidth: "90vw",    /* 모바일 기기 화면을 벗어나지 않도록 방어 */
                maxHeight: "80vh",   /* 세로가 짧은 기기에서 화면을 넘치지 않도록 방어 */
                bottom: "24px",      /* 하단 플로팅 버튼 위쪽으로 살짝 띄움 */
                right: "24px",        /* 플로팅 버튼의 me-4 간격과 우측 라인을 맞춤 */
                zIndex: "1021",
            }}>
            {/* 상단 헤더 영역 */}
            <div className="d-flex justify-content-between align-items-center border-bottom p-3 bg-white rounded-top-3">
                <h5 className="fw-bold mb-0">채팅 상담</h5>
                <CloseButton onClick={() => setIsChatOpen(false)} data-bs-theme="dark" />
            </div>
            
            {/* 중간 대화 내역 영역 */}
            <div className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-3 message-wrapper"
                ref={messageWrapperRef}>
                {history.map((message, index)=>{
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
                            <div className="d-flex justify-content-end" key={index}>
                                <div className="d-flex flex-column align-items-end">
                                    <div className="d-flex align-items-end gap-2">
                                        {/* 보낸 시간 (내 메시지는 시간이 왼쪽, 말풍선이 오른쪽) */}
                                        <span className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                            { isDiffTime && (
                                                dayjs(message.time).format("a h:mm")
                                            )}
                                        </span>
                                        {/* 말풍선 본체 (Primary 색상 적용) */}
                                        <div className="bg-primary text-white rounded-3 p-2 px-3 shadow-sm">
                                            {message.content}
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex justify-content-start" key={index}>
                                <div className="d-flex flex-column align-items-start">
                                    {/* 보낸 사람 이름 */}
                                    { (!my && isDiffSender) && (
                                    <span className="small text-muted mb-1 fw-bold">
                                        상담원
                                    </span>
                                    )}
                                    <div className="d-flex align-items-end gap-2">
                                        {/* 말풍선 본체 */}
                                        <div className="bg-white border rounded-3 p-2 px-3 shadow-sm">
                                            {message.content}
                                        </div>
                                        {/* 보낸 시간 */}
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
                }, [history])}
            </div>

            {/* 하단 메시지 입력 및 전송 영역 */}
            <div className="p-3 border-top bg-white rounded-bottom-3">
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
                    <Button variant="primary" className="d-flex align-items-center justify-content-center text-nowrap fw-bold px-3"
                        disabled={isConnect === false} onClick={sendMessage}>
                        <FaPaperPlane />
                        <span className="d-none d-md-inline ms-1">전송</span>
                    </Button>
                </div>
            </div>
        </div>
        )}
    </>)
}