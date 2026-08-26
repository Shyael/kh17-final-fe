import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import AccountLogin from "@components/account/AccountLogin";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";

export default function Body() {

    return (
        <Routes>
            {/* 계정 */}
            <Route path="/account/login" element={<AccountLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}