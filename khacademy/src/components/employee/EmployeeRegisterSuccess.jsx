import Jumbotron from "@templates/Jumbotron";
import { Button, Col, Row } from "react-bootstrap";
import { FaRightFromBracket, FaUserPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function EmployeeRegisterSuccess() {
    
    return(<>
        <Jumbotron title="회원가입 완료"/>

        <Row className="mt-4">
            <Col>
                <h2>가입해주셔서 감사합니다</h2>
                <p>로그인 후 회원 전용 기능을 이용해주세요</p>
            </Col>
        </Row>
        <Row className="mt-4">
            <Col>
                <Button variant="info" className="w-100"
                    as={Link} to={`/employee/login`}>
                    <FaRightFromBracket/>
                    <span className="ms-2">로그인하기</span>
                </Button>
            </Col>
        </Row>
    </>)
}