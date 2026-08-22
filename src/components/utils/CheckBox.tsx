interface Props {
  message: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CheckBox({ message, onChange }: Props) {
  return (
    <div className="flex flex-row ">
      <input type="checkbox" onChange={onChange} />
      <p className="pl-4 dark:text-white">{message}</p>
    </div>
  );
}

export default CheckBox;
