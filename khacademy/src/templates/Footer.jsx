
import { Link } from "react-router-dom";
import { useAcademy } from "@templates/menu/useAcademyName";
import "@templates/menu/menu.css";
import { useAtomValue } from "jotai";
import AcademyChat from "@components/academy/AcademyChat";
import Student from "@guard/Student";
import Alarm from "@components/employee/alarm/Alarm";
import { isLoginState, isEmployeeState } from "@utils/storage";
// API에 없는 항목은 하드코딩 폴백 유지
const FALLBACK = {
    name: "KH정보교육원",
    address: "OO시 OO구 OO동 000-000번지",
    phone: "(02) 1234-5678",
    owner: "피카츄",
};

export default function Footer() {
    const academy = useAcademy();

    const name = academy?.academyName || FALLBACK.name;
    const address = academy?.academyAddress || FALLBACK.address;
    const phone = academy?.academyPhone || FALLBACK.phone;
    const year = new Date().getFullYear();
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);

    return (
        <>
            {isLogin && isEmployee && (
                <Alarm />
            )}
            <footer className="kh-footer">
                <div className="kh-footer-main">
                    <div className="kh-footer-info">
                        <div className="kh-footer-brand">{name}</div>
                        <p>{address}</p>
                        <p>대표자 {FALLBACK.owner}</p>
                        <p>고객센터 {phone}</p>
                    </div>

                    <nav className="kh-footer-links">
                        <Link to="/academy">학원소개</Link>
                        <span>이용약관</span>
                        <span>개인정보 처리방침</span>
                    </nav>




                </div>

                <div className="kh-footer-copy">
                    Copyright © {year} {name}. All rights reserved.
                </div>
            </footer>
        </>
    );
}
