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
    <div className="tsy-kpi-card p-6">
      <p className="tsy-card-title">{group.header}</p>

      <div className="tsy-kpi-row mt-2 flex justify-between gap-6">
        {group.data.map((item) => (
          <div key={item.title}>
            <div
              className={`text-[28px] font-semibold ${Number(item.value) < 0 ? 'tsy-negative' : 'tsy-title'}`}
            >
              {item.value}
            </div>
            <div className="text-sm">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
