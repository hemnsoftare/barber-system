interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="relative w-full flex items-center justify-center  pb-8">
      {/* Angled burgundy section */}
      <div
        className="absolute -left-24 top-2 h-[67px] bg-dark-purple"
        style={{
          width: "348px",
          clipPath: "polygon(0 0, 85% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center pls-[257spx] w-full">
        <h1 className="text-4xl uppercase md:text-[96px] font-[600] text-dark-purple tracking-wide">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default SectionTitle;
