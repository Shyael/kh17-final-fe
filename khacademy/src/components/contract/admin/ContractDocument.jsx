import { useMemo } from "react";
import { formatDate } from "@utils/format";

import "@templates/ContractDocument.css";


export default function ContractDocument({ contract,
    employee,
    employer }) {

    // =========================================================
    // 임금형태 한글
    // =========================================================

    const wageTypeText = useMemo(() => {

        if (!contract) return "";

        if (contract.wageType === "monthly") return "월급";
        if (contract.wageType === "hourly") return "시급";
        if (contract.wageType === "daily") return "일급";

        return contract.wageType ?? "";

    }, [contract]);


    // =========================================================
    // 주휴일 한글
    // =========================================================

    const weeklyHolidayDayText = useMemo(() => {

        if (!contract) return "";

        if (contract.weeklyHolidayDay === "MONDAY") return "월요일";
        if (contract.weeklyHolidayDay === "TUESDAY") return "화요일";
        if (contract.weeklyHolidayDay === "WEDNESDAY") return "수요일";
        if (contract.weeklyHolidayDay === "THURSDAY") return "목요일";
        if (contract.weeklyHolidayDay === "FRIDAY") return "금요일";
        if (contract.weeklyHolidayDay === "SATURDAY") return "토요일";
        if (contract.weeklyHolidayDay === "SUNDAY") return "일요일";

        return contract.weeklyHolidayDay ?? "";

    }, [contract]);


    // =========================================================
    // 계약 시작일
    // =========================================================

    const startDate = useMemo(() => {

        if (
            contract?.contractStart === null
            ||
            contract?.contractStart === undefined
            ||
            contract?.contractStart === ""
        ) {
            return "";
        }

        return formatDate(
            contract.contractStart
        );

    }, [contract]);


    // =========================================================
    // 계약 종료일
    // =========================================================

    const endDate = useMemo(() => {

        if (
            contract?.contractEnd === null
            ||
            contract?.contractEnd === undefined
            ||
            contract?.contractEnd === ""
        ) {
            return "기간의 정함 없음";
        }

        return formatDate(
            contract.contractEnd
        );

    }, [contract]);


    // =========================================================
    // 기본임금
    // =========================================================

    const baseWage = useMemo(() => {

        if (
            contract?.baseWage === null
            ||
            contract?.baseWage === undefined
            ||
            contract?.baseWage === ""
        ) {
            return "";
        }


        const value =
            parseInt(
                contract.baseWage,
                10
            );


        if (
            Number.isNaN(value)
        ) {
            return contract.baseWage;
        }


        return `${value.toLocaleString()}원`;

    }, [contract]);


    // =========================================================
    // 계약 없으면 출력 안 함
    // =========================================================

    if (!contract) {
        return null;
    }


    return (
        <div className="contract-document-wrapper">

            <div className="contract-paper">


                {/* =====================================================
                    제목
                ===================================================== */}

                <div className="contract-title-box">

                    <h2>
                        표준근로계약서
                    </h2>

                </div>


                <p className="contract-intro">

                    사용자와 근로자는 다음과 같이 근로계약을 체결한다.

                </p>


                {/* =====================================================
                    기본 정보
                ===================================================== */}

                {
                    (
                        contract.contractNo !== undefined
                        ||
                        contract.employeeNo !== undefined
                    )
                    && (

                        <div className="contract-summary">

                            <div>

                                <span className="contract-label">
                                    계약번호
                                </span>

                                <span>
                                    {
                                        contract.contractNo
                                        ?? "신규 작성"
                                    }
                                </span>

                            </div>


                            <div>

                                <span className="contract-label">
                                    직원번호
                                </span>

                                <span>
                                    {
                                        contract.employeeNo
                                        ?? "-"
                                    }
                                </span>

                            </div>

                        </div>

                    )
                }


                {/* =====================================================
                    제1조 계약기간
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제1조 [근로계약기간]
                    </h5>


                    <div className="contract-line">

                        근로계약기간은

                        <span className="contract-value">
                            {
                                startDate
                                || " "
                            }
                        </span>

                        부터

                        <span className="contract-value">
                            {
                                endDate
                            }
                        </span>

                        까지로 한다.

                    </div>

                </section>


                {/* =====================================================
                    제2조 임금
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제2조 [임금]
                    </h5>


                    <div className="contract-line">

                        임금 형태는

                        <span className="contract-value short">

                            {
                                wageTypeText
                                || " "
                            }

                        </span>

                        으로 한다.

                    </div>


                    <div className="contract-line">

                        기본임금은

                        <span className="contract-value">

                            {
                                baseWage
                                || " "
                            }

                        </span>

                        으로 한다.

                    </div>


                    <div className="contract-line">

                        임금은 매월

                        <span className="contract-value tiny">

                            {
                                contract.payday
                                || " "
                            }

                        </span>

                        일에 지급한다.

                    </div>

                </section>


                {/* =====================================================
                    제3조 소정근로시간
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제3조 [소정근로시간]
                    </h5>


                    <div className="contract-line">

                        1일 소정근로시간은

                        <span className="contract-value short">

                            {
                                contract.dailyWorkHours
                                || " "
                            }

                        </span>

                        시간으로 한다.

                    </div>


                    <div className="contract-line">

                        1주 소정근로시간은

                        <span className="contract-value short">

                            {
                                contract.weeklyWorkHours
                                || " "
                            }

                        </span>

                        시간으로 한다.

                    </div>

                </section>


                {/* =====================================================
                    제4조 주휴일
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제4조 [주휴일]
                    </h5>


                    <div className="contract-line">

                        1주 유급 주휴일은

                        <span className="contract-value short">

                            {
                                weeklyHolidayDayText
                                || " "
                            }

                        </span>

                        로 한다.

                    </div>

                </section>


                {/* =====================================================
                    제5조 휴게시간
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제5조 [휴게시간]
                    </h5>


                    <div className="contract-line">

                        근로시간 중 휴게시간은

                        <span className="contract-value short">

                            {
                                contract.writtenBreakMinutes
                                || " "
                            }

                        </span>

                        분으로 한다.

                    </div>

                </section>


                {/* =====================================================
                    제6조 기타 근로조건
                ===================================================== */}

                <section className="contract-section">

                    <h5>
                        제6조 [내용]
                    </h5>


                    <div className="contract-content-box">

                        {
                            contract.contractContent
                            ||
                            "근로 조건 내용"
                        }

                    </div>

                </section>


                {/* =====================================================
                    확인 문구
                ===================================================== */}

                <div className="contract-agreement">

                    본 계약의 내용을 확인하고 이에 동의하여
                    근로계약을 체결한다.

                </div>


                {/* =====================================================
                    계약일
                ===================================================== */}

                <div className="contract-date">

                    <span>
                        ________년
                    </span>

                    <span>
                        ______월
                    </span>

                    <span>
                        ______일
                    </span>

                </div>



                {/* =====================================================
    사용자 / 근로자
===================================================== */}

                <div className="contract-signatures">


                    {/* =================================================
        사용자
    ================================================= */}

                    <div className="signature-party">

                        <h5>
                            사용자
                        </h5>


                        <div className="signature-row">

                            <span>
                                사업체명
                            </span>

                            <strong>
                                KH EDU
                            </strong>

                        </div>


                        <div className="signature-row">

                            <span>
                                대표자
                            </span>

                            <strong>
                                {
                                    employer?.accountName
                                    ?? "____________________"
                                }
                            </strong>

                        </div>


                        <div className="signature-row">

                            <span>
                                연락처
                            </span>

                            <strong>
                                {
                                    employer?.accountPhone
                                    ?? "____________________"
                                }
                            </strong>

                        </div>


                        <div className="signature-row signature-space">

                            <span>
                                서명
                            </span>

                            <strong>

                                {
                                    contract.employerSignature
                                        ? "서명 완료"
                                        : "(서명)"
                                }

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
        근로자
    ================================================= */}

                    <div className="signature-party">

                        <h5>
                            근로자
                        </h5>


                        <div className="signature-row">

                            <span>
                                성명
                            </span>

                            <strong>
                                {
                                    employee?.accountName
                                    ?? "____________________"
                                }
                            </strong>

                        </div>


                        <div className="signature-row">

                            <span>
                                연락처
                            </span>

                            <strong>
                                {
                                    employee?.accountPhone
                                    ?? "____________________"
                                }
                            </strong>

                        </div>


                        <div className="signature-row">

                            <span>
                                직원번호
                            </span>

                            <strong>

                                {
                                    contract.employeeNo
                                    ?? "____________________"
                                }

                            </strong>

                        </div>


                        <div className="signature-row signature-space">

                            <span>
                                서명
                            </span>

                            <strong>

                                {
                                    contract.employeeSignature
                                        ? "서명 완료"
                                        : "(서명)"
                                }

                            </strong>

                        </div>

                    </div>


                </div>



            </div>

        </div>
    );
}