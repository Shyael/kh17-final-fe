//점보트론

import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";

export default function Jumbotron({title="테스트 제목", content=""}) {
    return (
        <Row>
            <Col>
                <div className="py-4 text-primary rounded">
                    <h1>{title}</h1>
                    <p className="text-muted">{content}</p>
                </div>
            </Col>
        </Row>
    );
}