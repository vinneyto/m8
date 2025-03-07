import { Suspense, useEffect, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { GradientSky } from "./GradientSky";
import { Quaternion, Euler, DoubleSide, Matrix4, Vector3 } from "three";

// Букет (GLB-модель)
const Bouquet = () => {
  const glb = useGLTF("/models/bouquet.glb") as any;
  return <primitive object={glb.scene} scale={[1, 1, 1]} />;
};

// Открытка — одна плоскость
function Card() {
  // Начальные и конечные позиции
  const initialPos = [0, 0.35, 0]; // в букете
  const initialQuat = new Quaternion().setFromEuler(
    new Euler(-0.2, 0.5, 0, "XYZ")
  );
  const initRot = [initialQuat.x, initialQuat.y, initialQuat.z, initialQuat.w];

  const [open, setOpen] = useState(false);

  const [pos, setPos] = useState<number[]>([...initialPos]);
  const [rot, setRot] = useState<number[]>([...initialQuat]);

  const { camera } = useThree();

  useEffect(() => {
    if (open) {
      const matrix = new Matrix4().multiplyMatrices(
        camera.matrixWorld,
        new Matrix4().makeTranslation(0, 0.0, -0.2)
      );

      const position = new Vector3();
      const quaternion = new Quaternion();
      matrix.decompose(position, quaternion, new Vector3());

      setPos([position.x, position.y, position.z]);
      setRot([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    } else {
      setPos(initialPos);
      setRot(initRot);
    }
  }, [open, camera]);

  // Используем useSpring с несколькими полями
  const { posX, posY, posZ, rotX, rotY, rotZ, rotW } = useSpring({
    posX: pos[0],
    posY: pos[1],
    posZ: pos[2],

    rotX: rot[0],
    rotY: rot[1],
    rotZ: rot[2],
    rotW: rot[3],

    config: { tension: 120, friction: 14 },
  });

  // Клик по открытке
  const handleClick = (_e: ThreeEvent<MouseEvent>) => {
    setOpen((o) => !o);
  };

  return (
    <a.group
      onClick={handleClick}
      position-x={posX}
      position-y={posY}
      position-z={posZ}
      quaternion-x={rotX}
      quaternion-y={rotY}
      quaternion-z={rotZ}
      quaternion-w={rotW}
    >
      <mesh>
        <planeGeometry args={[0.1, 0.15]} />
        <meshBasicMaterial color="white" side={DoubleSide} />
      </mesh>
    </a.group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      {/* Небо */}
      <GradientSky radius={500} topColor="#f3f5f7" bottomColor="#d6e6f0" />

      <Suspense fallback={null}>
        <Float
          rotationIntensity={0.5}
          floatIntensity={0.5}
          floatingRange={[-0.02, 0.02]}
          autoInvalidate
        >
          <Bouquet />

          <Card />
        </Float>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0.3, 0.5], near: 0.1, far: 1000 }}
    >
      <Scene />
      <OrbitControls target={[0, 0.2, 0]} />
    </Canvas>
  );
}
