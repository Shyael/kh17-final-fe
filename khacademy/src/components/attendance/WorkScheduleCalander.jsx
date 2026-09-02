import { useEffect, useMemo, useState } from "react";
import {
    Badge,
    Button,
    Card,
    Col,
    Row,
    Spinner
} from "react-bootstrap";
import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";

const WorkScheduleCalendar = ({ employeeNo }) => {

    const [currentDate, setCurrentDate] = useState(
        new Date()
    );

    const [scheduleList, setScheduleList] =
        useState([]);

    const [summary, setSummary] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    // YYYY-MM-DD
    const dateKey = (date) => {
        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // 이번 달 조회 시작일
    const startDate = useMemo(() => {

        const year =
            currentDate.getFullYear();

        const month =
            String(
                currentDate.getMonth() + 1
            ).padStart(2, "0");

        return `${year}-${month}-01 00:00:00`;

    }, [currentDate]);


    // 이번 달 조회 종료일
    const endDate = useMemo(() => {

        const lastDate =
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
            );

        return `${dateKey(lastDate)} 23:59:59`;

    }, [currentDate]);


    // 월 근무일정 조회
   const loadSchedule = async () => {
    try {
        setLoading(true);

        const response = await apiClient.get(
            "/workSchedule/mySearch",
            {
                params: {
                    startDate,
                    endDate
                }
            }
        );

        setScheduleList(
            response.data.scheduleList ?? []
        );

        setSummary(
            response.data.summary ?? null
        );
    }
    catch (err) {
        console.error(err);

        toast.error(
            "근무일정을 불러오지 못했습니다."
        );
    }
    finally {
        setLoading(false);
    }
};

    useEffect(() => {
        loadSchedule();
    }, [
        employeeNo,
        startDate,
        endDate
    ]);


    // 이전 달
    const previousMonth = () => {

        setCurrentDate(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1
            )
        );
    };


    // 다음 달
    const nextMonth = () => {

        setCurrentDate(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1
            )
        );
    };


    // YYYY-MM-DD 기준 일정 찾기
    // 서버에서 +09:00 포함 Timestamp가 오므로
    // Date로 다시 변환하지 않고 문자열 앞 10자리 사용
    const scheduleMap = useMemo(() => {

        const map = {};

        scheduleList.forEach(schedule => {

            const key =
                schedule.scheduledWorkDate
                    ?.substring(0, 10);

            if (key) {
                map[key] = schedule;
            }
        });

        return map;

    }, [scheduleList]);


    // 달력 날짜 배열
    const calendarDays = useMemo(() => {

        const year =
            currentDate.getFullYear();

        const month =
            currentDate.getMonth();

        const firstDay =
            new Date(year, month, 1);

        const lastDay =
            new Date(year, month + 1, 0);

        const result = [];


        // 1일 전 빈칸
        for (
            let i = 0;
            i < firstDay.getDay();
            i++
        ) {
            result.push(null);
        }


        // 실제 날짜
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

    }, [currentDate]);


    // 근무일 종류
    const dayTypeLabel = (type) => {

        switch (type) {

            case "workday":
                return "근무일";

            case "holiday":
                return "휴일";

            case "dayOff":
                return "휴무일";

            default:
                return null;
        }
    };


    // 근태 상태
    const attendanceLabel = (type) => {

        switch (type) {

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


    // 시간 표시
    const timeText = (value) => {

        if (!value) return null;

        // 2026-09-02T09:00:00...
        return value.substring(11, 16);
    };


    return (
        <Card>
            <Card.Body>

                {/* 월 이동 */}
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
                        onClick={previousMonth}
                    >
                        이전
                    </Button>

                    <h4 className="mb-0">
                        {currentDate.getFullYear()}년{" "}
                        {currentDate.getMonth() + 1}월
                    </h4>

                    <Button
                        variant="outline-secondary"
                        onClick={nextMonth}
                    >
                        다음
                    </Button>
                </div>


                {/* 월 합계 */}
                {summary && (
                    <Row className="mb-3 g-2">

                        <Col>
                            <Card body>
                                총 근무
                                <div>
                                    <strong>
                                        {summary.totalWorkHours}
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
                                        {summary.totalOvertimeHours}
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
                                        {summary.totalNightHours}
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
                                        {summary.totalHolidayHours}
                                    </strong>
                                    시간
                                </div>
                            </Card>
                        </Col>

                    </Row>
                )}


                {loading ? (

                    <div className="text-center py-5">
                        <Spinner />
                    </div>

                ) : (

                    <>
                        {/* 요일 */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(7, 1fr)"
                            }}
                        >
                            {[
                                "일",
                                "월",
                                "화",
                                "수",
                                "목",
                                "금",
                                "토"
                            ].map(day => (

                                <div
                                    key={day}
                                    className="
                                        text-center
                                        fw-bold
                                        border
                                        p-2
                                    "
                                >
                                    {day}
                                </div>
                            ))}
                        </div>


                        {/* 날짜 */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(7, 1fr)"
                            }}
                        >

                            {calendarDays.map(
                                (date, index) => {

                                    if (!date) {
                                        return (
                                            <div
                                                key={
                                                    `empty-${index}`
                                                }
                                                className="border"
                                                style={{
                                                    minHeight: 140
                                                }}
                                            />
                                        );
                                    }


                                    const key =
                                        dateKey(date);

                                    const schedule =
                                        scheduleMap[key];

                                    const attendance =
                                        attendanceLabel(
                                            schedule
                                                ?.attendanceType
                                        );


                                    return (
                                        <div
                                            key={key}
                                            className="border p-2"
                                            style={{
                                                minHeight: 140
                                            }}
                                        >
                                            <div
                                                className="
                                                    fw-bold
                                                    mb-2
                                                "
                                            >
                                                {date.getDate()}
                                            </div>


                                            {schedule && (
                                                <>
                                                    <Badge
                                                        bg="secondary"
                                                        className="me-1"
                                                    >
                                                        {
                                                            dayTypeLabel(
                                                                schedule
                                                                    .scheduledDayType
                                                            )
                                                        }
                                                    </Badge>


                                                    {attendance && (
                                                        <Badge
                                                            bg="danger"
                                                        >
                                                            {
                                                                attendance
                                                            }
                                                        </Badge>
                                                    )}


                                                    {schedule
                                                        .scheduledClockIn
                                                        && (
                                                        <div
                                                            className="
                                                                small
                                                                mt-2
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
                                                    )}


                                                    {schedule
                                                        .clockIn
                                                        && (
                                                        <div
                                                            className="
                                                                small
                                                                mt-1
                                                            "
                                                        >
                                                            실제{" "}
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
                                                                ?? "미퇴근"
                                                            }
                                                        </div>
                                                    )}


                                                    {schedule
                                                        .actualWorkHours
                                                        > 0
                                                        && (
                                                        <div
                                                            className="
                                                                small
                                                                mt-1
                                                            "
                                                        >
                                                            근무{" "}
                                                            {
                                                                schedule
                                                                    .actualWorkHours
                                                            }
                                                            시간
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    </>
                )}

            </Card.Body>
        </Card>
    );
};

export default WorkScheduleCalendar;