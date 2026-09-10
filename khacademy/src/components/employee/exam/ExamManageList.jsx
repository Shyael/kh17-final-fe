import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Col, Row, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";

export default function ExamManageList() {
    const navigate = useNavigate();

    //시험 목록
    const [examList, setExamList] = useState([]);

    //시험 목록 조회
    const loadExamList = useCallback(async () => {
        try {
            const response = await apiClient.get("/exam/manage");
            setExamList(response.data);
        }
        catch (e) {
            console.error(e);
        }
    }, []);

    //최초 1회 조회
    useEffect(() => {
        loadExamList();
    }, [loadExamList]);

    // 공개 상태에서 현재시간 기준 세부 단계 계산
    // 현재 < examStart              → "응시 예정"
    // examStart <= 현재 < examEnd   → "진행중"
    // 현재 >= examEnd               → "시험 종료"
    const getOpenPhase = (start, end) => {

        const now = new Date();

        if (start && now < new Date(start)) return "응시 예정";
        if (end && now < new Date(end)) return "진행중";
        return "시험 종료";
    };

   // 시험 상태 Badge
    const getStatusBadge = (exam) => {

        switch (exam.examStatus) {

            case "작성중":
                return (
                    <Badge bg="secondary">작성중</Badge>
                );

            case "공개": {

                const phase = getOpenPhase(exam.examStart, exam.examEnd);

                const bg = phase === "응시 예정"
                    ? "info"
                    : phase === "진행중"
                        ? "success"
                        : "dark";

                return (
                    <Badge bg={bg}>{phase}</Badge>
                );
            }

            case "마감":
                return (
                    <Badge bg="dark">마감</Badge>
                );

            default:
                return (
                    <Badge bg="secondary">{exam.examStatus}</Badge>
                );
        }
    };

    // 상태에 따른 맨 오른쪽 관리 버튼
    const renderManageButton = (exam) => {

        // 작성중 → 수정 (링크 구현 완료)
        if (exam.examStatus === "작성중") {
            return (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/employee/exam/${exam.examNo}`)}
                >
                    수정
                </Button>
            );
        }

        // 공개 → 시험 종료면 결과 보기, 그 외(응시 예정/진행중)는 응시 현황
        if (exam.examStatus === "공개") {

            const phase = getOpenPhase(exam.examStart, exam.examEnd);

            const label = phase === "시험 종료"
                ? "결과 보기"
                : "응시 현황";

            return (
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/employee/exam/${exam.examNo}/result`)}
                >
                    {label}
                </Button>
            );
        }

        // 마감 → 결과 보기
        return (
            <Button
                size="sm"
                variant="outline-primary"
                onClick={() => navigate(`/employee/exam/${exam.examNo}/result`)}
            >
                결과 보기
            </Button>
        );
    };

    // 날짜 출력
    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // 응시기간(시작~종료) 출력
    const formatDateRange = (start, end) => (
        <>
            {formatDate(start)}
            <span className="text-muted"> ~ </span>
            {formatDate(end)}
        </>
    );

    return (<>
        <Jumbotron title="시험정보 리스트" />

        <Row className="mt-4">
            <Col className="text-end">
                <Button as={Link} to={`/employee/exam/add`} variant="success" className="ms-2">
                    <FaPlus className="me-2" />
                    <span>신규시험생성</span>
                </Button>
            </Col>
        </Row>

        <Row className="mt-4">
            <Col>
                <Table responsive striped hover className="text-nowrap">
                    <thead>
                        <tr>
                            <th className="d-none d-md-table-cell">번호</th>
                            <th>강의명</th>
                            <th>시험명</th>
                            <th>응시기간</th>
                            <th className="d-none d-md-table-cell">제한시간</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examList.map(exam => (
                            <tr key={exam.examNo}>
                                <td className="d-none d-md-table-cell">{exam.examNo}</td>
                                <td>{exam.courseTitle}</td>
                                <td className="text-start">{exam.examTitle}</td>
                                <td>{formatDateRange(exam.examStart, exam.examEnd)}</td>
                                <td className="d-none d-md-table-cell">
                                    {exam.examLimit ? `${exam.examLimit}분` : "제한 없음"}
                                </td>
                                <td>{getStatusBadge(exam)}</td>
                                <td>{renderManageButton(exam)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Col>
        </Row>

    </>)
}