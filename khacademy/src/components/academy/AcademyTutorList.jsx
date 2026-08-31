import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
export default function AcademyTutorList() {
    //state
    const [tutorList, setTutorList] = useState([]);

    //callback
    const loadData = useCallback(async () => {
        const response = await apiClient.get("/tutor/")
        setTutorList(response.data);
    }, []);

    //effect
    useEffect(() => {
        loadData();
    }, []);

    return (<>
        <Jumbotron title="비로그인이 보는 강사목록" />
        <span>총 {tutorList.length}명의 강사</span>
        <Row className="g-3 mt-4">
            {tutorList.map((tutor) => (
                <Col key={tutor.tutorNo} xs={12}>
                    <Card
                        as={Link}
                        to={`/academy/tutor/${tutor.tutorNo}`}
                        className="text-decoration-none text-reset">
                        <Card.Body className="d-flex align-items-center">
                            <img
                                src={`https://picsum.photos/seed/tutor-${tutor.tutorNo}/160/160`}
                                alt={`${tutor.accountName} 강사`}
                                className="rounded-circle me-4"
                                width={100}
                                height={100}
                                style={{ objectFit: "cover" }}
                            />

                            <div className="flex-grow-1">
                                <Card.Title className="fw-bold mb-2">
                                    {tutor.accountName} 강사
                                </Card.Title>

                                <Card.Text className="text-muted mb-0">
                                    {tutor.tutorTagline}
                                </Card.Text>
                            </div>

                            <FaChevronRight
                                className="text-muted ms-3"
                                size={20}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    </>)
}