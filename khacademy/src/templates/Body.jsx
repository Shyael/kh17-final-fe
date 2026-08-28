import { Route, Routes } from "react-router-dom";
import Home from "@components/Home";

import EmployeeLogin from "@components/employee/EmployeeLogin";

import ConsultReservation from "@components/consult/ConsultReservation";

import NotFound from "@error/NotFound";

import Employee from "@guard/Employee";

import ContractAdd from "@components/contract/ContractAdd";
import ContractEditBeforeSigned from "@components/contract/ContractEditBeforeSigned";
import ContractSign from "@components/contract/ContractSign";
import ContractDetail from "@components/contract/ContractDetail";
import ContractHistory from "../components/contract/ContractHistory";

export default function Body() {

    return (
        <Routes>
            {/* 직원 로그인 */}
            <Route path="/employee/login" element={<EmployeeLogin/>} />

            {/* 직원 페이지 */}
            <Route path="/" element={<Employee><Home/></Employee>} />
            
            {/* 상담 */}
            <Route path="/consult/reservation" element={<Employee><ConsultReservation/></Employee>} />

            {/* fallback route */}
            <Route path="*" element={<NotFound/>}/>

            {/* 계약관련 */}
            <Route path="/contract/add/:employeeNo" element={<ContractAdd/>}/>
            <Route path="/contract/before/:contractNo" element={<ContractEditBeforeSigned/>}/>
            <Route path="/contract/sign:contractNo" element={<ContractSign/>}/>
            <Route path="/contract/detail:contractNo" element={<ContractDetail/>}/>
            <Route path="/contract/history/:employeeNo" element={<ContractHistory/>}/>
            <Route path="/contract/extend/:contractNo" element={<ContractExtend/>}/>
            <Route path="/contract/changeCondition/:contractNo" element={<ContractChangeCondition/>}/>
        </Routes>   
    )
}