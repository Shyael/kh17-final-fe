import Jumbotron from "@templates/Jumbotron";
import PaginationBar from "@templates/PaginationBar";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import { apiClient } from "@utils/reaxios";
import { Link } from "react-router-dom";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";

const PAGE_SIZE = 10;

export default function TutorList() {

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
        <Jumbotron title="강사정보 리스트" />

        <Row className="mt-4">
            <Col className="text-end">
                {/* 위치 나중에 생기면 수정 */}
                <Button as={Link} to={`/employee/tutor/add`} variant="success" className="ms-2">
                    <FaPlus className="me-2" />
                    <span>강사정보생성</span>
                </Button>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col className="text-end">
                <Button
                    className="ms-2"
                    variant={params.academySubjectNo == null ? "primary" : "secondary"}
                    onClick={() => handleSubjectFilter(null)}>
                    <span>전체</span>
                </Button>
                {academySubjectList.map((subject) => (
                    <Button
                        key={subject.academySubjectNo}
                        className="ms-2"
                        variant={
                            params.academySubjectNo === subject.academySubjectNo
                                ? "primary"
                                : "secondary"
                        }
                        onClick={() => handleSubjectFilter(subject.academySubjectNo)}>
                        <span>{subject.academySubjectName}</span>
                    </Button>
                ))}
            </Col>
        </Row>

        <Row className="mt-4">
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

        <Row className="mt-3">
            <Col>
                <span className="text-muted">
                    총 {pageResponse.totalCount}명의 강사
                </span>
            </Col>
        </Row>

        <Row className="mt-2">
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
                        {tutorList.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center text-muted py-4">
                                    조회된 강사가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            tutorList.map(tutor => (
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
                            ))
                        )}
                    </tbody>
                </Table>

                <PaginationBar
                    page={pageResponse.page}
                    totalPages={pageResponse.totalPages}
                    startBlock={pageResponse.startBlock}
                    endBlock={pageResponse.endBlock}
                    prev={pageResponse.prev}
                    next={pageResponse.next}
                    onChange={handlePageChange}
                />
            </Col>
        </Row>
    </>)
}
