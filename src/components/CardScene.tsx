import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export interface CardSceneProps {
  text: string;
}

export function CardScene({ text }: CardSceneProps) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0.3, 0.5], near: 0.1, far: 1000 }}
    >
      <Scene text={text} />
      <OrbitControls zoomSpeed={0.1} target={[0, 0.2, 0]} />
    </Canvas>
  );
}
