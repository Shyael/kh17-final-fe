

export default function Footer() {
    return (<>
        <div className="d-flex flex-column flex-md-row">
            <div className="w-md-50">
                <h2 className="mb-4">KH정보교육원</h2>
                <p>OO시 OO구 OO동 000-000번지</p>
                <p>대표자 - 피카츄</p>
                <p>고객센터 - (02) 1234-5678</p>
            </div>
            <div className="w-md-25">
                <h2 className="mb-4">지점 정보</h2>
                <p>강남지점</p>
                <p>종로지점</p>
                <p>부산지점</p>
            </div>
            <div className="w-md-25">
                <h2 className="mb-4">운영 방침</h2>
                <p>홈페이지 이용약관</p>
                <p>개인정보 처리방침</p>
            </div>
        </div>
    </>)
}