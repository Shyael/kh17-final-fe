import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FaCheck, FaPlus, FaRegImage, FaXmark } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

registerLocale("ko", ko);

//시간 선택 시 현재 이후만 선택 가능
const filterFutureTime = (time) => new Date().getTime() < new Date(time).getTime();

//새 보기 생성
const createOption = (order) => ({
    tempId: crypto.randomUUID(),
    optionNo: null,

    optionContent: "",
    optionIsAnswer: "N",
    optionOrder: order
});


//새 문제 생성
const createQuestion = (order) => ({
    tempId: crypto.randomUUID(),
    questionNo: null,

    questionContent: "",
    questionScore: "",
    questionComment: "",
    questionOrder: order,

    //새로 선택한 문제 첨부파일
    files: [],

    //기존(DB) 첨부파일
    beforeFiles: [],

    //기본 보기 2개
    options: [
        createOption(1),
        createOption(2)
    ]
});


export default function ExamManage() {

    //주소에서 시험 번호가져오기
    const { examNo: paramExamNo } = useParams();

    //수정인지
    const isEdit = paramExamNo !== undefined;

    //생성된 시험번호
    const [examNo, setExamNo] = useState(null);


    //시험 기본정보
    const [exam, setExam] = useState({
        courseNo: "",
        examTitle: "",
        examInfo: "",
        examStart: "",
        examEnd: "",
        examLimit: ""
    });


    //문제 목록
    const [questionList, setQuestionList] = useState([
        createQuestion(1)
    ]);


    //DB에 저장된 문제 중 삭제된 문제번호
    const [deletedQuestionNos, setDeletedQuestionNos] = useState([]);


    //DB에 저장된 보기 중 삭제된 보기번호
    const [deletedOptionNos, setDeletedOptionNos] = useState([]);


    //내가 담당하는 강의 목록
    const [courseList, setCourseList] = useState([]);

    //제한시간 없음 체크 여부
    const [noLimit, setNoLimit] = useState(false);


    //====================================================
    // 시험
    //====================================================
    //수정이면 시험 불러오기
    const loadExam = useCallback(async () => {
        try {
            const response = await apiClient.get(`/exam/${paramExamNo}`);
            const data = response.data;
            //시험 기본정보
            setExam({
                courseNo: data.courseNo,
                examTitle: data.examTitle,
                examInfo: data.examInfo,
                examStart: data.examStart,
                examEnd: data.examEnd,
                examLimit: data.examLimit ?? ""
            });

            //제한시간 없음 여부
            setNoLimit(data.examLimit == null);

            //시험번호
            setExamNo(data.examNo);

            //문제 + 보기
            setQuestionList(
                data.questionList.map(question => ({
                    //React에서 사용할 식별값
                    tempId: crypto.randomUUID(),
                    questionNo: question.questionNo,
                    questionContent: question.questionContent,
                    questionScore: question.questionScore,
                    questionComment: question.questionComment,
                    questionOrder: question.questionOrder,
                    files: [],
                    //DB에 저장된 기존 첨부파일
                    beforeFiles: question.fileList ?? question.attachList ?? [],
                    options: question.optionList.map(option => ({
                            tempId: crypto.randomUUID(),
                            optionNo: option.optionNo,
                            optionContent: option.optionContent,
                            optionIsAnswer: option.optionIsAnswer,
                            optionOrder: option.optionOrder
                        }))
                }))
            );
        }
        catch (e) {
            console.error(e);
            toast.error("시험 정보를 불러오지 못했습니다.");
        }
    }, [paramExamNo]);

    //최초 1회, 수정 모드일 때만 시험 조회
    useEffect(() => {
        if (!paramExamNo) return;
        loadExam();
    }, [paramExamNo, loadExam]);


    //강의 목록 조회
    const loadCourseList = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/course/tutor");
            setCourseList(response.data);
        }
        catch (e) {
            console.error(e);
        }
    }, []);

    //최초 1회 강의 목록 조회
    useEffect(() => {
        loadCourseList();
    }, [loadCourseList]);


    //시험 기본정보 변경
    const changeExam = useCallback((e) => {
        const { name, value } = e.target;
        setExam(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);


    //제한시간 없음 체크
    const changeNoLimit = useCallback((e) => {
        const checked = e.target.checked;

        setNoLimit(checked);

        if (checked) {
            setExam(prev => ({
                ...prev,
                examLimit: ""
            }));
        }
    }, []);


    //시험 최초 등록
    const insertExam = useCallback(async () => {
        try {
            const data = {
                courseNo: Number(exam.courseNo),
                examTitle: exam.examTitle,
                examInfo: exam.examInfo,
                examStart: exam.examStart,
                examEnd: exam.examEnd,
                examLimit: exam.examLimit === "" ? null : Number(exam.examLimit)
            };

            const response = await apiClient.post("/exam/", data);

            //생성된 시험번호 보관
            setExamNo(response.data);

            toast.success("시험 기본정보가 저장되었습니다.");
        }
        catch (e) {
            console.error(e);
            toast.error("시험 등록에 실패했습니다.");
        }
    }, [exam]);

    //시험 기본정보 수정
    const updateExam = useCallback(async () => {
        try {
            const data = {
                courseNo: Number(exam.courseNo),
                examTitle: exam.examTitle,
                examInfo: exam.examInfo,
                examStart: exam.examStart,
                examEnd: exam.examEnd,
                examLimit: exam.examLimit === "" ? null : Number(exam.examLimit),
                //현재 상태 유지
                examStatus: exam.examStatus
            };

            await apiClient.put(`/exam/${examNo}`, data);

            toast.success("시험 기본정보가 수정되었습니다.");
        }
        catch (e) {
            console.error(e);
            toast.error("시험 수정에 실패했습니다.");
        }
    }, [exam, examNo]);

    //====================================================
    // 문제
    //====================================================

    //문항 추가
    const addQuestion = useCallback(() => {
        setQuestionList(prev => [
            ...prev,
            createQuestion(prev.length + 1)
        ]);
    }, []);

    //문제 내용 변경
    const changeQuestion = useCallback((tempId, e) => {
        const { name, value } = e.target;
        setQuestionList(prev =>
            prev.map(question =>
                question.tempId === tempId
                    ? {
                        ...question,
                        [name]: value
                    }
                    : question
            )
        );
    }, []);

    //문제 첨부파일 변경
    const changeQuestionFiles = useCallback((tempId, e) => {
        const selectedFiles = Array.from(e.target.files);

        setQuestionList(prev =>
            prev.map(question =>
                question.tempId === tempId
                    ? {
                        ...question,
                        files: selectedFiles
                    }
                    : question
            )
        );
    }, []);


    //기존(DB) 첨부파일 삭제
    const removeBeforeFile = useCallback(async (questionTempId, questionNo, attachNo) => {
        try {
            await apiClient.delete(`/question/${questionNo}/file/${attachNo}`);

            setQuestionList(prev =>
                prev.map(question =>
                    question.tempId === questionTempId
                        ? {
                            ...question,
                            beforeFiles: question.beforeFiles.filter(
                                file => file.attachNo !== attachNo
                            )
                        }
                        : question
                )
            );

            toast.success("첨부파일이 삭제되었습니다.");
        }
        catch (e) {
            console.error(e);
            toast.error("첨부파일 삭제에 실패했습니다.");
        }
    }, []);


    //문제 삭제
    const removeQuestion = useCallback((tempId) => {
        setQuestionList(prev => {
            const target =
                prev.find(
                    question =>
                        question.tempId === tempId
                );

            //이미 DB에 저장된 문제라면
            if (target?.questionNo != null) {
                setDeletedQuestionNos(old => [
                    ...old,
                    target.questionNo
                ]);
            }

            const filtered =
                prev.filter(
                    question =>
                        question.tempId !== tempId
                );

            //문제 순서 다시 설정
            return filtered.map(
                (question, index) => ({
                    ...question,
                    questionOrder: index + 1
                })
            );
        });
    }, []);

    //====================================================
    // 보기
    //====================================================

    //보기 추가
    const addOption = useCallback((questionTempId) => {
        setQuestionList(prev =>
            prev.map(question => {

                if (
                    question.tempId !==
                    questionTempId
                ) {
                    return question;
                }

                return {
                    ...question,

                    options: [
                        ...question.options,

                        createOption(
                            question.options.length + 1
                        )
                    ]
                };
            })
        );
    }, []);


    //보기 내용 변경
    const changeOption = useCallback((questionTempId, optionTempId, e) => {
        const { name, value } = e.target;

        setQuestionList(prev =>
            prev.map(question => {

                if (
                    question.tempId !==
                    questionTempId
                ) {
                    return question;
                }


                return {
                    ...question,

                    options:
                        question.options.map(
                            option =>
                                option.tempId === optionTempId
                                    ? {
                                        ...option,
                                        [name]: value
                                    }
                                    : option
                        )
                };
            })
        );

    }, []);

    //정답 선택
    const changeCorrectOption = useCallback((
        questionTempId,
        optionTempId
    ) => {
        setQuestionList(prev =>
            prev.map(question => {

                if (
                    question.tempId !==
                    questionTempId
                ) {
                    return question;
                }

                return {
                    ...question,
                    //한 문제당 정답 하나
                    options:
                        question.options.map(
                            option => ({
                                ...option,

                                optionIsAnswer:
                                    option.tempId === optionTempId
                                        ? "Y"
                                        : "N"
                            })
                        )
                };
            })
        );
    }, []);


    //보기 삭제
    const removeOption = useCallback((
        questionTempId,
        optionTempId
    ) => {
        setQuestionList(prev =>
            prev.map(question => {
                if (
                    question.tempId !==
                    questionTempId
                ) {
                    return question;
                }

                const target =
                    question.options.find(
                        option =>
                            option.tempId === optionTempId
                    );

                //이미 DB에 저장된 보기라면
                if (target?.optionNo != null) {

                    setDeletedOptionNos(old => [
                        ...old,
                        target.optionNo
                    ]);
                }

                const filtered =
                    question.options.filter(
                        option =>
                            option.tempId !== optionTempId
                    );

                //보기 순서 다시 설정
                const reordered =
                    filtered.map(
                        (option, index) => ({
                            ...option,
                            optionOrder: index + 1
                        })
                    );

                return {
                    ...question,
                    options: reordered
                };
            })
        );

    }, []);


    //====================================================
    // 임시저장
    //====================================================

    //저장 전 문항 유효성 검사 (통과하면 true)
    const validateQuestions = useCallback(() => {

        if (questionList.length === 0) {
            toast.error("문항을 1개 이상 추가해주세요.");
            return false;
        }

        for (let i = 0; i < questionList.length; i++) {
            const question = questionList[i];
            const label = `${i + 1}번 문항`;

            //지문
            if (!question.questionContent.trim()) {
                toast.error(`${label}의 지문을 입력해주세요.`);
                return false;
            }

            //배점
            if (Number(question.questionScore) <= 0 || Number.isNaN(Number(question.questionScore))) {
                toast.error(`${label}의 배점을 입력해주세요.`);
                return false;
            }

            //보기 개수
            if (question.options.length < 2) {
                toast.error(`${label}의 보기를 2개 이상 입력해주세요.`);
                return false;
            }

            //보기 내용
            if (question.options.some(option => !option.optionContent.trim())) {
                toast.error(`${label}의 보기 내용을 모두 입력해주세요.`);
                return false;
            }

            //정답
            if (!question.options.some(option => option.optionIsAnswer === "Y")) {
                toast.error(`${label}의 정답을 선택해주세요.`);
                return false;
            }
        }

        return true;
    }, [questionList]);


    //문제 + 보기 일괄 임시저장 (성공하면 true)
    const saveQuestions = useCallback(async () => {
        //시험이 아직 만들어지지 않은 경우
        if (examNo === null) {
            toast.error("시험 기본정보를 먼저 저장해주세요.");
            return false;
        }

        //문항 유효성 검사
        if (!validateQuestions()) {
            return false;
        }

        try {
            //============================================
            // 문제 + 보기 전송 데이터
            //============================================
            const data = {
                questionList: questionList.map(question => ({
                    questionNo: question.questionNo,
                    questionContent: question.questionContent,
                    questionScore: Number(question.questionScore),
                    questionComment: question.questionComment,
                    questionOrder: Number(question.questionOrder),
                    optionList: question.options.map(option => ({
                        optionNo: option.optionNo,
                        optionContent: option.optionContent,
                        optionIsAnswer: option.optionIsAnswer,
                        optionOrder: Number(option.optionOrder)
                    }))
                })),

                //삭제할 기존 문제
                deletedQuestionNos: deletedQuestionNos,

                //삭제할 기존 보기
                deletedOptionNos: deletedOptionNos
            };

            //============================================
            // 1. 문제 + 보기 전체 일괄 저장
            //============================================

            const response = await apiClient.put(`/exam/${examNo}/draft`, data);

            //서버에서 questionNo / optionNo가
            //생성되어 돌아온 문제 목록
            const savedQuestionList = response.data.questionList ?? [];

            //============================================
            // 2. 첨부파일 업로드
            //============================================
            for (const question of questionList) {
                //새로 올릴 파일이 없는 문제
                if (!question.files || question.files.length === 0
                ) {
                    continue;
                }

                //questionOrder로 저장된 문제 찾기
                const savedQuestion =
                    savedQuestionList.find(
                        item =>
                            item.questionOrder ===
                            question.questionOrder
                    );

                if (!savedQuestion) {
                    continue;
                }

                //문제 수정 API가
                //question + files multipart를 받으므로 같이 전송
                const questionData = {
                    examNo: examNo,
                    questionContent: question.questionContent,
                    questionScore: Number(question.questionScore),
                    questionComment: question.questionComment,
                    questionOrder: Number(question.questionOrder)
                };

                const formData = new FormData();

                formData.append(
                    "question",
                    new Blob(
                        [
                            JSON.stringify(
                                questionData
                            )
                        ],
                        {
                            type: "application/json"
                        }
                    )
                );

                question.files.forEach(file => {
                    formData.append(
                        "files",
                        file
                    );
                });

                await apiClient.put(`/question/${savedQuestion.questionNo}`, formData);
            }

            //============================================
            // 2-1. 업로드 후 최신 첨부파일 목록 다시 조회
            //      (draft 응답은 파일 업로드 전에 만들어져서 새 첨부가 없음)
            //============================================
            let latestQuestionList = savedQuestionList;
            try {
                const latest = await apiClient.get(`/exam/${examNo}`);
                latestQuestionList = latest.data.questionList ?? savedQuestionList;
            }
            catch (e) {
                console.error(e);
            }

            //============================================
            // 3. DB에서 생성된 번호를 state에 반영
            //============================================

            setQuestionList(prev =>
                prev.map(question => {

                    const savedQuestion =
                        savedQuestionList.find(
                            item =>
                                item.questionOrder ===
                                question.questionOrder
                        );


                    if (!savedQuestion) {
                        return question;
                    }

                    //questionNo로 최신 문제(첨부파일 포함) 찾기
                    const latestQuestion =
                        latestQuestionList.find(
                            item =>
                                item.questionNo ===
                                savedQuestion.questionNo
                        );

                    return {
                        ...question,

                        //DB 문제번호
                        questionNo:
                            savedQuestion.questionNo,

                        //새로 업로드한 파일 초기화
                        files: [],

                        //서버가 내려준 최신 첨부파일 목록으로 갱신
                        beforeFiles:
                            latestQuestion?.fileList
                            ?? latestQuestion?.attachList
                            ?? savedQuestion.fileList
                            ?? savedQuestion.attachList
                            ?? question.beforeFiles,

                        options:
                            question.options.map(option => {
                                const savedOption =
                                    savedQuestion.optionList
                                        ?.find(
                                            item =>
                                                item.optionOrder ===
                                                option.optionOrder
                                        );

                                return {
                                    ...option,
                                    //DB 보기번호
                                    optionNo:
                                        savedOption?.optionNo
                                        ?? option.optionNo
                                };
                            })
                    };
                })
            );


            //============================================
            // 4. 삭제대기 목록 초기화
            //============================================

            setDeletedQuestionNos([]);
            setDeletedOptionNos([]);

            toast.success(
                "임시저장되었습니다."
            );

            return true;
        }
        catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message ?? "임시저장에 실패했습니다.");
            return false;
        }
    }, [examNo, questionList, deletedQuestionNos, deletedOptionNos, validateQuestions]);


    //====================================================
    // 출제완료
    //====================================================

    //문제 + 보기 저장 후 시험 상태를 공개로 변경
    const completeExam = useCallback(async () => {
        if (examNo === null) {
            toast.error("시험 기본정보를 먼저 저장해주세요.");
            return;
        }

        try {
            //문제 + 보기 일괄 저장 (유효성 검사 실패 시 중단)
            const saved = await saveQuestions();
            if (!saved) {
                return;
            }

            //시험 상태를 공개로 변경
            const data = {
                courseNo: Number(exam.courseNo),
                examTitle: exam.examTitle,
                examInfo: exam.examInfo,
                examStart: exam.examStart,
                examEnd: exam.examEnd,
                examLimit: exam.examLimit === "" ? null : Number(exam.examLimit),
                examStatus: "공개"
            };

            await apiClient.put(`/exam/${examNo}`, data);

            toast.success("출제가 완료되었습니다.");
        }
        catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message ?? "출제완료 처리에 실패했습니다.");
        }
    }, [examNo, exam, saveQuestions]);


    return (
        <>
            <Jumbotron title={isEdit ? "시험 수정" : "시험 등록"} />

            {/* 시험 정보 */}
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="mb-0">시험 정보</Card.Title>
                                <Button variant="primary" onClick={isEdit ? updateExam : insertExam}>
                                    <FaCheck className="me-2" />
                                    <span>저장</span>
                                </Button>
                            </div>

                            <Row>
                                <Col sm={6}>
                                    <Form.Label>강좌</Form.Label>
                                    <Form.Select
                                        name="courseNo"
                                        value={exam.courseNo}
                                        onChange={changeExam}>
                                        <option value="">강좌 선택</option>
                                        {courseList.map(course => (
                                            <option
                                                key={course.courseNo}
                                                value={course.courseNo}>
                                                {course.courseTitle}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col sm={6}>
                                    <Form.Label>시험명</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="examTitle"
                                        value={exam.examTitle}
                                        onChange={changeExam}
                                        placeholder="시험명을 입력하세요" />
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col xs={12} lg={7}>
                                    <Form.Label>응시 기간</Form.Label>
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <DatePicker
                                            selected={
                                                exam.examStart
                                                    ? new Date(exam.examStart)
                                                    : null
                                            }
                                            onChange={(date) => {
                                                setExam(prev => ({
                                                    ...prev,
                                                    examStart: date
                                                }));
                                            }}
                                            showTimeSelect
                                            timeIntervals={10}
                                            minDate={new Date()}
                                            filterTime={filterFutureTime}
                                            dateFormat="yyyy-MM-dd HH:mm"
                                            locale="ko"
                                            placeholderText="시작일시를 선택하세요"
                                            className="form-control" />
                                        <span>~</span>
                                        <DatePicker
                                            selected={
                                                exam.examEnd
                                                    ? new Date(exam.examEnd)
                                                    : null
                                            }
                                            onChange={(date) => {
                                                setExam(prev => ({
                                                    ...prev,
                                                    examEnd: date
                                                }));
                                            }}
                                            showTimeSelect
                                            timeIntervals={10}
                                            minDate={exam.examStart ? new Date(exam.examStart) : new Date()}
                                            filterTime={filterFutureTime}
                                            dateFormat="yyyy-MM-dd HH:mm"
                                            locale="ko"
                                            placeholderText="종료일시를 선택하세요"
                                            className="form-control" />
                                    </div>
                                </Col>

                                <Col xs={12} lg={5} className="mt-3 mt-lg-0">
                                    <Form.Label>제한시간</Form.Label>
                                    <div className="d-flex flex-wrap align-items-center gap-3">
                                        <InputGroup style={{ width: "auto" }}>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                style={{ width: "100px" }}
                                                name="examLimit"
                                                value={exam.examLimit}
                                                onChange={changeExam}
                                                disabled={noLimit} />
                                            <InputGroup.Text>분</InputGroup.Text>
                                        </InputGroup>
                                        <Form.Check
                                            className="text-nowrap"
                                            type="checkbox"
                                            id="noLimit"
                                            label="제한시간 없음"
                                            checked={noLimit}
                                            onChange={changeNoLimit} />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col>
                                    <Form.Label>안내문</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="examInfo"
                                        value={exam.examInfo}
                                        onChange={changeExam}
                                        placeholder="시험에 대한 설명이나 안내를 입력하세요" />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 문항 목록 */}
            <Row className="mt-4">
                <Col>
                    <h5>문항 목록</h5>
                </Col>
            </Row>

            {questionList.map((question, questionIndex) => (
                <Row className="mt-3" key={question.tempId}>
                    <Col>
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className="fw-bold me-3">
                                            {questionIndex + 1}번
                                        </span>

                                        <Form.Label className="mb-0 me-2">배점</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            style={{ width: "100px" }}
                                            name="questionScore"
                                            value={question.questionScore}
                                            onChange={(e) => changeQuestion(question.tempId, e)} />
                                    </div>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeQuestion(question.tempId)}>
                                        <FaXmark className="me-1" />
                                        <span>문항 삭제</span>
                                    </Button>
                                </div>

                                <Form.Label>지문</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="questionContent"
                                    value={question.questionContent}
                                    onChange={(e) => changeQuestion(question.tempId, e)} />

                                <div className="mt-2">
                                    <Form.Label
                                        htmlFor={`question-file-${question.tempId}`}
                                        className="btn btn-outline-secondary btn-sm mb-0">
                                        <FaRegImage className="me-2" />
                                        <span>이미지 첨부</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        id={`question-file-${question.tempId}`}
                                        className="d-none"
                                        multiple
                                        onChange={(e) => changeQuestionFiles(question.tempId, e)} />

                                    {question.files.length > 0 && (
                                        <span className="ms-2 text-muted">
                                            {question.files.map(file => file.name).join(", ")}
                                        </span>
                                    )}
                                </div>

                                {/* 기존(DB) 첨부파일 */}
                                {question.beforeFiles?.length > 0 && (
                                    <div className="d-flex flex-wrap gap-3 mt-3">
                                        {question.beforeFiles.map(attach => (
                                            <div
                                                key={attach.attachNo}
                                                className="position-relative border rounded p-1">
                                                <img
                                                    src={`${import.meta.env.VITE_SERVER_URL}/api/attach/${attach.attachNo}`}
                                                    alt={attach.attachName}
                                                    style={{
                                                        height: "80px",
                                                        objectFit: "cover"
                                                    }} />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 py-0 px-1"
                                                    onClick={() =>
                                                        removeBeforeFile(question.tempId, question.questionNo, attach.attachNo)}>
                                                    <FaXmark />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <hr />

                                <Form.Label>보기</Form.Label>
                                {question.options.map((option, optionIndex) => (
                                    <InputGroup className="mb-2" key={option.tempId}>
                                        <InputGroup.Radio
                                            name={`correct-${question.tempId}`}
                                            checked={option.optionIsAnswer === "Y"}
                                            onChange={() =>
                                                changeCorrectOption(question.tempId, option.tempId)} />
                                        <InputGroup.Text>{optionIndex + 1}</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="optionContent"
                                            value={option.optionContent}
                                            onChange={(e) =>
                                                changeOption(question.tempId, option.tempId, e)} />
                                        <Button
                                            variant="outline-danger"
                                            onClick={() =>
                                                removeOption(question.tempId, option.tempId)}>
                                            <FaXmark />
                                        </Button>
                                    </InputGroup>
                                ))}

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => addOption(question.tempId)}>
                                    <FaPlus className="me-2" />
                                    <span>보기 추가</span>
                                </Button>

                                <Form.Label className="d-block mt-3">해설</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="questionComment"
                                    value={question.questionComment}
                                    onChange={(e) => changeQuestion(question.tempId, e)} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ))}

            <Row className="mt-3">
                <Col>
                    <Button variant="outline-success" className="w-100" onClick={addQuestion}>
                        <FaPlus className="me-2" />
                        <span>문항 추가</span>
                    </Button>
                </Col>
            </Row>

            <Row className="mt-4 mb-4">
                <Col className="text-end">
                    <Button variant="primary" as={Link} to={`/employee/exam`} className="ms-2">
                        <span>목록으로</span>
                    </Button>
                    <Button variant="secondary" onClick={saveQuestions} className="ms-2">
                        <span>임시저장</span>
                    </Button>
                    <Button variant="success" className="ms-2" onClick={completeExam}>
                        <span>출제완료</span>
                    </Button>
                </Col>
            </Row>
        </>
    );
}