import { animated, useSpring, a } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { Matrix4, Vector3, Quaternion, Mesh, DoubleSide, Euler } from "three";

const INITIAL_POS = [0, 0.35, 0];
const INITIAL_QUAT = new Quaternion().setFromEuler(
  new Euler(-0.2, 0.5, 0, "XYZ")
);
const INIT_ROT = [
  INITIAL_QUAT.x,
  INITIAL_QUAT.y,
  INITIAL_QUAT.z,
  INITIAL_QUAT.w,
];

const SPHERE_CENTER = new Vector3(0, 0.2, 0);
const SPHERE_RADIUS = 0.2;

export interface CardProps {
  text: string;
}

const AText = animated(Text);

export function Card({ text }: CardProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<number[]>([...INITIAL_POS]);
  const [rot, setRot] = useState<number[]>([...INIT_ROT]);

  const { camera } = useThree();

  useEffect(() => {
    if (open) {
      const matrix = new Matrix4().multiplyMatrices(
        camera.matrixWorld,
        new Matrix4().makeTranslation(0, 0, -0.25)
      );
      const position = new Vector3();
      const quaternion = new Quaternion();
      matrix.decompose(position, quaternion, new Vector3());

      const direction = new Vector3().subVectors(position, SPHERE_CENTER);
      const distance = direction.length();

      if (distance < SPHERE_RADIUS) {
        direction.setLength(SPHERE_RADIUS);
        position.copy(SPHERE_CENTER).add(direction);
      }

      setPos([position.x, position.y, position.z]);
      setRot([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    } else {
      setPos(INITIAL_POS);
      setRot(INIT_ROT);
    }
  }, [open, camera]);

  const { posX, posY, posZ, rotX, rotY, rotZ, rotW, textOpacity } = useSpring({
    posX: pos[0],
    posY: pos[1],
    posZ: pos[2],

    rotX: rot[0],
    rotY: rot[1],
    rotZ: rot[2],
    rotW: rot[3],

    textOpacity: open ? 1 : 0,

    config: { tension: 120, friction: 14 },
  });

  const handleClick = () => {
    setOpen((o) => !o);
  };

  const textRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (textRef.current) {
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
      <mesh>
        <planeGeometry args={[0.15, 0.2]} />
        <meshBasicMaterial color="white" side={DoubleSide} />
        <AText
          ref={textRef}
          font="/m8/fonts/Caveat-VariableFont_wght.ttf"
          position={[0, 0.05, 0.001]}
          fontSize={0.01}
          color="darkred"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.13}
          lineHeight={1.2}
          overflowWrap="break-word"
          material-transparent
          material-opacity={textOpacity}
        >
          {text}
        </AText>
      </mesh>
    </a.group>
  );
}
