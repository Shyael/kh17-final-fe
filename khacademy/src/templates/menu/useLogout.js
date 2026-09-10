import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { logoutActionState } from "@utils/storage";
import { authClient } from "@utils/reaxios";

// 서버에 로그아웃 요청 후 Jotai 저장소를 초기화하는 공용 훅
export default function useLogout() {
    const logoutAction = useSetAtom(logoutActionState);

    return useCallback(async () => {
        try {
            await authClient.delete("/logout"); // 쿠키 삭제 요청
        }
        catch (e) {
            console.error(e);
        }
        finally {
            logoutAction(); // 에러여부와 관계없이 화면상의 데이터는 삭제
        }
    }, [logoutAction]);
}
