import Jumbotron from "@templates/Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { FaArrowRight, FaGraduationCap, FaLocationDot, FaPhone, FaUsers } from "react-icons/fa6";
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

    // 학원정보/강사목록 로딩 완료 여부 (완료 전에는 레이아웃이 실제보다 짧아서
    // 스크롤 리빌 섹션들의 화면 안/밖 판정이 잘못될 수 있으므로 렌더링을 늦춤)
    const [dataLoaded, setDataLoaded] = useState(false);

    // 섹션별 스크롤 리빌 (스크롤해서 보일 때 서서히 나타나는 연출)
    const [photoRevealRef, photoVisible] = useScrollReveal();
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
        Promise.all([loadAcademy(), loadTutor()]).finally(() => setDataLoaded(true));
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
        <>
        {/* 캐치프레이즈 + 일러스트 : 사진 없이 텍스트/그래픽만으로 구성한 히어로
            (브랜드 컬러로 화면 끝까지 꽉 채우는 풀블리드 배너. 상세 스타일은
            index.css의 .kh-academy-hero / .kh-academy-hero-inner 참고) */}
        <div className="kh-academy-hero">
            <div className="kh-academy-hero-inner">
            <Row className="align-items-center g-4">
                <Col xs={12} md={7} className="text-center text-md-start">
                    <h2
                        className="fw-bolder mb-3 display-5"
                        style={{ letterSpacing: "-0.02em", color: "#FFFFFF" }}
                    >
                        {info.academyTagline}
                    </h2>

                    <div className="mb-3 d-flex justify-content-center justify-content-md-start flex-wrap gap-2">
                        {academy.subjectList.map((subject, index) => (
                            <Badge
                                key={subject.academySubjectNo ?? index}
                                pill
                                className="px-3 py-2 fw-semibold"
                                style={{
                                    background: "#FFFFFF",
                                    color: "var(--kh-primary-dark)",
                                }}
                            >
                                {subject.academySubjectName}
                            </Badge>
                        ))}
                    </div>

                    <p
                        className="mb-0 mx-auto mx-md-0 fs-5"
                        style={{ whiteSpace: "pre-line", maxWidth: 520, color: "rgba(255, 255, 255, 0.85)" }}
                    >
                        {info.academyIntro}
                    </p>
                </Col>

                <Col xs={12} md={5} className="d-flex justify-content-center">
                    {/* 사진 대신 공통으로 쓰는 간단한 그래픽 (도형 + 아이콘) */}
                    <div className="position-relative" style={{ width: 300, height: 300 }}>
                        <svg
                            viewBox="0 0 200 200"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                        >
                            <path
                                fill="rgba(255, 255, 255, 0.16)"
                                d="M45.3,-58.5C58.6,-49.7,68.8,-34.5,72.6,-17.9C76.5,-1.3,74,16.7,65.4,31.2C56.8,45.7,42.1,56.7,25.8,63.2C9.5,69.7,-8.4,71.7,-24.6,66.8C-40.8,61.9,-55.3,50.1,-63.8,35.1C-72.3,20.1,-74.8,1.9,-70.9,-14.5C-67,-30.9,-56.7,-45.5,-43.2,-54.4C-29.7,-63.3,-14.8,-66.5,1.6,-68.6C18.1,-70.7,36.1,-71.7,45.3,-58.5Z"
                                transform="translate(100 100)"
                            />
                        </svg>

                        <FaGraduationCap
                            size={128}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: "#FFFFFF",
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 24,
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: "var(--kh-accent)",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                bottom: 32,
                                left: 8,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#FFFFFF",
                            }}
                        />
                    </div>
                </Col>
            </Row>
            </div>
        </div>

        <div className="kh-external-content">
            {/* 데이터 로딩 완료 전에는 렌더링하지 않음
                (로딩 중에는 레이아웃이 실제보다 짧아서 스크롤 리빌 섹션들의
                화면 안/밖 판정이 잘못될 수 있으므로, 데이터가 준비된 뒤에 마운트되게 함) */}
            {dataLoaded && (
            <>
            {/* 학원 사진 : 등록된 사진이 있을 때만 히어로 아래에 나타남 */}
            {academy.imageList?.length > 0 && (
                <>
                    <div className="mt-5" />
                    <Row ref={photoRevealRef} className={"kh-reveal" + (photoVisible ? " visible" : "")}>
                        <Col>
                            <Carousel>
                                {academy.imageList.map((image) => (
                                    <Carousel.Item key={image.attachNo}>
                                        <img
                                            src={`${import.meta.env.VITE_SERVER_URL}/api/attach/${image.attachNo}`}
                                            alt={image.attachName}
                                            className="d-block w-100 rounded"
                                            style={{
                                                height: "400px",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </Col>
                    </Row>
                </>
            )}

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
            </>
            )}
        </div>
        </>
    );
}