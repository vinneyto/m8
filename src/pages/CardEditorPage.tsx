import { CardEditor } from "../components/CardEditor";
import { Row, Col } from "antd";

export default function CardEditorPage() {
  return (
    <Row justify="center" align="middle" style={{ height: "100%" }}>
      <Col>
        <CardEditor />
      </Col>
    </Row>
  );
}
