import { useEffect, useRef, useState } from "react";

// 스크롤해서 요소가 화면에 들어오면 한 번만 서서히 나타나게 하는 훅
// 사용법: const [ref, visible] = useScrollReveal();
//        <div ref={ref} className={"kh-reveal" + (visible ? " visible" : "")}>
//
// rootMargin 하단을 음수로 좁혀서, 페이지 로드 시점에 이미 화면 안에 살짝 걸쳐
// 있는 요소(예: 이미지 바로 아래 섹션)가 스크롤 없이 즉시 나타나버리는 것을 방지함
// - 실제로 어느 정도 스크롤해서 들어와야 "나타나는" 게 보임
export default function useScrollReveal({ rootMargin = "0px 0px -120px 0px", threshold = 0.1 } = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }

        // 모션 최소화를 선호하는 사용자는 애니메이션 없이 바로 표시
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
            { threshold, rootMargin }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    return [ref, visible];
}
