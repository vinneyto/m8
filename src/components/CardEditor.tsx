import { useCallback, useState } from "react";
import { Button, Input, Space } from "antd";
import { Link } from "react-router-dom";

export function CardEditor() {
  const [text, setText] = useState("");
  const [created, setCreated] = useState(false);
  const [cardId, setCardId] = useState("");

  const handleCreate = useCallback(() => {
    const id = crypto.randomUUID();
    setCardId(id);
    setCreated(true);
  }, []);

  const url =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}${import.meta.env.BASE_URL}card/${cardId}`;

  const handleCopy = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Input.TextArea
        maxLength={150}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст открытки"
      />
      {!created ? (
        <Button type="primary" onClick={handleCreate} disabled={!text}>
          Создать
        </Button>
      ) : (
        <Space>
          <Button type="primary">
            <Link to={`/card/${cardId}`}>Открыть открытку</Link>
          </Button>
          <Button onClick={handleCopy}>Скопировать URL</Button>
        </Space>
      )}
    </Space>
  );
}
