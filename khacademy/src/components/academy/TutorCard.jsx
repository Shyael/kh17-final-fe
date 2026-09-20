import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import TutorAvatar from "./TutorAvatar";

// 학원 소개(미리보기)와 강사 목록에서 공용으로 쓰는 강사 카드
export default function TutorCard({ tutor }) {
    return (
        <Card
            as={Link}
            to={`/academy/tutor/${tutor.tutorNo}`}
            className="h-100 shadow-sm text-center text-decoration-none text-reset"
            style={{ borderColor: "var(--kh-border)" }}>
            <Card.Body>
                <TutorAvatar tutor={tutor} size={120} className="mb-3" />
                <Card.Title className="fw-bold mb-1">
                    {tutor.accountName} 강사
                </Card.Title>
                <Card.Text className="text-muted">
                    {tutor.tutorTagline}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}
