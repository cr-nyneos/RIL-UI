export interface KpiItem {
  title: string;
  value: string | number;
}

export interface KpiGroup {
  header: string;
  data: KpiItem[];
}

export default function KpiGroupCard({ group }: { group: KpiGroup }) {
  return (
    <div className="tsy-kpi-card space-y-2 p-6">
      <h3 className="tsy-card-title mb-4">{group.header}</h3>

      {group.data.map((item) => (
        <div
          key={item.title}
          className="tsy-kpi-row flex justify-between gap-6 text-[20px] font-semibold"
        >
          <span>{item.title}</span>
          <span
            className={`text-[20px] font-semibold ${Number(item.value) < 0 ? 'tsy-negative' : 'tsy-title'}`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
