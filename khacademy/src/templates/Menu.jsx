import { useAtomValue } from "jotai";
import { isLoginState, isEmployeeState } from "@utils/storage";
import TopMenu from "@templates/menu/TopMenu";

/**
 * 메뉴 디스패처
 * - 비로그인 / 학생 / 학부모 : 상단 메뉴바(TopMenu)
 * - 직원 : App.jsx 의 EmployeeLayout(좌측 사이드바)에서 처리하므로 여기서는 렌더링하지 않음
 */
export default function Menu() {
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);

    if (isLogin && isEmployee) {
        return null;
    }

    return <TopMenu />;
}
