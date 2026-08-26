import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from "react-router-dom";
import { loginUserState } from "@utils/storage";
import { useCallback, useMemo } from "react";
import { RESET } from "jotai/utils";
import { isLoginState, isEmployeeState } from "@utils/storage";
import { logoutActionState } from "@utils/storage";
import axios from "axios";
import { loginActionState } from "@utils/storage";
import { authClient } from "@utils/reaxios";
import { FaCartShopping } from "react-icons/fa6";

export default function Menu() {
    //메뉴에서는 로그인 상태 데이터가 필요하다
    const [loginUser, setLoginUser] = useAtom(loginUserState);
    
    //읽기전용 atom을 불러오는법
    //const [isLogin] = useAtom(isLoginState);
    const isLogin = useAtomValue(isLoginState);
    const isEmployee = useAtomValue(isEmployeeState);
    
    const loginAction = useSetAtom(loginActionState);
    const logoutAction = useSetAtom(logoutActionState);

    //서버에 로그아웃 요청 및 Jotai 저장소 초기화 요청을 수행하는 함수
    const logout = useCallback(async ()=>{
        try {
            //await axios.delete("/service/auth/logout");//쿠키 삭제 요청
            await authClient.delete("/logout");//쿠키 삭제 요청
        }
        catch(e){
            console.error(e);
        }
        finally {
            logoutAction();//에러여부와 관계없이 화면상의 데이터는 삭제
        }
    }, []);

    return (<>
        <Navbar expand="md" className="bg-body-tertiary sticky-top"
                    bg="dark" data-bs-theme="dark">
            { isLogin === true ? (<>
            {/* 메뉴 메인 컨테이너 */}
            <Container fluid>
                {/* 메인 브랜드 로고 */}
                <Navbar.Brand as={Link} to="/">KH정보교육원</Navbar.Brand>
                {/* 접이식 버튼(좁은 화면에서만 보임) */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {/* 접이식 영역(좁은 화면에서만 보임) */}
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title="상담관리" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/consult/reservation">상담 예약 목록</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/consult/"></NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/account/mypage">내정보</Nav.Link>
                        <Nav.Link onClick={logout}>로그아웃</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </>) : (<>
            <Container fluid>
                <Navbar.Brand as={Link} to="/employee/login">KH정보교육원</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <Nav.Link as={Link} to="/employee/login">로그인</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </>)}
        </Navbar>
    </>)
}