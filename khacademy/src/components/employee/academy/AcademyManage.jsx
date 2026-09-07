import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Form, ListGroup, ListGroupItem, Row } from "react-bootstrap";
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

    // 학원 이미지
    const [images, setImages] = useState([]);
    const imagesRef = useRef();

    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        if (images.length === 0) {
            setPreviewImages([]);
            return;
        }
        const urls = Array.from(images).map((image) =>
            URL.createObjectURL(image)
        );
        setPreviewImages(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    //기존에 등록되어 있는 이미지 
    const [beforeImages, setBeforeImages] = useState([]);

    const changeImages = useCallback((e) => {
        setImages(e.target.files);
    }, []);

    const clearImages = useCallback(() => {
        setImages([]);
    }, []);

    useEffect(() => {
        if (images.length > 0) return;

        if (imagesRef.current) {
            imagesRef.current.value = "";
        }
    }, [images]);

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
                const {
                    academy: academyDto,
                    historyList,
                    subjectList,
                    imageList
                } = response.data;
                // 기존 학원 기본정보 + 연혁 + 과목
                setAcademy({
                    academy: academyDto,
                    historyList: historyList ?? [],
                    subjectList: subjectList ?? []
                });
                // 기존 이미지
                setBeforeImages(imageList ?? []);

                setIsRegistered(true);
            }
            else {
                //없으면 false
                setIsRegistered(false);
            }
        }
        catch (err) {
            console.error(err);
            setIsRegistered(false);
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
    const isAddressWritten = (academy.academy?.academyAddress ?? "").length > 0;

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
        //학원정보 + 이미지 multipart 전송
        const form = new FormData();

        //학원 기본정보
        form.append(
            "academy",
            new Blob(
                [JSON.stringify(academy.academy)],
                { type: "application/json" }
            )
        );

        // 학원 이미지 여러 장
        Array.from(images).forEach((image) => {
            form.append("images", image);
        });

        await apiClient.post("/academy/", form);

        for (const history of academy.historyList) {
            await apiClient.post("/academy/history", history);
        }

        for (const subject of academy.subjectList) {
            await apiClient.post("/academy/subject", subject);
        }

        toast.success("학원 정보가 등록되었습니다.");
        setIsRegistered(true);
        clearImages();
        await loadAcademy();
    }, [academy, images, loadAcademy, clearImages]);

    //수정
    const updateAcademy = useCallback(async () => {
        const form = new FormData();

        // 학원 기본정보
        form.append(
            "academy",
            new Blob(
                [JSON.stringify(academy.academy)],
                { type: "application/json" }
            )
        );

        // 새로 추가할 이미지
        Array.from(images).forEach((image) => {
            form.append("images", image);
        });

        // 학원 기본정보 수정 + 신규 이미지 추가
        await apiClient.put("/academy/", form);

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

        clearImages();
        await loadAcademy();
    }, [academy, images, loadAcademy, clearImages]);

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

    //기존 학원 이미지 삭제
    const deleteImage = useCallback(async (image) => {

        try {
            await apiClient.delete(
                `/academy/${academy.academy.academyNo}/image/${image.attachNo}`
            );

            //화면에서도 삭제
            setBeforeImages(prev =>
                prev.filter(
                    item => item.attachNo !== image.attachNo
                )
            );

            toast.success("이미지가 삭제되었습니다");
        }
        catch (err) {
            console.error("학원 이미지 삭제 실패", err);
        }
    }, [academy.academy.academyNo]);

    // 체크될 경우 항목을 신설하거나 true/false를 교체하는 함수
    const choiceDetailImages = useCallback((target, e)=>{
        setBeforeImages(prev=>prev.map(
            attach => {
                if(attach.attachNo === target.attachNo){//내가 찾는 항목
                    return{
                        ...attach,
                        choice : e.target.checked
                    };
                }
                return {...attach};//내가 찾는 항목이 아닌 경우
            }
        ));
    },[]);

    //전체선택 관련 항목들
    const checkAllDetailImages = useCallback(e => {
        setBeforeImages(prev => prev.map(
            attach => ({
                ...attach,
                choice: e.target.checked
            })
        ))
    }, []);
    const isAllChecked = useMemo(() => {
        //reduce를 이용하면 배열을 누적 계산하여 1개의 값을 만들어낼 수 있다
        //논리 1개 (true/false)를 만들어내고 싶으므로 유용한 계산
        //배열.reduce(계산함수, 초기값) 형태로 쓰며 계산함수의 첫번째 인자는 누적된 값, 두번째 인자는 현재대상
        return beforeImages.length > 0 && beforeImages.every(cur => cur.choice === true);
    }, [beforeImages]);

    const deleteCheckedDetailImages = useCallback(async () => {
        const detailNumbers = beforeImages.filter(
            attach => attach.choice === true//체크된 항목만 걸러라
        ).map(
            attach => attach.attachNo//전체 정보말고 번호만 추려라
        );

        if (detailNumbers.length === 0) {
            return;
        }

        // 벌크 삭제 API가 없으므로 단건 삭제 API를 반복 호출
        for (const attachNo of detailNumbers) {
            await apiClient.delete(
                `/academy/${academy.academy.academyNo}/image/${attachNo}`
            );
        }

        //화면갱신
        //- loadData는 안되고 화면에서 요소를 직접 제거해야함 (filter 사용)
        toast.success("상세 이미지가 삭제되었습니다");
        setBeforeImages(prev => prev.filter(
            attach => !detailNumbers.includes(attach.attachNo)//지운 번호가 아닌 요소만 추출
        ))
    }, [beforeImages, academy.academy.academyNo]);


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
                        value={academy.academy?.academyName ?? ""}
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
                        value={academy.academy?.academyTagline ?? ""}
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
                        value={academy.academy?.academyPhone ?? ""}
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
                            value={academy.academy?.academyAddress ?? ""}
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
                    value={academy.academy?.academyIntro ?? ""} onChange={changeStringValue} />
            </Col>

            <hr className="mt-4" />

            {/* 이미지 */}
            <Row className="mt-4">
                <Form.Label column sm={3}>학원 이미지</Form.Label>
                <Col sm={9}>
                    <div className="d-flex">
                        <Form.Control type="file" accept="image/*" multiple
                            ref={imagesRef}
                            onInput={changeImages} />
                        {images.length > 0 && (
                            <Button variant="danger" onClick={clearImages} className="ms-2">
                                <FaXmark />
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
            {previewImages.length > 0 && (
                <Row className="mt-3">
                    <Col sm={{ offset: 3, span: 9 }}>
                        <div className="d-flex flex-wrap gap-2">
                            {previewImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`학원 이미지 미리보기 ${index + 1}`}
                                    width={120}
                                    height={120}
                                    style={{
                                        objectFit: "cover",
                                        borderRadius: "8px"
                                    }}
                                />
                            ))}
                        </div>
                    </Col>
                </Row>
            )}

            <Row className="mt-5">
                <Form.Label column sm={3}>상세이미지</Form.Label>
                <Col sm={9}>
                    {/* 전체선택/해제 */}
                    <Form.Check type="checkbox" label="전체 선택"
                        checked={isAllChecked}
                        onChange={checkAllDetailImages} />

                    <Button variant="danger" onClick={deleteCheckedDetailImages}>
                        체크된 항목 삭제
                    </Button>
                    <ListGroup>
                        {beforeImages.map(attach => (
                            <ListGroupItem key={attach.attachNo}>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        {attach.attachName}
                                        <span className="ms-2 text-info">
                                            ({(attach.attachSize / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <div>
                                        {/* 하나만 삭제 가능한 기존 버튼 */}
                                        {/* <FaXmark className="text-danger" 
                                    onClick={e=>deleteDetailImage(attach)}/> */}

                                        {/* 체크박스 */}
                                        <Form.Check type="checkbox"
                                            checked={attach.choice === true}
                                            onChange={e => choiceDetailImages(attach, e)} />
                                    </div>
                                </div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Col>
            </Row>

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
                        value={history.academyHistoryYear ?? ""}
                        onChange={changeHistoryValue}
                        placeholder="년도"
                    />
                </Col>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyHistoryContent"
                        value={history.academyHistoryContent ?? ""}
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
                            value={history.academyHistoryYear ?? ""}
                            onChange={e => changeHistoryListValue(index, e)}
                        />
                    </Col>
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            name="academyHistoryContent"
                            value={history.academyHistoryContent ?? ""}
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
                        value={subject.academySubjectName ?? ""}
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
                            value={subject.academySubjectName ?? ""}
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