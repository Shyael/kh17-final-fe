import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useKakaoPostcodePopup } from "react-daum-postcode";
import { FaCheck, FaMagnifyingGlass, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";

export default function AcademyManage() {

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

    // Kakao Post
    const open = useKakaoPostcodePopup(
        "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    );

    //데이터 조회 후 데이터 있는지 확인
    const [isRegistered, setIsRegistered] = useState(false);

    //조회
    const loadAcademy = useCallback(async () => {
        try {
            const response = await apiClient.get("/academy/");

            if (response.data) {
                setAcademy(response.data);
                //데이터 있으면 true
                setIsRegistered(true);
            }
            else {
                //없으면 false
                setIsRegistered(false);
            }
        }
        catch (err) {
            console.error(err);
        }
    }, []);

    //최초진입 조회
    useEffect(() => {
        loadAcademy();
    }, [loadAcademy]);

    //연혁
    const [history, setHistory] = useState({
        academyHistoryYear: "",
        academyHistoryContent: ""
    });

    //과목
    const [subject, setSubject] = useState({
        academySubjectName: ""
    });

    // 문자열 입력값 변경
    const changeStringValue = useCallback((e) => {
        const { name, value } = e.target;

        setAcademy(prev => ({
            ...prev,
            academy: {
                ...prev.academy,
                [name]: value
            }
        }));
    }, []);

    // 우편번호 검색
    const addressSearch = useCallback(() => {

        open({
            onComplete: (data) => {

                // R = 도로명 주소
                // J = 지번 주소
                const address =
                    data.userSelectedType === "R"
                        ? data.roadAddress
                        : data.jibunAddress;

                setAcademy(prev => ({
                    ...prev,
                    academy: {
                        ...prev.academy,
                        academyAddress: address
                    }
                }));
            }
        });

    }, [open]);

    // 주소 삭제
    const addressRemove = useCallback(() => {

        setAcademy(prev => ({
            ...prev,
            academy: {
                ...prev.academy,
                academyAddress: ""
            }
        }));

    }, []);

    // 주소 입력 여부
    const isAddressWritten = academy.academy.academyAddress.length > 0;

    //연혁
    // 새 연혁 입력창
    const changeHistoryValue = useCallback((e) => {
        const { name, value } = e.target;

        setHistory(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 연혁 입력값 변경
    const changeHistoryListValue = useCallback((index, e) => {
        const { name, value } = e.target;

        setAcademy(prev => ({
            ...prev,
            historyList: prev.historyList.map((history, i) =>
                i === index
                    ? {
                        ...history,
                        [name]: value
                    }
                    : history
            )
        }));
    }, []);

    //연혁추가(academy에 있는 history 리스트에 추가)
    const addHistory = useCallback(() => {

        if (!history.academyHistoryYear.trim() || !history.academyHistoryContent.trim()) {
            return;
        }

        setAcademy(prev => ({
            ...prev,
            historyList: [
                ...prev.historyList,
                history
            ]
        }));

        // 입력창 초기화
        setHistory({
            academyHistoryYear: "",
            academyHistoryContent: ""
        });

    }, [history]);

    //과목

    //과목 입력창 
    const changeSubjectValue = useCallback(e => {
        const { name, value } = e.target;

        setSubject(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 과목 입력값 변경
    const changeSubjectListValue = useCallback((index, e) => {
        const { name, value } = e.target;

        setAcademy(prev => ({
            ...prev,
            subjectList: prev.subjectList.map((subject, i) =>
                i === index
                    ? {
                        ...subject,
                        [name]: value
                    }
                    : subject
            )
        }));
    }, []);

    //과목 추가
    const addSubject = useCallback(() => {

        if (!subject.academySubjectName.trim()) {
            return;
        }

        setAcademy(prev => ({
            ...prev,
            subjectList: [
                ...prev.subjectList,
                subject
            ]
        }));

        setSubject({
            academySubjectName: ""
        });

    }, [subject]);

    //등록
    const insertAcademy = useCallback(async () => {
        await apiClient.post("/academy/", academy.academy);

        for (const history of academy.historyList) {
            await apiClient.post("/academy/history", history);
        }

        for (const subject of academy.subjectList) {
            await apiClient.post("/academy/subject", subject);
        }

        toast.success("학원 정보가 등록되었습니다.");
        setIsRegistered(true);

        await loadAcademy();
    }, [academy, loadAcademy]);

    //수정
    const updateAcademy = useCallback(async () => {
        await apiClient.put("/academy/", academy.academy);

        for (const history of academy.historyList) {
            if (history.academyHistoryNo) {
                //기존 값 있으면 수정
                await apiClient.put(
                    `/academy/history/${history.academyHistoryNo}`,
                    history
                );
            }
            else {
                //없으면 등록
                await apiClient.post("/academy/history", history);
            }
        }

        for (const subject of academy.subjectList) {
            if (subject.academySubjectNo) {
                //기존 값 있으면 수정
                await apiClient.put(
                    `/academy/subject/${subject.academySubjectNo}`,
                    subject
                );
            }
            else {
                //없으면 등록
                await apiClient.post("/academy/subject", subject);
            }
        }

        toast.success("학원 정보가 수정되었습니다.");

        await loadAcademy();
    }, [academy, loadAcademy]);

    //연혁삭제처리
    const deleteHistory = useCallback(async (history, index) => {

        // 이미 DB에 등록된 연혁
        if (history.academyHistoryNo) {
            //데이터베이스에서 삭제
            await apiClient.delete(
                `/academy/history/${history.academyHistoryNo}`
            );
        }

        // 새로 만든거 삭제할 때 화면 목록에서 제거
        setAcademy(prev => ({
            ...prev,
            historyList: prev.historyList.filter((_, i) => i !== index)
        }));

    }, []);

    //과목삭제처리
    const deleteSubject = useCallback(async (subject, index) => {

        if (subject.academySubjectNo) {
            await apiClient.delete(
                `/academy/subject/${subject.academySubjectNo}`
            );
        }

        setAcademy(prev => ({
            ...prev,
            subjectList: prev.subjectList.filter((_, i) => i !== index)
        }));

    }, []);


    return (
        <>
            <Jumbotron
                title="학원정보 관리"
                content="외부 고객들이 볼 학원정보를 등록/수정/삭제 할 수 있습니다"
            />

            {/* 학원 정보 */}
            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>학원명</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyName"
                        value={academy.academy.academyName}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>캐치프레이즈</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyTagline"
                        value={academy.academy.academyTagline}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>대표번호</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyPhone"
                        value={academy.academy.academyPhone}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>주소</span>
                </Form.Label>

                <Col sm={9}>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Control
                            type="text"
                            name="academyAddress"
                            value={academy.academy.academyAddress}
                            onClick={addressSearch}
                            readOnly
                            style={{
                                minWidth: 0,
                                flex: 1,
                            }}
                        />

                        <Button
                            variant="success"
                            className="text-nowrap flex-shrink-0"
                            onClick={addressSearch}
                        >
                            <FaMagnifyingGlass className="me-1" />
                            <span className="d-none d-lg-inline-block">주소 검색</span>
                        </Button>

                        <Button
                            variant="danger"
                            className="text-nowrap flex-shrink-0"
                            onClick={addressRemove}
                            style={{
                                display: isAddressWritten ? "block" : "none",
                            }}
                        >
                            <FaXmark className="me-1" />
                            <span className="d-none d-lg-inline-block">주소 지우기</span>
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>학원소개</span>
                </Form.Label>
            </Row>
            <Col sm={9}>
                <Form.Control as="textarea" rows={5} name="academyIntro"
                    value={academy.academy.academyIntro} onChange={changeStringValue} />
            </Col>

            <hr className="mt-4" />

            {/* 연혁 */}
            <Row className="mt-4">
                <Col>
                    <span>연혁</span>
                </Col>
            </Row>
            <Row>
                <Col sm={3}>
                    <Form.Control
                        type="text"
                        name="academyHistoryYear"
                        value={history.academyHistoryYear}
                        onChange={changeHistoryValue}
                        placeholder="년도"
                    />
                </Col>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyHistoryContent"
                        value={history.academyHistoryContent}
                        onChange={changeHistoryValue}
                        placeholder="연혁 설명"
                    />
                </Col>
            </Row>

            <Button className="mt-4" onClick={addHistory}>
                연혁 추가
            </Button>

            {academy.historyList.map((history, index) => (
                <Row key={index} className="mb-2 align-items-center">
                    <Col sm={3}>
                        <Form.Control
                            type="text"
                            name="academyHistoryYear"
                            value={history.academyHistoryYear}
                            onChange={e => changeHistoryListValue(index, e)}
                        />
                    </Col>
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            name="academyHistoryContent"
                            value={history.academyHistoryContent}
                            onChange={e => changeHistoryListValue(index, e)}
                        />
                    </Col>
                    <Col sm={1} className="text-end">
                        <FaTrash
                            className="text-danger"
                            size={20}
                            style={{ cursor: "pointer" }}
                            onClick={() => deleteHistory(history, index)}
                        />
                    </Col>
                </Row>
            ))}

            <hr />

            {/* 과목 */}
            <Row className="mb-2 align-items-center">
                <Col sm={3}>
                    <Form.Control
                        type="text"
                        name="academySubjectName"
                        value={subject.academySubjectName}
                        onChange={changeSubjectValue}
                        placeholder="과목명"
                    />
                </Col>
                <Col sm={1}>
                    <FaPlus size={20} style={{ cursor: "pointer" }} onClick={addSubject} />
                </Col>
            </Row>

            {academy.subjectList.map((subject, index) => (
                <Row key={index} className="mb-2 align-items-center">
                    <Col sm={3}>
                        <Form.Control
                            type="text"
                            name="academySubjectName"
                            value={subject.academySubjectName}
                            onChange={e => changeSubjectListValue(index, e)}
                        />
                    </Col>

                    <Col sm={1} className="text-end">
                        <FaXmark
                            className="text-danger"
                            size={20}
                            style={{ cursor: "pointer" }}
                            onClick={() => deleteSubject(subject, index)}
                        />
                    </Col>
                </Row>
            ))}

            <Row className="mt-4">
                <Col className="text-end">
                    {/* 위치 나중에 생기면 수정 */}
                    <Button as={Link} to={`/employee/login/`} variant="danger" className="ms-2">
                        <FaXmark className="me-2" />
                        <span>취소하기</span>
                    </Button>

                    <Button type="button" variant="success" className="ms-2"
                        onClick={isRegistered ? updateAcademy : insertAcademy}>
                        <FaCheck className="me-2" />
                        <span>{isRegistered ? "수정하기" : "등록하기"}</span>
                    </Button>
                </Col>
            </Row>
        </>
    );
}