import "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { R3FStage } from "r3f-stage";
import "r3f-stage/styles.css";
import { useMemo } from "react";
import {
  Add,
  code,
  compileShader,
  CustomShaderMaterialMaster,
  Float,
  Fresnel,
  Mix,
  Mul,
  Multiply,
  Pipe,
  Simplex3DNoise,
  Smoothstep,
  Step,
  Time,
  Uniform,
  Vec3,
  VertexPosition
} from "shadenfreude";
import { Color, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";

function Thingy() {
  const continents = useControls("Continents", {
    offset: { value: 0, min: 0, max: 100 },
    scale: { value: 0.1, min: 0.01, max: 0.2 }
  });

  const details = useControls("Details", {
    offset: { value: 0, min: 0, max: 100 },
    scale: { value: 0.5, min: 0.01, max: 0.2 }
  });

  const [shader, update] = useMemo(() => {
    /* A bunch of input variables, by way of uniforms. */
    const continents = {
      offset: Uniform("float", "u_continents_offset"),
      scale: Uniform("float", "u_continents_scale")
    };

    const details = {
      offset: Uniform("float", "u_details_offset"),
      scale: Uniform("float", "u_details_scale")
    };

    const continentalNoise = Smoothstep(
      -0.3,
      0.3,
      Simplex3DNoise(
        Multiply(Add(VertexPosition, continents.offset), continents.scale)
      )
    );

    const detailsNoise = Smoothstep(
      0,
      0.7,
      Simplex3DNoise(
        Multiply(Add(VertexPosition, details.offset), details.scale)
      )
    );

    const waterNoise = Smoothstep(
      0,
      0.1,
      Simplex3DNoise(Multiply(Add(VertexPosition, Time), 0.13))
    );

    /* Calculate total height */
    const height = Add(Mul(continentalNoise, 0.1), Mul(detailsNoise, 0.1));

    /* Calculate water height (we're animating it!) */
    const waterHeight = Float(
      code`0.04 + sin(${Time} + ${VertexPosition}.y) * 0.004`
    );

    return compileShader(
      CustomShaderMaterialMaster({
        /* Scale the vertex according to height. */
        position: Mul(VertexPosition, Add(height, 1)),

        /* Determine the color based on height. */
        diffuseColor: Pipe(
          Vec3(new Color("#559")),
          ($) => Mix($, new Color("#448"), Step(0.04, waterNoise)),
          ($) => Mix($, new Color("#ed8"), Step(waterHeight, height)),
          ($) => Mix($, new Color("#080"), Step(0.06, height)),
          ($) => Mix($, new Color("#060"), Step(0.09, height)),
          ($) => Mix($, new Color("#aaa"), Step(0.1, height)),
          ($) => Mix($, new Color("#888"), Step(0.11, height)),
          ($) => Mix($, new Color("#fff"), Step(0.17, height)),

          /* Apply fresnel */
          ($) => Add($, Mul(new Color(1, 1, 1), Fresnel({ intensity: 0.5 })))
        )
      })
    );
  }, []);

  useFrame((_, dt) => update(dt));

  return (
    <mesh position-y={14}>
      <icosahedronGeometry args={[12, 24]} />
      <CustomShaderMaterial
        baseMaterial={MeshStandardMaterial}
        {...shader}
        uniforms={{
          ...shader.uniforms,
          u_continents_offset: { value: continents.offset },
          u_continents_scale: { value: continents.scale },
          u_details_offset: { value: details.offset },
          u_details_scale: { value: details.scale }
        }}
      />
    </mesh>
  );
}

export default function App() {
  const Footer = <strong>Chunky Little Planet</strong>;

  return (
    <R3FStage footer={Footer}>
      <Thingy />
    </R3FStage>
  );
}
