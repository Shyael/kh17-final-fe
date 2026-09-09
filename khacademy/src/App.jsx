import { matchPath, useLocation, Link } from "react-router-dom"
import { useAtomValue } from "jotai"
import './App.css'
import Menu from "@templates/Menu"
import Body from "@templates/Body"
import Footer from "@templates/Footer"
import EmployeeLayout from "@templates/menu/EmployeeLayout"
import useAcademyName from "@templates/menu/useAcademyName"
import Container from "react-bootstrap/esm/Container"
import Row from "react-bootstrap/esm/Row"
import Col from "react-bootstrap/esm/Col"
import { ToastContainer, Bounce } from "react-toastify";
import { isLoginState, isEmployeeState } from "@utils/storage"

// 헤더/푸터 없이 보여줄 인증 화면
// logo: true / false / (location) => boolean
//   - 상단에 홈으로 가는 학원명 로고를 보일지 여부
//   - 직원은 이 화면으로 바로 들어오고 외부페이지로 갈 일이 없어 로고 없음
const AUTH_PATHS = [
  { path: "/member/login", logo: true },
  { path: "/employee/login", logo: false },
  // 아이디/비밀번호 찾기: 어느 로그인에서 넘어왔는지에 따라 로고 표시
  { path: "/account/find", logo: (loc) => loc.state?.loginPath !== "/employee/login" },
];

function App() {
  const location = useLocation();

  const isLogin = useAtomValue(isLoginState);
  const isEmployee = useAtomValue(isEmployeeState);
  const academyName = useAcademyName();

  const isExamAttempt = matchPath(
    "/student/exam/:examNo/attempt/:attemptNo",
    location.pathname
  );

  const authPage = AUTH_PATHS.find(
    ({ path }) => matchPath(path, location.pathname)
  );
  const showAuthLogo = authPage && (
    typeof authPage.logo === "function"
      ? authPage.logo(location)
      : authPage.logo
  );

  // 직원 로그인 시에는 그룹웨어(좌측 사이드바) 레이아웃 사용
  const isEmployeeView = isLogin && isEmployee && !isExamAttempt;

  return (
    <>
      {isEmployeeView ? (
        <EmployeeLayout>
          <Body />
        </EmployeeLayout>
      ) : authPage ? (
        // 인증 화면: 메뉴/푸터 없이 (로고는 외부 회원용 화면에서만)
        <Container fluid>
          {showAuthLogo && (
            <div className="kh-auth-bar">
              <Link to="/" className="kh-auth-logo">{academyName}</Link>
            </div>
          )}
          <Body />
        </Container>
      ) : (
        <Container fluid>
          {/* 메뉴 */}
          {/* 시험 응시 화면이 아닐 때만 메뉴 */}
          {!isExamAttempt && <Menu />}

          {/* 본문 */}
          {/* 시험 응시 화면은 폭 제한 없이 전체 사용 (컴포넌트 내부에서 가운데 정렬) */}
          <Row className={isExamAttempt ? "" : "mt-3 mb-4"} style={{ minHeight: 450 }}>
            {isExamAttempt ? (
              <Col className="px-0">
                <Body />
              </Col>
            ) : (
              <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                <Body />
              </Col>
            )}
          </Row>

          {/* 푸터 */}
          {!isExamAttempt && (
            <Row className="mt-4">
              <Col>
                <Footer />
              </Col>
            </Row>
          )}
        </Container>
      )}

      {/* React Toastify Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        //draggable
        //pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  )
}

export default App
