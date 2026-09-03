import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaArrowLeft, FaCommentDots, FaGraduationCap, FaPhone } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";
import NoImage from "@assets/no-image.png";

export default function AcademyTutorDetail() {
    // URL
    const { tutorNo } = useParams();
    const navigate = useNavigate();

    // 강사 전체 입력정보
    const [tutor, setTutor] = useState({
        tutor: {
            tutorNo: 0,
            employeeNo: "",
            accountName: "",
            tutorTagline: "",
            tutorIntro: ""
        },
        careerList: [],
        subjectList: [],
        image: null
    });

    // 학원에 등록된 과목 목록=
    const [academySubjectList, setAcademySubjectList] = useState([]);

    const loadTutor = useCallback(async () => {
        const [academyResponse, tutorResponse] =
            //api한번에 하는 처리인거 같음
            await Promise.all([
                apiClient.get("/academy/"),
                apiClient.get(`/tutor/${tutorNo}`)
            ]);

        // 학원 과목가져와서 리스트에 넣기
        const academySubjects = academyResponse.data?.subjectList ?? [];

        setAcademySubjectList(academySubjects);

        // 강사 상세
        const data = tutorResponse.data;

        if (!data) {
            toast.error("강사 정보를 찾을 수 없습니다.");
            navigate("/academy/tutor");
            return;
        }

        // 담당과목 번호를 이용해서 과목명 붙이기
        const subjectList = (data.subjectList ?? []).map(
            tutorSubject => {
                const academySubject =
                    academySubjects.find(
                        subject =>
                            subject.academySubjectNo ===
                            Number(tutorSubject.academySubjectNo)
                    );

                return {
                    ...tutorSubject,

                    academySubjectName:
                        tutorSubject.academySubjectName ??
                        academySubject?.academySubjectName ??
                        ""
                };
            }
        );

        //강사 정보 조회후 입력
        setTutor({
            tutor: {
                tutorNo: data.tutorNo,
                employeeNo: data.employeeNo,
                accountName: data.accountName ?? "",
                tutorTagline: data.tutorTagline ?? "",
                tutorIntro: data.tutorIntro ?? ""
            },
            careerList: data.careerList ?? [],
            subjectList: subjectList,
            image: data.image ?? null
        });
    }, [tutorNo, navigate]);

    useEffect(() => {
        loadTutor();
    }, [loadTutor]);

    // 화면에 표시할 강사 기본정보
    const info = tutor.tutor;

    return (
        <>
            <Jumbotron title={info.accountName ? `${info.accountName} 강사` : "강사 소개"} />

            {/* 뒤로가기 */}
            <Row className="mb-3">
                <Col>
                    <Button
                        variant="link"
                        className="text-decoration-none px-0 fw-bold"
                        onClick={() => navigate("/academy/tutor")}>
                        <FaArrowLeft className="me-2" />
                        <span>강사진 목록</span>
                    </Button>
                </Col>
            </Row>

            {/* 강사 프로필 카드 */}
            <Row>
                <Col>
                    <Card className="text-center mb-4">
                        <Card.Body className="py-5">
                            <img
                                src={
                                    tutor.image
                                            ? `${import.meta.env.VITE_SERVER_URL}/api/attach/${tutor.image.attachNo}`
                                            : NoImage
                                }
                                alt={`${info.accountName} 강사`}
                                className="rounded-circle mb-3"
                                width={140}
                                height={140}
                                style={{ objectFit: "cover" }}
                            />

                            <h2 className="fw-bold mb-2">
                                {info.accountName} 강사
                            </h2>

                            <div className="d-flex justify-content-center flex-wrap gap-2">
                                {tutor.subjectList.map((subject, index) => (
                                    <Badge
                                        key={subject.tutorSubjectNo ?? subject.academySubjectNo ?? index}
                                        bg="primary"
                                        pill
                                        className="px-3 py-2">
                                        {subject.academySubjectName}
                                    </Badge>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 소개 */}
            <Row className="mt-4">
                <Col>
                    <h3 className="fw-bold mb-3">
                        <Badge bg="primary" className="me-2">소개</Badge>
                    </h3>
                    <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                        {info.tutorIntro}
                    </p>
                </Col>
            </Row>

            <hr className="mt-4" />

            {/* 경력 및 학력 */}
            <Row className="mt-4">
                <Col>
                    <h3 className="fw-bold mb-3">
                        <FaGraduationCap className="text-primary me-2" />
                        <span>경력 및 학력</span>
                    </h3>
                    <ul className="list-unstyled">
                        {tutor.careerList.map((career, index) => (
                            <li
                                key={career.tutorCareerNo ?? index}
                                className="d-flex gap-3 py-2 border-bottom">
                                <span className="fw-bold text-primary text-nowrap">
                                    {career.tutorCareerType}
                                </span>
                                <span>{career.tutorCareerContent}</span>
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row>
        </>
    );
}
