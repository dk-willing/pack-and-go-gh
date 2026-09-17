import Image from "next/image";

export default function Map() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Image
        src="/assets/ghana_map.svg"
        alt="Ghana logistics route map"
        className="w-full h-auto"
        width={100}
        height={100}
      />
    </div>
  );
}
