import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useAlarmSse(isLogin) {

    useEffect(() => {

        if (!isLogin) return;

        const eventSource = new EventSource(
            `${import.meta.env.VITE_SERVER_URL}/api/sse/connect`,
            {
                withCredentials: true
            }
        );

        // 연결 성공
        eventSource.addEventListener("connect", (event) => {
            console.log("SSE 연결 성공", event.data);
        });

        // 알림 수신
        eventSource.addEventListener("alarm", (event) => {
            console.log("알림 도착", event.data);

            toast.info(event.data);
        });

        // 연결 오류
        eventSource.onerror = (error) => {
            console.error("SSE 연결 오류", error);
        };

        // 로그아웃 또는 컴포넌트 제거 시 연결 종료
        return () => {
            eventSource.close();
        };

    }, [isLogin]);
}