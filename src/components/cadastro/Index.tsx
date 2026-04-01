import React from "react";
import IndexNumber from "./IndexNumber";

interface Props {
  qntPages: number;
  itemOn: string;
}

function Index({ qntPages, itemOn }: Props) {
  return (
    <div className="grid grid-cols-5 gap-4 justify-items-center my-4">
      {Array.from({ length: qntPages }, (_, i) => (
        <React.Fragment key={i}>
          <IndexNumber
            index={String(i + 1)}
            atived={itemOn === String(i + 1)}
          />

          {i + 1 < qntPages && (
            <span className="text-gray-700 justify-self-center text-6xl">
              -
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Index;
