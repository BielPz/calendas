import { useState } from "react";

interface Props {
  index: string;
  atived?: boolean;
}

function IndexNumber({ index, atived }: Props) {
  //const [fase, setFase] = useState(1);

  return (
    <>
      <div
        className={`w-20 h-20 rounded-full border flex items-center justify-center font-bold text-4xl transition ${
          atived
            ? "bg-gradient-to-br from-orange-400 to-purple-400 text-white"
            : "border-gray-400 text-gray-600 hover:bg-gray-200 cursor-pointer"
        }`}
      >
        <h2>{index}</h2>
      </div>
    </>
  );
}

export default IndexNumber;
