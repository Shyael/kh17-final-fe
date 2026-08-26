import Jumbotron from "@templates/Jumbotron";
import { useCallback, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useKakaoPostcodePopup } from "react-daum-postcode";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

export default function AcademyManage() {

    // Kakao Post
    const open = useKakaoPostcodePopup(
        "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    );

    const [academy, setAcademy] = useState({
        academy: {
            academyName: "",
            academyTagline: "",
            academyIntro: "",
            academyPhone: "",
            academyAddress: ""
        }
    });

    // 문자열 입력값 변경
    const changeStringValue = useCallback((e) => {
        const { name, value } = e.target;

        setAcademy(prev => ({
            ...prev,
            academy: {
                ...prev.academy,
                [name]: value
            }
        }));
    }, []);

    // 우편번호 검색
    const addressSearch = useCallback(() => {

        open({
            onComplete: (data) => {

                // R = 도로명 주소
                // J = 지번 주소
                const address =
                    data.userSelectedType === "R"
                        ? data.roadAddress
                        : data.jibunAddress;

                setAcademy(prev => ({
                    ...prev,
                    academy: {
                        ...prev.academy,
                        academyAddress: address
                    }
                }));
            }
        });

    }, [open]);

    // 주소 삭제
    const addressRemove = useCallback(() => {

        setAcademy(prev => ({
            ...prev,
            academy: {
                ...prev.academy,
                academyAddress: ""
            }
        }));

    }, []);

    // 주소 입력 여부
    const isAddressWritten = academy.academy.academyAddress.length > 0;

    return (
        <>
            <Jumbotron
                title="학원정보 관리"
                content="외부 고객들이 볼 학원정보를 등록/수정/삭제 할 수 있습니다"
            />

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>학원명</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyName"
                        value={academy.academy.academyName}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>캐치프레이즈</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyTagline"
                        value={academy.academy.academyTagline}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>대표번호</span>
                </Form.Label>

                <Col sm={9}>
                    <Form.Control
                        type="text"
                        name="academyPhone"
                        value={academy.academy.academyPhone}
                        onChange={changeStringValue}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>주소</span>
                </Form.Label>

                <Col sm={9}>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Control
                            type="text"
                            name="academyAddress"
                            value={academy.academy.academyAddress}
                            onClick={addressSearch}
                            readOnly
                            style={{
                                minWidth: 0,
                                flex: 1,
                            }}
                        />

                        <Button
                            variant="success"
                            className="text-nowrap flex-shrink-0"
                            onClick={addressSearch}
                        >
                            <FaMagnifyingGlass className="me-1" />
                            <span className="d-none d-lg-inline-block">주소 검색</span>
                        </Button>

                        <Button
                            variant="danger"
                            className="text-nowrap flex-shrink-0"
                            onClick={addressRemove}
                            style={{
                                display: isAddressWritten ? "block" : "none",
                            }}
                        >
                            <FaXmark className="me-1" />
                            <span className="d-none d-lg-inline-block">주소 지우기</span>
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="mt-4">
                <Form.Label column sm={3}>
                    <span>학원소개</span>
                </Form.Label>
            </Row>
            <Col sm={9}>
                <Form.Control as="textarea" rows={5} name="academyIntro"
                    value={account.academyIntro} onChange={changeStringValue}
                    onBlur={checkAccountMessage}
                    className={result.accountMessage}/>
            </Col>
        </>
    );
}