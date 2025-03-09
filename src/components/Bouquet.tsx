import { useGLTF } from "@react-three/drei";

export const Bouquet = () => {
  const glb = useGLTF("/m8/models/bouquet.glb");
  return <primitive object={glb.scene} scale={[1, 1, 1]} />;
};
