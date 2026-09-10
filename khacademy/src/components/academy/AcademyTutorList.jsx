import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import { Link } from "react-router-dom";
import { FaChevronRight, FaMagnifyingGlass } from "react-icons/fa6";
import NoImage from "@assets/no-image.png";

const PAGE_SIZE = 10;

export default function AcademyTutorList() {
    //state
    //- 검색어 입력값(draft)
    const [tutorName, setTutorName] = useState("");
    //- 실제 조회에 사용하는 파라미터 (검색 버튼/과목 선택/페이지 이동 시에만 변경)
    const [params, setParams] = useState({ page: 1, tutorName: "", academySubjectNo: null });
    //- 과목 필터 목록
    const [academySubjectList, setAcademySubjectList] = useState([]);
    //- 백엔드 PageResponseVO 응답
    const [pageResponse, setPageResponse] = useState({
        list: [],
        totalCount: 0,
        page: 1,
        size: PAGE_SIZE,
        totalPages: 0,
        startBlock: 1,
        endBlock: 0,
        prev: false,
        next: false,
    });

    //callback
    const loadData = useCallback(async () => {
        const response = await apiClient.get("/tutor", {
            params: {
                page: params.page,
                size: PAGE_SIZE,
                tutorName: params.tutorName || undefined,
                academySubjectNo: params.academySubjectNo ?? undefined,
            },
        });
        setPageResponse(response.data);
    }, [params]);

    const loadSubjectList = useCallback(async () => {
        const response = await apiClient.get("/academy/");
        setAcademySubjectList(response.data?.subjectList ?? []);
    }, []);

    //effect
    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadSubjectList();
    }, [loadSubjectList]);

    //검색 실행 (1페이지로 리셋)
    const handleSearch = useCallback((e) => {
        e?.preventDefault();
        setParams((prev) => ({ ...prev, page: 1, tutorName: tutorName.trim() }));
    }, [tutorName]);

    //과목 필터 선택 (1페이지로 리셋)
    const handleSubjectFilter = useCallback((academySubjectNo) => {
        setParams((prev) => ({ ...prev, page: 1, academySubjectNo }));
    }, []);

    //페이지 이동
    const handlePageChange = useCallback((page) => {
        setParams((prev) => ({ ...prev, page }));
    }, []);

    const tutorList = pageResponse.list ?? [];

    return (<>
        <Jumbotron title="비로그인이 보는 강사목록" />

        <Row className="mt-4 g-2">
            <Col md={6} lg={4}>
                <Form onSubmit={handleSearch}>
                    <InputGroup>
                        <Form.Control
                            placeholder="강사명 검색"
                            value={tutorName}
                            onChange={(e) => setTutorName(e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                            <FaMagnifyingGlass className="me-1" />
                            <span>검색</span>
                        </Button>
                    </InputGroup>
                </Form>
            </Col>
        </Row>

        <Row className="mt-2">
            <Col>
                <Button
                    size="sm"
                    className="me-2 mb-2"
                    variant={params.academySubjectNo == null ? "primary" : "outline-secondary"}
                    onClick={() => handleSubjectFilter(null)}>
                    전체
                </Button>
                {academySubjectList.map((subject) => (
                    <Button
                        key={subject.academySubjectNo}
                        size="sm"
                        className="me-2 mb-2"
                        variant={
                            params.academySubjectNo === subject.academySubjectNo
                                ? "primary"
                                : "outline-secondary"
                        }
                        onClick={() => handleSubjectFilter(subject.academySubjectNo)}>
                        {subject.academySubjectName}
                    </Button>
                ))}
            </Col>
        </Row>

        <span className="d-block mt-2">총 {pageResponse.totalCount}명의 강사</span>

        <Row className="g-3 mt-1">
            {tutorList.length === 0 ? (
                <Col xs={12}>
                    <p className="text-muted text-center py-5 mb-0">
                        조회된 강사가 없습니다.
                    </p>
                </Col>
            ) : (
                tutorList.map((tutor) => (
                    <Col key={tutor.tutorNo} xs={12}>
                        <Card
                            as={Link}
                            to={`/academy/tutor/${tutor.tutorNo}`}
                            className="text-decoration-none text-reset">
                            <Card.Body className="d-flex align-items-center">
                                <img
                                    src={
                                        tutor.image
                                            ? `${import.meta.env.VITE_SERVER_URL}/api/attach/${tutor.image.attachNo}`
                                            : NoImage
                                    }
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
                ))
            )}
        </Row>

        <PaginationBar
            page={pageResponse.page}
            totalPages={pageResponse.totalPages}
            startBlock={pageResponse.startBlock}
            endBlock={pageResponse.endBlock}
            prev={pageResponse.prev}
            next={pageResponse.next}
            onChange={handlePageChange}
        />
    </>)
}
