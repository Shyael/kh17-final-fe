import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Badge, Button, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";

export default function AssignmentList() {
    const navigate = useNavigate();
    
    const [assignmentList, setAssignmentList] = useState([]);

    // 내가 등록한 과제 목록 조회
    const loadAssignmentList = useCallback(async () => {

        try {
            const response = await apiClient.get("/assignment/manage");

            setAssignmentList(response.data);
        }
        catch (err) {
            console.error(err);
        }

    }, []);

    useEffect(() => {
        loadAssignmentList();
    }, [loadAssignmentList]);


    // 상태 배지
    const statusBadge = (status) => {

        switch (status) {
            case "게시":
                return <Badge bg="success">게시</Badge>;

            case "마감":
                return <Badge bg="secondary">마감</Badge>;

            default:
                return <Badge bg="secondary">{status}</Badge>;
        }

    };

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h3 className="mb-0">
                    과제 관리
                </h3>

                <Button
                    variant="primary"
                    className="flex-shrink-0"
                    onClick={() => navigate("/employee/assignment/add")}
                >
                    <FaPlus className="me-1" />
                    과제 등록
                </Button>
            </div>


            <Table
                bordered
                hover
                responsive
                className="align-middle text-center"
                style={{ minWidth: 720 }}
            >
                <thead>
                    <tr className="text-nowrap">
                        <th>번호</th>
                        <th>강의명</th>
                        <th>과제명</th>
                        <th>상태</th>
                        <th>마감일</th>
                        <th>등록일</th>
                        <th>관리</th>
                    </tr>
                </thead>

                <tbody>

                    {assignmentList.length === 0 && (
                        <tr>
                            <td colSpan={7}>
                                등록된 과제가 없습니다.
                            </td>
                        </tr>
                    )}

                    {assignmentList.map((assignment) => (
                        <tr key={assignment.assignmentNo}>

                            <td>
                                {assignment.assignmentNo}
                            </td>

                            <td>
                                {assignment.courseTitle}
                            </td>

                            <td className="text-start">
                                {assignment.assignmentTitle}
                            </td>

                            <td>
                                {statusBadge(assignment.assignmentStatus)}
                            </td>

                            <td className="text-nowrap">
                                {assignment.assignmentDueDate
                                    ? new Date(
                                        assignment.assignmentDueDate
                                    ).toLocaleString()
                                    : "-"
                                }
                            </td>

                            <td className="text-nowrap">
                                {assignment.assignmentWtime
                                    ? new Date(
                                        assignment.assignmentWtime
                                    ).toLocaleDateString()
                                    : "-"
                                }
                            </td>

                            <td className="text-nowrap">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                        navigate(
                                            `/employee/assignment/${assignment.assignmentNo}`
                                        )
                                    }>
                                    상세
                                </Button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}