import React from "react";
import IndexNumber from "./IndexNumber";

interface Props {
  qntPages: number;
  itemOn: number;
  onClick: () => void;
}

function Index({ qntPages, itemOn, onClick }: Props) {
  return (
    <div className="flex gap-4 items-center justify-between w-full my-4">
      {Array.from({ length: qntPages }, (_, i) => (
        <React.Fragment key={i}>
          <IndexNumber
            index={String(i + 1)}
            atived={itemOn === i + 1}
            onClick={onClick}
          />

          {i + 1 < qntPages && (
              <hr className="flex-1 border-t border-gray-400 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Index;
