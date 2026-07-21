import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - HSE Hub Admin",
  description: "Administrative dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Welcome to the administration panel.</p>
      </div>
    </div>
  );
}
