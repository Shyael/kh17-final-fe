import React from "react";

export default function Header() {
    return (
        <div className="d-flex align-items-center py-3 bg-white shadow-sm" style={{ borderBottom: "1px solid #EAEAEA" }}>
            <div className="w-25 text-start"></div>
            <div className="w-50 text-center">
                <h2 className="fw-bolder mb-0" style={{ letterSpacing: "-1px" }}>
                    <span style={{ color: "#FF6B00" }}>KH</span>
                    <span style={{ color: "#202124" }}>정보교육원</span>
                </h2>
            </div>
            <div className="w-25 text-end"></div>
        </div>
    );
}