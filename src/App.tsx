import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF, Text } from "@react-three/drei";
import { useSpring, a, animated } from "@react-spring/three";

// Допустим, ваш компонент градиентного неба
import { GradientSky } from "./GradientSky";
import { Quaternion, Euler, Matrix4, Vector3, DoubleSide, Mesh } from "three";

// Вспомогательные функции для Base64 (UTF-8)
function decodeBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return "";
  }
}

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// @ts-expect-error
window.encodeBase64 = encodeBase64;

// ---------- Букет -----------
const Bouquet = () => {
  const glb = useGLTF("/m8/models/bouquet.glb") as any;
  return <primitive object={glb.scene} scale={[1, 1, 1]} />;
};

// ---------- Открытка ----------
interface CardProps {
  text: string; // Текст для открытки
}

// Animated Text
const AText = animated(Text);

function Card({ text }: CardProps) {
  // Начальная позиция/ориентация
  const initialPos = [0, 0.35, 0];
  const initialQuat = new Quaternion().setFromEuler(
    new Euler(-0.2, 0.5, 0, "XYZ")
  );
  const initRot = [initialQuat.x, initialQuat.y, initialQuat.z, initialQuat.w];

  const [open, setOpen] = useState(false);

  // Текущие целевые pos/rot (меняются при "open")
  const [pos, setPos] = useState<number[]>([...initialPos]);
  const [rot, setRot] = useState<number[]>([...initRot]);

  const { camera } = useThree();

  useEffect(() => {
    if (open) {
      // Посчитать матрицу: на -0.2m перед камерой
      const matrix = new Matrix4().multiplyMatrices(
        camera.matrixWorld,
        new Matrix4().makeTranslation(0, 0, -0.25)
      );
      // Раскладываем матрицу
      const position = new Vector3();
      const quaternion = new Quaternion();
      matrix.decompose(position, quaternion, new Vector3());

      const sphereCenter = new Vector3(0, 0.2, 0); // Центр сферы
      const sphereRadius = 0.2; // Радиус сферы

      // Вычисляем вектор от центра сферы до позиции
      const direction = new Vector3().subVectors(position, sphereCenter);
      const distance = direction.length();

      // Если позиция внутри сферы, перемещаем её на поверхность сферы
      if (distance < sphereRadius) {
        direction.setLength(sphereRadius);
        position.copy(sphereCenter).add(direction);
      }

      setPos([position.x, position.y, position.z]);
      setRot([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    } else {
      setPos(initialPos);
      setRot(initRot);
    }
  }, [open, camera]);

  // Анимируем поля
  const { posX, posY, posZ, rotX, rotY, rotZ, rotW, textOpacity } = useSpring({
    posX: pos[0],
    posY: pos[1],
    posZ: pos[2],

    rotX: rot[0],
    rotY: rot[1],
    rotZ: rot[2],
    rotW: rot[3],

    // Прозрачность текста (появляется при open)
    textOpacity: open ? 1 : 0,

    config: { tension: 120, friction: 14 },
  });

  const handleClick = (_e: ThreeEvent<MouseEvent>) => {
    setOpen((o) => !o);
  };

  const textRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (textRef.current) {
      // Убираем raycast, чтобы текст «не ловил» клики.
      textRef.current.raycast = () => {};
    }
  }, []);

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
      {/* Плоскость открытки */}
      <mesh>
        <planeGeometry args={[0.15, 0.2]} />
        <meshBasicMaterial color="white" side={DoubleSide} />

        {/* Текст (добавляем maxWidth, overflowWrap и т.д.) */}
        <AText
          ref={textRef}
          font="/m8/fonts/Caveat-VariableFont_wght.ttf"
          position={[0, 0.05, 0.001]}
          fontSize={0.01} // ещё поменьше
          color="darkred"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.13} // чтобы вписаться в 0.15 ширину
          lineHeight={1.2}
          overflowWrap="break-word" // можно "anywhere"
          material-transparent
          material-opacity={textOpacity}
        >
          {text}
        </AText>
      </mesh>
    </a.group>
  );
}

// ---------- Сцена ----------
function Scene({ text }: { text: string }) {
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

// ---------- Главный компонент ----------
export default function App() {
  // Считываем ?text=base64
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
