import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { apiClient } from "@utils/reaxios";
import { toast } from "react-toastify";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaPaperPlane } from "react-icons/fa6";

export default function ExamStudentAttempt(){
    const{ examNo, attemptNo } =useParams();

    const navigate = useNavigate();

    //시험 기본정보
    const [exam, setExam] = useState(null);

    //문제 목록
    const [questionList, setQuestionList] = useState([]);

    //기존 저장답안
    const [answerList, setAnswerList] = useState([]);

    //남은 시간(초)
    const [remainingSeconds, setRemainingSeconds] = useState(null);

    //최종 제출 중
    const [submitting, setSubmitting] = useState(false);

    //초기 로딩
    const [loading, setLoading] = useState(true);

    //현재 보고 있는 문제 인덱스
    const [currentIndex, setCurrentIndex] = useState(0);

    //답안 저장 중인 문제번호 (중복 요청 방지)
    const [savingQuestionNo, setSavingQuestionNo] = useState(null);

    //시험 데이터 조회
    const loadExam = useCallback(async () => {
        try{
            const[
                examResponse,
                questionResponse,
                answerResponse
            ] = await Promise.all([
                //시험 기본정보 + attempt 정보
                apiClient.get(`/exam/student/${examNo}`),
                //학생용 문제
                apiClient.get(`/question/attempt/${attemptNo}`),
                //기존 저장 답안
                apiClient.get(`/attempt-answer/attempt/${attemptNo}`)
            ]);
            setExam(examResponse.data);
            setQuestionList(questionResponse.data);
            setAnswerList(answerResponse.data);
        }
        catch(e){
            console.error(e);
            toast.error(e.response?.data?.message ?? "시험 정보를 불러오지 못했습니다.");
        }
        finally{
            setLoading(false);
        }
    }, [examNo, attemptNo]);

    useEffect(()=>{
        loadExam();
    }, [loadExam]);
    // 실제 종료시간 계산
    // 시험 전체 종료시간
    // VS
    // 응시 시작 + 제한시간
    // 둘 중 빠른 시간이 실제 종료
    const deadline = useMemo(()=>{
        if(!exam?.examEnd){
            return null;
        }

        const examEnd = new Date(exam.examEnd);

        //제한시간 없음
        if(exam.examLimit == null || !exam.attemptStart){
            return examEnd;
        }

        const personalEnd = new Date(exam.attemptStart);

        personalEnd.setMinutes(personalEnd.getMinutes()+Number(exam.examLimit));

        return personalEnd < examEnd ? personalEnd : examEnd;
    }, [exam]);

    //타이머
    useEffect(()=>{
        if(!deadline){
            return;
        }

        const calculateRemaining = () =>{
            const diff =
                Math.floor(
                    (
                        deadline.getTime() - Date.now()
                    )
                    / 1000
                );
                setRemainingSeconds(Math.max(diff, 0));
        };

        calculateRemaining();

        const timer = setInterval(calculateRemaining, 1000);

        return () =>{
            clearInterval(timer);
        }
    }, [deadline]);

    //남은시간 표시
    const remainingTimeText = useMemo(()=>{
        if(remainingSeconds == null){
            return "--:--";
        }

        const hour = Math.floor(remainingSeconds / 3600);
        const minute = Math.floor((remainingSeconds % 3600) / 60);
        const second = remainingSeconds % 60;

        if(hour > 0){
            return[
                String(hour).padStart(2, "0"),
                String(minute).padStart(2, "0"),
                String(second).padStart(2, "0")
            ].join(":");
        }

        return [
            String(minute).padStart(2, "0"),
            String(second).padStart(2, "0")
        ].join(":");
    }, [remainingSeconds]);

    //남은 시간 부족 여부 (1분 미만)
    const isTimeCritical = remainingSeconds != null && remainingSeconds <= 60;

    //특정 문제의 현재 선택 답안
    const getSelectedOptionNo = useCallback((questionNo) =>{
        const answer = answerList.find(item => item.questionNo === questionNo);

        return answer?.optionNo ?? null;
    }, [answerList]);

    //답안 선택
    const selectAnswer = useCallback(async(
        questionNo,
        optionNo
    )=>{
        //시간 종료 후 변경 금지
        if(remainingSeconds === 0){
            toast.error("응시 시간이 종료되었습니다.");

            return;
        }

        const existingAnswer =
            answerList.find(
                item =>
                    item.questionNo === questionNo
        );

        //이미 같은 보기가 선택된 경우 재요청 방지
        if(existingAnswer?.optionNo === optionNo){
            return;
        }

        //동일 문제 저장 요청이 진행 중이면 무시 (중복 호출 방지)
        if(savingQuestionNo === questionNo){
            return;
        }

        try{
            setSavingQuestionNo(questionNo);

            //이미 저장된 답안
            // -> 수정
            if(existingAnswer){
                await apiClient.put(
                    `/attempt-answer/attempt/${attemptNo}/question/${questionNo}`,{optionNo}
                );

                setAnswerList(prev =>
                    prev.map(answer =>
                        answer.questionNo === questionNo
                            ? {
                                ...answer,
                                optionNo
                            }
                            : answer
                    )
                );
            }

            //최초 답안
            // -> 등록
            else{
                await apiClient.post("/attempt-answer", {
                    attemptNo:Number(attemptNo),
                    questionNo:Number(questionNo),
                    optionNo:Number(optionNo)
                });

                setAnswerList(prev => [
                    ...prev,
                    {
                        attemptNo:Number(attemptNo),
                        questionNo:Number(questionNo),
                        optionNo:Number(optionNo),
                        isCorrect: null
                    }
                ]);
            }
        }
        catch(e){
            console.error(e);
            toast.error(e.response?.data?.message ?? "답안을 저장하지 못했습니다.");
        }
        finally{
            setSavingQuestionNo(null);
        }
    }, [attemptNo, answerList, remainingSeconds, savingQuestionNo]);

    //선택 취소
    const removeAnswer = useCallback(async(questionNo)=>{
        const existing = answerList.find(item => item.questionNo === questionNo);

        if(!existing){
            return;
        }

        if(remainingSeconds === 0){
            toast.error("응시 시간이 종료되었습니다.");
            return;
        }

        if(savingQuestionNo === questionNo){
            return;
        }

        try{
            setSavingQuestionNo(questionNo);

            await apiClient.delete( `/attempt-answer/attempt/${attemptNo}/question/${questionNo}`);

            setAnswerList(prev =>
                prev.filter(
                    answer =>
                        answer.questionNo !== questionNo
                )
            );
        }
        catch(e){
            console.error(e);
            toast.error("답안을 삭제하지 못했습니다.");
        }
        finally{
            setSavingQuestionNo(null);
        }
    }, [attemptNo, answerList, remainingSeconds, savingQuestionNo]);

    //최종 제출
    const submitExam = useCallback(async (auto = false) => {
        if (submitting) {
            return;
        }
        //직접 제출일 때만 확인창
        if (!auto) {
            const unansweredCount = questionList.length - answerList.length;

            const message = unansweredCount > 0
                    ? `미응답 문항이 ${unansweredCount}개 있습니다.\n그래도 제출하시겠습니까?`
                    : "시험을 최종 제출하시겠습니까?";

            if (!window.confirm(message)) {
                return;
            }
        }

        try {
            setSubmitting(true);
            await apiClient.put(`/attempt/${attemptNo}/submit`);
            toast.success(auto ? "응시 시간이 종료되어 자동 제출되었습니다." : "시험이 제출되었습니다.");

            //시험 목록으로 이동
            navigate("/student/exam", { replace: true });
        }
        catch (e) {
            console.error(e);
            toast.error( e.response?.data?.message ?? "시험 제출에 실패했습니다.");
        }
        finally {
            setSubmitting(false);
        }

    }, [submitting, questionList, answerList, attemptNo, navigate
    ]);

    // 제한시간이 0이 되면 자동 제출
    useEffect(() => {
        if (
            remainingSeconds !== 0
            || loading
            || submitting
        ) {
            return;
        }
        submitExam(true);
    }, [remainingSeconds, loading, submitting, submitExam]);

    // 답변 진행률
    const answeredCount = answerList.length;
    const totalCount = questionList.length;

    // 현재 문제
    const currentQuestion = questionList[currentIndex] ?? null;

    // 현재 문제 선택 보기
    const currentSelectedOptionNo = currentQuestion
        ? getSelectedOptionNo(currentQuestion.questionNo)
        : null;

    // 이전 / 다음 이동
    const goPrev = useCallback(() => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const goNext = useCallback(() => {
        setCurrentIndex(prev => Math.min(prev + 1, questionList.length - 1));
    }, [questionList.length]);

    if (loading) {
        return (
            <div className="text-center py-5 text-muted">
                시험 문제를 불러오는 중입니다.
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="text-center py-5 text-muted">
                출제된 문제가 없습니다.
            </div>
        );
    }

    return (<>
        <Row className="g-3 mt-1">

            {/* ===== 좌측 : 문제 풀이 영역 ===== */}
            <Col lg={8}>

                {/* 1. 시험 정보 : 제목 + 남은 시간 */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="fw-bold mb-0">
                        {exam?.examTitle ?? "시험"}
                    </h3>
                    <div className="text-end">
                        <div className="text-muted small">남은 시간</div>
                        <div
                            className={
                                "fs-4 fw-bold font-monospace "
                                + (isTimeCritical ? "text-danger" : "")
                            }>
                            {remainingTimeText}
                        </div>
                    </div>
                </div>

                {/* 2. 문제 정보 */}
                <Card>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold fs-5">
                                {currentIndex + 1}번
                            </span>
                            <Badge bg="light" text="dark">
                                {currentQuestion.questionScore}점
                            </Badge>
                        </div>

                        <p className="fs-6 mb-3" style={{ whiteSpace: "pre-line" }}>
                            {currentQuestion.questionContent}
                        </p>

                        {/* 보기 목록 (라디오) */}
                        <div className="d-flex flex-column gap-2">
                            {currentQuestion.optionList?.map((option, optionIndex) => {

                                const checked = currentSelectedOptionNo === option.optionNo;

                                return (
                                    <label
                                        key={option.optionNo}
                                        htmlFor={`q${currentQuestion.questionNo}-o${option.optionNo}`}
                                        className={
                                            "border rounded px-3 py-2 d-flex align-items-center gap-2 mb-0 "
                                            + (checked ? "border-primary bg-primary-subtle" : "")
                                        }
                                        style={{ cursor: "pointer" }}>
                                        <Form.Check
                                            type="radio"
                                            id={`q${currentQuestion.questionNo}-o${option.optionNo}`}
                                            name={`question-${currentQuestion.questionNo}`}
                                            className="m-0"
                                            checked={checked}
                                            disabled={remainingSeconds === 0 || savingQuestionNo === currentQuestion.questionNo}
                                            onChange={() =>
                                                selectAnswer(
                                                    currentQuestion.questionNo,
                                                    option.optionNo
                                                )
                                            }
                                        />
                                        <span>
                                            <span className="text-muted me-2">
                                                {optionIndex + 1}.
                                            </span>
                                            {option.optionContent}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* 선택 해제 */}
                        {currentSelectedOptionNo != null && (
                            <div className="mt-2 text-end">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-muted p-0"
                                    onClick={() =>
                                        removeAnswer(currentQuestion.questionNo)
                                    }>
                                    선택 해제
                                </Button>
                            </div>
                        )}
                    </Card.Body>

                    {/* 3·4. 이전 / 다음 */}
                    <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
                        <span className="text-muted small">
                            {currentIndex + 1} / {totalCount}
                        </span>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={goPrev}
                                disabled={currentIndex === 0}>
                                <FaChevronLeft className="me-1" />
                                이전
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={goNext}
                                disabled={currentIndex === totalCount - 1}>
                                다음
                                <FaChevronRight className="ms-1" />
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            </Col>

            {/* ===== 우측 : 답안지 ===== */}
            <Col lg={4}>
                <Card className="position-sticky" style={{ top: "1rem" }}>
                    <Card.Body>
                        {/* 5. 내가 푼 문제 정보 */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold">답안지</span>
                            <span className="text-muted small">
                                {answeredCount} / {totalCount}
                            </span>
                        </div>

                        <div
                            className="d-grid gap-2"
                            style={{
                                gridTemplateColumns: "repeat(4, 1fr)"
                            }}>
                            {questionList.map((question, index) => {

                                const selectedOptionNo = getSelectedOptionNo(question.questionNo);
                                const answered = selectedOptionNo != null;

                                const selectedOptionOrder = answered
                                    ? (question.optionList?.findIndex(
                                        option => option.optionNo === selectedOptionNo
                                    ) + 1)
                                    : null;

                                const isCurrent = index === currentIndex;

                                return (
                                    <Button
                                        key={question.questionNo}
                                        size="sm"
                                        variant={
                                            answered
                                                ? "primary"
                                                : "outline-secondary"
                                        }
                                        className={
                                            "d-flex flex-column align-items-center py-2 "
                                            + (isCurrent ? "border border-3 border-dark" : "")
                                        }
                                        onClick={() => setCurrentIndex(index)}>
                                        <span className="fw-bold">{index + 1}</span>
                                        <span
                                            className="small"
                                            style={{ minHeight: "1em" }}>
                                            {answered ? selectedOptionOrder : ""}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </Card.Body>

                    {/* 6. 답안 제출 */}
                    <Card.Footer className="bg-white">
                        <Button
                            variant="success"
                            className="w-100"
                            onClick={() => submitExam(false)}
                            disabled={submitting}>
                            <FaPaperPlane className="me-2" />
                            {submitting ? "제출 중..." : "답안 제출"}
                        </Button>
                    </Card.Footer>
                </Card>
            </Col>
        </Row>
    </>);
}
