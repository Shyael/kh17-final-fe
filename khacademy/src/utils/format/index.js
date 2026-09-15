// 공용 날짜 표시 포맷
// - 페이지마다 formatDate/formatDateTime을 따로 만들면서 표기 방식이 다 달라져서
//   (2026.09.14 / 2026-09-14 / toLocaleString 그대로 등) 하나로 통일
// - toLocaleString 대신 직접 조립 : 브라우저/OS 로케일 설정에 따라 결과가
//   달라지는 걸 막고, 화면마다 같은 형식이 나오게 하기 위함

const pad = (n) => String(n).padStart(2, "0");

// 날짜만 : 2026.09.14
export const formatDate = (value) => {
    if (!value) {
        return "-";
    }
    const d = new Date(value);
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

// 날짜 + 시간 : 2026.09.14 18:00
export const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }
    const d = new Date(value);
    return `${formatDate(value)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 시간만 : 18:00
export const formatTime = (value) => {
    if (!value) {
        return "-";
    }
    const d = new Date(value);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 연도 없이 날짜 + 시간 (대시보드 등 좁은 공간용) : 09.14 18:00
export const formatShortDateTime = (value) => {
    if (!value) {
        return "-";
    }
    const d = new Date(value);
    return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 연도 없이 날짜만 : 09.14
export const formatShortDate = (value) => {
    if (!value) {
        return "-";
    }
    const d = new Date(value);
    return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

// 기간 : 2026.09.14 18:00 ~ 2026.09.14 20:00
export const formatDateRange = (start, end) =>
    `${formatDateTime(start)} ~ ${formatDateTime(end)}`;
