import { matchPath, Route, Routes, useLocation } from "react-router-dom"
import './App.css'
import Header from "@templates/Header"
import Menu from "@templates/Menu"
import Body from "@templates/Body"
import Footer from "@templates/Footer"
import Container from "react-bootstrap/esm/Container"
import Row from "react-bootstrap/esm/Row"
import Col from "react-bootstrap/esm/Col"
import { ToastContainer, Bounce } from "react-toastify";
import { useEffect, useState } from "react"

function App() {
  const location = useLocation();

  const isExamAttempt = matchPath(
    "/student/exam/:examNo/attempt/:attemptNo",
    location.pathname
  );
  
  return (
    <Container fluid>
      {/* 헤더(시험 화면일때 안보임) */}
      {!isExamAttempt && (
      <Row className="d-none d-md-block my-4">
        <Col className="py-2">
          <Header/>
        </Col>
      </Row>
      )}

      {/* 메뉴 */}
      {/* 시험 응시 화면이 아닐 때만 메뉴 */}
      {!isExamAttempt && <Menu />}

      {/* 본문 */}
      {/* 시험 응시 화면은 폭 제한 없이 전체 사용 (컴포넌트 내부에서 가운데 정렬) */}
      <Row className={isExamAttempt ? "" : "my-4"} style={ { minHeight: 450 } }>
        {isExamAttempt ? (
          <Col className="px-0">
            <Body/>
          </Col>
        ) : (
          <Col sm={ {span:10, offset:1} } md={ {span:8, offset:2} }>
            <Body/>
          </Col>
        )}
      </Row>

      {/* 푸터 */}
      {!isExamAttempt &&(
        <>
          <hr/>
          <Row className="mt-4">
            <Col>
              <Footer/>
            </Col>
          </Row>
        </>
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
    </Container>
  )
}

export default App
