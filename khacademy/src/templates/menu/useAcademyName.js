import { useEffect, useState } from "react";
import { apiClient } from "@utils/reaxios";

const FALLBACK_NAME = "KH정보교육원";

// 앱 전체에서 학원 정보를 1회만 조회하도록 모듈 수준에 캐시
let cached = null;
let inflight = null;

function fetchAcademy() {
    if (cached) {
        return Promise.resolve(cached);
    }
    if (!inflight) {
        inflight = apiClient
            .get("/academy/")
            .then(res => {
                cached = res.data?.academy ?? {};
                return cached;
            })
            .catch(() => ({}))
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
}

/**
 * 학원 기본정보 객체를 반환한다.
 * { academyName, academyTagline, academyIntro, academyPhone, academyAddress }
 * 조회 전/실패 시 빈 객체.
 */
export function useAcademy() {
    const [academy, setAcademy] = useState(cached ?? {});

    useEffect(() => {
        let alive = true;
        fetchAcademy().then(data => {
            if (alive) {
                setAcademy(data);
            }
        });
        return () => {
            alive = false;
        };
    }, []);

    return academy;
}

/**
 * 학원 이름만 필요할 때. (조회 전/실패 시 "KH정보교육원")
 * 메뉴 헤더/사이드바 브랜드명에 사용.
 */
export default function useAcademyName() {
    const academy = useAcademy();
    return academy?.academyName || FALLBACK_NAME;
}
