import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import { FaMagnifyingGlass } from "react-icons/fa6";
import TutorCard from "./TutorCard";

// 카드 그리드가 화면 크기별 컬럼 수(1/2/3/4/6)로 나눠떨어지도록 12의 배수로 설정
// (예: 10개면 4열 화면에서 마지막 줄이 2장만 남아 오른쪽이 허전하게 비어 보임)
const PAGE_SIZE = 12;

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
        const response = await apiClient.get("/academy/tutor/", {
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

    return (<div className="kh-external-content">
        <Jumbotron title="강사진 소개" />

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
                    <Col key={tutor.tutorNo} xs={12} sm={6} md={4} lg={3} xl={2}>
                        <TutorCard tutor={tutor} />
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
    </div>)
}
