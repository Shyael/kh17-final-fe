import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";

import { loginUserState } from "@utils/storage";
import AttendanceButton from "@templates/AttendanceButton";
import useLogout from "@templates/menu/useLogout";
import useAcademyName from "@templates/menu/useAcademyName";
import "@templates/menu/menu.css";

/* 직원 사이드바 메뉴 구성 (기존 Menu.jsx 직원 메뉴와 동일한 경로) */
const MENU = [
    { type: "link", icon: "📊", label: "대시보드", to: "/employeeHome" },
    {
        type: "group", icon: "🎓", label: "학생·수업관리", children: [
            { label: "학생 목록", to: "/student/list" },
            { label: "강의 관리", to: "/employee/course/list" },
            { label: "과제 관리", to: "/employee/assignment" },
            { label: "시험 관리", to: "/employee/exam" },
            { label: "성적 관리", to: "/score/" },
        ],
    },
    {
        type: "group", icon: "📅", label: "상담관리", children: [
            { label: "상담 예약 목록", to: "/employee/consult/reservation" },
            { label: "상담 관리", to: "/employee/consult/manage" },
            { label: "채팅 관리", to: "/employee/consult/chat" },
        ],
    },
    {
        type: "group", icon: "💳", label: "수납관리", children: [
            { label: "수납 목록", to: "/payment/list" },
            { label: "할인 관리", to: "/payment/discount" },
        ],
    },
    {
        type: "group", icon: "🧑‍🏫", label: "직원·인사관리", children: [
            { label: "직원 목록", to: "/employee/search" },
            { label: "직원 등록", to: "/employee/register" },
            { label: "계약 관리", to: "/admin/contract/list" },
            { label: "급여 관리", to: "/admin/payroll", end: true },
        ],
    },
    {
        type: "group", icon: "🏫", label: "학원정보관리", children: [
            { label: "학원 정보 관리", to: "/employee/academy" },
            { label: "강사 소개 관리", to: "/employee/tutor" },
        ],
    },
    { type: "link", icon: "⚙️", label: "내 정보", to: "/employee/myInfo" },
];

/**
 * 직원 로그인 시 사용하는 그룹웨어 레이아웃
 * 좌측 고정 사이드바 + 상단 검색바 + 우측 본문(children)
 */
export default function EmployeeLayout({ children }) {
    const location = useLocation();
    const logout = useLogout();
    const loginUser = useAtomValue(loginUserState);
    const academyName = useAcademyName();

    const isAdmin =
    loginUser?.roleNames?.includes("ADMIN") ?? false;

    const userName = loginUser?.accountName ?? loginUser?.name ?? "직원";
    const userDept = loginUser?.department ?? loginUser?.deptName ?? "";
    const avatarText = userName.charAt(0) || "직";

    // 현재 경로가 포함된 그룹은 기본으로 펼침
    const initialOpen = useMemo(() => {
        const map = {};
        MENU.forEach(m => {
            if (m.type === "group") {
                map[m.label] = m.children.some(c =>
                    location.pathname.startsWith(c.to)
                );
            }
        });
        return map;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [open, setOpen] = useState(initialOpen);
    const toggle = (label) =>
        setOpen(prev => ({ ...prev, [label]: !prev[label] }));

    // 사이드바 열림/닫힘 (화면 크기와 무관하게 클릭으로 토글)
    // 처음 진입 시에는 화면이 넓으면 펼친 상태, 좁으면 닫힌 상태로 시작
    const [sidebarOpen, setSidebarOpen] = useState(() =>
        typeof window === "undefined" ? true : window.innerWidth >= 768
    );
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    //로그아웃 처리

    return (
        <div className={"kh-gw-layout" + (sidebarOpen ? " sidebar-open" : "")}>
            {/* 사이드바가 열려있을 때 작은 화면에서 뒤 화면을 덮는 백드롭 (클릭 시 닫힘) */}
            <div className="kh-gw-backdrop" onClick={() => setSidebarOpen(false)} />

            {/* ===== 좌측 사이드바 ===== */}
            <aside className={"kh-gw-sidebar" + (sidebarOpen ? " open" : "")}>
                <div className="kh-gw-sidebar-head">
                    <Link to="/employeeHome" className="brand">{academyName}</Link>
                    <span className="sub">ACADEMY ADMIN</span>
                </div>

                <ul className="kh-gw-menu">
                    {MENU.map(m => m.type === "link" ? (
                        <li key={m.label}>
                            <NavLink
                                to={m.to}
                                end
                                className={({ isActive }) =>
                                    "item-link" + (isActive ? " active" : "")
                                }
                            >
                                <span>{m.icon}</span>{m.label}
                            </NavLink>
                        </li>
                    ) : (
                        <li key={m.label}>
                            <button
                                type="button"
                                className="grp-btn"
                                onClick={() => toggle(m.label)}
                                aria-expanded={!!open[m.label]}
                            >
                                <span>{m.icon}</span>{m.label}
                                <span className="chev">{open[m.label] ? "▾" : "▸"}</span>
                            </button>

                            {open[m.label] && (
                                <ul className="kh-gw-submenu">
                                    {m.children.map(c => (
                                        <li key={c.to}>
                                            <NavLink
                                                to={c.to}
                                                className={({ isActive }) =>
                                                    "item-link" + (isActive ? " active" : "")
                                                }
                                            >
                                                {c.label}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* ===== 우측 메인 ===== */}
            <div className="kh-gw-main">
                <header className="kh-gw-topbar">
                    <button
                        type="button"
                        className="kh-gw-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label="사이드바 열기/닫기"
                        aria-expanded={sidebarOpen}
                    >
                        ☰
                    </button>

                    <div className="kh-gw-topbar-right">
                        {!isAdmin && (
                             <AttendanceButton />
                            )}
                        <div className="kh-gw-user">
                            {/* <div className="kh-gw-avatar">{avatarText}</div> */}
                            <div>
                                <strong>{userName}</strong>
                                {userDept && (
                                    <span className="text-muted ms-1" style={{ fontSize: 11 }}>
                                        ({userDept})
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link to="/employee/myInfo" className="btn btn-outline-secondary btn-sm">
                            내정보
                        </Link>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => logout(`/employee/login`)}
                        >
                            로그아웃
                        </button>
                    </div>
                </header>

                <main className="kh-gw-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
