import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import {
    FaCalendarPlus,
    FaCheck,
    FaPlus,
    FaMagnifyingGlass,
    FaTrash,
    FaUser
} from "react-icons/fa6";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";


// ============================================================
// 색상
// ============================================================
const COLORS = {
    bg: "#F7F5F1",
    surface: "#FFFFFF",
    primary: "#71869A",
    primaryDark: "#596E82",
    primaryLight: "#E8EDF1",
    accent: "#C4B39E",
    text: "#37393A",
    muted: "#85878A",
    border: "#E2E0DC",
    success: "#6F8E7E",
    warning: "#C79A5E",
    danger: "#B86B6B"
};


// ============================================================
// 기본 일정
// ============================================================
const emptySchedule = {
    scheduleOpen: "",
    scheduleClose: "",
    scheduleWeek: "",
    scheduleStart: "",
    scheduleEnd: "",
    classroomNo: ""
};


export default function CourseCreate() {

    const navigate = useNavigate();


    // ========================================================
    // 강좌 정보
    // ========================================================
    const [course, setCourse] = useState({
        employeeNo: 0,
        academySubjectNo: 0,
        gradeNo: 0,

        courseTitle: "",
        courseSubject: "",
        courseLimit: 20,
        courseFee: 1000,
        courseInfo: "",
        courseType: "정규",

        schedules: [
            { ...emptySchedule }
        ]
    });


    // ========================================================
    // 강좌 등록 초기 데이터
    //
    // subjectList
    // gradeList
    // classroomList
    // tutorList
    // ========================================================
    const [formData, setFormData] = useState({
        subjectList: [],
        gradeList: [],
        classroomList: [],
        tutorList: []
    });


    // ========================================================
    // 초기 데이터 조회
    // ========================================================
    const loadFormData = useCallback(async () => {

        try {

            const { data } = await apiClient.get(
                "/employee/course/form-data"
            );

            console.log("강좌 등록 초기 데이터", data);

            setFormData(data);

        }
        catch (e) {

            console.error(
                "강좌 등록 초기 데이터 조회 오류",
                e
            );

            Swal.fire(
                "등록 정보 조회 실패",
                "강좌 등록에 필요한 정보를 불러오지 못했습니다.",
                "error"
            );
        }

    }, []);


    useEffect(() => {

        loadFormData();

    }, [loadFormData]);


    // ========================================================
    // 선택된 강사
    // ========================================================
    const [selectedTutor, setSelectedTutor] = useState(null);


    // ========================================================
    // 강사 Modal
    // ========================================================
    const [showTutorModal, setShowTutorModal] = useState(false);

    const [tutorKeyword, setTutorKeyword] = useState("");

    const [tutors, setTutors] = useState([]);


    // ========================================================
    // 강의실 Modal
    // ========================================================
    const [showClassroomModal, setShowClassroomModal] =
        useState(false);

    const [classroomIndex, setClassroomIndex] =
        useState(null);

    const [classrooms, setClassrooms] =
        useState([]);


    // ========================================================
    // 입력 변경
    // ========================================================
    const changeCourseValue = useCallback((e) => {

        const { name, value } = e.target;

        setCourse(prev => ({
            ...prev,
            [name]: value
        }));

    }, []);

    // ==========================
    // 과목 변경
    // ===================
    const changeSubject = useCallback((e) => {
        const subjectNo = Number(e.target.value);

        const selectedSubject = formData.subjectList.find(
            subject =>
                Number(subject.academySubjectNo) === subjectNo
        );

        setCourse(prev => ({
            ...prev,
            academySubjectNo: subjectNo,
            courseSubject: selectedSubject?.academySubjectName || "",
            employeeNo: 0
        }));

        setSelectedTutor(null);

    }, [formData.subjectList]);
    // ========================================================
    // 일정 변경
    // ========================================================
    const changeScheduleValue = useCallback((index, e) => {

        const { name, value } = e.target;

        setCourse(prev => {

            const schedules = [...prev.schedules];

            schedules[index] = {
                ...schedules[index],
                [name]: value
            };

            return {
                ...prev,
                schedules
            };
        });

    }, []);


    // ========================================================
    // 일정 추가
    // ========================================================
    const addSchedule = useCallback(() => {

        setCourse(prev => ({
            ...prev,
            schedules: [
                ...prev.schedules,
                { ...emptySchedule }
            ]
        }));

    }, []);


    // ========================================================
    // 일정 삭제
    // ========================================================
    const removeSchedule = useCallback((index) => {

        if (course.schedules.length === 1) {

            Swal.fire(
                "일정은 최소 1개 이상 등록해야 합니다."
            );

            return;
        }

        setCourse(prev => ({
            ...prev,
            schedules: prev.schedules.filter(
                (_, i) => i !== index
            )
        }));

    }, [course.schedules.length]);


    // ========================================================
    // 강사 Modal 열기
    // ========================================================
    const loadTutors = useCallback(() => {

        const keyword = tutorKeyword.trim().toLowerCase();
        const filteredTutors = formData.tutorList.filter(tutor => {

            //강사 이름 검색
            const nameMatch =
                !keyword
                || tutor.accountName?.toLowerCase().includes(keyword);

            //과목 선택 여부(과목 선택x 시 전체 강사)
            const subjectMatch =
                Number(course.academySubjectNo) === 0
                    ? true
                    : tutor.subjectList?.some(
                        subject =>
                            Number(subject.academySubjectNo) ===
                            Number(course.academySubjectNo)
                    );

            return nameMatch && subjectMatch;
        });

        setTutors(filteredTutors);
        setShowTutorModal(true);

    }, [formData.tutorList, tutorKeyword, course.academySubjectNo]);


    // ========================================================
    // 강사 선택
    // ========================================================
    const selectTutor = useCallback((tutor) => {

        setSelectedTutor(tutor);

        setCourse(prev => ({
            ...prev,
            employeeNo: tutor.employeeNo
        }));

        setShowTutorModal(false);

    }, []);


    // ========================================================
    // 강의실 선택 Modal 열기
    //
    // 현재 강좌의
    // 1. 수강 정원
    // 2. 전체 일정
    //
    // 을 서버에 전달해서
    // 실제 사용 가능한 강의실만 조회
    // ========================================================
    const openClassroomModal = useCallback(async (index) => {

        // ----------------------------------------------------
        // 수강 정원 검사
        // ----------------------------------------------------
        if (
            !course.courseLimit ||
            Number(course.courseLimit) <= 0
        ) {

            await Swal.fire(
                "수강 정원을 먼저 입력해주세요."
            );

            return;
        }


        // ----------------------------------------------------
        // 일정 기본 검사
        // ----------------------------------------------------
        for (
            let i = 0;
            i < course.schedules.length;
            i++
        ) {

            const schedule = course.schedules[i];


            if (!schedule.scheduleWeek) {

                await Swal.fire(
                    `${i + 1}번째 일정의 요일을 먼저 선택해주세요.`
                );

                return;
            }


            if (
                !schedule.scheduleStart ||
                !schedule.scheduleEnd
            ) {

                await Swal.fire(
                    `${i + 1}번째 일정의 시간을 먼저 입력해주세요.`
                );

                return;
            }

        }


        try {

            // ------------------------------------------------
            // 어떤 일정의 강의실을 선택하는지 저장
            // ------------------------------------------------
            setClassroomIndex(index);


            // ------------------------------------------------
            // 사용 가능 강의실 조회 요청
            // ------------------------------------------------
            const request = {

                courseLimit:
                    Number(course.courseLimit),

                schedules:
                    course.schedules.map(schedule => ({

                        scheduleOpen:
                            schedule.scheduleOpen || null,

                        scheduleClose:
                            schedule.scheduleClose || null,

                        scheduleWeek:
                            schedule.scheduleWeek,

                        scheduleStart:
                            schedule.scheduleStart,

                        scheduleEnd:
                            schedule.scheduleEnd

                    }))

            };


            console.log(
                "사용 가능 강의실 조회 요청",
                request
            );


            // ------------------------------------------------
            // 사용 가능한 강의실 조회
            // ------------------------------------------------
            const { data } = await apiClient.post(
                "/employee/course/available-classrooms",
                request
            );


            setClassrooms(data);

            setShowClassroomModal(true);

        }
        catch (e) {

            console.error(
                "사용 가능 강의실 조회 오류",
                e
            );

            Swal.fire(
                "강의실 조회 실패",
                e.response?.data?.message ||
                "사용 가능한 강의실을 불러오지 못했습니다.",
                "error"
            );
        }

    }, [
        course.courseLimit,
        course.schedules
    ]);


    // ========================================================
    // 강의실 선택
    // ========================================================
    const selectClassroom = useCallback((classroom) => {

        setCourse(prev => {

            const schedules = [
                ...prev.schedules
            ];


            schedules[classroomIndex] = {

                ...schedules[classroomIndex],

                classroomNo:
                    classroom.classroomNo

            };


            return {
                ...prev,
                schedules
            };

        });


        setShowClassroomModal(false);

    }, [classroomIndex]);


    // ========================================================
    // 등록
    // ========================================================
    const sendCourseCreate = useCallback(async () => {

        // ----------------------------------------------------
        // 기본 검사
        // ----------------------------------------------------
        if (!course.gradeNo) {

            await Swal.fire(
                "학년을 선택해주세요."
            );

            return;
        }


        if (!course.academySubjectNo) {

            await Swal.fire(
                "과목을 선택해주세요."
            );

            return;
        }


        if (!course.employeeNo) {

            await Swal.fire(
                "담당 강사를 선택해주세요."
            );

            return;
        }


        if (!course.courseTitle.trim()) {

            await Swal.fire(
                "강좌명을 입력해주세요."
            );

            return;
        }


        if (course.schedules.length === 0) {

            await Swal.fire(
                "수업 일정을 최소 1개 이상 등록해주세요."
            );

            return;
        }


        // ----------------------------------------------------
        // 일정 기본 검사
        // ----------------------------------------------------
        for (
            let i = 0;
            i < course.schedules.length;
            i++
        ) {

            const schedule =
                course.schedules[i];


            if (!schedule.scheduleWeek) {

                await Swal.fire(
                    `${i + 1}번째 일정의 요일을 선택해주세요.`
                );

                return;
            }


            if (
                !schedule.scheduleStart ||
                !schedule.scheduleEnd
            ) {

                await Swal.fire(
                    `${i + 1}번째 일정의 수업 시간을 입력해주세요.`
                );

                return;
            }


            if (!schedule.classroomNo) {

                await Swal.fire(
                    `${i + 1}번째 일정의 강의실을 선택해주세요.`
                );

                return;
            }

        }


        // ----------------------------------------------------
        // 최종 확인
        // ----------------------------------------------------
        const result = await Swal.fire({

            title:
                "강좌를 등록하시겠습니까?",

            text:
                "등록 후 강좌 정보가 저장됩니다.",

            icon:
                "question",

            showCancelButton:
                true,

            confirmButtonText:
                "등록",

            cancelButtonText:
                "취소",

            confirmButtonColor:
                COLORS.primary

        });


        if (!result.isConfirmed) {

            return;

        }


        // ----------------------------------------------------
        // 서버 등록
        // ----------------------------------------------------
        try {

            const request = {

                ...course,

                employeeNo:
                    Number(course.employeeNo),

                academySubjectNo:
                    Number(course.academySubjectNo),

                gradeNo:
                    Number(course.gradeNo),

                courseLimit:
                    Number(course.courseLimit),

                courseFee:
                    Number(course.courseFee),

                schedules:
                    course.schedules.map(schedule => ({

                        ...schedule,

                        classroomNo:
                            Number(schedule.classroomNo)

                    }))

            };


            console.log(
                "강좌 등록 요청",
                request
            );


            await apiClient.post(
                "/employee/course/",
                request
            );


            await Swal.fire({

                title:
                    "등록 완료",

                text:
                    "강좌가 정상적으로 등록되었습니다.",

                icon:
                    "success",

                confirmButtonColor:
                    COLORS.primary

            });


            navigate(
                "/employee/course"
            );

        }
        catch (e) {

            console.error(
                "강좌 등록 오류",
                e
            );


            const status =
                e.response?.status;


            if (status === 409) {

                await Swal.fire(

                    "등록할 수 없습니다.",

                    e.response?.data?.message ||
                    "강사 또는 강의실의 수업 시간이 겹칩니다.",

                    "warning"

                );

            }
            else if (status === 404) {

                await Swal.fire(

                    "등록할 수 없습니다.",

                    e.response?.data?.message ||
                    "선택한 정보를 찾을 수 없습니다.",

                    "warning"

                );

            }
            else {

                await Swal.fire(

                    "등록 실패",

                    "일시적인 서버 오류가 발생했습니다.",

                    "error"

                );

            }

        }

    }, [
        course,
        navigate
    ]);


    return (

        <div
            style={{
                backgroundColor: COLORS.bg,
                minHeight: "100vh",
                color: COLORS.text
            }}
        >

            {/* =================================================
                상단 제목
            ================================================= */}
            <Jumbotron
                title="강좌 등록"
                content="새로운 강좌와 수업 일정을 등록합니다."
            />


            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "30px 20px 50px"
                }}
            >

                {/* =================================================
                    페이지 헤더
                ================================================= */}
                <div
                    className="d-flex justify-content-between align-items-center mb-4"
                >

                    <div>

                        <h2
                            style={{
                                fontSize: "22px",
                                fontWeight: "700",
                                marginBottom: "5px"
                            }}
                        >
                            강좌 등록
                        </h2>

                        <p
                            style={{
                                color: COLORS.muted,
                                fontSize: "13px",
                                marginBottom: 0
                            }}
                        >
                            고등학교 강좌의 기본 정보와 수업 일정을 등록해주세요.
                        </p>

                    </div>


                    <span
                        style={{
                            background:
                                COLORS.primaryLight,

                            color:
                                COLORS.primaryDark,

                            padding:
                                "6px 10px",

                            borderRadius:
                                "5px",

                            fontSize:
                                "12px",

                            fontWeight:
                                "600"
                        }}
                    >
                        신규 강좌
                    </span>

                </div>


                {/* =================================================
                    기본정보 + 담당강사
                ================================================= */}
                <Row className="g-4 mb-4">

                    {/* -------------------------------------------------
                        기본 정보
                    ------------------------------------------------- */}
                    <Col lg={8}>

                        <div
                            style={{
                                background:
                                    COLORS.surface,

                                border:
                                    `1px solid ${COLORS.border}`,

                                borderRadius:
                                    "11px",

                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.02)"
                            }}
                        >

                            <div
                                style={{
                                    padding:
                                        "18px 22px",

                                    borderBottom:
                                        `1px solid ${COLORS.border}`
                                }}
                            >

                                <h5
                                    style={{
                                        fontSize:
                                            "15px",

                                        fontWeight:
                                            "700",

                                        marginBottom:
                                            "3px"
                                    }}
                                >
                                    강좌 기본 정보
                                </h5>


                                <small
                                    style={{
                                        color:
                                            COLORS.muted
                                    }}
                                >
                                    강좌의 기본 정보를 입력해주세요.
                                </small>

                            </div>


                            <div
                                style={{
                                    padding: "22px"
                                }}
                            >

                                {/* 학년 / 과목 */}
                                <Row className="mb-3">

                                    <Col md={6}>

                                        <Form.Label>
                                            학년
                                        </Form.Label>


                                        <Form.Select
                                            name="gradeNo"
                                            value={
                                                course.gradeNo
                                            }
                                            onChange={
                                                changeCourseValue
                                            }
                                        >

                                            <option value="0">
                                                학년 선택
                                            </option>


                                            {formData.gradeList.map(
                                                grade => (

                                                    <option
                                                        key={
                                                            grade.gradeNo
                                                        }
                                                        value={
                                                            grade.gradeNo
                                                        }
                                                    >
                                                        {
                                                            grade.gradeLevel
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </Form.Select>

                                    </Col>


                                    <Col md={6}>

                                        <Form.Label>
                                            과목
                                        </Form.Label>


                                        <Form.Select
                                            name="academySubjectNo"
                                            value={course.academySubjectNo}
                                            onChange={changeSubject}
                                        >

                                            <option value="0">과목 선택</option>
                                            {formData.subjectList.map(subject => (
                                                <option
                                                    key={subject.academySubjectNo}
                                                    value={subject.academySubjectNo}
                                                >
                                                    {subject.academySubjectName}
                                                </option>
                                            ))}
                                        </Form.Select>

                                    </Col>

                                </Row>

                                {/* 강좌명 */}
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        강좌명
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="courseTitle"
                                        value={
                                            course.courseTitle
                                        }
                                        onChange={
                                            changeCourseValue
                                        }
                                        placeholder="예) 고2 수학 내신 대비"
                                    />

                                </Form.Group>


                                {/* 과목명 / 유형 */}
                                <Row className="mb-3">

                                    <Col md={6}>

                                        <Form.Label>
                                            강좌 유형
                                        </Form.Label>


                                        <Form.Select
                                            name="courseType"
                                            value={
                                                course.courseType
                                            }
                                            onChange={
                                                changeCourseValue
                                            }
                                        >

                                            <option value="정규">
                                                정규
                                            </option>

                                            <option value="특강">
                                                특강
                                            </option>

                                            <option value="보충">
                                                보충
                                            </option>

                                        </Form.Select>

                                    </Col>

                                </Row>


                                {/* 정원 / 수강료 */}
                                <Row className="mb-3">

                                    <Col md={6}>

                                        <Form.Label>
                                            수강 정원
                                        </Form.Label>


                                        <Form.Control
                                            type="number"
                                            name="courseLimit"
                                            min="1"
                                            value={
                                                course.courseLimit
                                            }
                                            onChange={
                                                changeCourseValue
                                            }
                                        />

                                    </Col>


                                    <Col md={6}>

                                        <Form.Label>
                                            수강료
                                        </Form.Label>


                                        <div className="input-group">

                                            <Form.Control
                                                type="number"
                                                name="courseFee"
                                                min="1000"
                                                step="1000"
                                                value={
                                                    course.courseFee
                                                }
                                                onChange={
                                                    changeCourseValue
                                                }
                                            />


                                            <span className="input-group-text">
                                                원
                                            </span>

                                        </div>

                                    </Col>

                                </Row>


                                {/* 설명 */}
                                <Form.Group>

                                    <Form.Label>
                                        강좌 설명
                                    </Form.Label>


                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="courseInfo"
                                        value={
                                            course.courseInfo
                                        }
                                        onChange={
                                            changeCourseValue
                                        }
                                        placeholder="강좌에 대한 설명을 입력해주세요."
                                    />

                                </Form.Group>

                            </div>

                        </div>

                    </Col>


                    {/* -------------------------------------------------
                        강사 정보
                    ------------------------------------------------- */}
                    <Col lg={4}>

                        <div
                            style={{
                                background:
                                    COLORS.surface,

                                border:
                                    `1px solid ${COLORS.border}`,

                                borderRadius:
                                    "11px",

                                height:
                                    "100%",

                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.02)"
                            }}
                        >

                            <div
                                style={{
                                    padding:
                                        "18px 20px",

                                    borderBottom:
                                        `1px solid ${COLORS.border}`
                                }}
                            >

                                <h5
                                    style={{
                                        fontSize:
                                            "15px",

                                        fontWeight:
                                            "700",

                                        marginBottom:
                                            "3px"
                                    }}
                                >
                                    담당 강사
                                </h5>


                                <small
                                    style={{
                                        color:
                                            COLORS.muted
                                    }}
                                >
                                    선택한 과목을 담당할 강사를 선택합니다.
                                </small>

                            </div>


                            <div
                                style={{
                                    padding: "22px"
                                }}
                            >

                                {!selectedTutor ? (

                                    <div
                                        className="text-center"
                                        style={{
                                            padding:
                                                "35px 10px",

                                            border:
                                                `1px dashed ${COLORS.border}`,

                                            borderRadius:
                                                "8px",

                                            background:
                                                COLORS.bg
                                        }}
                                    >

                                        <FaUser
                                            size={28}
                                            style={{
                                                color:
                                                    COLORS.muted,

                                                marginBottom:
                                                    "12px"
                                            }}
                                        />


                                        <div
                                            style={{
                                                fontSize:
                                                    "13px",

                                                color:
                                                    COLORS.muted,

                                                marginBottom:
                                                    "15px"
                                            }}
                                        >
                                            담당 강사를 선택해주세요.
                                        </div>


                                        <Button
                                            style={{
                                                background:
                                                    COLORS.primary,

                                                borderColor:
                                                    COLORS.primary
                                            }}
                                            onClick={
                                                loadTutors
                                            }
                                        >

                                            <FaMagnifyingGlass
                                                className="me-2"
                                            />

                                            강사 선택

                                        </Button>

                                    </div>

                                ) : (

                                    <div>

                                        <div
                                            style={{
                                                background:
                                                    COLORS.primaryLight,

                                                borderRadius:
                                                    "8px",

                                                padding:
                                                    "18px",

                                                marginBottom:
                                                    "15px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize:
                                                        "11px",

                                                    color:
                                                        COLORS.muted,

                                                    marginBottom:
                                                        "4px"
                                                }}
                                            >
                                                담당 강사
                                            </div>


                                            <strong
                                                style={{
                                                    fontSize:
                                                        "18px"
                                                }}
                                            >
                                                {
                                                    selectedTutor.accountName
                                                }
                                            </strong>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "8px",

                                                    fontSize:
                                                        "12px",

                                                    color:
                                                        COLORS.muted
                                                }}
                                            >
                                                사번 {
                                                    selectedTutor.employeeNo
                                                }
                                            </div>


                                            {selectedTutor.subjectList && (

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "8px",

                                                        fontSize:
                                                            "12px"
                                                    }}
                                                >

                                                    담당 과목:{" "}

                                                    {
                                                        selectedTutor.subjectList
                                                            .map(
                                                                subject =>
                                                                    subject.academySubjectName
                                                            )
                                                            .join(", ")
                                                    }

                                                </div>

                                            )}

                                        </div>


                                        <Button
                                            variant="outline-secondary"
                                            className="w-100"
                                            onClick={
                                                loadTutors
                                            }
                                        >
                                            강사 변경
                                        </Button>

                                    </div>

                                )}

                            </div>

                        </div>

                    </Col>

                </Row>


                {/* =================================================
                    수업 일정
                ================================================= */}
                <div
                    style={{
                        background:
                            COLORS.surface,

                        border:
                            `1px solid ${COLORS.border}`,

                        borderRadius:
                            "11px",

                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.02)"
                    }}
                >

                    <div
                        className="d-flex justify-content-between align-items-center"
                        style={{
                            padding:
                                "18px 22px",

                            borderBottom:
                                `1px solid ${COLORS.border}`
                        }}
                    >

                        <div>

                            <h5
                                style={{
                                    fontSize:
                                        "15px",

                                    fontWeight:
                                        "700",

                                    marginBottom:
                                        "3px"
                                }}
                            >
                                수업 일정
                            </h5>


                            <small
                                style={{
                                    color:
                                        COLORS.muted
                                }}
                            >
                                반복되는 수업 요일과 시간을 등록합니다.
                            </small>

                        </div>


                        <Button
                            size="sm"
                            style={{
                                background:
                                    COLORS.primary,

                                borderColor:
                                    COLORS.primary
                            }}
                            onClick={
                                addSchedule
                            }
                        >

                            <FaPlus className="me-1" />

                            일정 추가

                        </Button>

                    </div>


                    <div
                        style={{
                            padding: "20px"
                        }}
                    >

                        {course.schedules.map(
                            (schedule, index) => (

                                <div
                                    key={index}
                                    style={{
                                        border:
                                            `1px solid ${COLORS.border}`,

                                        borderRadius:
                                            "9px",

                                        marginBottom:
                                            index ===
                                                course.schedules.length - 1
                                                ? 0
                                                : "14px",

                                        overflow:
                                            "hidden"
                                    }}
                                >

                                    {/* 일정 헤더 */}
                                    <div
                                        className="d-flex justify-content-between align-items-center"
                                        style={{
                                            background:
                                                COLORS.bg,

                                            padding:
                                                "11px 15px",

                                            borderBottom:
                                                `1px solid ${COLORS.border}`
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    "13px",

                                                fontWeight:
                                                    "700"
                                            }}
                                        >

                                            <FaCalendarPlus
                                                className="me-2"
                                                style={{
                                                    color:
                                                        COLORS.primary
                                                }}
                                            />

                                            수업 일정 {
                                                index + 1
                                            }

                                        </div>


                                        <Button
                                            variant="link"
                                            size="sm"
                                            style={{
                                                color:
                                                    COLORS.danger,

                                                textDecoration:
                                                    "none"
                                            }}
                                            onClick={() =>
                                                removeSchedule(index)
                                            }
                                        >
                                            <FaTrash />
                                        </Button>

                                    </div>


                                    <div
                                        style={{
                                            padding: "18px"
                                        }}
                                    >

                                        <Row className="g-3">

                                            {/* 시작일 */}
                                            <Col md={3}>

                                                <Form.Label>
                                                    시작일
                                                </Form.Label>


                                                <Form.Control
                                                    type="date"
                                                    name="scheduleOpen"
                                                    value={
                                                        schedule.scheduleOpen
                                                    }
                                                    onChange={e =>
                                                        changeScheduleValue(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                />

                                            </Col>


                                            {/* 종료일 */}
                                            <Col md={3}>

                                                <Form.Label>
                                                    종료일
                                                </Form.Label>


                                                <Form.Control
                                                    type="date"
                                                    name="scheduleClose"
                                                    value={
                                                        schedule.scheduleClose
                                                    }
                                                    onChange={e =>
                                                        changeScheduleValue(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                />

                                            </Col>


                                            {/* 요일 */}
                                            <Col md={2}>

                                                <Form.Label>
                                                    요일
                                                </Form.Label>


                                                <Form.Select
                                                    name="scheduleWeek"
                                                    value={
                                                        schedule.scheduleWeek
                                                    }
                                                    onChange={e =>
                                                        changeScheduleValue(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        선택
                                                    </option>

                                                    <option value="월">
                                                        월요일
                                                    </option>

                                                    <option value="화">
                                                        화요일
                                                    </option>

                                                    <option value="수">
                                                        수요일
                                                    </option>

                                                    <option value="목">
                                                        목요일
                                                    </option>

                                                    <option value="금">
                                                        금요일
                                                    </option>

                                                    <option value="토">
                                                        토요일
                                                    </option>

                                                </Form.Select>

                                            </Col>


                                            {/* 시작시간 */}
                                            <Col md={2}>

                                                <Form.Label>
                                                    시작
                                                </Form.Label>


                                                <Form.Control
                                                    type="time"
                                                    name="scheduleStart"
                                                    value={
                                                        schedule.scheduleStart
                                                    }
                                                    onChange={e =>
                                                        changeScheduleValue(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                />

                                            </Col>


                                            {/* 종료시간 */}
                                            <Col md={2}>

                                                <Form.Label>
                                                    종료
                                                </Form.Label>


                                                <Form.Control
                                                    type="time"
                                                    name="scheduleEnd"
                                                    value={
                                                        schedule.scheduleEnd
                                                    }
                                                    onChange={e =>
                                                        changeScheduleValue(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                />

                                            </Col>


                                            {/* 강의실 */}
                                            <Col md={4}>

                                                <Form.Label>
                                                    강의실
                                                </Form.Label>


                                                <div
                                                    className="d-flex gap-2"
                                                >

                                                    <Form.Control
                                                        readOnly
                                                        value={
                                                            schedule.classroomNo
                                                                ? `${schedule.classroomNo}번 강의실`
                                                                : ""
                                                        }
                                                        placeholder="강의실을 선택해주세요."
                                                    />


                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() =>
                                                            openClassroomModal(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        선택
                                                    </Button>

                                                </div>

                                            </Col>

                                        </Row>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* =================================================
                    하단 버튼
                ================================================= */}
                <div
                    className="d-flex justify-content-end gap-2 mt-4"
                >

                    <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={() =>
                            navigate(
                                "/employee/course"
                            )
                        }
                    >
                        취소
                    </Button>


                    <Button
                        size="lg"
                        style={{
                            background:
                                COLORS.primary,

                            borderColor:
                                COLORS.primary
                        }}
                        onClick={
                            sendCourseCreate
                        }
                    >

                        <FaCheck
                            className="me-2"
                        />

                        강좌 등록

                    </Button>

                </div>

            </div>


            {/* =====================================================
                강사 선택 Modal
            ===================================================== */}
            <Modal
                show={showTutorModal}
                onHide={() =>
                    setShowTutorModal(false)
                }
                centered
                size="lg"
            >

                <Modal.Header closeButton>

                    <Modal.Title
                        style={{ fontSize: "17px", fontWeight: "700" }}
                    >
                        담당 강사 선택
                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    {/* 검색 */}
                    <div className="d-flex gap-2 mb-3">

                        <Form.Control
                            placeholder="강사 이름 검색"
                            value={tutorKeyword}
                            onChange={e =>
                                setTutorKeyword(e.target.value)
                            }
                        />


                        <Button
                            style={{
                                background: COLORS.primary,
                                borderColor: COLORS.primary
                            }}
                            onClick={loadTutors}
                        >
                            <FaMagnifyingGlass />
                        </Button>

                    </div>


                    {/* 강사 목록 */}
                    <div
                        style={{
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "8px",
                            overflow: "hidden"
                        }}
                    >

                        {tutors.length === 0 ? (

                            <div
                                className="text-center"
                                style={{
                                    padding: "35px",
                                    color: COLORS.muted,
                                    fontSize: "13px"
                                }}
                            >
                                조회된 강사가 없습니다.
                            </div>

                        ) : (
                            tutors.map(
                                tutor => (
                                    <div
                                        key={
                                            tutor.employeeNo
                                        }
                                        onClick={() =>
                                            selectTutor(
                                                tutor
                                            )
                                        }
                                        style={{
                                            padding:
                                                "15px 18px",

                                            borderBottom:
                                                `1px solid ${COLORS.border}`,

                                            cursor:
                                                "pointer"
                                        }}
                                        onMouseEnter={e => {

                                            e.currentTarget.style.background =
                                                COLORS.primaryLight;

                                        }}
                                        onMouseLeave={e => {

                                            e.currentTarget.style.background =
                                                COLORS.surface;

                                        }}
                                    >

                                        <div
                                            className="d-flex justify-content-between"
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        tutor.accountName
                                                    }
                                                </strong>


                                                <span
                                                    style={{
                                                        marginLeft:
                                                            "10px",

                                                        color:
                                                            COLORS.muted,

                                                        fontSize:
                                                            "12px"
                                                    }}
                                                >
                                                    사번 {
                                                        tutor.employeeNo
                                                    }
                                                </span>

                                            </div>


                                            {tutor.subjectList && (

                                                <span
                                                    style={{
                                                        background:
                                                            COLORS.primaryLight,

                                                        color:
                                                            COLORS.primaryDark,

                                                        padding:
                                                            "3px 7px",

                                                        borderRadius:
                                                            "4px",

                                                        fontSize:
                                                            "11px"
                                                    }}
                                                >

                                                    {
                                                        tutor.subjectList
                                                            .map(
                                                                subject =>
                                                                    subject.academySubjectName
                                                            )
                                                            .join(", ")
                                                    }

                                                </span>

                                            )}

                                        </div>


                                        {tutor.accountPhone && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "5px",

                                                    fontSize:
                                                        "12px",

                                                    color:
                                                        COLORS.muted
                                                }}
                                            >
                                                {
                                                    tutor.accountPhone
                                                }
                                            </div>

                                        )}

                                    </div>

                                )
                            )

                        )}

                    </div>

                </Modal.Body>

            </Modal>


            {/* =====================================================
                강의실 선택 Modal
            ===================================================== */}
            <Modal
                show={
                    showClassroomModal
                }
                onHide={() =>
                    setShowClassroomModal(
                        false
                    )
                }
                centered
            >

                <Modal.Header closeButton>

                    <Modal.Title
                        style={{
                            fontSize:
                                "17px",

                            fontWeight:
                                "700"
                        }}
                    >
                        강의실 선택
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    {classrooms.length === 0 ? (

                        <div
                            className="text-center"
                            style={{
                                padding:
                                    "30px",

                                color:
                                    COLORS.muted
                            }}
                        >
                            현재 일정에서 사용 가능한 강의실이 없습니다.
                        </div>

                    ) : (

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "repeat(2, 1fr)",

                                gap:
                                    "10px"
                            }}
                        >

                            {classrooms.map(
                                classroom => (

                                    <div
                                        key={
                                            classroom.classroomNo
                                        }
                                        onClick={() =>
                                            selectClassroom(
                                                classroom
                                            )
                                        }
                                        style={{
                                            padding:
                                                "16px",

                                            border:
                                                `1px solid ${COLORS.border}`,

                                            borderRadius:
                                                "8px",

                                            cursor:
                                                "pointer"
                                        }}
                                        onMouseEnter={e => {

                                            e.currentTarget.style.background =
                                                COLORS.primaryLight;

                                        }}
                                        onMouseLeave={e => {

                                            e.currentTarget.style.background =
                                                COLORS.surface;

                                        }}
                                    >

                                        <strong>
                                            {
                                                classroom.classroomName ||
                                                `${classroom.classroomNo}번 강의실`
                                            }
                                        </strong>


                                        <div
                                            style={{
                                                fontSize:
                                                    "12px",

                                                color:
                                                    COLORS.muted,

                                                marginTop:
                                                    "5px"
                                            }}
                                        >
                                            정원 {
                                                classroom.classroomCapacity
                                            }명
                                        </div>


                                        <div
                                            style={{
                                                marginTop:
                                                    "5px",

                                                fontSize:
                                                    "12px",

                                                fontWeight:
                                                    "600",

                                                color:
                                                    classroom.classroomStatus ===
                                                        "사용가능"
                                                        ? COLORS.success
                                                        : COLORS.warning
                                            }}
                                        >
                                            상태 · {
                                                classroom.classroomStatus
                                            }
                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </Modal.Body>

            </Modal>

        </div >

    );

}