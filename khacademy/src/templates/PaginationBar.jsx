import { Pagination } from "react-bootstrap";

/**
 * 백엔드 PageResponseVO 의 계산 필드를 그대로 받아서 렌더링하는 공용 페이지네이션 바
 *
 * props
 * - page        : 현재 페이지 번호 (1-base)
 * - totalPages  : 전체 페이지 수
 * - startBlock  : 화면 하단 페이지 버튼 시작 번호
 * - endBlock    : 화면 하단 페이지 버튼 끝 번호
 * - prev        : [이전 블록] 버튼 활성화 여부
 * - next        : [다음 블록] 버튼 활성화 여부
 * - onChange    : (page:number) => void
 */
export default function PaginationBar({
    page = 1,
    totalPages = 0,
    startBlock = 1,
    endBlock = 0,
    prev = false,
    next = false,
    onChange,
}) {
    if (totalPages <= 1) return null;

    const move = (target) => {
        if (target < 1 || target > totalPages || target === page) return;
        onChange?.(target);
    };

    const pages = [];
    for (let i = startBlock; i <= endBlock; i++) {
        pages.push(i);
    }

    return (
        <Pagination className="justify-content-center mt-4 mb-0">
            <Pagination.First disabled={page === 1} onClick={() => move(1)} />
            <Pagination.Prev disabled={page === 1} onClick={() => move(page - 1)} />

            {prev && (
                <Pagination.Ellipsis onClick={() => move(startBlock - 1)} />
            )}

            {pages.map((p) => (
                <Pagination.Item
                    key={p}
                    active={p === page}
                    onClick={() => move(p)}>
                    {p}
                </Pagination.Item>
            ))}

            {next && (
                <Pagination.Ellipsis onClick={() => move(endBlock + 1)} />
            )}

            <Pagination.Next
                disabled={page === totalPages}
                onClick={() => move(page + 1)}
            />
            <Pagination.Last
                disabled={page === totalPages}
                onClick={() => move(totalPages)}
            />
        </Pagination>
    );
}
