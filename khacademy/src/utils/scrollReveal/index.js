import { useCallback, useRef, useState } from "react";

// 스크롤해서 요소가 화면에 들어오면 한 번만 서서히 나타나게 하는 훅
// 사용법: const [ref, visible] = useScrollReveal();
//        <div ref={ref} className={"kh-reveal" + (visible ? " visible" : "")}>
//
// 규칙을 명확하게 : 마운트 시점에 이미 화면 안(또는 살짝 걸침)이면 애니메이션 없이
// 바로 표시하고, 완전히 화면 밖에 있는 요소만 스크롤해서 들어올 때 나타나게 함
// (rootMargin으로 트리거 지점을 늦추는 방식은 화면 높이에 따라 "이미 거의 보이는데
// 아주 살짝 부족해서 안 뜨는" 애매한 구간이 생겨서 대신 이 방식을 씀)
//
// 콜백 ref로 구현 : 대상 요소가 처음부터 있지 않고(예: API 응답 후에야 나타나는
// 조건부 렌더링) 나중에 마운트되더라도, 마운트되는 시점에 다시 관찰을 시작함
// (useRef+useEffect였다면 최초 마운트 시점에 요소가 없으면 이후 나타나도 못 잡음)
export default function useScrollReveal({ threshold = 0.1 } = {}) {
    const [visible, setVisible] = useState(false);
    const observerRef = useRef(null);

    const ref = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (!node) {
            return;
        }

        // 모션 최소화를 선호하는 사용자는 애니메이션 없이 바로 표시
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        // 마운트 시점에 이미 화면에 걸쳐 있으면(=스크롤한 적 없이 보이는 상태) 바로 표시
        const rect = node.getBoundingClientRect();
        const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (alreadyInView) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(node);
        observerRef.current = observer;
    }, [threshold]);

    return [ref, visible];
}
