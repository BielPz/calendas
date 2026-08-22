interface Props {
  index: string;
  atived?: boolean;
  onClick: () => void;
}

function IndexNumber({ index, atived, onClick }: Props) {
  return (
    <>
      <div
        className={`w-20 h-20 rounded-full border flex items-center justify-center font-bold text-4xl transition ${
          atived
            ? "bg-linear-to-br from-orange-500 to-violet-600 text-white"
            : "border-gray-400 dark:border-zinc-400 text-gray-600 dark:text-gray-400 hover:bg-gray-200 cursor-pointer"
        }`}
        onClick={onClick}
      >
        <h2>{index}</h2>
      </div>
    </>
  );
}

export default IndexNumber;
