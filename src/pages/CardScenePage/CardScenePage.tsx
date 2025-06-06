import { useParams } from "react-router-dom";
import { CardScene } from "../../components/CardScene";
import { decodeBase64, encodeBase64 } from "../../util";
import styles from "./CardScenePage.module.css";

export default function CardScenePage() {
  const { id } = useParams();
  const cardId = id ?? encodeBase64("Милые девушки, поздравляю с 8-м марта!");
  const text = decodeBase64(cardId);
  return (
    <div className={styles.page}>
      <CardScene text={text} />
    </div>
  );
}
