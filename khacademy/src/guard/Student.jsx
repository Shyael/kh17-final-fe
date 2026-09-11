
import { useAtomValue } from "jotai";
import { isEmployeeState, isLoginState } from "@utils/storage";

export default function Student({ children }) {
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);

    if(isLogin !== true) {//로그인 상태가 아니라면
        return;
    }

    if(isEmployee === true) {//직원이라면
        return;
    }

    return children;
}