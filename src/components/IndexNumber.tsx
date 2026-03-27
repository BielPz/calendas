interface Props {
  index: string;
  atived?: boolean;
}

function IndexNumber({ index, atived }: Props) {
  return (
    <>
      <div
        className={
          atived ? "bg-gradient-to-br from-orange-400 to-purple-400" : ""
        }
      >
        <h2>{index}</h2>
      </div>
    </>
  );
}

export default IndexNumber;
