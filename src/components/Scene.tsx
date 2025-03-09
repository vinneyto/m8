import { Suspense } from "react";
import { GradientSky } from "../GradientSky";
import { Float } from "@react-three/drei";
import { Bouquet } from "./Bouquet";
import { Card } from "./Card";

export function Scene({ text }: { text: string }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <GradientSky radius={500} topColor="#f3f5f7" bottomColor="#d6e6f0" />
      <Suspense fallback={null}>
        <Float
          rotationIntensity={0.5}
          floatIntensity={0.5}
          floatingRange={[-0.02, 0.02]}
        >
          <Bouquet />
          <Card text={text} />
        </Float>
      </Suspense>
    </>
  );
}
