import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
export default function Reports() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Medicine usage and pharmacy preparation overview."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <WorkspaceCard title="Medicine Usage">
          <div className="flex h-44 items-end gap-3">
            {[45, 62, 35, 78, 58, 88, 68].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[#168c9b]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#7b8497]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Average Preparation Time">
          <div className="grid place-items-center py-7">
            <div className="grid h-36 w-36 place-items-center rounded-full border-[18px] border-[#168c9b]/20 text-center">
              <div>
                <b className="text-3xl text-[#101a3d]">30</b>
                <p className="text-xs text-[#7b8497]">minutes</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-[#7b8497]">
              Target pharmacy preparation time
            </p>
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
