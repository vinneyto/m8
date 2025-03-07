import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * GradientSky: создаёт большую сферу вокруг сцены,
 * рисует вертикальный градиент (bottomColor -> topColor).
 *
 * Параметры:
 * - radius (число) – размер сферы (чем больше, тем дальше “горизонт”).
 * - topColor / bottomColor (строка или THREE.Color) – цвета.
 */
interface GradientSkyProps {
  radius?: number;
  topColor?: THREE.ColorRepresentation;
  bottomColor?: THREE.ColorRepresentation;
}

export function GradientSky({
  radius = 500,
  topColor = "#ffffff",
  bottomColor = "#9999ff",
}: GradientSkyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Шейдер: в вершинах передаём позицию, в фрагменте вычисляем factor от -1..+1
  // и интерполируем bottom->top.

  const vertexShader = `
    varying vec3 vWorldPos;

    void main() {
      // Мировая позиция
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float uRadius;

    varying vec3 vWorldPos;

    void main() {
      // Для упрощения возьмём "factor" = (y / uRadius) + 0.5,
      // чтобы y=-uRadius -> factor ~ 0, y=+uRadius -> factor ~ 1
      // Можно настроить формулу под себя.
      float factor = (vWorldPos.y / uRadius) + 0.5;
      factor = clamp(factor, 0.0, 1.0);

      vec3 color = mix(bottomColor, topColor, factor);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Подготовим uniforms
  const uniforms = {
    topColor: { value: new THREE.Color(topColor) },
    bottomColor: { value: new THREE.Color(bottomColor) },
    uRadius: { value: radius },
  };

  // В анимационном цикле, если нужно, можно слегка вращать
  useFrame(() => {
    // Например, meshRef.current.rotation.y += 0.0001;
  });

  return (
    <mesh ref={meshRef} scale={[radius, radius, radius]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide} // важный момент: рисуем "внутреннюю" сторону сферы
      />
    </mesh>
  );
}
