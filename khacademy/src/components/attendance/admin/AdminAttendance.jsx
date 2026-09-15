import { useEffect, useMemo, useState } from "react";

import {
    Badge,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import { formatDate, formatTime } from "@utils/format";


const AdminWorkScheduleCalendar = ({ employeeNo }) => {

    // =========================================================
    // 달력
    // =========================================================

    const [currentDate, setCurrentDate] =
        useState(new Date());

    const [scheduleList, setScheduleList] =
        useState([]);

    const [summary, setSummary] =
        useState(null);


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
    // 날짜 처리
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


    const dateTimeInputValue = (value) => {

        if (!value) {
            return "";
        }

        return value.substring(
            0,
            16
        );
    };


    const formatHours = (value) => {

        if (
            value === null
            ||
            value === undefined
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
    // 조회 기간
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
    // 월간 근무일정 조회
    // =========================================================

    const loadSchedule = async () => {

        if (!employeeNo) {
            return;
        }

        try {

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
    };


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
    // 날짜별 일정 Map
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
    // 달력 날짜 생성
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
    // 신규 일정 근무일 유형 변경
    // =========================================================

    const changeScheduledDayType = (value) => {

        setScheduledDayType(
            value
        );


        // 신규 등록일 때만
        // 근무일 기본시간 생성
        // 휴일 / 휴무일은 시간 제거
        if (!selectedSchedule) {

            if (
                value === "workday"
            ) {

                setScheduledClockIn(
                    `${selectedDate}T09:00`
                );

                setScheduledClockOut(
                    `${selectedDate}T18:00`
                );

            }
            else {

                setScheduledClockIn("");

                setScheduledClockOut("");

            }

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


        // =====================================================
        // 기존 일정
        // =====================================================

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

        // =====================================================
        // 신규 일정
        // =====================================================

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

        setScheduledDayType(
            "workday"
        );

        setScheduledClockIn("");

        setScheduledClockOut("");

        setClockIn("");

        setClockOut("");

        setBreakMinutes(
            0
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


        // 일반 근무일만
        // 최초 등록 시 예정시간 필수
        if (
            scheduledDayType === "workday"
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


            // 신규 근무일일 때만
            // 출퇴근 예정시간 저장
            if (
                scheduledDayType === "workday"
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
    // 빈 날짜 -> 결근 등록
    //
    // 1. workday schedule 생성
    // 2. absent attendance 생성
    // =========================================================

    const addBlankAbsent = async () => {

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
            !scheduledClockIn
            ||
            !scheduledClockOut
        ) {

            toast.warning(
                "결근 처리할 예정 근무시간을 입력해주세요."
            );

            return;
        }


        let scheduleCreated =
            false;


        try {

            // =================================================
            // 1. 근무일정 생성
            // =================================================

            await apiClient.post(
                "/employee/attendance/add",
                {

                    employeeNo,

                    scheduledWorkDate:
                        `${selectedDate}T00:00:00`,

                    scheduledDayType:
                        "workday",

                    scheduledClockIn,

                    scheduledClockOut

                }
            );


            scheduleCreated =
                true;


            // =================================================
            // 2. 결근 생성
            // =================================================

            await apiClient.post(
                "/admin/attendance/absent",
                {

                    employeeNo,

                    workDate:
                        `${selectedDate}T00:00:00`

                }
            );


            toast.success(
                "결근 처리되었습니다."
            );


            closeModal();

            await loadSchedule();

        }
        catch (err) {

            console.error(err);


            // 일정은 만들어졌는데
            // 결근 API만 실패한 경우
            if (scheduleCreated) {

                toast.error(
                    "근무일정은 등록되었지만 결근 등록에 실패했습니다."
                );

                closeModal();

                await loadSchedule();

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
                "결근 처리에 실패했습니다."
            );

        }
    };


    // =========================================================
    // 기존 근무일정 수정
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


            // =================================================
            // 일반 근무일
            // =================================================

            if (
                scheduledDayType === "workday"
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


            // =================================================
            // 기존 휴일
            //
            // 최초등록 때는 시간이 없지만
            // 다시 들어왔을 때는 입력 가능
            // =================================================

            else if (
                scheduledDayType === "holiday"
            ) {

                const onlyOneInput =
                    (
                        scheduledClockIn
                        &&
                        !scheduledClockOut
                    )
                    ||
                    (
                        !scheduledClockIn
                        &&
                        scheduledClockOut
                    );


                if (onlyOneInput) {

                    toast.warning(
                        "예정 출근시간과 퇴근시간을 모두 입력해주세요."
                    );

                    return;
                }


                if (
                    scheduledClockIn
                    &&
                    scheduledClockOut
                ) {

                    request.scheduledClockIn =
                        scheduledClockIn;

                    request.scheduledClockOut =
                        scheduledClockOut;

                }

            }


            // dayOff는 시간 전송 안 함


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
    // 기존 스케줄
    // 근태 없음 -> 결근 / 휴가
    // =========================================================

    const addNonWorkingAttendance =
        async (type) => {

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
    // 정상 -> 정상 수정
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
    // 정상 -> 결근 / 휴가
    // =========================================================

    const normalToAbsent =
        async (attendanceType) => {

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
        async (attendanceType) => {

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
    // 현재 선택 일정 상태
    // =========================================================

    const attendanceType =
        selectedSchedule
            ?.attendanceType;


    const attendanceExist =
        selectedSchedule
            ?.empAttendanceNo
        != null;


    const nonWorkingAttendance =
        attendanceType === "absent"
        ||
        attendanceType === "paid_leave"
        ||
        attendanceType === "unpaid_leave";


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


                                                        {/* =============================================
                                                            휴일근무
                                                        ============================================= */}

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


                                                        {/* =============================================
                                                            휴일
                                                        ============================================= */}

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


                                                        {/* =============================================
                                                            휴무일
                                                        ============================================= */}

                                                        {
                                                            schedule
                                                                .scheduledDayType
                                                            === "dayOff"
                                                            && (

                                                                <Badge
                                                                    bg="secondary"
                                                                >
                                                                    휴무일
                                                                </Badge>

                                                            )
                                                        }


                                                        {/* =============================================
                                                            결근 / 휴가
                                                        ============================================= */}

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


                                                        {/* =============================================
                                                            근태 미등록
                                                        ============================================= */}

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


                                                        {/* =============================================
                                                            예정시간
                                                        ============================================= */}

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
                                                                        formatTime(
                                                                            schedule
                                                                                .scheduledClockIn
                                                                        )
                                                                    }

                                                                    {" ~ "}

                                                                    {
                                                                        formatTime(
                                                                            schedule
                                                                                .scheduledClockOut
                                                                        )
                                                                    }

                                                                </div>

                                                            )
                                                        }


                                                        {/* =============================================
                                                            실제 출퇴근
                                                        ============================================= */}

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
                                                                        formatTime(
                                                                            schedule
                                                                                .clockIn
                                                                        )
                                                                    }

                                                                    {" ~ "}

                                                                    {
                                                                        schedule.clockOut
                                                                        ? formatTime(
                                                                            schedule.clockOut
                                                                        )
                                                                        : "미퇴근"
                                                                    }

                                                                </div>

                                                            )
                                                        }


                                                        {/* =============================================
                                                            실제 근무시간
                                                        ============================================= */}

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


                                                        {/* =============================================
                                                            휴일근로시간
                                                        ============================================= */}

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

                        {formatDate(selectedDate)}{" "}
                        근태 관리

                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>


                    {/* =================================================
                        신규 일정
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

                                    {formatDate(selectedDate)}의{" "}
                                    근무 일정을 등록합니다.

                                </div>


                                <Row className="g-3">


                                    {/* =====================================
                                        근무일 유형
                                    ===================================== */}

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
                                                        changeScheduledDayType(
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


                                    {/* =====================================
                                        신규 근무일 / 휴일

                                        휴일 최초 입력:
                                        화면은 보이지만 disabled
                                    ===================================== */}

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
                                                            disabled={
                                                                scheduledDayType
                                                                === "holiday"
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
                                                            disabled={
                                                                scheduledDayType
                                                                === "holiday"
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


                                {/* =====================================
                                    휴일 최초등록 안내
                                ===================================== */}

                                {
                                    scheduledDayType
                                    === "holiday"
                                    && (

                                        <div
                                            className="
                                                small
                                                text-muted
                                                mt-3
                                            "
                                        >

                                            휴일 최초 등록 시에는
                                            예정 출퇴근시간을 입력하지 않습니다.
                                            등록 후 해당 날짜를 다시 열면
                                            휴일근무 예정시간을 입력할 수 있습니다.

                                        </div>

                                    )
                                }


                                {/* =====================================
                                    휴무일 안내
                                ===================================== */}

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


                                {/* =====================================
                                    신규 등록 버튼
                                ===================================== */}

                                <div
                                    className="
                                        d-flex
                                        justify-content-end
                                        gap-2
                                        mt-4
                                    "
                                >


                                    {/* 빈 날짜 바로 결근 */}

                                    {
                                        scheduledDayType
                                        === "workday"
                                        && (

                                            <Button
                                                variant="danger"
                                                onClick={
                                                    addBlankAbsent
                                                }
                                            >

                                                결근 등록

                                            </Button>

                                        )
                                    }


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
                        // 기존 일정
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


                                    {/* =====================================
                                        기존 근무일 유형
                                    ===================================== */}

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


                                    {/* =====================================
                                        기존 일정 출퇴근 예정시간

                                        holiday는 재진입 시 입력 가능

                                        결근/휴가 발생 후에는 잠금
                                    ===================================== */}

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
                                                            disabled={
                                                                attendanceExist
                                                                ||
                                                                nonWorkingAttendance
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
                                                            disabled={
                                                                attendanceExist
                                                                ||
                                                                nonWorkingAttendance
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


                                {/* =====================================
                                    기존 휴일 안내
                                ===================================== */}

                                {
                                    scheduledDayType
                                    === "holiday"
                                    &&
                                    !attendanceExist
                                    && (

                                        <div
                                            className="
                                                small
                                                text-muted
                                                mb-3
                                            "
                                        >

                                            휴일 일정입니다.
                                            휴일근무 예정 시 출퇴근시간을
                                            입력한 뒤 일정을 수정하세요.

                                        </div>

                                    )
                                }


                                {/* =====================================
                                    일정 수정

                                    이미 근태 있으면 일정 수정 막음
                                ===================================== */}

                                <div
                                    className="
                                        text-end
                                        mb-4
                                    "
                                >

                                    <Button
                                        variant="outline-primary"
                                        disabled={
                                            attendanceExist
                                        }
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


                                {/* =====================================
                                    휴무일
                                ===================================== */}

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


                                {/* =====================================
                                    아직 근태 없음
                                ===================================== */}

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


                                {/* =====================================
                                    정상 출근
                                ===================================== */}

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


                                {/* =====================================
                                    결근 / 휴가

                                    출퇴근 입력 없음
                                ===================================== */}

                                {
                                    attendanceExist
                                    &&
                                    nonWorkingAttendance
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
                                                    mb-3
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


                                            <div
                                                className="
                                                    small
                                                    text-muted
                                                "
                                            >

                                                결근 또는 휴가 상태에서는
                                                출퇴근시간을 설정할 수 없습니다.

                                            </div>


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
