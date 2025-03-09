import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { decodeBase64, encodeBase64 } from "./util";
import { Scene } from "./components";

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const b64 =
    searchParams.get("text") ||
    encodeBase64("Милые девушки, поздравляю с 8-м марта!");
  const decoded = decodeBase64(b64);

  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0.3, 0.5], near: 0.1, far: 1000 }}
    >
      <Scene text={decoded} />
      <OrbitControls zoomSpeed={0.1} target={[0, 0.2, 0]} />
    </Canvas>
  );
}
