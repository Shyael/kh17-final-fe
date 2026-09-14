// 대시보드(학생/학부모/직원)에서 공통으로 쓰는 D-day 표시 유틸

// 자정 기준 날짜 차이 (오늘=0, 내일=1, 어제=-1 ...)
export const getDday = (value) => {
    if (!value) {
        return null;
    }
    const target = new Date(value);
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
};

// 과제 마감 D-day 뱃지 (남은 일수에 따라 색상 강조)
export const assignmentDdayLabel = (dueDate) => {
    const diff = getDday(dueDate);
    if (diff === null) {
        return { text: "마감일 없음", variant: "secondary" };
    }
    if (diff < 0) {
        return { text: "마감 지남", variant: "secondary" };
    }
    if (diff === 0) {
        return { text: "오늘마감", variant: "danger" };
    }
    return { text: `D-${diff}`, variant: diff <= 3 ? "danger" : "warning" };
};

// 시험 D-day 뱃지 (응시가능 → 마감까지 / 예정 → 시작까지)
export const examDdayLabel = (exam) => {
    const isUpcoming =
        exam.examPhase === "예정" ||
        (!exam.examPhase && exam.examStart && new Date(exam.examStart) > new Date());

    const diff = getDday(isUpcoming ? exam.examStart : exam.examEnd);
    const prefix = isUpcoming ? "시작" : "마감";

    if (diff === null) {
        return { text: "-", variant: "secondary" };
    }
    if (diff < 0) {
        return { text: `${prefix} 지남`, variant: "secondary" };
    }
    if (diff === 0) {
        return { text: `오늘 ${prefix}`, variant: "danger" };
    }
    return { text: `${prefix} D-${diff}`, variant: diff <= 3 ? "danger" : "warning" };
};
