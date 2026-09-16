import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { loginUserState, isLoginState } from "@utils/storage"; // 본인 프로젝트의 스토리지 경로에 맞게 수정
import Swal from "sweetalert2";

export default function Alarm() {
    const isLogin = useAtomValue(isLoginState);
    const loginUser = useAtomValue(loginUserState);

    useEffect(() => {
        // 로그인 상태가 아니거나 유저 정보(사번 등)가 없으면 연결하지 않음
        if (!isLogin || !loginUser || !loginUser.accountNo) return;

        const serverUrl = import.meta.env.VITE_SERVER_URL;
        
        const token = localStorage.getItem("loginUserState") || "";

        console.log("SSE 연결 시도:", token);
        // 1. EventSource 객체를 생성하여 백엔드 connect 엔드포인트 연결 (Query Parameter로 계정 번호 전달)
        const eventSource = new EventSource(`${serverUrl}/api/sse/connect`, {
            withCredentials: true 
        });

        // 2. 연결 성공 시 (백엔드에서 "connect" 이름으로 보낸 이벤트)
        eventSource.addEventListener("connect", (event) => {
            console.log("SSE 연결 성공:", event.data);
        });

        // 3. 백엔드에서 'alarm' 이름으로 이벤트를 전송했을 때 수신
        eventSource.addEventListener("alarm", (event) => {
            const message = event.data;
            
            // SweetAlert 토스트(Toast) 알람 띄우기
            Swal.fire({
                title: "알림",
                text: message,
                icon: "info",
                toast: true,
                position: "top-end", // 우측 상단에 팝업 형태로 표시
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
            });

            // (선택) 여기에 헤더의 안읽은 알람 카운트나 상태를 업데이트하는 로직을 추가할 수 있습니다.
        });

        // 4. 에러 발생 시 처리 (네트워크 단절 등 브라우저가 자동 재연결을 시도합니다)
        eventSource.onerror = (error) => {
            console.error("SSE 연결 오류 발생:", error);
            eventSource.close();
        };

        // 5. 컴포넌트가 언마운트되거나 로그아웃될 때 연결 안전하게 종료
        return () => {
            eventSource.close();
        };
    }, [isLogin, loginUser]);

    return null; // 화면에 직접 렌더링되는 UI는 없고 백그라운드에서 동작합니다.
}