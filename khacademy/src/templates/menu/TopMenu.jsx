import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

import { isLoginState, isEmployeeState, isParentState } from "@utils/storage";
import { childrenState, selectedChildNoState, selectedChildState } from "@utils/storage";

import AcademyConsultReservation from "@components/academy/AcademyConsultReservation";
import useLogout from "@templates/menu/useLogout";
import useAcademyName from "@templates/menu/useAcademyName";
import "@templates/menu/menu.css";

/**
 * 외부/회원용 상단 메뉴바
 * - 비로그인
 * - 학생 / 학부모
 * (직원은 EmployeeLayout 의 좌측 사이드바를 사용)
 */
export default function TopMenu() {
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);
    const isParent = useAtomValue(isParentState);
    const logout = useLogout();

    // 자녀 목록 및 선택된 자녀 (학부모)
    const children = useAtomValue(childrenState);
    const selectedChild = useAtomValue(selectedChildState);
    const [selectedChildNo, setSelectedChildNo] = useAtom(selectedChildNoState);

    const [showModal, setShowModal] = useState(false);

    // 학원 정보에서 받아온 학원 이름 (조회 전/실패 시 "KH정보교육원")
    const academyName = useAcademyName();

    // 스크롤이 맨 위일 때는 헤더 하단 구분선을 숨긴다
    const [atTop, setAtTop] = useState(
        typeof window === "undefined" || window.scrollY <= 0
    );
    useEffect(() => {
        const onScroll = () => setAtTop(window.scrollY <= 0);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 자녀가 있는데 선택된 자녀가 없거나 목록에 없는 번호면 첫번째 자녀로 자동 선택
    useEffect(() => {
        if (children.length === 0) {
            return;
        }
        const exists = children.some(
            child => child.studentNo === selectedChildNo
        );
        if (!exists) {
            setSelectedChildNo(children[0].studentNo);
        }
    }, [children, selectedChildNo, setSelectedChildNo]);

    return (
        <Navbar
            expand="md"
            className={"kh-topnav sticky-top" + (atTop ? " at-top" : "")}
            data-bs-theme="light"
        >
            {/* 비로그인 */}
            {!isLogin && (
                <>
                    <Navbar.Brand as={Link} to="/academy">
                        {academyName}
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="외부페이지" id="public-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/academy">
                                    학원정보
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/academy/tutor">
                                    외부강사목록
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>

                        <Nav className="align-items-md-center gap-md-2">
                            <Nav.Link onClick={() => setShowModal(true)}>
                                상담신청
                            </Nav.Link>
                            <Nav.Link as={Link} to="/member/login" className="kh-btn-outline btn btn-sm">
                                로그인
                            </Nav.Link>
                        </Nav>

                        <AcademyConsultReservation
                            show={showModal}
                            handleClose={() => setShowModal(false)}
                        />
                    </Navbar.Collapse>
                </>
            )}

            {/* 학생 / 학부모 */}
            {isLogin && !isEmployee && (
                <>
                    <Navbar.Brand as={Link} to="/">
                        {academyName}
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="학습관리" id="student-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/student/assignment">
                                    내 과제
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/student/exam">
                                    내 시험
                                </NavDropdown.Item>
                            </NavDropdown>

                            {/* 학부모: 자녀 선택 드롭다운 */}
                            {children.length >= 1 && (
                                <NavDropdown
                                    title={`자녀: ${selectedChild?.studentName ?? "선택"}`}
                                    id="child-nav-dropdown"
                                >
                                    {children.map(child => (
                                        <NavDropdown.Item
                                            key={child.studentNo}
                                            active={child.studentNo === selectedChildNo}
                                            onClick={() => setSelectedChildNo(child.studentNo)}
                                        >
                                            {child.studentName}
                                            <span className="text-muted ms-2">
                                                ({child.relationship})
                                            </span>
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                            )}
                        </Nav>

                        <Nav className="align-items-md-center gap-md-2">
                            <Nav.Link as={Link} to={isParent ? "/Parent/myInfo" : "/student/myInfo"}>
                                내정보
                            </Nav.Link>
                            <Nav.Link onClick={() => logout(`/academy/`)}>
                                로그아웃
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </>
            )}
        </Navbar>
    );
}
