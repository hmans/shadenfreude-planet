import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  Add,
  code,
  compileShader,
  CustomShaderMaterialMaster,
  Div,
  Float,
  Fresnel,
  JoinVector3,
  Mul,
  Simplex3DNoise,
  Smoothstep,
  Time,
  Value,
  VertexPosition,
} from "shadenfreude";
import { DoubleSide, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";

const Clamp = (x: Value<"float">, min: Value<"float">, max: Value<"float">) =>
  Float(code`clamp(${x}, ${min}, ${max})`);

const Clamp01 = (x: Value<"float">) => Clamp(x, 0, 1);

export function Atmosphere() {
  const [shader, update] = useMemo(() => {
    const t = Div(Time, 35);

    const cloudsNoise1 = Smoothstep(
      0.5,
      0.55,
      Simplex3DNoise(Add(Div(VertexPosition, 20), JoinVector3(t, 0, 0)))
    );

    const cloudsNoise2 = Smoothstep(
      0.5,
      0.55,
      Simplex3DNoise(
        Add(Div(VertexPosition, 120), JoinVector3(Div(t, 2), 0, 0))
      )
    );

    const clouds = Clamp01(Add(cloudsNoise1, cloudsNoise2));

    return compileShader(
      CustomShaderMaterialMaster({
        alpha: Add(Mul(clouds, 0.8), Mul(Fresnel(), 0.05)),
      })
    );
  }, []);

  useFrame((_, dt) => update(dt));

  return (
    <mesh position-y={14}>
      <icosahedronGeometry args={[15, 3]} />
      <CustomShaderMaterial
        baseMaterial={MeshStandardMaterial}
        {...shader}
        transparent
        side={DoubleSide}
      />
    </mesh>
  );
}
