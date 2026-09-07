import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { apiClient } from "@utils/reaxios";

const AttendanceButton = () => {

    const [working, setWorking] = useState(false);
    const [loading, setLoading] = useState(false);


    // 현재 근무 중인지 조회
    const loadWorking = async () => {

        try {
            const response =
                await apiClient.get(
                    "/attendance/working"
                );

            setWorking(response.data);
        }
        catch (err) {
            console.error(err);
        }
    };


    // 출근
    const clockIn = async () => {

        try {
            setLoading(true);

            await apiClient.post(
                "/attendance/clockIn"
            );

            setWorking(true);

            toast.success(
                "출근 처리되었습니다."
            );
        }
        catch (err) {
            console.error(err);

            if (err.response?.status === 403) {
                toast.error(
                    "출근할 수 없는 상태입니다."
                );
                return;
            }

            toast.error(
                "출근 처리에 실패했습니다."
            );
        }
        finally {
            setLoading(false);
        }
    };


    // 퇴근
    const clockOut = async () => {

        try {
            setLoading(true);

            await apiClient.patch(
                "/attendance/clockOut"
            );

            setWorking(false);

            toast.success(
                "퇴근 처리되었습니다."
            );
        }
        catch (err) {
            console.error(err);

            if (err.response?.status === 403) {
                toast.error(
                    "퇴근할 수 없는 상태입니다."
                );
                return;
            }

            toast.error(
                "퇴근 처리에 실패했습니다."
            );
        }
        finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadWorking();
    }, []);


    return (
        <div className="d-flex align-items-center gap-2">

            <span>
                현재 상태 :{" "}
                <strong>
                    {working
                        ? "근무 중"
                        : "퇴근"}
                </strong>
            </span>

            {working ? (
                <Button
                    variant="danger"
                    onClick={clockOut}
                    disabled={loading}
                >
                    {loading ? (
                        <Spinner
                            size="sm"
                        />
                    ) : (
                        "퇴근"
                    )}
                </Button>
            ) : (
                <Button
                    variant="primary"
                    onClick={clockIn}
                    disabled={loading}
                >
                    {loading ? (
                        <Spinner
                            size="sm"
                        />
                    ) : (
                        "출근"
                    )}
                </Button>
            )}

        </div>
    );
};

export default AttendanceButton;