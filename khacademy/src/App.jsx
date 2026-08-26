import { Route, Routes } from "react-router-dom"
import './App.css'
import Header from "@templates/Header"
import Menu from "@templates/Menu"
import Body from "@templates/Body"
import Footer from "@templates/Footer"
import Container from "react-bootstrap/esm/Container"
import Row from "react-bootstrap/esm/Row"
import Col from "react-bootstrap/esm/Col"
import { ToastContainer, Bounce } from "react-toastify";

function App() {

  return (
    <Container fluid>
      {/* 헤더 */}
      <Row className="d-none d-md-block my-4">
        <Col className="py-2">
          <Header/>
        </Col>
      </Row>

      {/* 메뉴 */}
      <Menu />

      {/* 본문 */}
      <Row className="my-4" style={ { minHeight: 450 } }>
        <Col sm={ {span:10, offset:1} } md={ {span:8, offset:2} }>
          <Body/>
        </Col>
      </Row>

      <hr/>
      <Row className="mt-4">
        <Col>
          <Footer/>
        </Col>
      </Row>

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
