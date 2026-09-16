// 강사 사진이 없을 때 no-image.png 대신 이름 이니셜 원형 아바타로 대체
export default function TutorAvatar({ tutor, size = 120, className = "" }) {
    const imageUrl = tutor.image
        ? `${import.meta.env.VITE_SERVER_URL}/api/attach/${tutor.image.attachNo}`
        : null;

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={`${tutor.accountName} 강사`}
                className={`rounded-circle ${className}`}
                width={size}
                height={size}
                style={{ objectFit: "cover" }}
            />
        );
    }

    const initial = tutor.accountName?.trim()?.[0] ?? "?";

    return (
        <div
            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold mx-auto ${className}`}
            style={{
                width: size,
                height: size,
                background: "var(--kh-primary-light)",
                color: "var(--kh-primary-dark)",
                fontSize: size * 0.4,
            }}
        >
            {initial}
        </div>
    );
}
