const SectionCard: React.FC<{
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, right, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-4">
      <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900">
        {title}
      </h3>
      {right}
    </div>
    <div className="text-sm text-gray-700">{children}</div>
  </section>
);
export default SectionCard;
