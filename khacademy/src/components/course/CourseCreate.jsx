import { useCallback, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaArrowLeft, FaCalendarDays, FaPlus, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { apiClient } from "@utils/reaxios";
import "./CourseCreate.css";

const CourseCreate = () => {

    const navigate = useNavigate();

    // ==============================
    // 강좌 정보
    // ==============================
    const [course, setCourse] = useState({
        employeeNo: "",
        gradeNo: "",
        courseTitle: "",
        courseSubject: "",
        courseLimit: "",
        courseFee: "",
        courseInfo: "",
        courseType: "정규"
    });

    // ==============================
    // 시간표
    // ==============================
    const [schedules, setSchedules] = useState([]);

    // ==============================
    // 시간표 추가 모달
    // ==============================
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const [scheduleForm, setScheduleForm] = useState({
        scheduleWeek: "",
        scheduleOpen: "",
        scheduleClose: "",
        scheduleStart: "",
        scheduleEnd: "",
        classroomNo: ""
    });


    // ==============================
    // 임시 데이터
    // 실제 API 연결 시 교체
    // ==============================
    const employees = [
        { employeeNo: 1, employeeName: "홍길동" },
        { employeeNo: 2, employeeName: "김철수" },
        { employeeNo: 3, employeeName: "이영희" }
    ];

    const grades = [
        { gradeNo: 1, gradeName: "중등 1학년" },
        { gradeNo: 2, gradeName: "중등 2학년" },
        { gradeNo: 3, gradeName: "중등 3학년" },
        { gradeNo: 4, gradeName: "고등 1학년" },
        { gradeNo: 5, gradeName: "고등 2학년" },
        { gradeNo: 6, gradeName: "고등 3학년" }
    ];

    const classrooms = [
        { classroomNo: 301, classroomName: "301호" },
        { classroomNo: 302, classroomName: "302호" },
        { classroomNo: 303, classroomName: "303호" },
        { classroomNo: 304, classroomName: "304호" }
    ];

    const weekNames = {
        월: "월요일",
        화: "화요일",
        수: "수요일",
        목: "목요일",
        금: "금요일",
        토: "토요일",
        일: "일요일"
    };


    // ==============================
    // 강좌 정보 변경
    // ==============================
    const handleCourseChange = useCallback((e) => {
        const { name, value } = e.target;

        setCourse(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);


    // ==============================
    // 시간표 모달 열기
    // ==============================
    const handleOpenScheduleModal = useCallback(() => {

        setScheduleForm({
            scheduleWeek: "",
            scheduleOpen: "",
            scheduleClose: "",
            scheduleStart: "",
            scheduleEnd: "",
            classroomNo: ""
        });

        setShowScheduleModal(true);

    }, []);


    // ==============================
    // 시간표 모달 닫기
    // ==============================
    const handleCloseScheduleModal = useCallback(() => {
        setShowScheduleModal(false);
    }, []);


    // ==============================
    // 시간표 입력 변경
    // ==============================
    const handleScheduleChange = useCallback((e) => {

        const { name, value } = e.target;

        setScheduleForm(prev => ({
            ...prev,
            [name]: value
        }));

    }, []);


    // ==============================
    // 시간표 추가
    // ==============================
    const handleAddSchedule = useCallback(() => {

        const {
            scheduleWeek,
            scheduleOpen,
            scheduleClose,
            scheduleStart,
            scheduleEnd,
            classroomNo
        } = scheduleForm;


        // 필수값 검사
        if (!scheduleWeek) {
            Swal.fire({
                icon: "warning",
                title: "요일을 선택해주세요."
            });
            return;
        }

        if (!scheduleStart || !scheduleEnd) {
            Swal.fire({
                icon: "warning",
                title: "수업 시간을 입력해주세요."
            });
            return;
        }

        if (!classroomNo) {
            Swal.fire({
                icon: "warning",
                title: "강의실을 선택해주세요."
            });
            return;
        }


        // 시작 시간이 종료 시간보다 늦은 경우
        if (scheduleStart >= scheduleEnd) {
            Swal.fire({
                icon: "warning",
                title: "수업 시간을 확인해주세요.",
                text: "종료 시간은 시작 시간보다 늦어야 합니다."
            });
            return;
        }


        // 같은 요일 + 같은 시간이 이미 존재하는지 검사
        const duplicated = schedules.some(schedule =>
            schedule.scheduleWeek === scheduleWeek &&
            schedule.scheduleStart === scheduleStart &&
            schedule.scheduleEnd === scheduleEnd
        );

        if (duplicated) {
            Swal.fire({
                icon: "warning",
                title: "이미 등록된 시간표입니다."
            });
            return;
        }


        const newSchedule = {
            ...scheduleForm,
            classroomNo: Number(classroomNo)
        };

        setSchedules(prev => [
            ...prev,
            newSchedule
        ]);

        setShowScheduleModal(false);

    }, [scheduleForm, schedules]);


    // ==============================
    // 시간표 삭제
    // ==============================
    const handleDeleteSchedule = useCallback((index) => {

        Swal.fire({
            icon: "question",
            title: "시간표를 삭제할까요?",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소"
        }).then(result => {

            if (result.isConfirmed) {

                setSchedules(prev =>
                    prev.filter((_, i) => i !== index)
                );

            }

        });

    }, []);


    // ==============================
    // 강좌 등록
    // ==============================
    const handleSubmit = useCallback(async (e) => {

        e.preventDefault();


        // 강좌 필수값 검사
        if (!course.employeeNo) {
            Swal.fire({
                icon: "warning",
                title: "담당 강사를 선택해주세요."
            });
            return;
        }

        if (!course.gradeNo) {
            Swal.fire({
                icon: "warning",
                title: "학년을 선택해주세요."
            });
            return;
        }

        if (!course.courseTitle.trim()) {
            Swal.fire({
                icon: "warning",
                title: "강좌명을 입력해주세요."
            });
            return;
        }

        if (!course.courseSubject.trim()) {
            Swal.fire({
                icon: "warning",
                title: "과목을 입력해주세요."
            });
            return;
        }

        if (!course.courseLimit || Number(course.courseLimit) <= 0) {
            Swal.fire({
                icon: "warning",
                title: "수강 정원을 입력해주세요."
            });
            return;
        }

        if (course.courseFee === "" || Number(course.courseFee) < 0) {
            Swal.fire({
                icon: "warning",
                title: "수강료를 입력해주세요."
            });
            return;
        }


        // 시간표 최소 1개
        if (schedules.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "시간표를 최소 1개 등록해주세요."
            });
            return;
        }


        // ==============================
        // 백엔드 Request VO 구조
        // ==============================
        const request = {
            employeeNo: Number(course.employeeNo),
            gradeNo: Number(course.gradeNo),

            courseTitle: course.courseTitle,
            courseSubject: course.courseSubject,

            courseLimit: Number(course.courseLimit),
            courseFee: Number(course.courseFee),

            courseInfo: course.courseInfo,
            courseType: course.courseType,

            schedules: schedules
        };


        console.log("강좌 등록 요청:", request);


        try {

            await apiClient.post(
                "/employee/course",
                request
            );


            await Swal.fire({
                icon: "success",
                title: "강좌가 등록되었습니다.",
                confirmButtonText: "확인"
            });


            navigate("/employee/course");

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "강좌 등록에 실패했습니다.",
                text: error.response?.data?.message
                    || "잠시 후 다시 시도해주세요."
            });

        }

    }, [course, schedules, navigate]);


    return (
        <div className="course-create-page">

            {/* ==============================
                페이지 헤더
            ============================== */}
            <div className="course-page-header">

                <div>
                    <div className="course-breadcrumb">
                        강좌 관리
                        <span>/</span>
                        강좌 등록
                    </div>

                    <h2>강좌 등록</h2>

                    <p>
                        새로운 강좌의 기본 정보와 수업 시간표를 등록합니다.
                    </p>
                </div>

                <Button
                    className="btn-back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                    이전
                </Button>

            </div>


            <Form onSubmit={handleSubmit}>

                {/* ==============================
                    강좌 기본 정보
                ============================== */}
                <section className="course-section">

                    <div className="section-title">

                        <div className="section-icon">
                            <FaCalendarDays />
                        </div>

                        <div>
                            <h4>강좌 기본 정보</h4>
                            <p>강좌 운영에 필요한 기본 정보를 입력하세요.</p>
                        </div>

                    </div>


                    <div className="section-body">

                        <Row>

                            <Col md={6}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        담당 강사
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <Form.Select
                                        name="employeeNo"
                                        value={course.employeeNo}
                                        onChange={handleCourseChange}
                                    >
                                        <option value="">
                                            담당 강사를 선택하세요
                                        </option>

                                        {employees.map(employee => (
                                            <option
                                                key={employee.employeeNo}
                                                value={employee.employeeNo}
                                            >
                                                {employee.employeeName}
                                            </option>
                                        ))}

                                    </Form.Select>

                                </Form.Group>

                            </Col>


                            <Col md={6}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        대상 학년
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <Form.Select
                                        name="gradeNo"
                                        value={course.gradeNo}
                                        onChange={handleCourseChange}
                                    >
                                        <option value="">
                                            학년을 선택하세요
                                        </option>

                                        {grades.map(grade => (
                                            <option
                                                key={grade.gradeNo}
                                                value={grade.gradeNo}
                                            >
                                                {grade.gradeName}
                                            </option>
                                        ))}

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>


                        <Row>

                            <Col md={8}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        강좌명
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="courseTitle"
                                        value={course.courseTitle}
                                        onChange={handleCourseChange}
                                        placeholder="예) 고등 수학 심화반"
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={4}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        강좌 유형
                                    </Form.Label>

                                    <Form.Select
                                        name="courseType"
                                        value={course.courseType}
                                        onChange={handleCourseChange}
                                    >
                                        <option value="정규">정규</option>
                                        <option value="보충">보충</option>
                                        <option value="특강">특강</option>
                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>


                        <Row>

                            <Col md={4}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        과목
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="courseSubject"
                                        value={course.courseSubject}
                                        onChange={handleCourseChange}
                                        placeholder="예) 수학"
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={4}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        수강 정원
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="courseLimit"
                                        value={course.courseLimit}
                                        onChange={handleCourseChange}
                                        min="1"
                                        placeholder="명"
                                    />

                                </Form.Group>

                            </Col>


                            <Col md={4}>

                                <Form.Group className="form-group">

                                    <Form.Label>
                                        수강료
                                        <span className="required">*</span>
                                    </Form.Label>

                                    <div className="input-with-unit">

                                        <Form.Control
                                            type="number"
                                            name="courseFee"
                                            value={course.courseFee}
                                            onChange={handleCourseChange}
                                            min="0"
                                            placeholder="0"
                                        />

                                        <span>원</span>

                                    </div>

                                </Form.Group>

                            </Col>

                        </Row>


                        <Form.Group className="form-group">

                            <Form.Label>
                                강좌 설명
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                name="courseInfo"
                                value={course.courseInfo}
                                onChange={handleCourseChange}
                                rows={5}
                                placeholder="강좌에 대한 상세 설명을 입력하세요."
                            />

                        </Form.Group>

                    </div>

                </section>


                {/* ==============================
                    시간표
                ============================== */}
                <section className="course-section">

                    <div className="section-title schedule-header">

                        <div className="section-title-left">

                            <div className="section-icon">
                                <FaCalendarDays />
                            </div>

                            <div>
                                <h4>시간표</h4>
                                <p>
                                    강좌의 요일별 수업 일정을 등록하세요.
                                </p>
                            </div>

                        </div>


                        <Button
                            type="button"
                            className="btn-add-schedule"
                            onClick={handleOpenScheduleModal}
                        >
                            <FaPlus />
                            수업 시간 추가
                        </Button>

                    </div>


                    <div className="section-body schedule-body">

                        {schedules.length === 0 ? (

                            <div className="empty-schedule">

                                <FaCalendarDays />

                                <h5>등록된 시간표가 없습니다.</h5>

                                <p>
                                    수업 시간 추가 버튼을 눌러
                                    강좌의 시간표를 등록해주세요.
                                </p>

                                <Button
                                    type="button"
                                    className="btn-empty-add"
                                    onClick={handleOpenScheduleModal}
                                >
                                    <FaPlus />
                                    첫 번째 수업 추가
                                </Button>

                            </div>

                        ) : (

                            <div className="schedule-table">

                                <div className="schedule-table-head">

                                    <div>요일</div>
                                    <div>수업 기간</div>
                                    <div>수업 시간</div>
                                    <div>강의실</div>
                                    <div></div>

                                </div>


                                {schedules.map((schedule, index) => {

                                    const classroom =
                                        classrooms.find(
                                            item =>
                                                item.classroomNo ===
                                                schedule.classroomNo
                                        );

                                    return (

                                        <div
                                            className="schedule-table-row"
                                            key={index}
                                        >

                                            <div className="schedule-week">

                                                <span>
                                                    {weekNames[
                                                        schedule.scheduleWeek
                                                    ]}
                                                </span>

                                            </div>


                                            <div className="schedule-period">

                                                {schedule.scheduleOpen
                                                    ? schedule.scheduleOpen
                                                    : "미정"
                                                }

                                                <span>~</span>

                                                {schedule.scheduleClose
                                                    ? schedule.scheduleClose
                                                    : "미정"
                                                }

                                            </div>


                                            <div className="schedule-time">

                                                <strong>
                                                    {schedule.scheduleStart}
                                                </strong>

                                                <span>~</span>

                                                <strong>
                                                    {schedule.scheduleEnd}
                                                </strong>

                                            </div>


                                            <div className="schedule-classroom">

                                                {classroom?.classroomName
                                                    || `${schedule.classroomNo}호`
                                                }

                                            </div>


                                            <div className="schedule-action">

                                                <Button
                                                    type="button"
                                                    className="btn-delete-schedule"
                                                    onClick={() =>
                                                        handleDeleteSchedule(index)
                                                    }
                                                >
                                                    <FaTrash />
                                                </Button>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        )}

                    </div>

                </section>


                {/* ==============================
                    하단 버튼
                ============================== */}
                <div className="course-form-footer">

                    <Button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate(-1)}
                    >
                        취소
                    </Button>

                    <Button
                        type="submit"
                        className="btn-submit"
                    >
                        강좌 등록
                    </Button>

                </div>

            </Form>


            {/* ==============================
                시간표 추가 Modal
            ============================== */}
            <Modal
                show={showScheduleModal}
                onHide={handleCloseScheduleModal}
                centered
                className="schedule-modal"
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        수업 시간 추가
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    <div className="modal-description">
                        해당 강좌의 수업 일정을 입력하세요.
                    </div>


                    <Row>

                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    요일
                                    <span className="required">*</span>
                                </Form.Label>

                                <Form.Select
                                    name="scheduleWeek"
                                    value={scheduleForm.scheduleWeek}
                                    onChange={handleScheduleChange}
                                >
                                    <option value="">
                                        요일 선택
                                    </option>

                                    {Object.entries(weekNames).map(
                                        ([key, value]) => (
                                            <option
                                                key={key}
                                                value={key}
                                            >
                                                {value}
                                            </option>
                                        )
                                    )}

                                </Form.Select>

                            </Form.Group>

                        </Col>


                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    강의실
                                    <span className="required">*</span>
                                </Form.Label>

                                <Form.Select
                                    name="classroomNo"
                                    value={scheduleForm.classroomNo}
                                    onChange={handleScheduleChange}
                                >
                                    <option value="">
                                        강의실 선택
                                    </option>

                                    {classrooms.map(classroom => (
                                        <option
                                            key={classroom.classroomNo}
                                            value={classroom.classroomNo}
                                        >
                                            {classroom.classroomName}
                                        </option>
                                    ))}

                                </Form.Select>

                            </Form.Group>

                        </Col>

                    </Row>


                    <div className="modal-sub-title">
                        수업 기간
                    </div>


                    <Row>

                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    개강일
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="scheduleOpen"
                                    value={scheduleForm.scheduleOpen}
                                    onChange={handleScheduleChange}
                                />

                            </Form.Group>

                        </Col>


                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    종강일
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="scheduleClose"
                                    value={scheduleForm.scheduleClose}
                                    onChange={handleScheduleChange}
                                />

                            </Form.Group>

                        </Col>

                    </Row>


                    <div className="modal-sub-title">
                        수업 시간
                    </div>


                    <Row>

                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    시작 시간
                                    <span className="required">*</span>
                                </Form.Label>

                                <Form.Control
                                    type="time"
                                    name="scheduleStart"
                                    value={scheduleForm.scheduleStart}
                                    onChange={handleScheduleChange}
                                />

                            </Form.Group>

                        </Col>


                        <Col md={6}>

                            <Form.Group className="modal-form-group">

                                <Form.Label>
                                    종료 시간
                                    <span className="required">*</span>
                                </Form.Label>

                                <Form.Control
                                    type="time"
                                    name="scheduleEnd"
                                    value={scheduleForm.scheduleEnd}
                                    onChange={handleScheduleChange}
                                />

                            </Form.Group>

                        </Col>

                    </Row>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={handleCloseScheduleModal}
                    >
                        취소
                    </Button>

                    <Button
                        type="button"
                        className="btn-modal-add"
                        onClick={handleAddSchedule}
                    >
                        <FaPlus />
                        시간표 추가
                    </Button>

                </Modal.Footer>

            </Modal>

        </div>
    );
};