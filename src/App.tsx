import "@react-three/fiber";
import { R3FStage } from "r3f-stage";
import "r3f-stage/styles.css";
import { Atmosphere } from "./Atmosphere";
import { Planet } from "./Planet";

export default function App() {
  const Footer = <strong>Chunky Little Planet</strong>;

  return (
    <R3FStage footer={Footer}>
      <Planet />
      <Atmosphere />
    </R3FStage>
  );
}
