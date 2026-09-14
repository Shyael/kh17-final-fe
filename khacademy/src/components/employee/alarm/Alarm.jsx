import { useCallback, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { Link } from "react-router-dom";

export default function Alarm() {
    const [client, setClient] = useState(null);//서버와의 연결정보를 가진 객체

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
                //신규채팅방 체크
                client.subscribe(`/public/room/check`, (message)=>{
                    const json = JSON.parse(message.body);
                    //toast.success('신규 상담 채팅이 도착했습니다'); 
                    toast.info(
                        <div>
                            신규 상담 채팅
                            <Link to="/employee/consult/chat">
                                <span class="fs-6 badge rounded-pill bg-primary ms-2">확인하기</span>
                            </Link>
                        </div>,
                        {
                            autoClose: false
                        }
                    );
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
    }, []);
    //연결 종료 함수
    const disconnectFromServer = useCallback((client)=>{
        if(client) {//client가 존재한다면
            client.deactivate();//비활성화
        }
    }, []);
    //연결 및 해제
    useEffect(()=>{
        //최초 1회 실행해야할 작업
        const client = connectToServer();
        setClient(client);

        //페이지 이탈 시 해야할 작업
        return ()=>{
            disconnectFromServer(client);
            setClient(null);
        };
    }, [connectToServer]);

    return (<>

    </>)
}