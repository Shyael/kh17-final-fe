import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaArrowRight, FaLocationDot, FaPhone, FaUsers } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { apiClient } from "@utils/reaxios";

export default function AcademyInfo() {

    //state
    const [academy, setAcademy] = useState({
        academy: {
            academyName: "",
            academyTagline: "",
            academyIntro: "",
            academyPhone: "",
            academyAddress: ""
        },
        historyList: [],
        subjectList: []
    });

    const [tutorList, setTutorList] = useState([]);

    //데이터 조회
    //학원정보
    const loadAcademy = useCallback(async () => {
        const response = await apiClient.get("/academy/");
        setAcademy(response.data);
    }, []);

    //강사정보
    const loadTutor = useCallback(async () => {
        const response = await apiClient.get("/tutor/");
        setTutorList(response.data);
    }, []);

    useEffect(() => {
        loadAcademy();
        loadTutor();
    }, [loadAcademy, loadTutor]);

    // 화면에 표시할 학원 기본정보
    const info = academy.academy;

    // 강사 소개 미리보기(최대 3명)
    const previewTutorList = tutorList.slice(0, 3);

    return (
        <>
            <Jumbotron
                title={info.academyName || "학원 소개"}/>

            {/* 메인 배너 이미지 (Lorem Picsum 자리잡기) */}
            <Row>
                <Col>
                    <img
                        src="https://picsum.photos/seed/academy-main/1200/400"
                        alt="메인 배너 이미지"
                        className="img-fluid rounded w-100"
                        style={{ objectFit: "cover", maxHeight: "400px" }}/>
                </Col>
            </Row>

            {/* 캐치프레이즈 + 과목 뱃지 + 소개글 */}
            <Row className="mt-4 text-center">
                <Col>
                    <h2 className="fw-bold">
                        {info.academyTagline}
                    </h2>

                    <div className="my-3 d-flex justify-content-center flex-wrap gap-2">
                        {academy.subjectList.map((subject, index) => (
                            <Badge
                                key={subject.academySubjectNo ?? index}
                                bg="primary"
                                pill
                                className="px-3 py-2">
                                {subject.academySubjectName}
                            </Badge>
                        ))}
                    </div>

                    <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                        {info.academyIntro}
                    </p>
                </Col>
            </Row>

            <hr className="mt-4" />

            {/* 학원 연혁 */}
            <Row className="mt-4">
                <Col>
                    <h3 className="fw-bold mb-3">학원 연혁</h3>
                    <ul className="list-unstyled">
                        {academy.historyList.map((history, index) => (
                            <li
                                key={history.academyHistoryNo ?? index}
                                className="d-flex gap-3 py-2 border-bottom">
                                <span className="fw-bold text-primary text-nowrap">
                                    {history.academyHistoryYear}
                                </span>
                                <span>{history.academyHistoryContent}</span>
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row>

            <hr className="mt-4" />

            {/* 오시는 길 */}
            <Row className="mt-4">
                <Col>
                    <h3 className="fw-bold mb-3">
                        <FaLocationDot className="text-primary me-2" />
                        <span>오시는 길</span>
                    </h3>
                </Col>
            </Row>
            <Row className="align-items-center">
                <Col md={7}>
                    {/* 지도 영역 (나중에 지도 API 연동) */}
                    <img
                        src="https://picsum.photos/seed/academy-map/800/450"
                        alt="지도 영역"
                        className="img-fluid rounded w-100"
                        style={{ objectFit: "cover", maxHeight: "300px" }}
                    />
                </Col>
                <Col md={5} className="mt-3 mt-md-0">
                    {/* 주소는 단순 텍스트 (나중에 API 연동) */}
                    <p className="fw-bold fs-5 mb-1">{info.academyAddress}</p>
                </Col>
            </Row>

            <hr className="mt-4" />

            {/* 강사 소개 */}
            <Row className="mt-4">
                <Col>
                    <h3 className="fw-bold mb-3">
                        <FaUsers className="text-primary me-2" />
                        <span>강사 소개</span>
                    </h3>
                </Col>
            </Row>
            <Row className="g-3">
                {previewTutorList.map((tutor) => (
                    <Col key={tutor.tutorNo} xs={12} md={4}>
                        <Card
                            as={Link}
                            to={`/academy/tutor/${tutor.tutorNo}`}
                            className="h-100 text-center text-decoration-none text-reset">
                            <Card.Body>
                                <img
                                    src={`https://picsum.photos/seed/tutor-${tutor.tutorNo}/160/160`}
                                    alt={`${tutor.accountName} 강사`}
                                    className="rounded-circle mb-3"
                                    width={120}
                                    height={120}
                                    style={{ objectFit: "cover" }}
                                />
                                <Card.Title className="fw-bold mb-1">
                                    {tutor.accountName} 강사
                                </Card.Title>
                                <Card.Text className="text-muted">
                                    {tutor.tutorTagline}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="mt-3">
                <Col className="text-center">
                    <Link
                        to="/academy/tutor"
                        className="text-decoration-none fw-bold">
                        <span>강사진 전체보기</span>
                        <FaArrowRight className="ms-2"/>
                    </Link>
                </Col>
            </Row>

            <hr className="mt-4" />

            {/* 상담 신청 */}
            <Row className="mt-4 mb-5">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title className="fw-bold mb-3">
                                <FaPhone className="text-primary me-2" />
                                <span>상담 신청</span>
                            </Card.Title>

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 border rounded p-3">
                                <div>
                                    <p className="fw-bold fs-4 mb-1">
                                        {info.academyPhone}
                                    </p>
                                </div>

                                <Button
                                    href={`tel:${info.academyPhone}`}
                                    variant="primary"
                                    className="text-nowrap"
                                >
                                    <FaPhone className="me-2" />
                                    <span>전화 걸기</span>
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
