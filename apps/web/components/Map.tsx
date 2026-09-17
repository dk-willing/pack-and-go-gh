import Image from "next/image";
import GhanaMap from "../assets/ghana_map.svg";

export default function Map() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Image
        src={GhanaMap}
        alt="Ghana logistics route map"
        className="w-full h-auto"
      />
    </div>
  );
}
