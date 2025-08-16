const Badge: React.FC<{
  label: string;
  color?: "orange" | "green" | "blue" | "yellow" | "red";
}> = ({ label, color = "gray" }) => {
  const colors: Record<typeof color, string> = {
    gray: "bg-gray-500 shadow-gray-500/50      text-white shadow-sm   ",
    green: "bg-green-500 shadow-green-500/50    text-white shadow-sm   ",
    blue: "bg-blue-500 shadow-blue-500/50     text-white  shadow-sm  ",
    yellow: "bg-yellow-500 shadow-yellow-500/50 text-white  shadow-sm  ",
    red: "bg-red-500 shadow-red-500/50       text-white  shadow-sm  ",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-5 py-1 text-[11px] sm:text-xs font-semibold  ${colors[color]}`}
    >
      {label}
    </span>
  );
};
export default Badge;
