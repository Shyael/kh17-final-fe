import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import koLocale from "@fullcalendar/core/locales/ko";
import { Col, Form, Row } from "react-bootstrap";
import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";
import "./timetable.css";

// 수업 상태별 이벤트 색상 (백엔드 classStatus enum: 예정/진행중/종료/취소)
const STATUS_COLOR = {
    예정: "var(--kh-primary)",
    진행중: "var(--bs-success)",
    종료: "var(--kh-muted)",
    취소: "var(--bs-danger)",
};

// FullCalendar가 넘겨주는 Date 객체 -> 백엔드 date 파라미터 포맷("YYYY-MM-DD")
const formatDateParam = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function EmployeeTimetable() {
    const calendarRef = useRef(null);

    // 강의실 목록 / 선택된 강의실
    const [classroomList, setClassroomList] = useState([]);
    const [classroomNo, setClassroomNo] = useState(null);

    // 현재 캘린더에 표시중인 주의 시작일 ("YYYY-MM-DD")
    const [currentWeekStart, setCurrentWeekStart] = useState(null);

    // 시간표 이벤트 목록
    const [events, setEvents] = useState([]);

    // 강의실 목록 조회
    const loadClassroomList = useCallback(async () => {
        try {
            const response = await apiClient.get("/employee/classroom");
            const list = response.data ?? [];

            setClassroomList(list);

            if (list.length > 0) {
                setClassroomNo(list[0].classroomNo);
            }
        }
        catch (err) {
            console.error("강의실 목록 조회 실패", err);
        }
    }, []);

    useEffect(() => {
        loadClassroomList();
    }, [loadClassroomList]);

    // 선택된 강의실 + 표시중인 주 기준으로 시간표 조회
    const loadTimetable = useCallback(async () => {
        if (!classroomNo) {
            return;
        }

        try {
            const response = await apiClient.get("/employee/timetable", {
                params: {
                    classroomNo,
                    date: currentWeekStart || undefined,
                },
            });

            const list = response.data ?? [];

            setEvents(
                list.map((schedule) => {
                    const color = STATUS_COLOR[schedule.classStatus] ?? "var(--kh-primary)";

                    return {
                        id: String(schedule.scheduleNo),
                        title: `${schedule.courseTitle} · ${schedule.employeeName}`,
                        start: `${schedule.classDate}T${schedule.startTime}`,
                        end: `${schedule.classDate}T${schedule.endTime}`,
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: schedule,
                    };
                })
            );
        }
        catch (err) {
            console.error("시간표 조회 실패", err);
            setEvents([]);
        }
    }, [classroomNo, currentWeekStart]);

    useEffect(() => {
        loadTimetable();
    }, [loadTimetable]);

    // 이전/다음/오늘 이동 시 실제 보여지는 주의 시작일을 갱신 (초기 진입 시에도 한 번 호출됨)
    const handleDatesSet = useCallback((arg) => {
        setCurrentWeekStart(formatDateParam(arg.view.currentStart));
    }, []);

    return (
        <>
            <Jumbotron
                title="강의 시간표"
                content="강의실별 이번 주 수업 일정을 확인합니다."
            />

            <Row className="mt-4 mb-3">
                <Col xs={12} md={4} lg={3}>
                    <Form.Select
                        value={classroomNo ?? ""}
                        onChange={(e) => setClassroomNo(Number(e.target.value))}>
                        {classroomList.length === 0 && (
                            <option value="">등록된 강의실이 없습니다</option>
                        )}
                        {classroomList.map((classroom) => (
                            <option key={classroom.classroomNo} value={classroom.classroomNo}>
                                {classroom.classroomName ?? `${classroom.classroomNo}번 강의실`}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            <div className="kh-timetable">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin]}
                    initialView="timeGridWeek"
                    locale={koLocale}
                    firstDay={1}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "",
                    }}
                    allDaySlot={false}
                    slotMinTime="09:00:00"
                    slotMaxTime="23:00:00"
                    slotDuration="00:30:00"
                    height="auto"
                    events={events}
                    datesSet={handleDatesSet}
                />
            </div>
        </>
    );
}
