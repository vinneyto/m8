"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Text } from "@react-three/drei";
import { animated, a, useSpring } from "@react-spring/three";
import { useState } from "react";
import { DoubleSide } from "three";

const AnimatedText = animated(Text);

function Flower({
  position,
  petalColor,
  centerColor,
}: {
  position: [number, number, number];
  petalColor: string;
  centerColor: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, -0.18, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.008, 0.01, 0.4, 10]} />
        <meshStandardMaterial color="#4f8f4f" />
      </mesh>

      {[
        [0.045, 0, 0],
        [-0.045, 0, 0],
        [0, 0.045, 0],
        [0, -0.045, 0],
        [0.032, 0.032, 0],
        [-0.032, 0.032, 0],
      ].map((petalPosition, index) => (
        <mesh
          key={`${petalColor}-${index}`}
          position={petalPosition as [number, number, number]}
          rotation={[0.3, 0.4, 0]}
        >
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color={petalColor} roughness={0.4} />
        </mesh>
      ))}

      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial color={centerColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Bouquet() {
  return (
    <group position={[0, -0.06, 0]} rotation={[0.15, 0.2, -0.1]}>
      <mesh position={[0, -0.22, 0.03]} rotation={[0.1, 0, Math.PI / 2]}>
        <coneGeometry args={[0.18, 0.34, 24, 1, true]} />
        <meshStandardMaterial color="#f6d8de" side={DoubleSide} />
      </mesh>

      <Flower position={[-0.13, 0.12, 0.02]} petalColor="#ff8fab" centerColor="#fff1a8" />
      <Flower position={[-0.04, 0.18, -0.02]} petalColor="#ffd166" centerColor="#fff7cc" />
      <Flower position={[0.06, 0.16, 0.01]} petalColor="#cdb4db" centerColor="#fff1a8" />
      <Flower position={[0.13, 0.1, -0.01]} petalColor="#84dcc6" centerColor="#fef3c7" />
      <Flower position={[0.02, 0.07, 0.05]} petalColor="#ffafcc" centerColor="#fff1a8" />
    </group>
  );
}

function CardMesh({
  text,
  initiallyOpen = true,
}: {
  text: string;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);

  const { posX, posY, posZ, rotX, rotY, rotZ, textOpacity } = useSpring({
    posX: open ? 0 : 0,
    posY: open ? 0.19 : 0.35,
    posZ: open ? 0.18 : 0.02,
    rotX: open ? -0.08 : -0.45,
    rotY: open ? 0.03 : 0.6,
    rotZ: open ? 0 : 0.05,
    textOpacity: open ? 1 : 0,
    config: {
      tension: 170,
      friction: 22,
    },
  });

  return (
    <a.group
      onClick={() => setOpen((current) => !current)}
      position-x={posX}
      position-y={posY}
      position-z={posZ}
      rotation-x={rotX}
      rotation-y={rotY}
      rotation-z={rotZ}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.46, 0.02]} />
        <meshStandardMaterial color="#fff9fb" />
      </mesh>

      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.3, 0.42]} />
        <meshStandardMaterial color="#fff" side={DoubleSide} />
      </mesh>

      <AnimatedText
        position={[0, 0.04, 0.022]}
        fontSize={0.03}
        maxWidth={0.24}
        lineHeight={1.25}
        color="#7f1d1d"
        anchorX="center"
        anchorY="middle"
        material-transparent
        material-opacity={textOpacity}
      >
        {text}
      </AnimatedText>

      <mesh position={[0, -0.18, 0.022]}>
        <planeGeometry args={[0.14, 0.035]} />
        <meshStandardMaterial color="#f9c5d1" />
      </mesh>
    </a.group>
  );
}

function GradientBackdrop() {
  return (
    <mesh scale={[8, 8, 8]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={DoubleSide}
        uniforms={{
          topColor: { value: [0.95, 0.9, 0.96] },
          bottomColor: { value: [0.84, 0.92, 0.97] },
        }}
        vertexShader={`
          varying vec3 vPosition;

          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vPosition;

          void main() {
            float mixValue = clamp((vPosition.y + 1.0) * 0.5, 0.0, 1.0);
            vec3 color = mix(bottomColor, topColor, mixValue);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function CardScene({
  text,
  initiallyOpen = true,
}: {
  text: string;
  initiallyOpen?: boolean;
}) {
  return (
    <div className="sceneCanvasShell">
      <Canvas camera={{ position: [0, 0.2, 1.05], fov: 35 }} shadows>
        <color attach="background" args={["#f6f3ff"]} />
        <GradientBackdrop />
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
        <pointLight position={[-2, 2, 2]} intensity={0.6} />

        <Float
          speed={1.2}
          rotationIntensity={0.25}
          floatIntensity={0.45}
          floatingRange={[-0.03, 0.03]}
        >
          <Bouquet />
          <CardMesh text={text} initiallyOpen={initiallyOpen} />
        </Float>

        <Sparkles
          count={30}
          size={2}
          scale={[2.6, 1.8, 2.2]}
          position={[0, 0.3, 0]}
          speed={0.2}
          color="#ffffff"
        />

        <OrbitControls
          enablePan={false}
          minDistance={0.8}
          maxDistance={1.4}
          target={[0, 0.1, 0]}
        />
      </Canvas>
    </div>
  );
}
