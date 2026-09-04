import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Nav } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { loginUserState, isLoginState, isEmployeeState, logoutActionState, loginActionState } from "@utils/storage";
import { useCallback } from "react";
import { authClient } from "@utils/reaxios";
import { FaUserCircle, FaSignOutAlt, FaChalkboardTeacher } from "react-icons/fa";

export default function Menu() {
    const [loginUser, setLoginUser] = useAtom(loginUserState);
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);
    
    const loginAction = useSetAtom(loginActionState);
    const logoutAction = useSetAtom(logoutActionState);

    const logout = useCallback(async () => {
        try {
            await authClient.delete("/logout");
        } catch (e) {
            console.error(e);
        } finally {
            logoutAction(); 
        }
    }, [logoutAction]);

    return (
        <div 
            className="d-flex flex-column flex-shrink-0 p-3 shadow-sm" 
            style={{ 
                width: "260px", 
                height: "100vh", 
                position: "fixed", 
                top: 0, 
                left: 0, 
                backgroundColor: "var(--color-surface)", 
                borderRight: "1px solid var(--color-border)",
                zIndex: 1000,
                fontFamily: "'Pretendard', sans-serif"
            }}
        >
            {/* 브랜드 로고 영역 */}
            <Link to={isLogin ? "/" : "/employee/login"} className="d-flex align-items-center mb-4 mt-2 me-md-auto text-decoration-none px-2">
                <FaChalkboardTeacher size={24} style={{ color: "var(--color-accent-gold)" }} className="me-2" />
                <span className="fs-4 fw-bolder" style={{ color: "var(--color-text-main)", letterSpacing: "-1px" }}>KH EDU</span>
            </Link>
            <hr style={{ borderColor: "var(--color-border)", margin: "0 0 1rem 0" }} />

            {/* 메뉴 영역 */}
            {isLogin ? (
                <>
                    <Nav className="nav-pills flex-column mb-auto gap-1">
                        <div className="text-muted small fw-bold px-3 py-2 mt-2" style={{ color: "var(--color-text-muted)" }}>상담관리</div>
                        <Nav.Link as={Link} to="/consult/reservation" className="text-dark fw-semibold px-3 py-2" style={{ color: "var(--color-text-main)", borderRadius: "8px" }}>
                            상담 예약 목록
                        </Nav.Link>
                        <Nav.Link as={Link} to="/consult/" className="text-dark fw-semibold px-3 py-2" style={{ color: "var(--color-text-main)", borderRadius: "8px" }}>
                            상담 등록
                        </Nav.Link>

                        <div className="text-muted small fw-bold px-3 py-2 mt-3" style={{ color: "var(--color-text-muted)" }}>수납관리</div>
                        <Nav.Link as={Link} to="/payment/list" className="text-dark fw-semibold px-3 py-2" style={{ color: "var(--color-text-main)", borderRadius: "8px" }}>
                            수납 목록
                        </Nav.Link>
                        <Nav.Link as={Link} to="/payment/discount" className="text-dark fw-semibold px-3 py-2" style={{ color: "var(--color-text-main)", borderRadius: "8px" }}>
                            할인 관리
                        </Nav.Link>

                        <div className="text-muted small fw-bold px-3 py-2 mt-3" style={{ color: "var(--color-text-muted)" }}>학생/직원관리</div>
                        {/* 현재 페이지를 활성화된 것처럼 돋보이게 처리 (골드 포인트) */}
                        <Nav.Link as={Link} to="/student/list" className="fw-bold px-3 py-2" style={{ backgroundColor: "var(--color-surface-white)", color: "var(--color-accent-gold)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                            학생 목록
                        </Nav.Link>
                        <Nav.Link as={Link} to="/employee/register" className="text-dark fw-semibold px-3 py-2" style={{ color: "var(--color-text-main)", borderRadius: "8px" }}>
                            직원 등록
                        </Nav.Link>
                    </Nav>

                    <hr style={{ borderColor: "var(--color-border)" }} />
                    
                    {/* 하단 유저 정보 및 로그아웃 */}
                    <div className="d-flex align-items-center justify-content-between px-2 pb-2">
                        <Link to="/account/mypage" className="d-flex align-items-center text-decoration-none" style={{ color: "var(--color-text-main)" }}>
                            <FaUserCircle size={32} style={{ color: "var(--color-border)" }} className="me-2" />
                            <div className="d-flex flex-column">
                                <span className="fw-bold" style={{ fontSize: "0.95rem" }}>내 정보</span>
                                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>관리자 설정</span>
                            </div>
                        </Link>
                        <button onClick={logout} className="btn btn-link p-0 text-decoration-none" style={{ color: "var(--color-point-pink)" }} title="로그아웃">
                            <FaSignOutAlt size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="mt-auto p-3">
                    <Link to="/employee/login" className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: "var(--color-accent-gold)", color: "var(--color-surface-white)", borderRadius: "8px" }}>
                        로그인
                    </Link>
                </div>
            )}
        </div>
    );
}