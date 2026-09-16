import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaArrowRight, FaLocationDot, FaPhone, FaUsers } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { apiClient } from "@utils/reaxios";
import { Carousel } from "react-bootstrap";
import TutorCard from "./TutorCard";
import useScrollReveal from "@utils/scrollReveal";

import {
    Map,
    MapMarker,
    CustomOverlayMap,
    useKakaoLoader
} from "react-kakao-maps-sdk";

//오버레이가 마커 위쪽으로 열리므로 지도를 아래로 내려 상단이 잘리지 않게 하는 픽셀 값
const MAP_OFFSET_Y = -100;

export default function AcademyInfo() {


    //state
    //학원 정보
    const [academy, setAcademy] = useState({
        academy: {
            academyName: "",
            academyTagline: "",
            academyIntro: "",
            academyPhone: "",
            academyAddress: ""
        },
        historyList: [],
        subjectList: [],
        imageList: []
    });

    const [tutorList, setTutorList] = useState([]);

    // 섹션별 스크롤 리빌 (스크롤해서 보일 때 서서히 나타나는 연출)
    const [historyRevealRef, historyVisible] = useScrollReveal();
    const [locationRevealRef, locationVisible] = useScrollReveal();
    const [tutorRevealRef, tutorVisible] = useScrollReveal();
    const [consultRevealRef, consultVisible] = useScrollReveal();

    //지도 좌표
    const [position, setPosition] = useState(null);

    //카카오맵 인스턴스
    const mapRef = useRef(null);
    //지도 생성 완료 여부 (페이지 재진입 시에도 오프셋을 다시 적용하기 위함)
    const [mapReady, setMapReady] = useState(false);

    //커스텀 오버레이
    const [overlayOpen, setOverlayOpen] = useState(true);
    //데이터 조회
    //학원정보
    const loadAcademy = useCallback(async () => {
        const response = await apiClient.get("/academy/");
        setAcademy(response.data);
    }, []);

    //강사정보 (미리보기용 3명만 조회)
    const loadTutor = useCallback(async () => {
        const response = await apiClient.get("/academy/tutor/", {
            params: { page: 1, size: 3 },
        });
        setTutorList(response.data?.list ?? []);
    }, []);

    useEffect(() => {
        loadAcademy();
        loadTutor();
    }, [loadAcademy, loadTutor]);

    // 화면에 표시할 학원 기본정보
    const info = academy.academy;

    // 강사 소개 미리보기(최대 3명)
    const previewTutorList = tutorList.slice(0, 3);

    //카카오맵 SDK
    const [mapLoading, mapError] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
        libraries: ["services"],
    });

    useEffect(() => {

        if (mapLoading) return;
        if (!info.academyAddress) return;
        if (!window.kakao) return;

        // SDK 내부 모듈 로드 완료 후 실행
        window.kakao.maps.load(() => {
            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.addressSearch(
                info.academyAddress,
                (result, status) => {

                    if (status === window.kakao.maps.services.Status.OK) {

                        setPosition({
                            lat: Number(result[0].y),
                            lng: Number(result[0].x),
                        });

                    }
                    else {
                        console.error("주소 검색 실패");
                    }

                }
            );
        });

    }, [mapLoading, mapError, info.academyAddress]);

    //지도 생성 완료 or 좌표 변경 시: 마커 중심으로 맞춘 뒤 지도를 살짝 내려 오버레이 상단이 잘리지 않게 함
    //(다른 페이지 갔다가 재진입하면 지도가 컨테이너 크기를 모른 채 생성되므로 relayout 후 적용)
    useEffect(() => {

        if (!mapReady) return;

        const map = mapRef.current;

        if (!map) return;
        if (!position) return;
        if (!window.kakao) return;

        const id = requestAnimationFrame(() => {
            map.relayout();
            map.setCenter(new window.kakao.maps.LatLng(position.lat, position.lng));
            map.panBy(0, MAP_OFFSET_Y);
        });

        return () => cancelAnimationFrame(id);

    }, [mapReady, position]);

    return (
        <div className="kh-external-content">
            {/* 메인 배너 이미지 (Lorem Picsum 자리잡기) */}
            <Row>
                <Col>
                    {academy.imageList?.length > 0 ? (
                        <Carousel>
                            {academy.imageList.map((image) => (
                                <Carousel.Item key={image.attachNo}>
                                    <img
                                        src={`${import.meta.env.VITE_SERVER_URL}/api/attach/${image.attachNo}`}
                                        alt={image.attachName}
                                        className="d-block w-100 rounded-top"
                                        style={{
                                            height: "400px",
                                            objectFit: "cover"
                                        }}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <div
                            className="d-flex justify-content-center align-items-center bg-light rounded-top"
                            style={{ height: "400px" }}
                        >
                            <span className="text-muted">
                                등록된 이미지가 없습니다.
                            </span>
                        </div>
                    )}
                </Col>
            </Row>

            {/* 캐치프레이즈 + 과목 뱃지 + 소개글 : 캐러셀과 한 덩어리로 보이는 히어로 배너 */}
            <Row className="g-0">
                <Col>
                    <div
                        className="text-center px-4 py-5 shadow-sm"
                        style={{
                            background: "var(--kh-surface)",
                            borderBottomLeftRadius: "var(--bs-card-border-radius)",
                            borderBottomRightRadius: "var(--bs-card-border-radius)",
                        }}
                    >
                        <h2
                            className="fw-bolder mb-3"
                            style={{ letterSpacing: "-0.02em", color: "var(--kh-text)" }}
                        >
                            {info.academyTagline}
                        </h2>

                        <div className="mb-3 d-flex justify-content-center flex-wrap gap-2">
                            {academy.subjectList.map((subject, index) => (
                                <Badge
                                    key={subject.academySubjectNo ?? index}
                                    pill
                                    className="px-3 py-2 fw-semibold"
                                    style={{
                                        background: "var(--kh-primary-light)",
                                        color: "var(--kh-primary-dark)",
                                    }}
                                >
                                    {subject.academySubjectName}
                                </Badge>
                            ))}
                        </div>

                        <p
                            className="text-muted mb-0 mx-auto"
                            style={{ whiteSpace: "pre-line", maxWidth: 640 }}
                        >
                            {info.academyIntro}
                        </p>
                    </div>
                </Col>
            </Row>

            <div className="mt-5" />

            {/* 학원 연혁 */}
            <div
                ref={historyRevealRef}
                className={"kh-reveal bg-white shadow-sm p-4 p-md-5" + (historyVisible ? " visible" : "")}
                style={{ borderRadius: "var(--bs-card-border-radius)" }}
            >
                <h3 className="fw-bold mb-3">학원 연혁</h3>
                <ul className="list-unstyled mb-0">
                    {academy.historyList.map((history, index) => (
                        <li
                            key={history.academyHistoryNo ?? index}
                            className="d-flex gap-3 py-2 border-bottom">
                            <span className="fw-bold text-primary text-nowrap">
                                {history.academyHistoryYear}
                            </span>
                            <span>{history.academyHistoryContent}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-5" />

            {/* 오시는 길 */}
            <div
                ref={locationRevealRef}
                className={"kh-reveal p-4 p-md-5" + (locationVisible ? " visible" : "")}
                style={{
                    background: "var(--kh-primary-light)",
                    borderRadius: "var(--bs-card-border-radius)",
                }}
            >
            <Row>
                <Col>
                    <h3 className="fw-bold mb-3">
                        <FaLocationDot className="text-primary me-2" />
                        <span>오시는 길</span>
                    </h3>
                </Col>
            </Row>
            <Row className="align-items-center">
                <Col md={7}>
                    {!mapError && !position && (
                        <div
                            className="d-flex justify-content-center align-items-center border rounded"
                            style={{ height: "300px" }}
                        >
                            위치 정보를 불러오는 중...
                        </div>
                    )}

                    {!mapError && position && (
                        <Map
                            center={position}
                            style={{
                                width: "100%",
                                height: "300px"
                            }}
                            level={3}
                            onCreate={(map) => {
                                mapRef.current = map;
                                setMapReady(true);
                            }}
                        >
                            <MapMarker
                                position={position}
                                onClick={() => setOverlayOpen(true)}
                            />

                            {overlayOpen && (
                                <CustomOverlayMap
                                    position={position}
                                    yAnchor={1.4}
                                >
                                    <div
                                        className="bg-white border rounded shadow-sm"
                                        style={{
                                            minWidth: "240px",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                            <strong>
                                                {info.academyName}
                                            </strong>

                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setOverlayOpen(false)}
                                            />
                                        </div>

                                        <div className="p-3">
                                            <div className="text-muted small mb-2">
                                                {info.academyAddress}
                                            </div>

                                            <div className="d-flex gap-3">
                                                <a
                                                    href={`https://map.kakao.com/link/map/${encodeURIComponent(info.academyName)},${position.lat},${position.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-decoration-none"
                                                >
                                                    큰지도보기
                                                </a>

                                                <a
                                                    href={`https://map.kakao.com/link/to/${encodeURIComponent(info.academyName)},${position.lat},${position.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-decoration-none"
                                                >
                                                    길찾기
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </CustomOverlayMap>
                            )}
                        </Map>
                    )}
                </Col>
                <Col md={5} className="mt-3 mt-md-0">
                    <p className="fw-bold fs-5 mb-2">
                        {info.academyAddress}
                    </p>
                </Col>
            </Row>
            </div>

            <div className="mt-5" />

            {/* 강사 소개 */}
            <div
                ref={tutorRevealRef}
                className={"kh-reveal bg-white shadow-sm p-4 p-md-5" + (tutorVisible ? " visible" : "")}
                style={{ borderRadius: "var(--bs-card-border-radius)" }}
            >
            <Row>
                <Col>
                    <h3 className="fw-bold mb-3">
                        <FaUsers className="text-primary me-2" />
                        <span>강사 소개</span>
                    </h3>
                </Col>
            </Row>
            <Row className="g-3">
                {previewTutorList.map((tutor) => (
                    <Col key={tutor.tutorNo} xs={12} md={4}>
                        <TutorCard tutor={tutor} />
                    </Col>
                ))}
            </Row>

            <Row className="mt-3">
                <Col className="text-center">
                    <Link
                        to="/academy/tutor"
                        className="text-decoration-none fw-bold">
                        <span>강사진 전체보기</span>
                        <FaArrowRight className="ms-2" />
                    </Link>
                </Col>
            </Row>
            </div>

            <div className="mt-5 mb-5" />

            {/* 상담 신청 */}
            <Row className="mb-5" ref={consultRevealRef}>
                <Col>
                    <Card className={"kh-reveal border-0 shadow-sm" + (consultVisible ? " visible" : "")}>
                        <Card.Body>
                            <Card.Title className="fw-bold mb-3">
                                <FaPhone className="text-primary me-2" />
                                <span>상담 신청</span>
                            </Card.Title>

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 border rounded p-3">
                                <div>
                                    <p className="fw-bold fs-4 mb-1">
                                        {info.academyPhone}
                                    </p>
                                </div>

                                <Button
                                    href={`tel:${info.academyPhone}`}
                                    variant="primary"
                                    className="btn-kh-accent text-nowrap"
                                >
                                    <FaPhone className="me-2" />
                                    <span>전화 걸기</span>
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}