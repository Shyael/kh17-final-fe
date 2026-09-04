import React from "react";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";

export default function Jumbotron({ title = "메뉴 제목", content = "" }) {
    return (
        <Row className="mb-4">
            <Col>
                <div className="pt-4 pb-2 px-2">
                    <h2 className="fw-bolder mb-2" style={{ color: "#202124", letterSpacing: "-0.5px" }}>
                        {title}
                    </h2>
                    {content && (
                        <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                            {content}
                        </p>
                    )}
                </div>
            </Col>
        </Row>
    );
}