import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

// Self-contained SVG icons replacing external "react-icons/fa6" dependency
const FaUserLock = ({ className = "", style = {} }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h282.8c-2.8-10.4-4.5-21.2-4.5-32v-16h-48v-32h48v-32h-48v-32h56.4c17.5-39 56.7-65.7 101.6-67-10.8-3.4-22.3-5-34.2-5H178.3zM608 352h-16v-48c0-44.2-35.8-80-80-80s-80 35.8-80 80v48h-16c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V384c0-17.7-14.3-32-32-32zm-64 0h-64v-48c0-17.7 14.3-32 32-32s32 14.3 32 32v48z" />
  </svg>
);

const FaKey = ({ className = "", style = {} }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.6 8.3 53.5L8.5 389.9C3.1 395.3 0 402.7 0 410.5V480c0 17.7 14.3 32 32 32h70c8.8 0 16-7.2 16-16v-40h40c8.8 0 16-7.2 16-16v-40h40c8.8 0 16-7.2 16-16v-40h36.2l32.3-32.3c16.9 5.4 34.8 8.3 53.5 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z" />
  </svg>
);

const FaArrowLeft = ({ className = "", style = {} }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
  </svg>
);

const FaCircleExclamation = ({ className = "", style = {} }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zm32 224a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z" />
  </svg>
);

const FaHeadset = ({ className = "", style = {} }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M256 48C141.1 48 48 141.1 48 256v32c0 26.5 21.5 48 48 48h32c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H80.5C95.9 146.4 169.3 88 256 88s160.1 58.4 175.5 136H384c-17.7 0-32 14.3-32 32v48c0 17.7 14.3 32 32 32h32c8.8 0 16-7.2 16-16v-8c0-1.7-.1-3.3-.4-5 1.7-6.2 2.4-12.7 2.4-19v-32c0-114.9-93.1-208-208-208zm160 336h-48c-8.8 0-16 7.2-16 16v16c0 26.5-21.5 48-48 48h-64c-8.8 0-16-7.2-16-16s7.2-16 16-16h64c8.8 0 16-7.2 16-16v-16c0-26.5-21.5-48-48-48H160c-8.8 0-16 7.2-16 16v16c0 44.2 35.8 80 80 80h64c44.2 0 80-35.8 80-80v-16c0-8.8-7.2-16-16-16z" />
  </svg>
);

const blockStyles = `
.kh-block-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1.5rem;
  font-family: inherit;
}

.kh-block-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2.25rem 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
  text-align: center;
}

.kh-block-icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  font-size: 2rem;
  box-shadow: 0 0 0 8px #fff1f2;
}

.kh-block-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.kh-block-desc {
  font-size: 0.925rem;
  color: #64748b;
  line-height: 1.55;
  margin-bottom: 1.5rem;
  word-break: keep-all;
}

.kh-block-info-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin-bottom: 1.75rem;
  text-align: left;
  font-size: 0.85rem;
}

.kh-block-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.35rem 0;
}

.kh-block-info-row:not(:last-child) {
  border-bottom: 1px dashed #e2e8f0;
}

.kh-block-info-label {
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
}

.kh-block-info-val {
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}

.kh-block-actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.kh-block-btn-primary {
  height: 46px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.kh-block-btn-secondary {
  height: 44px;
  font-weight: 500;
  font-size: 0.92rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.kh-block-footer {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.kh-block-footer a,
.kh-block-footer span.contact {
  color: #64748b;
  font-weight: 500;
  text-decoration: none;
}
`;

export default function AccountBlock() {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 페이지 등에서 state로 넘어온 차단 정보가 있을 경우 활용 (없으면 기본값 제공)
  const blockedAccountId = location.state?.accountId || "해당 계정";
  const blockedReason = location.state?.reason || "비밀번호 5회 연속 오류 (보안 정책)";
  const currentTime = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  // 비밀번호 재설정 및 본인인증으로 이동
  const goFind = () => {
    navigate("/account/find", { state: { loginPath: "/employee/login" } });
  };

  // 기존 직원 로그인 화면으로 복귀
  const goLogin = () => {
    navigate("/employee/login");
  };

  return (
    <div className="kh-login kh-block-container">
      {/* 컴포넌트 격리형 스타일 주입 */}
      <style>{blockStyles}</style>

      <div className="kh-login-card kh-block-card">
        {/* 보안 경고 아이콘 */}
        <div className="kh-block-icon-wrapper">
          <FaUserLock />
        </div>

        {/* 안내 타이틀 및 기본 설명 */}
        <h2 className="kh-login-title kh-block-title">계정 이용 제한 안내</h2>
        <p className="kh-block-desc">
          비정상적인 접근 감지 또는 보안 정책에 따라<br />
          해당 계정의 로그인이 일시적으로 차단되었습니다.
        </p>

        {/* 세부 차단 정보 박스 */}
        <div className="kh-block-info-box">
          <div className="kh-block-info-row">
            <span className="kh-block-info-label">대상 계정</span>
            <span className="kh-block-info-val">{blockedAccountId}</span>
          </div>
          <div className="kh-block-info-row">
            <span className="kh-block-info-label">제한 사유</span>
            <span className="kh-block-info-val text-danger d-flex align-items-center gap-1 justify-content-end">
              <FaCircleExclamation /> {blockedReason}
            </span>
          </div>
          <div className="kh-block-info-row">
            <span className="kh-block-info-label">제한 일시</span>
            <span className="kh-block-info-val">{currentTime}</span>
          </div>
          <div className="kh-block-info-row">
            <span className="kh-block-info-label">해제 안내</span>
            <span className="kh-block-info-val text-secondary">
              본인 확인 후 비밀번호 재설정 시 즉시 해제
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="kh-block-actions">
          <Button 
            variant="success" 
            className="w-100 kh-block-btn-primary"
            onClick={goFind}
          >
            <FaKey />
            <span>본인 인증 및 비밀번호 재설정</span>
          </Button>

          <Button 
            variant="outline-secondary" 
            className="w-100 kh-block-btn-secondary"
            onClick={goLogin}
          >
            <FaArrowLeft />
            <span>로그인 화면으로 돌아가기</span>
          </Button>
        </div>

        {/* 관리자 및 지원 문의 푸터 */}
        <div className="kh-block-footer">
          <div className="d-flex align-items-center gap-1">
            <FaHeadset className="text-secondary" />
            <span>시스템 관리자 문의 : <strong>내선 1004</strong> / 보안팀</span>
          </div>
          <div>문의 가능 시간: 평일 09:00 ~ 18:00 (help@company.com)</div>
        </div>
      </div>
    </div>
  );
}