import { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";

const adminSeedUsers = [
  { id: "U-101", name: "Aarav Singh", role: "Donor", status: "Active", donations: 18 },
  { id: "U-208", name: "Sunrise Foundation", role: "NGO", status: "Pending Verification", donations: 0 },
  { id: "U-349", name: "Maya Patel", role: "Donor", status: "Active", donations: 9 },
  { id: "U-411", name: "Green Future NGO", role: "NGO", status: "Flagged", donations: 0 },
];

const ngoRequests = [
  { ngo: "Sunrise Foundation", submitted: "2 hours ago", docs: "KYC + Bank + PAN" },
  { ngo: "HopeBridge Trust", submitted: "5 hours ago", docs: "KYC + Tax Certificate" },
  { ngo: "EcoLife Movement", submitted: "Yesterday", docs: "KYC + NGO Registration" },
];

const fraudAlerts = [
  { id: "F-19", severity: "High", detail: "Repeated high-value donations from new accounts", campaign: "Emergency Health Drive" },
  { id: "F-23", severity: "Medium", detail: "Suspicious IP switching within 10 minutes", campaign: "School Supplies Fund" },
  { id: "F-31", severity: "Low", detail: "Multiple failed OTP verifications", campaign: "General Platform" },
];

const Admin = () => {
  const [search, setSearch] = useState("");

  const users = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return adminSeedUsers;
    return adminSeedUsers.filter((user) =>
      `${user.name} ${user.role} ${user.status}`.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div className="space-y-8">
      <section className="glass-card p-6 sm:p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-300">Admin Mission Control</p>
        <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">Platform intelligence, compliance, and safety in one place.</h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300">Monitor user growth, verify NGOs, investigate suspicious patterns, and track platform health in real time.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatWidget label="Total Users" value="28,420" trend="+8.2%" />
        <StatWidget label="Verified NGOs" value="118" trend="+5 this week" />
        <StatWidget label="Fraud Alerts" value="14" trend="-2 today" />
        <StatWidget label="Live Donations / min" value="37" trend="Real-time" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card p-5">
          <SectionHeading title="User Management" subtitle="Search and review donor + NGO account status." />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users, role, status"
            className="focus-ring mb-4 w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-100"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Donations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 text-slate-200">
                    <td className="py-3">{user.id}</td>
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${badgeClass(user.status)}`}>{user.status}</span>
                    </td>
                    <td className="py-3">{user.donations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">NGO Verification Requests</h3>
            <ul className="space-y-3 text-sm">
              {ngoRequests.map((request) => (
                <li key={request.ngo} className="rounded-xl bg-white/5 p-3">
                  <p className="font-semibold text-slate-100">{request.ngo}</p>
                  <p className="text-slate-400">Submitted {request.submitted}</p>
                  <p className="text-cyan-200">{request.docs}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30">Approve</button>
                    <button type="button" className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs text-rose-200 hover:bg-rose-500/30">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">Real-Time Monitoring</h3>
            <div className="space-y-3 text-sm">
              <MonitorRow label="API Latency" value="142ms" status="good" />
              <MonitorRow label="Payment Success Rate" value="97.9%" status="good" />
              <MonitorRow label="OTP Delivery Rate" value="94.2%" status="warning" />
              <MonitorRow label="Chatbot Availability" value="99.1%" status="good" />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Fraud Detection Alerts</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {fraudAlerts.map((alert) => (
            <Motion.div key={alert.id} className="rounded-xl border border-white/15 bg-white/5 p-4" whileHover={{ y: -4 }}>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{alert.id}</p>
              <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs ${severityClass(alert.severity)}`}>{alert.severity}</p>
              <p className="mt-3 text-sm text-slate-200">{alert.detail}</p>
              <p className="mt-2 text-xs text-cyan-200">Campaign: {alert.campaign}</p>
            </Motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatWidget = ({ label, value, trend }) => (
  <Motion.div className="glass-card p-4" whileHover={{ y: -4 }}>
    <p className="text-sm text-slate-300">{label}</p>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    <p className="mt-1 text-xs text-emerald-300">{trend}</p>
  </Motion.div>
);

const MonitorRow = ({ label, value, status }) => (
  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
    <p className="text-slate-300">{label}</p>
    <span className={`rounded-full px-2 py-1 text-xs ${status === "good" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>
      {value}
    </span>
  </div>
);

function badgeClass(status) {
  if (status.includes("Pending")) return "bg-amber-500/20 text-amber-200";
  if (status.includes("Flagged")) return "bg-rose-500/20 text-rose-200";
  return "bg-emerald-500/20 text-emerald-200";
}

function severityClass(severity) {
  if (severity === "High") return "bg-rose-500/20 text-rose-200";
  if (severity === "Medium") return "bg-amber-500/20 text-amber-200";
  return "bg-emerald-500/20 text-emerald-200";
}

export default Admin;
