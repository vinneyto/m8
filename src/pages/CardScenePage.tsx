import { useSearchParams } from "react-router-dom";
import { CardScene } from "../components/CardScene";
import { decodeBase64, encodeBase64 } from "../util";

export default function CardScenePage() {
  const [params] = useSearchParams();
  const cardId =
    params.get("cardId") || encodeBase64("Милые девушки, поздравляю с 8-м марта!");
  const text = decodeBase64(cardId);
  return <CardScene text={text} />;
}
