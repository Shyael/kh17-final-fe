import { useCallback, useState } from "react";
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { apiClient } from "@utils/reaxios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Jumbotron from "@templates/Jumbotron";

//초기화
const initCustomer = {
    customerNo: "",
    studentNo: "",
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    studentAddress: "",
    studentSchool: "",
    studentGrade: "",
    studentGender: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    customerRelation: "",
    customerMemo: "",
};

export default function ConsultManage() {

    // 모달 표시 여부 상태
    const [showModal, setShowModal] = useState(false);
    // 검색 결과 데이터 상태
    const [searchResults, setSearchResults] = useState([]);

    const [customer, setCustomer] = useState({
        customerNo: "",
        studentNo: "",
        studentName: "",
        studentPhone: "",
        studentEmail: "",
        studentAddress: "",
        studentSchool: "",
        studentGrade: "",
        studentGender: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        customerRelation: "",
        customerMemo: "",
    });

    const resetCustomer = useCallback(()=>{
        setCustomer({
            customerNo: "",
            studentNo: "",
            studentName: "",
            studentPhone: "",
            studentEmail: "",
            studentAddress: "",
            studentSchool: "",
            studentGrade: "",
            studentGender: "",
            parentName: "",
            parentPhone: "",
            parentEmail: "",
            customerRelation: "",
            customerMemo: "",
        });
    }, [customer]);

    const [search, setSearch] = useState("");

    const changeStringValue = useCallback((e)=>{
        const { name, value } = e.target;
        setSearch(value);
    }, []);

    const changeCustomerValue = useCallback((e)=>{
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            [name]: value
        }));
    }, [customer]);

    // 검색 버튼 클릭 이벤트
    const searchCustomer = useCallback(async ()=>{
        if(search.trim().length == 0) {
            Swal.fire("이름이나 연락처를 입력하세요");
            return false;
        }

        const { data } = await apiClient.post("/employee/consult/customer", {
            search: search
        });
        const items = data.items || [];
        setSearchResults(items);

        // 테스트용 가상 검색 결과 2건
        // const mockData = [
        // { id: 1, name: '김학생', phone: '010-1234-5678', email: 'kh1@kh.com' },
        // { id: 2, name: '김학생', phone: '010-8765-4321', email: 'kh_alt@kh.com' }d
        // ];

        console.log(items);
        if (items.length == 1) {
            toast.success('조회 완료');
            console.log(items[0]);
            // setCustomer({
            //     ...initCustomer,
            //     ...items[0]
            // })
            selectCustomer(items[0]);
        } else if(items.length >= 2) {
            setShowModal(true); // 결과가 2개 이상이면 모달 오픈
        } else {
            toast.error('검색 결과가 없습니다.');
        }
    }, [search]);

    //고객 선택 이벤트
    const selectCustomer = useCallback((item)=>{
        setCustomer({
            ...initCustomer,
            ...item
        });
        setShowModal(false);
        console.log(item);
    }, []);

    //고객 정보 저장 이벤트
    const saveCustomer = useCallback(async ()=>{
        if((customer.studentName || "").trim().length === 0 && (customer.studentPhone || "").trim().length === 0) {
            Swal.fire("이름과 연락처는 필수입력입니다");
        }

        if(customer.customerNo !== "") {
            const result = await Swal.fire({
                title:`${customer.studentName} 고객의 정보를 수정하시겠습니까?`,
                icon:"warning",
                showCancelButton:true,
                confirmButtonText:"확인",
                cancelButtonText:"취소",
                confirmButtonColor:"#3085d6",
                cancelButtonColor:"#b2bec3"
            });
            if(result.isConfirmed === false) return;
        }
        const { data } = await apiClient.put("/employee/consult/customer", customer);
        if(data.result) {
            toast.success("저장 완료");
            // setCustomer({
            //     ...initCustomer,
            //     ...data.item
            // });
            selectCustomer(data.item);
        } else {
            Swal.fire("저장에 실패했습니다.\n연락처 중복을 확인해주세요");
        }
    }, [customer])

    return (<>
    <Jumbotron title="상담 관리" content="고객정보로 상담 내역을 관리" />

    <Container fluid className="p-4">
      <Row className="border-bottom pb-4 mb-4">
        
        {/* ================= 좌측: 고객 정보 영역 (버튼 + 폼) ================= */}
        <Col xs={12} xxl={7} className="border-lg-end ps-lg-4 mb-5 mb-xxl-0">
          
            {/* 1. 좌측 상단 버튼 영역 (구조 변경됨: div.d-flex -> Row.g-2) */}
            {/* <Row className="align-items-center flex-wrap g-2 border-bottom pb-3 mb-4"> */}
            <Row className="align-items-center flex-wrap g-2 border-bottom pb-3 mb-4 justify-content-end justify-content-xxl-start">
                <Col xs="auto">
                    {/* 라벨은 내용물 너비에 맞춤 */}
                    <Form.Label className="fw-bold text-nowrap mb-0">검색</Form.Label>
                </Col>
                {/* 💡 핵심 변경 부분: 입력창 너비를 그리드 비율(4/12)로 고정하여 줄임 */}
                <Col xs={4} lg={3}>
                    <Form.Control 
                        type="text" 
                        placeholder="이름, 연락처" 
                        value={search}
                        onChange={changeStringValue}
                    />
                </Col>
                <Col xs="auto">
                {/* 버튼 그룹은 내용물 너비에 맞춤, 버튼 간격 유지 */}
                <div className="d-flex gap-2"> 
                    <Button variant="light" className="border text-nowrap"
                            onClick={searchCustomer}>
                    🔍<span className="d-none d-lg-inline ms-1">검색</span>
                    </Button>
                    <Button variant="light" className="border text-nowrap text-danger fw-bold"
                            onClick={resetCustomer}>
                    ❌<span className="d-none d-lg-inline ms-1">리셋</span>
                    </Button>
                    <Button variant="light" className="border text-nowrap fw-bold"
                            onClick={saveCustomer}>
                    ✔️<span className="d-none d-lg-inline ms-1">고객정보저장</span>
                    </Button>
                </div>
                </Col>
          </Row>

          {/* 2. 좌측 폼 영역 (이전 대화 최종 코드와 동일) */}
          <div>
            <h6 className="fw-bold mb-3">
                { customer.customerNo !== "" ? (<>
                고객번호 : {customer.customerNo}
                </>) : (<>
                신규 등록
                </>)}
            </h6>
            
            <Row className="mb-2 align-items-center g-2">
                <Form.Label column xs={2} className="text-center text-nowrap">이름</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="studentName"
                        value={customer.studentName || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">연락처</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="studentPhone"
                        value={customer.studentPhone || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">이메일</Form.Label>
                <Col xs={2}>
                    <Form.Control type="email" name="studentEmail"
                        value={customer.studentEmail || ""}
                        onChange={changeCustomerValue} />
                </Col>
            </Row>

            <Row className="mb-2 align-items-center g-2">
                <Form.Label column xs={2} className="text-center text-nowrap">이름2</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="parentName"
                        value={customer.parentName || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">연락처2</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="parentPhone"
                        value={customer.parentPhone || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">이메일2</Form.Label>
                <Col xs={2}>
                    <Form.Control type="email" name="parentEmail"
                        value={customer.parentEmail || ""}
                        onChange={changeCustomerValue} />
                </Col>
            </Row>

            <Row className="mb-2 align-items-center g-2">
                <Form.Label column xs={2} className="text-center text-nowrap">주소</Form.Label>
                <Col xs={10}>
                    <Form.Control type="text" name="studentAddress"
                        value={customer.studentAddress || ""}
                        onChange={changeCustomerValue} />
                </Col>
            </Row>

            <Row className="mb-2 align-items-center g-2">
                <Form.Label column xs={2} className="text-center text-nowrap">학교</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="studentSchool"
                        value={customer.studentSchool || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">학년</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="studentGrade"
                        value={customer.studentGrade || ""}
                        onChange={changeCustomerValue} />
                </Col>
                <Form.Label column xs={2} className="text-center text-nowrap">성별</Form.Label>
                <Col xs={2}>
                    <Form.Control type="text" name="studentGender"
                        value={customer.studentGender || ""}
                        onChange={changeCustomerValue} />
                </Col>
            </Row>

            <Row className="mb-2 g-2">
                <Form.Label column xs={2} className="text-center text-nowrap pt-2">정보</Form.Label>
                <Col xs={10}>
                    <Form.Control as="textarea" rows={2} name="customerMemo"
                        value={customer.customerMemo || ""}
                        onChange={changeCustomerValue} />
                </Col>
            </Row>
          </div>
        </Col>

        {/* ================= 우측: 상담 정보 영역 (버튼 + 폼) ================= */}
        <Col xs={12} xxl={5} className="ps-lg-4">
          
          {/* 1. 우측 상단 버튼 영역 (이전 대화 최종 코드와 동일) */}
          <div className="d-flex justify-content-end flex-wrap gap-2 border-bottom pb-3 mb-4">
            <Button variant="light" className="border text-nowrap text-danger fw-bold">
              ❌<span className="d-none d-lg-inline ms-1">리셋</span>
            </Button>
            <Button variant="light" className="border text-nowrap fw-bold">
              ✔️<span className="d-none d-lg-inline ms-1">상담정보저장</span>
            </Button>
          </div>

          {/* 2. 우측 폼 영역 (이전 대화 최종 코드와 동일) */}
          <div>
            <h6 className="fw-bold mb-3">
                신규 등록
            </h6>

            <Row className="mb-2 align-items-center g-2">
              <Form.Label column xs={3} className="text-center text-nowrap">상담제목</Form.Label>
              <Col xs={9}>
                <Form.Control type="text" />
              </Col>
            </Row>
            
            <Row className="h-100 g-2">
              <Form.Label column xs={3} className="text-center text-nowrap pt-2">상담내용</Form.Label>
              <Col xs={9}>
                <Form.Control as="textarea" className="h-100" rows={8} />
              </Col>
            </Row>
          </div>
        </Col>

      </Row>

      {/* ================= 하단: 상담내역 테이블 ================= */}
      <div>
        <h6 className="fw-bold mb-2">상담내역</h6>
        <Table bordered responsive className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '50px', width: '10%' }}>No</th>
              <th style={{ minWidth: '120px', width: '20%' }}>상담시각</th>
              <th style={{ minWidth: '100px', width: '20%' }}>상담자</th>
              <th style={{ minWidth: '200px', width: '50%' }}>상담 제목</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="py-3 text-muted">
                검색된 상담내역이 없습니다
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* ================= 검색 목록 모달 팝업 ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">[{search}] 검색 결과 목록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table hover responsive className="text-center align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>이름</th>
                <th>연락처</th>
                <th>이름2</th>
                <th>연락처2</th>
                <th>선택</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.studentName}</td>
                  <td>{result.studentPhone}</td>
                  <td>{result.parentName}</td>
                  <td>{result.parentPhone}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                    //   onClick={() => {
                    //     //alert(`${result.name} 고객 정보가 선택되었습니다.`);
                    //     setCustomer({
                    //         ...initCustomer,
                    //         ...result
                    //     });
                    //     setShowModal(false); // 선택 시 모달 닫기
                    //   }}
                        onClick={() => selectCustomer(result)}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

    </Container>
    </>)
}