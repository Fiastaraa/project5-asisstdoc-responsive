import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
export default function Notifications() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Workflow notifications for pharmacy operations."
      />
      <WorkspaceCard title="Notifications" subtitle="Today">
        <div className="space-y-3">
          <div className="flex gap-3 rounded-xl border border-[#cde9ed] bg-[#f1fbfc] p-4">
            <Bell className="mt-1 text-[#168c9b]" size={18} />
            <div>
              <b>Prescription ready to prepare</b>
              <p className="text-sm text-[#596274]">
                New prescription has arrived from Doctor.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[#f1d9d5] bg-[#fff4f1] p-4">
            <AlertTriangle className="mt-1 text-[#a13e34]" size={18} />
            <div>
              <b>Low stock alert</b>
              <p className="text-sm text-[#596274]">
                Review medicines with low inventory.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[#d7ebdf] bg-[#f2fbf5] p-4">
            <CheckCircle2 className="mt-1 text-[#21704b]" size={18} />
            <div>
              <b>Preparation completed</b>
              <p className="text-sm text-[#596274]">
                Prepared medicine will trigger invoice workflow.
              </p>
            </div>
          </div>
        </div>
      </WorkspaceCard>
    </>
  );
}
