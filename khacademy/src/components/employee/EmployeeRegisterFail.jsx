import Jumbotron from "@templates/Jumbotron";
import { Button, Col, Row } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function EmployeeRegisterFail() {
    
    return(<>
        <Jumbotron title="회원가입 오류 발생" content="일시적인 오류가 발생했습니다"/>

        <Row className="mt-4">
            <Col>
                <h2>일시적인 오류가 발생했습니다</h2>
                <p>잠시 후 다시 실행해주세요</p>
            </Col>
        </Row>
        <Row className="mt-4">
            <Col>
                <Button variant="info" className="w-100"
                    as={Link} to={`/employee/register`}>
                    <FaUserPlus/>
                    <span className="ms-2">다시 가입하기</span>
                </Button>
            </Col>
        </Row>
    </>)
}