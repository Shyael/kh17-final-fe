import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import { Link } from "react-router-dom";

export default function TutorList(){

    //state
    const [tutorList, setTutorList] = useState([]);

    //callback
    const loadData = useCallback(async()=>{
        const response = await apiClient.get("/tutor/")
        setTutorList(response.data); 
    },[]);    
    
    //effect
    useEffect(()=>{
        loadData();
    }, []);

    return(<>
        <Jumbotron title="강사정보 리스트"/>

        <Row className="mt-4">
            <Col className="text-end">
                <Button className="ms-2" variant="secondary">
                    <span>수학</span>
                </Button>
                <Button className="ms-2" variant="secondary">
                    <span>영어</span>
                </Button>
                <Button className="ms-2" variant="secondary">
                    <span>과학</span>
                </Button>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col>
                <Table responsive striped hover className="text-nowrap">
                    <thead>
                        <tr>
                            <th>강사번호</th>
                            <th>강사명</th>
                            <th>전화번호</th>
                            <th>한줄소개</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tutorList.map(tutor =>(
                            <tr key={tutor.tutorNo}>
                                <td>{tutor.tutorNo}</td>
                                <td>
                                    <Link to={`/employee/tutor/${tutor.tutorNo}`}>
                                        {tutor.accountName}
                                    </Link>
                                </td>
                                <td>{tutor.accountPhone}</td>
                                <td>{tutor.tutorTagline}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Col>
        </Row>
    </>)
}