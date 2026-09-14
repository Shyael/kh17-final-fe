
import { useAtomValue } from "jotai";
import { isEmployeeState, isLoginState } from "@utils/storage";
import NotAuthorized from "@error/NotAuthorized";
import NeedPermission from "@error/NeedPermission";

export default function Employee({ children }) {
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);

    if(isLogin !== true) {//로그인 상태가 아니라면
        return (//오류 화면을 보여주고 끝내라!
            <NotAuthorized/>
        );
    }

    if(isEmployee !== false) {//직원이 아니라면
        return (//오류 화면을 보여주고 끝내라!
            <NeedPermission/>
        );
    }

    return children;
}