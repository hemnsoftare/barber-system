interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="relative w-full  flex items-center justify-center  pb-8">
      {/* Angled burgundy section */}
      <div
        className="absolute -left-24 -top-1 lg:top-2 h-[32px] md:h-[67px] bg-dark-purple
             w-[170px] md:w-[260px] lg:w-[348px]"
        style={{
          clipPath: "polygon(0 0, 85% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 lg:top-3 flex items-center justify-center pl-[257spx] w-full">
        <h1 className="text-3xl uppercase  md:text-[66px] font-[600] text-dark-purple tracking-wide">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default SectionTitle;
