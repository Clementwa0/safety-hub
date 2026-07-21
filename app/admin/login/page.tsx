import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - HSE Hub",
  description: "Administrative login page",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        <h1 className="mt-2 text-sm text-slate-600">Use your administrator credentials to continue.</h1>
      </div>
    </div>
  );
}
