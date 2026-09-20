import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Badge,
    Button,
    Card,
    Col,
    Row
} from "react-bootstrap";

import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";
import { formatTime } from "@utils/format";


const WorkScheduleCalendar = ({
    employeeNo
}) => {


    const [
        currentDate,
        setCurrentDate
    ] = useState(
        new Date()
    );


    const [
        scheduleList,
        setScheduleList
    ] = useState([]);


    const [
        summary,
        setSummary
    ] = useState(null);


    // =========================================================
    // YYYY-MM-DD
    // =========================================================

    const dateKey =
        date => {


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
    // 시간
    // =========================================================

    const formatHours =
        value => {


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
    // 기간
    // =========================================================

    const startDate =
        useMemo(
            () => {


                const year =
                    currentDate.getFullYear();


                const month =
                    String(
                        currentDate.getMonth()
                        + 1
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


    const endDate =
        useMemo(
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
    // 조회
    // =========================================================

    const loadSchedule =
        async () => {


            try {


                const response =
                    await apiClient.get(
                        "/employee/workSchedule/mySearch",
                        {
                            params: {

                                startDate,

                                endDate
                            }
                        }
                    );


                setScheduleList(
                    response.data
                        .scheduleList
                    ?? []
                );


                setSummary(
                    response.data
                        .summary
                    ?? null
                );
            }

            catch (err) {


                console.error(
                    err
                );


                toast.error(
                    "근무일정을 불러오지 못했습니다."
                );
            }
        };


    useEffect(
        () => {

            loadSchedule();

        },
        [
            employeeNo,
            startDate,
            endDate
        ]
    );


    // =========================================================
    // 월 이동
    // =========================================================

    const previousMonth =
        () => {


            setCurrentDate(
                previous =>
                    new Date(
                        previous.getFullYear(),
                        previous.getMonth() - 1,
                        1
                    )
            );
        };


    const nextMonth =
        () => {


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
    // 일정 Map
    // =========================================================

    const scheduleMap =
        useMemo(
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

    const calendarDays =
        useMemo(
            () => {


                const year =
                    currentDate
                        .getFullYear();


                const month =
                    currentDate
                        .getMonth();


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
    // 근무일 유형
    // =========================================================

    const dayTypeLabel =
        type => {


            switch (type) {

                case "workday":
                    return "근무일";

                case "holiday":
                    return "주휴일";

                case "dayOff":
                    return "휴무일";

                default:
                    return null;
            }
        };


    // =========================================================
    // 근태
    // =========================================================

    const attendanceLabel =
        type => {


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
                    return null;
            }
        };


    const attendanceBadge =
        type => {


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


    return (

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

                        <Row className="mb-3 g-2">


                            <Col>

                                <Card body>

                                    <div className="small text-muted">
                                        총 근무
                                    </div>

                                    <strong>
                                        {
                                            formatHours(
                                                summary.totalWorkHours
                                            )
                                        }
                                    </strong>
                                    시간

                                </Card>

                            </Col>


                            <Col>

                                <Card body>

                                    <div className="small text-muted">
                                        연장근로
                                    </div>

                                    <strong>
                                        {
                                            formatHours(
                                                summary.totalOvertimeHours
                                            )
                                        }
                                    </strong>
                                    시간

                                </Card>

                            </Col>


                            <Col>

                                <Card body>

                                    <div className="small text-muted">
                                        야간근로
                                    </div>

                                    <strong>
                                        {
                                            formatHours(
                                                summary.totalNightHours
                                            )
                                        }
                                    </strong>
                                    시간

                                </Card>

                            </Col>


                            <Col>

                                <Card body>

                                    <div className="small text-muted">
                                        휴일근로
                                    </div>

                                    <strong>
                                        {
                                            formatHours(
                                                summary.totalHolidayHours
                                            )
                                        }
                                    </strong>
                                    시간

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
                                        text-center
                                        fw-bold
                                        border
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
                                                    150
                                            }}
                                        />

                                    );
                                }


                                const key =
                                    dateKey(
                                        date
                                    );


                                const schedule =
                                    scheduleMap[key];


                                return (

                                    <div
                                        key={
                                            key
                                        }
                                        className="border p-2"
                                        style={{
                                            minHeight:
                                                150
                                        }}
                                    >


                                        <div className="fw-bold mb-2">

                                            {
                                                date.getDate()
                                            }

                                        </div>


                                        {
                                            schedule
                                            && (

                                                <>


                                                    {/* 근무일 구분 */}
                                                    {
                                                        schedule.attendanceType !== "paid_leave"
                                                        &&
                                                        schedule.attendanceType !== "unpaid_leave"
                                                        && (

                                                            <Badge
                                                                bg={
                                                                    schedule.scheduledDayType === "holiday"
                                                                        ? "warning"
                                                                        : "secondary"
                                                                }
                                                                text={
                                                                    schedule.scheduledDayType === "holiday"
                                                                        ? "dark"
                                                                        : undefined
                                                                }
                                                                className="me-1"
                                                            >

                                                                {
                                                                    dayTypeLabel(
                                                                        schedule.scheduledDayType
                                                                    )
                                                                }

                                                            </Badge>

                                                        )
                                                    }


                                                    {/* 근태 상태 */}

                                                    {
                                                        schedule.attendanceType
                                                        && (

                                                            <Badge
                                                                bg={
                                                                    attendanceBadge(
                                                                        schedule.attendanceType
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    attendanceLabel(
                                                                        schedule.attendanceType
                                                                    )
                                                                }

                                                            </Badge>

                                                        )
                                                    }


                                                    {/* =========================
                                                        일반 근무일 예정시간
                                                    ========================= */}

                                                    {
                                                        schedule.scheduledDayType
                                                        === "workday"
                                                        &&
                                                        schedule.scheduledClockIn
                                                        && (

                                                            <div className="small mt-2 text-muted">

                                                                예정{" "}

                                                                {
                                                                    formatTime(
                                                                        schedule.scheduledClockIn
                                                                    )
                                                                }

                                                                {" ~ "}

                                                                {
                                                                    formatTime(
                                                                        schedule.scheduledClockOut
                                                                    )
                                                                }

                                                            </div>

                                                        )
                                                    }


                                                    {/* =========================
                                                        주휴일 실제 출퇴근
                                                    ========================= */}

                                                    {
                                                        schedule.scheduledDayType
                                                        === "holiday"
                                                        &&
                                                        schedule.clockIn
                                                        && (

                                                            <div className="small mt-2">

                                                                <div>

                                                                    출근 :{" "}

                                                                    <strong>
                                                                        {
                                                                            formatTime(
                                                                                schedule.clockIn
                                                                            )
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div>

                                                                    퇴근 :{" "}

                                                                    <strong>

                                                                        {
                                                                            schedule.clockOut

                                                                                ? formatTime(
                                                                                    schedule.clockOut
                                                                                )

                                                                                : "미퇴근"
                                                                        }

                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        )
                                                    }


                                                    {/* =========================
                                                        일반 근무일 실제 출퇴근
                                                    ========================= */}

                                                    {
                                                        schedule.scheduledDayType
                                                        === "workday"
                                                        &&
                                                        schedule.clockIn
                                                        && (

                                                            <div className="small mt-1">

                                                                실제{" "}

                                                                {
                                                                    formatTime(
                                                                        schedule.clockIn
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


                                                    {/* 실제근무 */}

                                                    {
                                                        schedule.actualWorkHours
                                                        > 0
                                                        && (

                                                            <div className="small mt-1">

                                                                근무{" "}

                                                                {
                                                                    formatHours(
                                                                        schedule.actualWorkHours
                                                                    )
                                                                }

                                                                시간

                                                            </div>

                                                        )
                                                    }


                                                    {/* 휴일근로 */}

                                                    {
                                                        schedule.actualHolidayHours
                                                        > 0
                                                        && (

                                                            <div className="small mt-1 text-warning">

                                                                휴일근로{" "}

                                                                {
                                                                    formatHours(
                                                                        schedule.actualHolidayHours
                                                                    )
                                                                }

                                                                시간

                                                            </div>

                                                        )
                                                    }


                                                    {/* 연장근로 */}

                                                    {
                                                        schedule.actualOvertimeHours
                                                        > 0
                                                        && (

                                                            <div className="small mt-1 text-danger">

                                                                연장근로{" "}

                                                                {
                                                                    formatHours(
                                                                        schedule.actualOvertimeHours
                                                                    )
                                                                }

                                                                시간

                                                            </div>

                                                        )
                                                    }


                                                    {/* 야간근로 */}

                                                    {
                                                        schedule.actualNightHours
                                                        > 0
                                                        && (

                                                            <div className="small mt-1 text-primary">

                                                                야간근로{" "}

                                                                {
                                                                    formatHours(
                                                                        schedule.actualNightHours
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
    );
};


export default WorkScheduleCalendar;