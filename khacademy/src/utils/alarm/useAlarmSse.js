import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function useAlarmSse(isLogin) {
const navigate = useNavigate();
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

        eventSource.addEventListener("alarm", (event) => {

            console.log("원본 알림:", event.data);

            let alarm;

            try {
                alarm = JSON.parse(event.data);
            }
            catch {
                // 기존 단순 문자열 알림 처리
                toast.info(event.data);
                return;
            }

            // JSON 알림 처리
            toast.info(alarm.message, {
                onClick: () => {
                    if (
                        typeof alarm.targetUrl === "string" &&
                        alarm.targetUrl.startsWith("/") &&
                        !alarm.targetUrl.startsWith("//") &&
                        !alarm.targetUrl.includes("\\")
                    ) {
                        navigate(alarm.targetUrl);
                    }
                }
            });

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