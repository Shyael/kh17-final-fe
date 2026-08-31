import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FaCheck, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "@utils/reaxios";

export default function TutorManage() {

    // URL
    const { tutorNo } = useParams();
    const navigate = useNavigate();

    // tutorNo가 있으면 수정, 없으면 등록
    const isEdit = tutorNo !== undefined;

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
        subjectList: []
    });

    // 등록 가능한 직원 목록
    const [employeeList, setEmployeeList] = useState([]);

    // 학원에 등록된 과목 목록=
    const [academySubjectList, setAcademySubjectList] = useState([]);

    // 새 경력/학력 입력
    const [career, setCareer] = useState({
        tutorCareerType: "경력",
        tutorCareerContent: ""
    });

    // 새 담당과목 선택
    const [subject, setSubject] = useState("");

    // 최초 조회
    useEffect(() => {
        const initialize = async () => {
            try {
                // 수정 화면(주소에 강사번호 있으면)
                if (isEdit) {
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
                        navigate("/employee/tutor");
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
                        subjectList: subjectList
                    });
                }

                // 등록 화면(주소에 강사번호가 없으면 등록)
                else {
                    const [academyResponse, employeeResponse] =
                        await Promise.all([
                            apiClient.get("/academy/"),
                            apiClient.get("/tutor/available-employee")
                        ]);

                    // 학원 등록 과목(수정이랑 동일한 작업)
                    setAcademySubjectList(
                        academyResponse.data?.subjectList ?? []
                    );

                    // 강사정보를 아직 등록하지 않은 재직 강사
                    setEmployeeList(
                        employeeResponse.data ?? []
                    );
                }

            }
            catch (err) {
                console.error(err);
                toast.error("강사 정보를 불러오지 못했습니다.");
            }
        };

        initialize();

    }, [isEdit, tutorNo, navigate]);

    // 강사 기본정보 변경
    const changeTutorValue = useCallback((e) => {

        const { name, value } = e.target;
        setTutor(prev => ({
            ...prev,
            tutor: {
                ...prev.tutor,
                [name]:
                    name === "employeeNo"
                        ? value === ""
                            ? ""
                            : Number(value)
                        : value
            }
        }));
    }, []);

    // 새 경력/학력 입력
    const changeCareerValue = useCallback((e) => {

        const { name, value } = e.target;

        setCareer(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 기존 경력/학력 수정
    const changeCareerListValue = useCallback((index, e) => {
        const { name, value } = e.target;
        setTutor(prev => ({
            ...prev,
            careerList: prev.careerList.map((career, i) =>
                i === index
                    ? {
                        ...career,
                        [name]: value
                    }
                    : career
            )
        }));
    }, []);

    // 경력/학력 추가
    const addCareer = useCallback(() => {
        //경력 내용에 아무내용도 안넣으면 추가 안됨
        if (!career.tutorCareerContent.trim()) {
            return;
        }
        setTutor(prev => ({
            ...prev,

            careerList: [
                ...prev.careerList,
                career
            ]
        }));

        // 입력창 초기화
        setCareer({
            tutorCareerType: "경력",
            tutorCareerContent: ""
        });
    }, [career]);

    // 담당과목 선택
    const changeSubjectValue = useCallback((e) => {
        setSubject(e.target.value);
    }, []);

    // 담당과목 추가
    const addSubject = useCallback(() => {
        if (!subject) {
            return;
        }
        const academySubjectNo = Number(subject);
        // 이미 선택한 과목인지 확인
        const exists = tutor.subjectList.some(
            item =>
                Number(item.academySubjectNo) === academySubjectNo
        );
        if (exists) {
            toast.warning("이미 추가된 담당과목입니다.");
            return;
        }

        // 학원 과목 목록에서 선택한 과목 찾기
        const selectedSubject = academySubjectList.find(
            item =>
                item.academySubjectNo === academySubjectNo
        );
        if (!selectedSubject) {
            return;
        }

        setTutor(prev => ({
            ...prev,
            subjectList: [
                ...prev.subjectList,
                {
                    academySubjectNo:
                        selectedSubject.academySubjectNo,
                    academySubjectName:
                        selectedSubject.academySubjectName
                }
            ]
        }));
        setSubject("");
    }, [subject, tutor.subjectList, academySubjectList]);

    // 강사 등록
    const insertTutor = useCallback(async () => {
        try {
            if (!tutor.tutor.employeeNo) {
                toast.warning("강사를 선택해주세요.");
                return;
            }

            // 1. 강사 기본정보 등록
            const response = await apiClient.post("/tutor/",
                {
                    employeeNo: tutor.tutor.employeeNo,
                    tutorTagline: tutor.tutor.tutorTagline,
                    tutorIntro: tutor.tutor.tutorIntro
                }
            );

            // 백엔드에서 방금 생성한 tutorNo 반환(위쪽 진행됨 그럼 no 생성완료)
            const newTutorNo = response.data.tutorNo;

            // 2. 경력/학력 등록
            for (const career of tutor.careerList) {
                await apiClient.post("/tutor/career",
                    {
                        tutorNo: newTutorNo,
                        tutorCareerType: career.tutorCareerType,
                        tutorCareerContent: career.tutorCareerContent
                    }
                );
            }


            // 3. 담당과목 등록
            for (const subject of tutor.subjectList) {

                await apiClient.post("/tutor/subject",
                    {
                        tutorNo: newTutorNo,
                        academySubjectNo: subject.academySubjectNo
                    }
                );
            }

            toast.success("강사 정보가 등록되었습니다.");

            // 등록 완료 후 같은 TutorManage를 수정모드로 진입
            navigate(`/employee/tutor/${newTutorNo}`);
        }
        catch (err) {
            console.error(err);
            toast.error("강사 정보 등록에 실패했습니다.");
        }
    }, [tutor, navigate]);

    // 강사 수정
    const updateTutor = useCallback(async () => {

        try {
            // 1. 강사 기본정보 수정
            await apiClient.put(
                `/tutor/${tutorNo}`,
                {
                    employeeNo: tutor.tutor.employeeNo,
                    tutorTagline: tutor.tutor.tutorTagline,
                    tutorIntro: tutor.tutor.tutorIntro
                }
            );

            // 2. 경력/학력
            for (const career of tutor.careerList) {
                // 기존 경력(데이터에 careerNo 존재하면 수정)
                if (career.tutorCareerNo) {
                    await apiClient.put(`/tutor/career/${career.tutorCareerNo}`,
                        {
                            tutorCareerType:career.tutorCareerType,
                            tutorCareerContent:career.tutorCareerContent
                        }
                    );
                }

                // 새 경력
                else {
                    await apiClient.post("/tutor/career",
                        {
                            tutorNo: Number(tutorNo),
                            tutorCareerType: career.tutorCareerType,
                            tutorCareerContent: career.tutorCareerContent
                        }
                    );
                }
            }

            // 3. 담당과목
            for (const subject of tutor.subjectList) {
                // 기존 담당과목
                if (subject.tutorSubjectNo) {
                    await apiClient.put(`/tutor/subject/${subject.tutorSubjectNo}`,
                        {
                            academySubjectNo: subject.academySubjectNo
                        }
                    );
                }

                // 새 담당과목
                else {
                    await apiClient.post("/tutor/subject",
                        {
                            tutorNo: Number(tutorNo),
                            academySubjectNo:subject.academySubjectNo
                        }
                    );
                }
            }
            toast.success("강사 정보가 수정되었습니다.");

            // 새로 추가된 경력/과목 PK 다시 받아오기
            const response = await apiClient.get(`/tutor/${tutorNo}`);
            const data = response.data;

            const subjectList =
                (data.subjectList ?? []).map(tutorSubject => {

                    const academySubject =
                        academySubjectList.find(
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
                });

            setTutor({
                tutor: {
                    tutorNo: data.tutorNo,
                    employeeNo: data.employeeNo,
                    accountName: data.accountName ?? "",
                    tutorTagline: data.tutorTagline ?? "",
                    tutorIntro: data.tutorIntro ?? ""
                },

                careerList: data.careerList ?? [],
                subjectList: subjectList
            });

        }
        catch (err) {
            console.error(err);
            toast.error("강사 정보 수정에 실패했습니다.");
        }

    }, [tutor, tutorNo, academySubjectList]);

    // 경력/학력 삭제
    const deleteCareer = useCallback(async (career, index) => {
        try {
            // DB에 이미 등록된 경력
            if (career.tutorCareerNo) {
                await apiClient.delete(
                    `/tutor/career/${career.tutorCareerNo}`
                );
            }

            // 화면 목록에서 제거
            setTutor(prev => ({
                ...prev,
                careerList:
                    prev.careerList.filter(
                        (_, i) => i !== index
                    )
            }));
        }
        catch (err) {
            console.error(err);
            toast.error("경력/학력 삭제에 실패했습니다.");
        }

    }, []);

    // 담당과목 삭제
    const deleteSubject = useCallback(async (subject, index) => {

        try {
            // DB에 이미 등록된 담당과목
            if (subject.tutorSubjectNo) {
                await apiClient.delete(
                    `/tutor/subject/${subject.tutorSubjectNo}`
                );
            }

            // 화면 목록 제거
            setTutor(prev => ({
                ...prev,
                subjectList:
                    prev.subjectList.filter(
                        (_, i) => i !== index
                    )
            }));
        }
        catch (err) {
            console.error(err);
            toast.error("담당과목 삭제에 실패했습니다.");
        }
    }, []);

    // 화면
    return (
        <>
            <Jumbotron
                title="강사정보 관리"
                content="외부 고객들이 볼 강사정보를 등록/수정/삭제 할 수 있습니다"
            />

            {/* 강사 기본정보 */}
            <Row className="mt-4">
                <Col sm={6}>
                    <Form.Label>
                        <span>이름</span>
                    </Form.Label>

                    {/* 등록(직원번호가 주소에 없을때) */}
                    {!isEdit ? (
                        <Form.Select
                            name="employeeNo"
                            value={tutor.tutor.employeeNo}
                            onChange={changeTutorValue}
                        >
                            <option value="">
                                강사 선택
                            </option>

                            {employeeList.map(employee => (
                                <option
                                    key={employee.employeeNo}
                                    value={employee.employeeNo}
                                >
                                    {employee.accountName}
                                </option>
                            ))}
                        </Form.Select>
                    ) : (
                        // 수정일 경우 강사를 변경하지 않음
                        <Form.Control
                            type="text"
                            value={tutor.tutor.accountName}
                            readOnly
                        />
                    )}
                </Col>

                {/* 담당과목 */}
                <Col sm={6}>
                    <Form.Label>
                        <span>담당과목</span>
                    </Form.Label>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Select
                            value={subject}
                            onChange={changeSubjectValue}>
                            <option value="">
                                과목 선택
                            </option>
                            {academySubjectList.map(item => (
                                <option
                                    key={item.academySubjectNo}
                                    value={item.academySubjectNo}>
                                    {item.academySubjectName}
                                </option>
                            ))}
                        </Form.Select>

                        <Button
                            type="button"
                            className="text-nowrap flex-shrink-0"
                            onClick={addSubject}>
                            <FaPlus/>
                        </Button>
                    </div>

                    {/* 선택된 담당과목 */}
                    <div className="mt-2 d-flex flex-wrap gap-2">
                        {tutor.subjectList.map(
                            (subject, index) => (
                                <span
                                    key={
                                        subject.tutorSubjectNo ??
                                        `${subject.academySubjectNo}-${index}`
                                    }
                                    className="text-nowrap border rounded px-2 py-1">
                                    {subject.academySubjectName}
                                    <FaXmark
                                        className="text-danger ms-2"
                                        style={{cursor: "pointer"}}
                                        onClick={() =>
                                            deleteSubject(subject, index)
                                        }/>
                                </span>
                            )
                        )}
                    </div>
                </Col>
            </Row>

            {/* 경력/한줄소개 */}
            <Row className="mt-4">
                <Col>
                    <Form.Label>
                        <span>경력/한줄소개</span>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="tutorTagline"
                        value={tutor.tutor.tutorTagline}
                        onChange={changeTutorValue}
                        placeholder="15년 경력, 내신 심화 전문"
                    />
                </Col>
            </Row>

            {/* 소개 */}
            <Row className="mt-4">
                <Col>
                    <Form.Label>
                        <span>소개</span>
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        name="tutorIntro"
                        value={tutor.tutor.tutorIntro}
                        onChange={changeTutorValue}
                    />
                </Col>
            </Row>
            <hr className="mt-4" />

            {/* 경력 및 학력 */}
            <Row className="mt-4">
                <Col>
                    <span>경력 및 학력</span>
                </Col>
            </Row>

            {/* 새 경력/학력 입력 */}
            <Row className="mt-2 align-items-center">
                <Col sm={3}>
                    <Form.Select
                        name="tutorCareerType"
                        value={career.tutorCareerType}
                        onChange={changeCareerValue}>
                        <option value="경력">
                            경력
                        </option>
                        <option value="학력">
                            학력
                        </option>
                    </Form.Select>
                </Col>
                <Col sm={8}>
                    <Form.Control
                        type="text"
                        name="tutorCareerContent"
                        value={career.tutorCareerContent}
                        onChange={changeCareerValue}
                        placeholder="OO대학교 수학교육과 졸업"
                    />
                </Col>
                <Col sm={1}>
                    <Button
                        type="button"
                        onClick={addCareer}>
                        <FaPlus />
                    </Button>
                </Col>
            </Row>

            {/* 등록된 경력/학력 */}
            {tutor.careerList.map(
                (career, index) => (
                    <Row
                        key={
                            career.tutorCareerNo ??
                            index
                        }
                        className="mt-2 align-items-center">
                        <Col sm={3}>
                            <Form.Select
                                name="tutorCareerType"
                                value={career.tutorCareerType}
                                onChange={e =>
                                    changeCareerListValue(
                                        index,
                                        e
                                    )
                                }>
                                <option value="경력">
                                    경력
                                </option>
                                <option value="학력">
                                    학력
                                </option>
                            </Form.Select>
                        </Col>
                        <Col sm={8}>
                            <Form.Control
                                type="text"
                                name="tutorCareerContent"
                                value={career.tutorCareerContent}
                                onChange={e =>
                                    changeCareerListValue(
                                        index,
                                        e
                                    )
                                }
                            />
                        </Col>
                        <Col
                            sm={1}
                            className="text-end">
                            <FaTrash
                                className="text-danger"
                                size={20}
                                style={{
                                    cursor: "pointer"
                                }}
                                onClick={() =>
                                    deleteCareer(
                                        career,
                                        index
                                    )
                                }/>
                        </Col>
                    </Row>
                )
            )}

            {/* 버튼 */}
            <Row className="mt-4">
                <Col className="text-end">
                    <Button
                        as={Link}
                        to="/employee/tutor"
                        variant="danger"
                        className="ms-2">
                        <FaXmark className="me-2" />
                        <span>취소하기</span>
                    </Button>
                    <Button
                        type="button"
                        variant="success"
                        className="ms-2"
                        onClick={
                            isEdit
                                ? updateTutor
                                : insertTutor
                        }>
                        <FaCheck className="me-2" />
                        <span>
                            {isEdit
                                ? "수정하기"
                                : "등록하기"}
                        </span>
                    </Button>
                </Col>
            </Row>
        </>
    );
}