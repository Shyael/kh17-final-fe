import Jumbotron from "@templates/Jumbotron";
import { apiClient } from "@utils/reaxios";

import dayjs from "dayjs";
import "dayjs/locale/ko";

import { useCallback, useState } from "react";

import {
    Badge,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";

import {
    FaMagnifyingGlass,
    FaSquarePen,
    FaXmark,
} from "react-icons/fa6";

import { toast } from "react-toastify";
import Swal from "sweetalert2";

dayjs.locale("ko");


const absentTypeList = [
    "결근",
    "유급휴가",
    "무급휴가",
];

const workDayTypeList = [
    "근무일",
    "휴일",
    "휴무일",
];


export default function AdminAttendance() {

    // 조회 조건
    const [condition, setCondition] = useState({
        employeeNo: "",
        startDate: dayjs()
            .startOf("month")
            .format("YYYY-MM-DD"),
        endDate: dayjs()
            .endOf("month")
            .format("YYYY-MM-DD"),
    });


    // 조회 결과
    const [attendanceList, setAttendanceList] =
        useState([]);

    const [searched, setSearched] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    // 수정 대상
    const [selectedAttendance, setSelectedAttendance] =
        useState(null);


    // 수정 종류
    // normalToNormal
    // normalToAbsent
    // absentToNormal
    // absentToAbsent
    const [editType, setEditType] =
        useState("");


    // 수정 입력값
    const [editAttendance, setEditAttendance] =
        useState({
            empAttendanceNo: "",
            attendanceType: "",
            workDayType: "근무일",
            clockIn: "",
            clockOut: "",
            breakMinutes: "",
        });


    const [showEditModal, setShowEditModal] =
        useState(false);

    const [saving, setSaving] =
        useState(false);



    // 조회 문자열 변경
    const changeStringValue = useCallback((e) => {

        const { name, value } = e.target;

        setCondition(prev => ({
            ...prev,
            [name]: value,
        }));

    }, []);



    // 직원번호
    const changeEmployeeNo = useCallback((e) => {

        const { name, value } = e.target;

        const replacement =
            value.replace(/[^0-9]+/g, "");

        setCondition(prev => ({
            ...prev,
            [name]: replacement,
        }));

    }, []);



    // 근태 검색
    const searchAttendance = useCallback(async (e) => {

        if (e) {
            e.preventDefault();
        }


        if (condition.employeeNo === "") {

            await Swal.fire(
                "직원번호를 입력하세요"
            );

            return;
        }


        if (
            condition.startDate === ""
            || condition.endDate === ""
        ) {

            await Swal.fire(
                "조회기간을 입력하세요"
            );

            return;
        }


        if (
            dayjs(condition.endDate)
                .isBefore(
                    dayjs(condition.startDate)
                )
        ) {

            await Swal.fire(
                "종료일은 시작일보다 빠를 수 없습니다"
            );

            return;
        }


        try {

            setLoading(true);


            // 백엔드는 [시작일, 종료일) 구조이므로
            // 사용자가 선택한 종료일의 다음날 00:00을 전달
            const searchEndDate =
                dayjs(condition.endDate)
                    .add(1, "day")
                    .format(
                        "YYYY-MM-DD 00:00:00"
                    );


            const { data } =
                await apiClient.get(
                    "/attendance/search",
                    {
                        params: {
                            employeeNo:
                                Number(
                                    condition.employeeNo
                                ),

                            startDate:
                                `${condition.startDate} 00:00:00`,

                            endDate:
                                searchEndDate,
                        },
                    }
                );


            setAttendanceList(
                data ?? []
            );

            setSearched(true);

        }
        catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message
                ?? "근태 조회에 실패했습니다"
            );

        }
        finally {

            setLoading(false);

        }

    }, [condition]);



    // 수정 Modal 열기
    const openEditModal = useCallback((
        attendance,
        type
    ) => {

        setSelectedAttendance(
            attendance
        );

        setEditType(
            type
        );


        // 정상 -> 정상
        if (type === "normalToNormal") {

            setEditAttendance({
                empAttendanceNo:
                    attendance.empAttendanceNo,

                attendanceType:
                    attendance.attendanceType,

                workDayType:
                    attendance.workDayType
                    ?? "근무일",

                clockIn:
                    attendance.clockIn
                        ? dayjs(
                            attendance.clockIn
                        ).format(
                            "YYYY-MM-DDTHH:mm"
                        )
                        : "",

                clockOut:
                    attendance.clockOut
                        ? dayjs(
                            attendance.clockOut
                        ).format(
                            "YYYY-MM-DDTHH:mm"
                        )
                        : "",

                breakMinutes:
                    attendance.breakMinutes
                    ?? 0,
            });

        }


        // 정상 -> 비근무
        else if (type === "normalToAbsent") {

            setEditAttendance({
                empAttendanceNo:
                    attendance.empAttendanceNo,

                attendanceType:
                    "결근",

                workDayType:
                    attendance.workDayType
                    ?? "근무일",

                clockIn: "",
                clockOut: "",
                breakMinutes: "",
            });

        }


        // 비근무 -> 정상
        else if (type === "absentToNormal") {

            const workDate =
                dayjs(
                    attendance.workDate
                ).format(
                    "YYYY-MM-DD"
                );


            setEditAttendance({
                empAttendanceNo:
                    attendance.empAttendanceNo,

                attendanceType:
                    "정상",

                workDayType:
                    attendance.workDayType
                    ?? "근무일",

                clockIn:
                    `${workDate}T09:00`,

                clockOut:
                    `${workDate}T18:00`,

                breakMinutes:
                    attendance.breakMinutes
                    ?? 0,
            });

        }


        // 비근무 -> 비근무
        else if (type === "absentToAbsent") {

            setEditAttendance({
                empAttendanceNo:
                    attendance.empAttendanceNo,

                attendanceType:
                    attendance.attendanceType,

                workDayType:
                    attendance.workDayType
                    ?? "근무일",

                clockIn: "",
                clockOut: "",
                breakMinutes: "",
            });

        }


        setShowEditModal(true);

    }, []);



    // Modal 닫기
    const closeEditModal = useCallback(() => {

        if (saving) {
            return;
        }

        setShowEditModal(false);

        setSelectedAttendance(null);

        setEditType("");

    }, [saving]);



    // 수정값 변경
    const changeEditValue = useCallback((e) => {

        const { name, value } = e.target;


        setEditAttendance(prev => ({
            ...prev,

            [name]:
                name === "breakMinutes"
                    ? value.replace(
                        /[^0-9.]+/g,
                        ""
                    )
                    : value,
        }));

    }, []);



    // 근태 수정
    const saveAttendance = useCallback(async () => {

        if (
            selectedAttendance === null
            || editType === ""
        ) {
            return;
        }


        let endpoint;
        let requestData;



        // 정상 -> 정상
        if (editType === "normalToNormal") {

            if (
                editAttendance.clockIn === ""
                || editAttendance.clockOut === ""
                || editAttendance.breakMinutes === ""
            ) {

                await Swal.fire(
                    "근무 정보를 모두 입력하세요"
                );

                return;
            }


            if (
                !dayjs(
                    editAttendance.clockOut
                ).isAfter(
                    dayjs(
                        editAttendance.clockIn
                    )
                )
            ) {

                await Swal.fire(
                    "퇴근시간은 출근시간보다 늦어야 합니다"
                );

                return;
            }


            endpoint =
                "/attendance/normalToNormal";


            requestData = {

                empAttendanceNo:
                    editAttendance.empAttendanceNo,

                clockIn:
                    dayjs(
                        editAttendance.clockIn
                    ).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),

                clockOut:
                    dayjs(
                        editAttendance.clockOut
                    ).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),

                breakMinutes:
                    Number(
                        editAttendance.breakMinutes
                    ),

                workDayType:
                    editAttendance.workDayType,
            };

        }



        // 정상 -> 비근무
        else if (editType === "normalToAbsent") {

            endpoint =
                "/attendance/normalToAbsent";


            requestData = {

                empAttendanceNo:
                    editAttendance.empAttendanceNo,

                attendanceType:
                    editAttendance.attendanceType,
            };

        }



        // 비근무 -> 정상
        else if (editType === "absentToNormal") {

            if (
                editAttendance.clockIn === ""
                || editAttendance.clockOut === ""
                || editAttendance.breakMinutes === ""
            ) {

                await Swal.fire(
                    "근무 정보를 모두 입력하세요"
                );

                return;
            }


            if (
                !dayjs(
                    editAttendance.clockOut
                ).isAfter(
                    dayjs(
                        editAttendance.clockIn
                    )
                )
            ) {

                await Swal.fire(
                    "퇴근시간은 출근시간보다 늦어야 합니다"
                );

                return;
            }


            endpoint =
                "/attendance/absentToNormal";


            requestData = {

                empAttendanceNo:
                    editAttendance.empAttendanceNo,

                clockIn:
                    dayjs(
                        editAttendance.clockIn
                    ).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),

                clockOut:
                    dayjs(
                        editAttendance.clockOut
                    ).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),

                breakMinutes:
                    Number(
                        editAttendance.breakMinutes
                    ),

                workDayType:
                    editAttendance.workDayType,
            };

        }



        // 비근무 -> 비근무
        else if (editType === "absentToAbsent") {

            endpoint =
                "/attendance/absentToAbsent";


            requestData = {

                empAttendanceNo:
                    editAttendance.empAttendanceNo,

                attendanceType:
                    editAttendance.attendanceType,
            };

        }



        const result =
            await Swal.fire({

                title:
                    "근태 정보를 수정하시겠습니까?",

                icon:
                    "warning",

                showCancelButton:
                    true,

                confirmButtonText:
                    "수정",

                cancelButtonText:
                    "취소",

                confirmButtonColor:
                    "#00b894",

                cancelButtonColor:
                    "#b2bec3",
            });


        if (
            result.isConfirmed === false
        ) {
            return;
        }


        try {

            setSaving(true);


            await apiClient.patch(
                endpoint,
                requestData
            );


            toast.success(
                "근태 정보가 수정되었습니다"
            );


            setShowEditModal(false);

            setSelectedAttendance(null);

            setEditType("");


            await searchAttendance();

        }
        catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message
                ?? "근태 수정에 실패했습니다"
            );

        }
        finally {

            setSaving(false);

        }

    }, [
        selectedAttendance,
        editType,
        editAttendance,
        searchAttendance,
    ]);



    // 근태 Badge
    const attendanceBadge = useCallback(
        (attendanceType) => {

            if (
                attendanceType === "정상"
            ) {
                return "success";
            }

            if (
                attendanceType === "결근"
            ) {
                return "danger";
            }

            if (
                attendanceType === "유급휴가"
            ) {
                return "info";
            }

            return "secondary";

        },
        []
    );



    // Modal 제목
    const editModalTitle = () => {

        if (
            editType === "normalToNormal"
        ) {
            return "근무 세부사항 수정";
        }

        if (
            editType === "normalToAbsent"
        ) {
            return "비근무로 수정";
        }

        if (
            editType === "absentToNormal"
        ) {
            return "근무로 수정";
        }

        if (
            editType === "absentToAbsent"
        ) {
            return "비근무 세부사항 수정";
        }

        return "근태 수정";

    };



    return (
        <>

            <Jumbotron
                title="관리자 근태 관리"
                content="직원별 근태를 조회하고 정정하세요"
            />



            {/* 조회 조건 */}
            <Row className="mt-5">

                <Col>

                    <Card>

                        <Card.Header
                            className="fw-bold"
                        >
                            직원 근태 조회
                        </Card.Header>


                        <Card.Body>

                            <Form
                                onSubmit={
                                    searchAttendance
                                }
                            >

                                <Row
                                    className="
                                        g-3
                                        align-items-end
                                    "
                                >

                                    <Col
                                        xs={12}
                                        lg={3}
                                    >

                                        <Form.Group>

                                            <Form.Label>
                                                직원번호
                                            </Form.Label>

                                            <Form.Control
                                                type="text"
                                                inputMode="numeric"
                                                name="employeeNo"
                                                value={
                                                    condition.employeeNo
                                                }
                                                onChange={
                                                    changeEmployeeNo
                                                }
                                                placeholder="직원번호"
                                                autoFocus
                                            />

                                        </Form.Group>

                                    </Col>


                                    <Col
                                        xs={12}
                                        sm={6}
                                        lg={3}
                                    >

                                        <Form.Group>

                                            <Form.Label>
                                                시작일
                                            </Form.Label>

                                            <Form.Control
                                                type="date"
                                                name="startDate"
                                                value={
                                                    condition.startDate
                                                }
                                                onChange={
                                                    changeStringValue
                                                }
                                            />

                                        </Form.Group>

                                    </Col>


                                    <Col
                                        xs={12}
                                        sm={6}
                                        lg={3}
                                    >

                                        <Form.Group>

                                            <Form.Label>
                                                종료일
                                            </Form.Label>

                                            <Form.Control
                                                type="date"
                                                name="endDate"
                                                value={
                                                    condition.endDate
                                                }
                                                onChange={
                                                    changeStringValue
                                                }
                                            />

                                        </Form.Group>

                                    </Col>


                                    <Col
                                        xs={12}
                                        lg={3}
                                    >

                                        <Button
                                            type="submit"
                                            variant="success"
                                            className="w-100"
                                            disabled={
                                                loading
                                            }
                                        >

                                            {loading ? (
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                />
                                            ) : (
                                                <>
                                                    <FaMagnifyingGlass />

                                                    <span className="ms-2">
                                                        검색하기
                                                    </span>
                                                </>
                                            )}

                                        </Button>

                                    </Col>

                                </Row>

                            </Form>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>



            {/* 조회 결과 제목 */}
            <Row
                className="
                    mt-5
                    align-items-center
                "
            >

                <Col>

                    <h4 className="mb-0">
                        조회 결과
                    </h4>

                </Col>


                {searched && (
                    <Col className="text-end">

                        <span className="text-secondary">
                            총 {attendanceList.length}건
                        </span>

                    </Col>
                )}

            </Row>



            {/* 조회 결과 */}
            <Row className="mt-3">

                <Col>

                    {loading ? (

                        <div
                            className="
                                text-center
                                py-5
                            "
                        >

                            <Spinner
                                animation="border"
                            />

                            <div className="mt-3">
                                근태 내역을 불러오는 중입니다
                            </div>

                        </div>

                    ) : attendanceList.length === 0 ? (

                        <Card>

                            <Card.Body
                                className="
                                    text-center
                                    text-secondary
                                    py-5
                                "
                            >

                                {searched
                                    ? "조회된 근태 내역이 없습니다"
                                    : "직원번호와 기간을 입력한 뒤 검색하세요"
                                }

                            </Card.Body>

                        </Card>

                    ) : (

                        <Row className="g-4">

                            {attendanceList.map(
                                attendance => {

                                    const isNormal =
                                        attendance.attendanceType
                                        === "정상";


                                    return (

                                        <Col
                                            xs={12}
                                            lg={6}
                                            key={
                                                attendance.empAttendanceNo
                                            }
                                        >

                                            <Card
                                                className="h-100"
                                            >

                                                <Card.Header
                                                    className="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-center
                                                    "
                                                >

                                                    <div>

                                                        <span
                                                            className="
                                                                fw-bold
                                                                me-2
                                                            "
                                                        >
                                                            {dayjs(
                                                                attendance.workDate
                                                            ).format(
                                                                "YYYY년 MM월 DD일"
                                                            )}
                                                        </span>


                                                        <Badge
                                                            bg={
                                                                attendanceBadge(
                                                                    attendance.attendanceType
                                                                )
                                                            }
                                                        >
                                                            {
                                                                attendance.attendanceType
                                                            }
                                                        </Badge>


                                                        {isNormal && (
                                                            <Badge
                                                                bg="secondary"
                                                                className="ms-2"
                                                            >
                                                                {
                                                                    attendance.workDayType
                                                                    ?? "-"
                                                                }
                                                            </Badge>
                                                        )}

                                                    </div>


                                                    <small
                                                        className="
                                                            text-secondary
                                                        "
                                                    >
                                                        #{attendance.empAttendanceNo}
                                                    </small>

                                                </Card.Header>



                                                <Card.Body>

                                                    {isNormal ? (

                                                        <>
                                                            <Row className="g-3">

                                                                <Col
                                                                    xs={6}
                                                                    md={3}
                                                                >

                                                                    <div
                                                                        className="
                                                                            small
                                                                            text-secondary
                                                                        "
                                                                    >
                                                                        출근
                                                                    </div>

                                                                    <div
                                                                        className="
                                                                            fw-bold
                                                                        "
                                                                    >
                                                                        {attendance.clockIn
                                                                            ? dayjs(
                                                                                attendance.clockIn
                                                                            ).format(
                                                                                "HH:mm"
                                                                            )
                                                                            : "-"
                                                                        }
                                                                    </div>

                                                                </Col>


                                                                <Col
                                                                    xs={6}
                                                                    md={3}
                                                                >

                                                                    <div
                                                                        className="
                                                                            small
                                                                            text-secondary
                                                                        "
                                                                    >
                                                                        퇴근
                                                                    </div>

                                                                    <div
                                                                        className="
                                                                            fw-bold
                                                                        "
                                                                    >
                                                                        {attendance.clockOut
                                                                            ? dayjs(
                                                                                attendance.clockOut
                                                                            ).format(
                                                                                "HH:mm"
                                                                            )
                                                                            : "-"
                                                                        }
                                                                    </div>

                                                                </Col>


                                                                <Col
                                                                    xs={4}
                                                                    md={2}
                                                                >

                                                                    <div
                                                                        className="
                                                                            small
                                                                            text-secondary
                                                                        "
                                                                    >
                                                                        휴게
                                                                    </div>

                                                                    <div>
                                                                        {
                                                                            attendance.breakMinutes
                                                                            ?? 0
                                                                        }
                                                                        분
                                                                    </div>

                                                                </Col>


                                                                <Col
                                                                    xs={4}
                                                                    md={2}
                                                                >

                                                                    <div
                                                                        className="
                                                                            small
                                                                            text-secondary
                                                                        "
                                                                    >
                                                                        야간
                                                                    </div>

                                                                    <div>
                                                                        {Number(
                                                                            attendance.nightHours
                                                                            ?? 0
                                                                        ).toFixed(1)}
                                                                        시간
                                                                    </div>

                                                                </Col>


                                                                <Col
                                                                    xs={4}
                                                                    md={2}
                                                                >

                                                                    <div
                                                                        className="
                                                                            small
                                                                            text-secondary
                                                                        "
                                                                    >
                                                                        연장
                                                                    </div>

                                                                    <div>
                                                                        {Number(
                                                                            attendance.overtimeHours
                                                                            ?? 0
                                                                        ).toFixed(1)}
                                                                        시간
                                                                    </div>

                                                                </Col>

                                                            </Row>


                                                            <hr />


                                                            <Row className="g-2">

                                                                <Col
                                                                    xs={12}
                                                                    sm={6}
                                                                >

                                                                    <Button
                                                                        variant="outline-warning"
                                                                        className="w-100"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                attendance,
                                                                                "normalToNormal"
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaSquarePen />

                                                                        <span className="ms-2">
                                                                            근무 세부사항 수정
                                                                        </span>
                                                                    </Button>

                                                                </Col>


                                                                <Col
                                                                    xs={12}
                                                                    sm={6}
                                                                >

                                                                    <Button
                                                                        variant="outline-danger"
                                                                        className="w-100"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                attendance,
                                                                                "normalToAbsent"
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaXmark />

                                                                        <span className="ms-2">
                                                                            비근무로 수정
                                                                        </span>
                                                                    </Button>

                                                                </Col>

                                                            </Row>

                                                        </>

                                                    ) : (

                                                        <>
                                                            <div
                                                                className="
                                                                    text-center
                                                                    py-4
                                                                "
                                                            >

                                                                <Badge
                                                                    bg={
                                                                        attendanceBadge(
                                                                            attendance.attendanceType
                                                                        )
                                                                    }
                                                                    className="
                                                                        fs-6
                                                                        px-3
                                                                        py-2
                                                                    "
                                                                >
                                                                    {
                                                                        attendance.attendanceType
                                                                    }
                                                                </Badge>


                                                                <div
                                                                    className="
                                                                        text-secondary
                                                                        mt-3
                                                                    "
                                                                >
                                                                    출퇴근 기록이 없는 비근무 근태입니다
                                                                </div>

                                                            </div>


                                                            <hr />


                                                            <Row className="g-2">

                                                                <Col
                                                                    xs={12}
                                                                    sm={6}
                                                                >

                                                                    <Button
                                                                        variant="outline-success"
                                                                        className="w-100"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                attendance,
                                                                                "absentToNormal"
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaSquarePen />

                                                                        <span className="ms-2">
                                                                            근무로 수정
                                                                        </span>
                                                                    </Button>

                                                                </Col>


                                                                <Col
                                                                    xs={12}
                                                                    sm={6}
                                                                >

                                                                    <Button
                                                                        variant="outline-warning"
                                                                        className="w-100"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                attendance,
                                                                                "absentToAbsent"
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaSquarePen />

                                                                        <span className="ms-2">
                                                                            비근무 세부사항 수정
                                                                        </span>
                                                                    </Button>

                                                                </Col>

                                                            </Row>

                                                        </>

                                                    )}

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                    );

                                }
                            )}

                        </Row>

                    )}

                </Col>

            </Row>



            {/* 근태 수정 Modal */}
            <Modal
                show={showEditModal}
                onHide={closeEditModal}
                centered
                backdrop="static"
            >

                <Modal.Header closeButton={!saving}>

                    <Modal.Title>
                        {editModalTitle()}
                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    {selectedAttendance !== null && (
                        <>

                            <div
                                className="
                                    mb-4
                                    text-secondary
                                "
                            >
                                {dayjs(
                                    selectedAttendance.workDate
                                ).format(
                                    "YYYY년 MM월 DD일"
                                )}

                                <span className="mx-2">
                                    /
                                </span>

                                현재 상태

                                <Badge
                                    bg={
                                        attendanceBadge(
                                            selectedAttendance.attendanceType
                                        )
                                    }
                                    className="ms-2"
                                >
                                    {
                                        selectedAttendance.attendanceType
                                    }
                                </Badge>

                            </div>



                            {/* 정상 -> 정상 */}
                            {editType === "normalToNormal" && (
                                <>

                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            근무일 유형
                                        </Form.Label>

                                        <Form.Select
                                            name="workDayType"
                                            value={
                                                editAttendance.workDayType
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        >

                                            {workDayTypeList.map(
                                                type => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                            )}

                                        </Form.Select>

                                    </Form.Group>


                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            출근시간
                                        </Form.Label>

                                        <Form.Control
                                            type="datetime-local"
                                            name="clockIn"
                                            value={
                                                editAttendance.clockIn
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        />

                                    </Form.Group>


                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            퇴근시간
                                        </Form.Label>

                                        <Form.Control
                                            type="datetime-local"
                                            name="clockOut"
                                            value={
                                                editAttendance.clockOut
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        />

                                    </Form.Group>


                                    <Form.Group>

                                        <Form.Label>
                                            휴게시간
                                        </Form.Label>

                                        <div
                                            className="
                                                d-flex
                                                align-items-center
                                            "
                                        >

                                            <Form.Control
                                                type="text"
                                                inputMode="decimal"
                                                name="breakMinutes"
                                                value={
                                                    editAttendance.breakMinutes
                                                }
                                                onChange={
                                                    changeEditValue
                                                }
                                            />

                                            <span
                                                className="
                                                    ms-2
                                                    text-nowrap
                                                "
                                            >
                                                분
                                            </span>

                                        </div>

                                    </Form.Group>

                                </>
                            )}



                            {/* 정상 -> 비근무 */}
                            {editType === "normalToAbsent" && (
                                <Form.Group>

                                    <Form.Label>
                                        변경할 비근무 유형
                                    </Form.Label>

                                    <Form.Select
                                        name="attendanceType"
                                        value={
                                            editAttendance.attendanceType
                                        }
                                        onChange={
                                            changeEditValue
                                        }
                                    >

                                        {absentTypeList.map(
                                            type => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </option>
                                            )
                                        )}

                                    </Form.Select>

                                </Form.Group>
                            )}



                            {/* 비근무 -> 정상 */}
                            {editType === "absentToNormal" && (
                                <>

                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            근무일 유형
                                        </Form.Label>

                                        <Form.Select
                                            name="workDayType"
                                            value={
                                                editAttendance.workDayType
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        >

                                            {workDayTypeList.map(
                                                type => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type}
                                                    </option>
                                                )
                                            )}

                                        </Form.Select>

                                    </Form.Group>


                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            출근시간
                                        </Form.Label>

                                        <Form.Control
                                            type="datetime-local"
                                            name="clockIn"
                                            value={
                                                editAttendance.clockIn
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        />

                                    </Form.Group>


                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            퇴근시간
                                        </Form.Label>

                                        <Form.Control
                                            type="datetime-local"
                                            name="clockOut"
                                            value={
                                                editAttendance.clockOut
                                            }
                                            onChange={
                                                changeEditValue
                                            }
                                        />

                                    </Form.Group>


                                    <Form.Group>

                                        <Form.Label>
                                            휴게시간
                                        </Form.Label>

                                        <div
                                            className="
                                                d-flex
                                                align-items-center
                                            "
                                        >

                                            <Form.Control
                                                type="text"
                                                inputMode="decimal"
                                                name="breakMinutes"
                                                value={
                                                    editAttendance.breakMinutes
                                                }
                                                onChange={
                                                    changeEditValue
                                                }
                                            />

                                            <span
                                                className="
                                                    ms-2
                                                    text-nowrap
                                                "
                                            >
                                                분
                                            </span>

                                        </div>

                                    </Form.Group>

                                </>
                            )}



                            {/* 비근무 -> 비근무 */}
                            {editType === "absentToAbsent" && (
                                <Form.Group>

                                    <Form.Label>
                                        변경할 비근무 유형
                                    </Form.Label>

                                    <Form.Select
                                        name="attendanceType"
                                        value={
                                            editAttendance.attendanceType
                                        }
                                        onChange={
                                            changeEditValue
                                        }
                                    >

                                        {absentTypeList.map(
                                            type => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </option>
                                            )
                                        )}

                                    </Form.Select>

                                </Form.Group>
                            )}

                        </>
                    )}

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={
                            closeEditModal
                        }
                        disabled={
                            saving
                        }
                    >
                        취소
                    </Button>


                    <Button
                        variant="success"
                        onClick={
                            saveAttendance
                        }
                        disabled={
                            saving
                        }
                    >

                        {saving ? (
                            <Spinner
                                animation="border"
                                size="sm"
                            />
                        ) : (
                            <>
                                <FaSquarePen />

                                <span className="ms-2">
                                    수정하기
                                </span>
                            </>
                        )}

                    </Button>

                </Modal.Footer>

            </Modal>

        </>
    );
}