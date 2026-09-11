import { useEffect, useMemo, useState } from "react";

import {
    Badge,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Spinner
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";


const AdminWorkScheduleCalendar = ({ employeeNo }) => {

    const [currentDate, setCurrentDate] =
        useState(new Date());

    const [scheduleList, setScheduleList] =
        useState([]);

    const [summary, setSummary] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    // =========================================================
    // 선택 날짜 / 일정
    // =========================================================

    const [selectedDate, setSelectedDate] =
        useState(null);

    const [selectedSchedule, setSelectedSchedule] =
        useState(null);

    const [showModal, setShowModal] =
        useState(false);


    // =========================================================
    // 예정 근무
    // =========================================================

    const [scheduledDayType, setScheduledDayType] =
        useState("workday");

    const [scheduledClockIn, setScheduledClockIn] =
        useState("");

    const [scheduledClockOut, setScheduledClockOut] =
        useState("");


    // =========================================================
    // 실제 근태
    // =========================================================

    const [clockIn, setClockIn] =
        useState("");

    const [clockOut, setClockOut] =
        useState("");

    const [breakMinutes, setBreakMinutes] =
        useState(0);


    // =========================================================
    // YYYY-MM-DD
    // =========================================================

    const dateKey = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    };


    // =========================================================
    // Timestamp -> datetime-local
    // =========================================================

    const dateTimeInputValue = (value) => {

        if (!value) {
            return "";
        }

        return value.substring(
            0,
            16
        );
    };


    // =========================================================
    // HH:mm
    // =========================================================

    const timeText = (value) => {

        if (!value) {
            return null;
        }

        return value.substring(
            11,
            16
        );
    };


    // =========================================================
    // 소수점 시간
    // =========================================================

    const formatHours = (value) => {

        if (
            value === null
            || value === undefined
        ) {
            return "-";
        }

        return (
            Math.round(
                Number(value) * 100
            ) / 100
        );
    };


    // =========================================================
    // 이번 달 시작
    // =========================================================

    const startDate = useMemo(
        () => {

            const year =
                currentDate.getFullYear();

            const month =
                String(
                    currentDate.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            return `${year}-${month}-01 00:00:00`;

        },
        [
            currentDate
        ]
    );


    // =========================================================
    // 이번 달 끝
    // =========================================================

    const endDate = useMemo(
        () => {

            const lastDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                );

            return `${dateKey(lastDate)} 23:59:59`;

        },
        [
            currentDate
        ]
    );


    // =========================================================
    // 월간 일정 조회
    // =========================================================

    const loadSchedule = async () => {

        if (!employeeNo) {
            return;
        }


        try {

            setLoading(true);


            const response =
                await apiClient.get(
                    "/employee/attendance/search",
                    {
                        params: {
                            employeeNo,
                            startDate,
                            endDate
                        }
                    }
                );


            setScheduleList(
                response.data.scheduleList
                ?? []
            );


            setSummary(
                response.data.summary
                ?? null
            );

        }
        catch (err) {

            console.error(err);


            toast.error(
                "근무일정 조회에 실패했습니다."
            );

        }
        finally {

            setLoading(false);

        }
    };


    // =========================================================
    // 직원 / 월 변경
    // =========================================================

    useEffect(
        () => {

            if (!employeeNo) {

                setScheduleList([]);
                setSummary(null);

                return;
            }


            setShowModal(false);

            setSelectedDate(null);
            setSelectedSchedule(null);

            setScheduleList([]);
            setSummary(null);


            loadSchedule();

        },
        [
            employeeNo,
            startDate,
            endDate
        ]
    );


    // =========================================================
    // 날짜 -> 일정 Map
    // =========================================================

    const scheduleMap = useMemo(
        () => {

            const map = {};


            scheduleList.forEach(
                schedule => {

                    const key =
                        schedule
                            .scheduledWorkDate
                            ?.substring(
                                0,
                                10
                            );


                    if (key) {

                        map[key] =
                            schedule;

                    }

                }
            );


            return map;

        },
        [
            scheduleList
        ]
    );


    // =========================================================
    // 달력 날짜
    // =========================================================

    const calendarDays = useMemo(
        () => {

            const year =
                currentDate.getFullYear();

            const month =
                currentDate.getMonth();


            const firstDay =
                new Date(
                    year,
                    month,
                    1
                );


            const lastDay =
                new Date(
                    year,
                    month + 1,
                    0
                );


            const result = [];


            for (
                let i = 0;
                i < firstDay.getDay();
                i++
            ) {

                result.push(
                    null
                );

            }


            for (
                let day = 1;
                day <= lastDay.getDate();
                day++
            ) {

                result.push(
                    new Date(
                        year,
                        month,
                        day
                    )
                );

            }


            return result;

        },
        [
            currentDate
        ]
    );


    // =========================================================
    // 월 이동
    // =========================================================

    const previousMonth = () => {

        setCurrentDate(
            previous =>
                new Date(
                    previous.getFullYear(),
                    previous.getMonth() - 1,
                    1
                )
        );
    };


    const nextMonth = () => {

        setCurrentDate(
            previous =>
                new Date(
                    previous.getFullYear(),
                    previous.getMonth() + 1,
                    1
                )
        );
    };


    // =========================================================
    // 근태 표시
    // =========================================================

    const attendanceLabel = (type) => {

        switch (type) {

            case "normal":
                return "출근";

            case "absent":
                return "결근";

            case "paid_leave":
                return "유급휴가";

            case "unpaid_leave":
                return "무급휴가";

            default:
                return "";
        }
    };


    const attendanceBadge = (type) => {

        switch (type) {

            case "normal":
                return "success";

            case "absent":
                return "danger";

            case "paid_leave":
                return "primary";

            case "unpaid_leave":
                return "secondary";

            default:
                return "secondary";
        }
    };


    // =========================================================
    // 날짜 클릭
    // =========================================================

    const openDate = (date) => {

        const key =
            dateKey(date);


        const schedule =
            scheduleMap[key]
            ?? null;


        setSelectedDate(
            key
        );

        setSelectedSchedule(
            schedule
        );


        if (schedule) {

            setScheduledDayType(
                schedule.scheduledDayType
                ?? "workday"
            );


            setScheduledClockIn(
                dateTimeInputValue(
                    schedule.scheduledClockIn
                )
            );


            setScheduledClockOut(
                dateTimeInputValue(
                    schedule.scheduledClockOut
                )
            );


            setClockIn(
                dateTimeInputValue(
                    schedule.clockIn
                )
            );


            setClockOut(
                dateTimeInputValue(
                    schedule.clockOut
                )
            );


            setBreakMinutes(
                schedule.breakMinutes
                ?? 0
            );

        }
        else {

            setScheduledDayType(
                "workday"
            );


            setScheduledClockIn(
                `${key}T09:00`
            );


            setScheduledClockOut(
                `${key}T18:00`
            );


            setClockIn("");

            setClockOut("");

            setBreakMinutes(
                0
            );

        }


        setShowModal(
            true
        );
    };


    // =========================================================
    // Modal 닫기
    // =========================================================

    const closeModal = () => {

        setShowModal(
            false
        );

        setSelectedDate(
            null
        );

        setSelectedSchedule(
            null
        );
    };


    // =========================================================
    // 신규 근무일정 등록
    // =========================================================

    const addSchedule = async () => {

        if (!employeeNo) {

            toast.error(
                "직원 정보가 없습니다."
            );

            return;
        }


        if (!selectedDate) {
            return;
        }


        if (
            scheduledDayType
            !== "dayOff"
            &&
            (
                !scheduledClockIn
                ||
                !scheduledClockOut
            )
        ) {

            toast.warning(
                "예정 출퇴근시간을 입력해주세요."
            );

            return;
        }


        try {

            const request = {

                employeeNo,

                scheduledWorkDate:
                    `${selectedDate}T00:00:00`,

                scheduledDayType

            };


            if (
                scheduledDayType
                !== "dayOff"
            ) {

                request.scheduledClockIn =
                    scheduledClockIn;

                request.scheduledClockOut =
                    scheduledClockOut;

            }


            await apiClient.post(
                "/employee/attendance/add",
                request
            );


            toast.success(
                "근무일정이 등록되었습니다."
            );


            closeModal();

            await loadSchedule();

        }
        catch (err) {

            console.error(err);


            if (
                err.response?.status
                === 403
            ) {

                toast.error(
                    "근무일정을 등록할 수 없습니다."
                );

                return;
            }


            if (
                err.response?.status
                === 404
            ) {

                toast.error(
                    "해당 날짜에 적용되는 근로계약이 없습니다."
                );

                return;
            }


            toast.error(
                "근무일정 등록에 실패했습니다."
            );

        }
    };


    // =========================================================
    // 근무일정 수정
    // =========================================================

    const updateSchedule = async () => {

        if (!selectedSchedule) {
            return;
        }


        try {

            const request = {

                workScheduleNo:
                    selectedSchedule
                        .workScheduleNo,

                scheduledDayType

            };


            if (
                scheduledDayType
                !== "dayOff"
            ) {

                if (
                    !scheduledClockIn
                    ||
                    !scheduledClockOut
                ) {

                    toast.warning(
                        "예정 출퇴근시간을 입력해주세요."
                    );

                    return;
                }


                request.scheduledClockIn =
                    scheduledClockIn;

                request.scheduledClockOut =
                    scheduledClockOut;

            }


            await apiClient.patch(
                "/employee/attendance/edit",
                request
            );


            toast.success(
                "근무일정이 수정되었습니다."
            );


            closeModal();

            await loadSchedule();

        }
        catch (err) {

            console.error(err);


            if (
                err.response?.status
                === 403
            ) {

                toast.error(
                    "변경할 수 없는 근무일정입니다."
                );

                return;
            }


            toast.error(
                "근무일정 수정에 실패했습니다."
            );

        }
    };


    // =========================================================
    // 근태 없음 -> 결근 / 휴가 신규 생성
    // =========================================================

    const addNonWorkingAttendance =
        async (
            type
        ) => {

            if (!selectedSchedule) {
                return;
            }


            const request = {

                employeeNo,

                workDate:
                    `${selectedDate}T00:00:00`

            };


            let url;


            switch (type) {

                case "absent":

                    url =
                        "/admin/attendance/absent";

                    break;


                case "paid_leave":

                    url =
                        "/admin/attendance/paidLeave";

                    break;


                case "unpaid_leave":

                    url =
                        "/admin/attendance/unpaidLeave";

                    break;


                default:
                    return;
            }


            try {

                await apiClient.post(
                    url,
                    request
                );


                toast.success(
                    "근태가 등록되었습니다."
                );


                closeModal();

                await loadSchedule();

            }
            catch (err) {

                console.error(err);

                toast.error(
                    "근태 등록에 실패했습니다."
                );

            }
        };


    // =========================================================
    // 출근 -> 출근
    // =========================================================

    const normalToNormal = async () => {

        if (
            !selectedSchedule
                ?.empAttendanceNo
        ) {

            toast.error(
                "수정할 근태가 없습니다."
            );

            return;
        }


        if (
            !clockIn
            ||
            !clockOut
        ) {

            toast.warning(
                "실제 출퇴근시간을 입력해주세요."
            );

            return;
        }


        if (
            Number(
                breakMinutes
            ) < 0
        ) {

            toast.warning(
                "휴게시간은 0 이상이어야 합니다."
            );

            return;
        }


        try {

            await apiClient.patch(
                "/employee/attendance/normalToNormal",
                {

                    empAttendanceNo:
                        selectedSchedule
                            .empAttendanceNo,

                    clockIn,

                    clockOut,

                    breakMinutes:
                        Number(
                            breakMinutes
                        )

                }
            );


            toast.success(
                "출근 근태가 수정되었습니다."
            );


            closeModal();

            await loadSchedule();

        }
        catch (err) {

            console.error(err);

            toast.error(
                "근태 수정에 실패했습니다."
            );

        }
    };


    // =========================================================
    // 출근 -> 결근 / 휴가
    // =========================================================

    const normalToAbsent =
        async (
            attendanceType
        ) => {

            if (
                !selectedSchedule
                    ?.empAttendanceNo
            ) {

                toast.error(
                    "수정할 근태가 없습니다."
                );

                return;
            }


            try {

                await apiClient.patch(
                    "/employee/attendance/normalToAbsent",
                    {

                        empAttendanceNo:
                            selectedSchedule
                                .empAttendanceNo,

                        attendanceType

                    }
                );


                toast.success(
                    "근태 상태가 변경되었습니다."
                );


                closeModal();

                await loadSchedule();

            }
            catch (err) {

                console.error(err);

                toast.error(
                    "근태 상태 변경에 실패했습니다."
                );

            }
        };


    // =========================================================
    // 결근 / 휴가 -> 결근 / 휴가
    // =========================================================

    const absentToAbsent =
        async (
            attendanceType
        ) => {

            if (
                !selectedSchedule
                    ?.empAttendanceNo
            ) {

                toast.error(
                    "수정할 근태가 없습니다."
                );

                return;
            }


            try {

                await apiClient.patch(
                    "/employee/attendance/absentToAbsent",
                    {

                        empAttendanceNo:
                            selectedSchedule
                                .empAttendanceNo,

                        attendanceType

                    }
                );


                toast.success(
                    "근태 상태가 변경되었습니다."
                );


                closeModal();

                await loadSchedule();

            }
            catch (err) {

                console.error(err);

                toast.error(
                    "근태 상태 변경에 실패했습니다."
                );

            }
        };


    // =========================================================
    // 결근 / 휴가 -> 출근
    // =========================================================

    const absentToNormal = async () => {

        if (
            !selectedSchedule
                ?.empAttendanceNo
        ) {

            toast.error(
                "수정할 근태가 없습니다."
            );

            return;
        }


        if (
            !clockIn
            ||
            !clockOut
        ) {

            toast.warning(
                "실제 출퇴근시간을 입력해주세요."
            );

            return;
        }


        if (
            Number(
                breakMinutes
            ) < 0
        ) {

            toast.warning(
                "휴게시간은 0 이상이어야 합니다."
            );

            return;
        }


        try {

            await apiClient.patch(
                "/employee/attendance/absentToNormal",
                {

                    empAttendanceNo:
                        selectedSchedule
                            .empAttendanceNo,

                    clockIn,

                    clockOut,

                    breakMinutes:
                        Number(
                            breakMinutes
                        )

                }
            );


            toast.success(
                "출근 상태로 변경되었습니다."
            );


            closeModal();

            await loadSchedule();

        }
        catch (err) {

            console.error(err);

            toast.error(
                "출근 상태 변경에 실패했습니다."
            );

        }
    };


    // =========================================================
    // 현재 근태
    // =========================================================

    const attendanceType =
        selectedSchedule
            ?.attendanceType;


    const attendanceExist =
        selectedSchedule
            ?.empAttendanceNo
        != null;


    return (
        <>


            {/* =====================================================
                달력
            ===================================================== */}

            <Card>

                <Card.Body>


                    {/* =================================================
                        월 이동
                    ================================================= */}

                    <div
                        className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-3
                        "
                    >

                        <Button
                            variant="outline-secondary"
                            onClick={
                                previousMonth
                            }
                        >
                            이전
                        </Button>


                        <h4 className="mb-0">

                            {
                                currentDate
                                    .getFullYear()
                            }
                            년{" "}

                            {
                                currentDate
                                    .getMonth()
                                + 1
                            }
                            월

                        </h4>


                        <Button
                            variant="outline-secondary"
                            onClick={
                                nextMonth
                            }
                        >
                            다음
                        </Button>

                    </div>


                    {/* =================================================
                        월 합계
                    ================================================= */}

                    {
                        summary
                        && (

                            <Row className="g-2 mb-3">


                                <Col>

                                    <Card body>

                                        총 근무

                                        <div>

                                            <strong>
                                                {
                                                    formatHours(
                                                        summary
                                                            .totalWorkHours
                                                    )
                                                }
                                            </strong>
                                            시간

                                        </div>

                                    </Card>

                                </Col>


                                <Col>

                                    <Card body>

                                        연장

                                        <div>

                                            <strong>
                                                {
                                                    formatHours(
                                                        summary
                                                            .totalOvertimeHours
                                                    )
                                                }
                                            </strong>
                                            시간

                                        </div>

                                    </Card>

                                </Col>


                                <Col>

                                    <Card body>

                                        야간

                                        <div>

                                            <strong>
                                                {
                                                    formatHours(
                                                        summary
                                                            .totalNightHours
                                                    )
                                                }
                                            </strong>
                                            시간

                                        </div>

                                    </Card>

                                </Col>


                                <Col>

                                    <Card body>

                                        휴일

                                        <div>

                                            <strong>
                                                {
                                                    formatHours(
                                                        summary
                                                            .totalHolidayHours
                                                    )
                                                }
                                            </strong>
                                            시간

                                        </div>

                                    </Card>

                                </Col>


                            </Row>

                        )
                    }


                    {
                        loading
                        ? (

                            <div
                                className="
                                    text-center
                                    py-5
                                "
                            >

                                <Spinner />

                            </div>

                        )
                        : (

                            <>


                                {/* =================================================
                                    요일
                                ================================================= */}

                                <div
                                    style={{
                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                            "repeat(7, 1fr)"
                                    }}
                                >

                                    {
                                        [
                                            "일",
                                            "월",
                                            "화",
                                            "수",
                                            "목",
                                            "금",
                                            "토"
                                        ].map(
                                            day => (

                                                <div
                                                    key={
                                                        day
                                                    }
                                                    className="
                                                        border
                                                        text-center
                                                        fw-bold
                                                        p-2
                                                    "
                                                >

                                                    {day}

                                                </div>

                                            )
                                        )
                                    }

                                </div>


                                {/* =================================================
                                    날짜
                                ================================================= */}

                                <div
                                    style={{
                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                            "repeat(7, 1fr)"
                                    }}
                                >

                                    {
                                        calendarDays.map(
                                            (
                                                date,
                                                index
                                            ) => {


                                                if (!date) {

                                                    return (

                                                        <div
                                                            key={
                                                                `empty-${index}`
                                                            }
                                                            className="border"
                                                            style={{
                                                                minHeight:
                                                                    130
                                                            }}
                                                        />

                                                    );
                                                }


                                                const key =
                                                    dateKey(
                                                        date
                                                    );


                                                const schedule =
                                                    scheduleMap[
                                                        key
                                                    ];


                                                return (

                                                    <div
                                                        key={
                                                            key
                                                        }
                                                        className="
                                                            border
                                                            p-2
                                                        "
                                                        style={{
                                                            minHeight:
                                                                130,

                                                            cursor:
                                                                "pointer"
                                                        }}
                                                        onClick={
                                                            () =>
                                                                openDate(
                                                                    date
                                                                )
                                                        }
                                                    >


                                                        {/* 날짜 */}

                                                        <div
                                                            className="
                                                                fw-bold
                                                                mb-2
                                                            "
                                                        >

                                                            {
                                                                date
                                                                    .getDate()
                                                            }

                                                        </div>


                                                        {
                                                            schedule
                                                            && (

                                                                <>


                                                                    {/* =================================================
                                                                        휴일근무
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .scheduledDayType
                                                                        === "holiday"
                                                                        &&
                                                                        schedule
                                                                            .attendanceType
                                                                        === "normal"
                                                                        && (

                                                                            <Badge
                                                                                bg="warning"
                                                                                text="dark"
                                                                            >
                                                                                휴일근무
                                                                            </Badge>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        그냥 휴일
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .scheduledDayType
                                                                        === "holiday"
                                                                        &&
                                                                        schedule
                                                                            .attendanceType
                                                                        !== "normal"
                                                                        && (

                                                                            <Badge
                                                                                bg="secondary"
                                                                                className="me-1"
                                                                            >
                                                                                휴일
                                                                            </Badge>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        휴무일
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .scheduledDayType
                                                                        === "dayOff"
                                                                        && (

                                                                            <Badge bg="secondary">
                                                                                휴무일
                                                                            </Badge>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        결근 / 휴가
                                                                        normal은 Badge 없음
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .attendanceType
                                                                        &&
                                                                        schedule
                                                                            .attendanceType
                                                                        !== "normal"
                                                                        &&
                                                                        schedule
                                                                            .scheduledDayType
                                                                        !== "dayOff"
                                                                        && (

                                                                            <Badge
                                                                                bg={
                                                                                    attendanceBadge(
                                                                                        schedule
                                                                                            .attendanceType
                                                                                    )
                                                                                }
                                                                            >

                                                                                {
                                                                                    attendanceLabel(
                                                                                        schedule
                                                                                            .attendanceType
                                                                                    )
                                                                                }

                                                                            </Badge>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        일정은 있는데 근태 없음
                                                                    ================================================= */}

                                                                    {
                                                                        !schedule
                                                                            .attendanceType
                                                                        &&
                                                                        schedule
                                                                            .scheduledDayType
                                                                        !== "dayOff"
                                                                        && (

                                                                            <Badge
                                                                                bg="light"
                                                                                text="dark"
                                                                            >
                                                                                근태 미등록
                                                                            </Badge>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        아직 출근 전
                                                                        예정시간 표시
                                                                    ================================================= */}

                                                                    {
                                                                        !schedule
                                                                            .attendanceType
                                                                        &&
                                                                        schedule
                                                                            .scheduledClockIn
                                                                        &&
                                                                        schedule
                                                                            .scheduledDayType
                                                                        !== "dayOff"
                                                                        && (

                                                                            <div
                                                                                className="
                                                                                    small
                                                                                    mt-2
                                                                                    text-muted
                                                                                "
                                                                            >

                                                                                예정{" "}

                                                                                {
                                                                                    timeText(
                                                                                        schedule
                                                                                            .scheduledClockIn
                                                                                    )
                                                                                }

                                                                                {" ~ "}

                                                                                {
                                                                                    timeText(
                                                                                        schedule
                                                                                            .scheduledClockOut
                                                                                    )
                                                                                }

                                                                            </div>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        실제 출근
                                                                        normal이면 시간만 표시
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .attendanceType
                                                                        === "normal"
                                                                        &&
                                                                        schedule
                                                                            .clockIn
                                                                        && (

                                                                            <div
                                                                                className="
                                                                                    small
                                                                                    mt-2
                                                                                    fw-semibold
                                                                                "
                                                                            >

                                                                                {
                                                                                    timeText(
                                                                                        schedule
                                                                                            .clockIn
                                                                                    )
                                                                                }

                                                                                {" ~ "}

                                                                                {
                                                                                    timeText(
                                                                                        schedule
                                                                                            .clockOut
                                                                                    )
                                                                                    ??
                                                                                    "미퇴근"
                                                                                }

                                                                            </div>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        실제 근무시간
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .attendanceType
                                                                        === "normal"
                                                                        &&
                                                                        schedule
                                                                            .actualWorkHours
                                                                        > 0
                                                                        && (

                                                                            <div
                                                                                className="
                                                                                    small
                                                                                    mt-1
                                                                                    text-muted
                                                                                "
                                                                            >

                                                                                실제근무{" "}

                                                                                {
                                                                                    formatHours(
                                                                                        schedule
                                                                                            .actualWorkHours
                                                                                    )
                                                                                }

                                                                                시간

                                                                            </div>

                                                                        )
                                                                    }


                                                                    {/* =================================================
                                                                        휴일근로시간
                                                                    ================================================= */}

                                                                    {
                                                                        schedule
                                                                            .scheduledDayType
                                                                        === "holiday"
                                                                        &&
                                                                        schedule
                                                                            .attendanceType
                                                                        === "normal"
                                                                        &&
                                                                        schedule
                                                                            .actualHolidayHours
                                                                        > 0
                                                                        && (

                                                                            <div
                                                                                className="
                                                                                    small
                                                                                    mt-1
                                                                                    text-muted
                                                                                "
                                                                            >

                                                                                휴일근로{" "}

                                                                                {
                                                                                    formatHours(
                                                                                        schedule
                                                                                            .actualHolidayHours
                                                                                    )
                                                                                }

                                                                                시간

                                                                            </div>

                                                                        )
                                                                    }


                                                                </>

                                                            )
                                                        }


                                                    </div>

                                                );
                                            }
                                        )
                                    }

                                </div>


                            </>

                        )
                    }


                </Card.Body>

            </Card>


            {/* =====================================================
                날짜 관리 Modal
            ===================================================== */}

            <Modal
                show={
                    showModal
                }
                onHide={
                    closeModal
                }
                size="lg"
                centered
            >


                <Modal.Header closeButton>

                    <Modal.Title>

                        {selectedDate}{" "}
                        근태 관리

                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>


                    {/* =================================================
                        신규 근무일정
                    ================================================= */}

                    {
                        !selectedSchedule
                        ? (

                            <>


                                <h5 className="mb-3">
                                    근무 일정 등록
                                </h5>


                                <div
                                    className="
                                        text-muted
                                        mb-4
                                    "
                                >

                                    {selectedDate}의{" "}
                                    근무 일정을 등록합니다.

                                </div>


                                <Row className="g-3">


                                    <Col md={4}>

                                        <Form.Group>

                                            <Form.Label>
                                                근무일 유형
                                            </Form.Label>


                                            <Form.Select
                                                value={
                                                    scheduledDayType
                                                }
                                                onChange={
                                                    e =>
                                                        setScheduledDayType(
                                                            e.target.value
                                                        )
                                                }
                                            >

                                                <option value="workday">
                                                    근무일
                                                </option>

                                                <option value="holiday">
                                                    휴일
                                                </option>

                                                <option value="dayOff">
                                                    휴무일
                                                </option>

                                            </Form.Select>

                                        </Form.Group>

                                    </Col>


                                    {
                                        scheduledDayType
                                        !== "dayOff"
                                        && (

                                            <>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            예정 출근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                scheduledClockIn
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setScheduledClockIn(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            예정 퇴근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                scheduledClockOut
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setScheduledClockOut(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                            </>

                                        )
                                    }


                                </Row>


                                {
                                    scheduledDayType
                                    === "dayOff"
                                    && (

                                        <div
                                            className="
                                                small
                                                text-muted
                                                mt-3
                                            "
                                        >

                                            휴무일은 예정 출퇴근시간을
                                            입력하지 않습니다.

                                        </div>

                                    )
                                }


                                <div
                                    className="
                                        text-end
                                        mt-4
                                    "
                                >

                                    <Button
                                        variant="primary"
                                        onClick={
                                            addSchedule
                                        }
                                    >

                                        일정 등록

                                    </Button>

                                </div>


                            </>

                        )

                        // =================================================
                        // 기존 근무일정
                        // =================================================

                        : (

                            <>


                                <h5 className="mb-3">
                                    근무 일정
                                </h5>


                                {
                                    selectedSchedule
                                        .contractNo
                                    != null
                                    && (

                                        <div
                                            className="
                                                text-muted
                                                small
                                                mb-3
                                            "
                                        >

                                            적용 계약번호 :{" "}

                                            {
                                                selectedSchedule
                                                    .contractNo
                                            }

                                        </div>

                                    )
                                }


                                <Row className="g-3 mb-4">


                                    <Col md={4}>

                                        <Form.Group>

                                            <Form.Label>
                                                근무일 유형
                                            </Form.Label>


                                            <Form.Select
                                                value={
                                                    scheduledDayType
                                                }
                                                disabled={
                                                    attendanceExist
                                                }
                                                onChange={
                                                    e =>
                                                        setScheduledDayType(
                                                            e.target.value
                                                        )
                                                }
                                            >

                                                <option value="workday">
                                                    근무일
                                                </option>

                                                <option value="holiday">
                                                    휴일
                                                </option>

                                                <option value="dayOff">
                                                    휴무일
                                                </option>

                                            </Form.Select>

                                        </Form.Group>

                                    </Col>


                                    {
                                        scheduledDayType
                                        !== "dayOff"
                                        && (

                                            <>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            예정 출근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                scheduledClockIn
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setScheduledClockIn(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            예정 퇴근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                scheduledClockOut
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setScheduledClockOut(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                            </>

                                        )
                                    }


                                </Row>


                                <div className="text-end mb-4">

                                    <Button
                                        variant="outline-primary"
                                        onClick={
                                            updateSchedule
                                        }
                                    >

                                        일정 수정

                                    </Button>

                                </div>


                                <hr />


                                <h5 className="mb-3">
                                    실제 근태
                                </h5>


                                {/* =================================================
                                    휴무일
                                ================================================= */}

                                {
                                    scheduledDayType
                                    === "dayOff"
                                    && (

                                        <div
                                            className="
                                                text-muted
                                                py-2
                                            "
                                        >

                                            휴무일은 근태 관리 대상이 아닙니다.

                                        </div>

                                    )
                                }


                                {/* =================================================
                                    근태 미등록
                                ================================================= */}

                                {
                                    scheduledDayType
                                    !== "dayOff"
                                    &&
                                    !attendanceExist
                                    && (

                                        <div>


                                            <div
                                                className="
                                                    text-muted
                                                    mb-3
                                                "
                                            >

                                                아직 등록된 근태가 없습니다.

                                            </div>


                                            <div
                                                className="
                                                    d-flex
                                                    gap-2
                                                    flex-wrap
                                                "
                                            >


                                                <Button
                                                    variant="danger"
                                                    onClick={
                                                        () =>
                                                            addNonWorkingAttendance(
                                                                "absent"
                                                            )
                                                    }
                                                >

                                                    결근 등록

                                                </Button>


                                                <Button
                                                    variant="primary"
                                                    onClick={
                                                        () =>
                                                            addNonWorkingAttendance(
                                                                "paid_leave"
                                                            )
                                                    }
                                                >

                                                    유급휴가 등록

                                                </Button>


                                                <Button
                                                    variant="secondary"
                                                    onClick={
                                                        () =>
                                                            addNonWorkingAttendance(
                                                                "unpaid_leave"
                                                            )
                                                    }
                                                >

                                                    무급휴가 등록

                                                </Button>


                                            </div>


                                            <div
                                                className="
                                                    small
                                                    text-muted
                                                    mt-3
                                                "
                                            >

                                                실제 출근은 직원이 출근 처리하면
                                                자동으로 등록됩니다.

                                            </div>


                                        </div>

                                    )
                                }


                                {/* =================================================
                                    출근
                                ================================================= */}

                                {
                                    attendanceExist
                                    &&
                                    attendanceType
                                    === "normal"
                                    && (

                                        <>


                                            <div className="mb-3">

                                                현재 상태 :{" "}

                                                <Badge
                                                    bg={
                                                        scheduledDayType
                                                        === "holiday"
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                    text={
                                                        scheduledDayType
                                                        === "holiday"
                                                            ? "dark"
                                                            : undefined
                                                    }
                                                >

                                                    {
                                                        scheduledDayType
                                                        === "holiday"
                                                        ? "휴일근무"
                                                        : "출근"
                                                    }

                                                </Badge>

                                            </div>


                                            <Row className="g-3">


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            실제 출근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                clockIn
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setClockIn(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            실제 퇴근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                clockOut
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setClockOut(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            휴게시간(분)
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                breakMinutes
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setBreakMinutes(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                            </Row>


                                            <div
                                                className="
                                                    d-flex
                                                    gap-2
                                                    flex-wrap
                                                    mt-3
                                                "
                                            >


                                                <Button
                                                    onClick={
                                                        normalToNormal
                                                    }
                                                >

                                                    출근정보 수정

                                                </Button>


                                                <Button
                                                    variant="danger"
                                                    onClick={
                                                        () =>
                                                            normalToAbsent(
                                                                "absent"
                                                            )
                                                    }
                                                >

                                                    결근 전환

                                                </Button>


                                                <Button
                                                    variant="outline-primary"
                                                    onClick={
                                                        () =>
                                                            normalToAbsent(
                                                                "paid_leave"
                                                            )
                                                    }
                                                >

                                                    유급휴가 전환

                                                </Button>


                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={
                                                        () =>
                                                            normalToAbsent(
                                                                "unpaid_leave"
                                                            )
                                                    }
                                                >

                                                    무급휴가 전환

                                                </Button>


                                            </div>


                                        </>

                                    )
                                }


                                {/* =================================================
                                    결근 / 휴가
                                ================================================= */}

                                {
                                    attendanceExist
                                    &&
                                    attendanceType
                                    !== "normal"
                                    && (

                                        <>


                                            <div className="mb-3">

                                                현재 상태 :{" "}

                                                <Badge
                                                    bg={
                                                        attendanceBadge(
                                                            attendanceType
                                                        )
                                                    }
                                                >

                                                    {
                                                        attendanceLabel(
                                                            attendanceType
                                                        )
                                                    }

                                                </Badge>

                                            </div>


                                            <div
                                                className="
                                                    d-flex
                                                    gap-2
                                                    flex-wrap
                                                    mb-4
                                                "
                                            >


                                                {
                                                    attendanceType
                                                    !== "absent"
                                                    && (

                                                        <Button
                                                            variant="danger"
                                                            onClick={
                                                                () =>
                                                                    absentToAbsent(
                                                                        "absent"
                                                                    )
                                                            }
                                                        >

                                                            결근으로 변경

                                                        </Button>

                                                    )
                                                }


                                                {
                                                    attendanceType
                                                    !== "paid_leave"
                                                    && (

                                                        <Button
                                                            variant="primary"
                                                            onClick={
                                                                () =>
                                                                    absentToAbsent(
                                                                        "paid_leave"
                                                                    )
                                                            }
                                                        >

                                                            유급휴가로 변경

                                                        </Button>

                                                    )
                                                }


                                                {
                                                    attendanceType
                                                    !== "unpaid_leave"
                                                    && (

                                                        <Button
                                                            variant="secondary"
                                                            onClick={
                                                                () =>
                                                                    absentToAbsent(
                                                                        "unpaid_leave"
                                                                    )
                                                            }
                                                        >

                                                            무급휴가로 변경

                                                        </Button>

                                                    )
                                                }


                                            </div>


                                            <hr />


                                            <h6>
                                                출근 상태로 변경
                                            </h6>


                                            <Row className="g-3 mt-1">


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            실제 출근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                clockIn
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setClockIn(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            실제 퇴근
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={
                                                                clockOut
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setClockOut(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                                <Col md={4}>

                                                    <Form.Group>

                                                        <Form.Label>
                                                            휴게시간(분)
                                                        </Form.Label>


                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                breakMinutes
                                                            }
                                                            onChange={
                                                                e =>
                                                                    setBreakMinutes(
                                                                        e.target.value
                                                                    )
                                                            }
                                                        />

                                                    </Form.Group>

                                                </Col>


                                            </Row>


                                            <Button
                                                className="mt-3"
                                                variant="success"
                                                onClick={
                                                    absentToNormal
                                                }
                                            >

                                                출근 상태로 변경

                                            </Button>


                                        </>

                                    )
                                }


                            </>

                        )
                    }


                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={
                            closeModal
                        }
                    >

                        닫기

                    </Button>

                </Modal.Footer>


            </Modal>


        </>
    );
};


export default AdminWorkScheduleCalendar;