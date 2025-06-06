import { CardEditor } from "../components/CardEditor";
import { Typography } from "antd";
import styles from "./CardEditorPage.module.css";

export default function CardEditorPage() {
  return (
    <div className={styles.container}>
      <Typography.Title level={2} className={styles.title}>
        Поздравляем!
      </Typography.Title>
      <div className={styles.form}>
        <CardEditor />
      </div>
    </div>
  );
}
