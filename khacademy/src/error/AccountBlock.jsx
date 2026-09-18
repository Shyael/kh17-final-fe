import { Link } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { FaUserLock } from "react-icons/fa6";

export default function AccountBlock() {
    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "70vh",
                backgroundColor: "#F7F5F1",
            }}
        >
            <Card
                className="border-0 shadow-sm text-center"
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "16px",
                }}
            >
                <Card.Body className="p-5">

                    <div
                        className="d-flex justify-content-center align-items-center mx-auto mb-4"
                        style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "50%",
                            backgroundColor: "#E9E4DD",
                            color: "#596E82",
                        }}
                    >
                        <FaUserLock size={32} />
                    </div>

                    <h3
                        className="fw-bold mb-3"
                        style={{ color: "#596E82" }}
                    >
                        계정 이용이 제한되었습니다.
                    </h3>

                    <p className="text-muted mb-2">
                        현재 해당 계정은 차단된 상태로
                        서비스를 이용할 수 없습니다.
                    </p>

                    <p className="text-muted mb-4">
                        이용 제한에 대한 문의가 필요한 경우
                        학원에 문의해 주세요.
                    </p>

                    <Button
                        as={Link}
                        to="/academy"
                        variant="outline-secondary"
                        className="px-4"
                    >
                        학원 홈으로
                    </Button>

                </Card.Body>
            </Card>
        </Container>
    );
}