import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  UserCircle2,
  Users,
  ClipboardList,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Eye,
  HardHat,
  Camera,
  ImagePlus
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import lrtLogo from "../../imports/image-removebg-preview_(1).png";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "active-directory" | "provision" | "audit-logs";
type UserStatus = "active" | "inactive";

interface DirectoryUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  mobile: string;
  email: string;
  status: UserStatus;
  station?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  result: "success" | "warning" | "error";
}

// ─── Demo Data ───────────────────────────────────────────────────────────────
export const LRT2_STATIONS = [
  "Antipolo", "Marikina-Pasig", "Santolan", "Katipunan", "Anonas", 
  "Araneta Center-Cubao", "Betty Go-Belmonte", "J. Ruiz", "Gilmore", 
  "V. Mapa", "Pureza", "Legarda", "Recto"
];

const INITIAL_USERS: DirectoryUser[] = [];

const AUDIT_LOGS: AuditEntry[] = [];

const ROLES = ["All Roles", "Command Center Officer", "Ground Control Staff"];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ active, onToggle }: { readonly active: boolean; readonly onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative inline-flex items-center flex-shrink-0 focus:outline-none"
      style={{ width: 44, height: 24 }}
      aria-label={active ? "Deactivate" : "Activate"}
    >
      <span
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ background: active ? "#22C55E" : "#D1D5DB" }}
      />
      <span
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{
          left: active ? "calc(100% - 20px)" : "4px",
          transform: "none",
        }}
      />
    </button>
  );
}

// ─── Active Directory Tab ─────────────────────────────────────────────────────
function ActiveDirectoryTab({ users, setUsers }: { readonly users: DirectoryUser[], readonly setUsers: React.Dispatch<React.SetStateAction<DirectoryUser[]>> }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search);
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <div
        className="bg-white overflow-hidden mt-6"
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}
      >
        {/* Card Header */}
        <div
          className="flex flex-col gap-4 px-6 py-5 border-b"
          style={{ borderColor: "#F3F4F6" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                System User Directory
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2 }}>
                {filtered.length} user{filtered.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  style={{
                    paddingLeft: 34,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    color: "#111827",
                    background: "#F9FAFB",
                    outline: "none",
                    width: 220,
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4B0082";
                    e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Filter by Role Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleOpen((v) => !v)}
                  className="flex items-center gap-2"
                  style={{
                    padding: "8px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    color: "#374151",
                    background: "#F9FAFB",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {roleFilter}
                  <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
                </button>
                {roleOpen && (
                  <div
                    className="absolute right-0 z-20 mt-1 py-1 bg-white border border-gray-200"
                    style={{ borderRadius: 8, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
                  >
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { setRoleFilter(r); setRoleOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                        style={{
                          fontSize: "0.82rem",
                          color: roleFilter === r ? "#4B0082" : "#374151",
                          fontWeight: roleFilter === r ? 600 : 400,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Username", "System Role", "Mobile Number", "Account Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 20px",
                      textAlign: "left",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12"
                    style={{ color: "#9CA3AF", fontSize: "0.85rem" }}
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Username */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        color: "#1F2937",
                        fontWeight: 500,
                      }}
                    >
                      {user.username}
                    </span>
                  </td>

                  {/* System Role */}
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: user.role === "Command Center Officer" ? "#EDE9FE" : "#E0F2FE",
                        color: user.role === "Command Center Officer" ? "#4B0082" : "#0284C7",
                        boxShadow: user.role === "Ground Control Staff" ? "0 0 8px rgba(2, 132, 199, 0.25)" : "none",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {user.role === "Command Center Officer" ? <Shield size={11} /> : <HardHat size={11} />}
                      {user.role}
                    </span>
                  </td>

                  {/* Mobile Number */}
                  <td style={{ padding: "14px 20px", fontSize: "0.84rem", color: "#4B5563" }}>
                    {user.mobile}
                  </td>

                  {/* Account Status */}
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center">
                      <ToggleSwitch
                        active={user.status === "active"}
                        onToggle={() => toggleStatus(user.id)}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-1.5"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        cursor: "pointer",
                        border: "1px solid #E5E7EB",
                        background: "#FFFFFF",
                        color: "#374151",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        const b = e.currentTarget;
                        b.style.borderColor = "#4B0082";
                        b.style.color = "#4B0082";
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget;
                        b.style.borderColor = "#E5E7EB";
                        b.style.color = "#374151";
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}
        >
          <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
            Showing {filtered.length} of {users.length} accounts
          </span>
          <div className="flex items-center gap-1">
            <button
              style={{
                padding: "4px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: "0.78rem",
                color: "#9CA3AF",
                background: "#F3F4F6",
                cursor: "not-allowed",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Previous
            </button>
            <button
              style={{
                padding: "4px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: "0.78rem",
                color: "#374151",
                background: "#FFFFFF",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Expanded State / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Personnel Details</h3>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${selectedUser.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <ToggleSwitch
                    active={selectedUser.status === 'active'}
                    onToggle={() => toggleStatus(selectedUser.id)}
                  />
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-[#4B0082] overflow-hidden" style={{ background: "#F7F0FF" }}>
                  <UserCircle2 size={32} className="transition-opacity duration-200 group-hover:opacity-20" />
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10">
                    <Camera size={18} className="text-white mb-0.5" />
                    <span className="text-[0.55rem] font-semibold text-white uppercase tracking-wider">Photo</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm font-semibold text-[#4B0082] flex items-center gap-1.5 mt-1">
                    {selectedUser.role === "Command Center Officer" ? <Shield size={14} /> : <HardHat size={14} />}
                    {selectedUser.username} · {selectedUser.role}
                  </p>
                </div>
              </div>

              {/* Identity & Contact Details */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Identity & Contact Details</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">First Name</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.firstName}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Last Name</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.lastName}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Mobile Number</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.mobile}</span>
                  </div>
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Email Address</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* DSS Metrics */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Decision Support Metrics</h5>
                {selectedUser.role === "Command Center Officer" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-500">Predictions Reviewed</span>
                      <span className="text-xl font-bold text-[#4B0082]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-500">Alerts Processed</span>
                      <span className="text-xl font-bold text-[#4B0082]">0</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-500">Incident Reports Filed</span>
                      <span className="text-xl font-bold text-[#4B0082]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-500">Assigned Stations</span>
                      <span className="text-sm font-bold text-gray-900 mt-1">{selectedUser.station || "Unassigned"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Provision New Account Tab ────────────────────────────────────────────────
function ProvisionTab({ onAddUser, onSuccess, usersLength }: { readonly onAddUser: (u: DirectoryUser) => void, readonly onSuccess: () => void, readonly usersLength: number }) {
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    mobile: string;
    imagePreview: string | null;
  }>({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    mobile: "",
    imagePreview: null,
  });

  const handleChange = (field: string, value: string | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("imagePreview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic generation
  let rolePrefix = "";
  if (form.role === "Ground Control Staff") {
    rolePrefix = "GCS";
  } else if (form.role === "Command Center Officer") {
    rolePrefix = "CCO";
  }
  const autoUsername = React.useMemo(() => {
    if (!rolePrefix) return "";
    return `${rolePrefix}${String(usersLength + 10).padStart(4, '0')}`;
  }, [rolePrefix, usersLength]);

  const autoKey = React.useMemo(() => {
    if (!rolePrefix) return "";
    return `${rolePrefix}-${(Math.floor(Math.random() * 9000) + 1000).toString(16).toUpperCase()}`;
  }, [rolePrefix]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    onAddUser({
      id: Date.now().toString(),
      username: autoUsername,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      email: form.email,
      mobile: form.mobile,
      status: "active",
      station: form.role === "Ground Control Staff" ? LRT2_STATIONS[Math.floor(Math.random() * LRT2_STATIONS.length)] : undefined,
    });

    setForm({ firstName: "", lastName: "", role: "", email: "", mobile: "", imagePreview: null });
    onSuccess();
  };

  // Validation: Either valid email OR exactly 11 digits for mobile
  const hasValidContact = form.email.trim() !== "" || form.mobile.length === 11;
  const isMobileValid = form.mobile === "" || form.mobile.length === 11;

  const isValid = 
    form.firstName.trim() !== "" && 
    form.lastName.trim() !== "" && 
    form.role !== "" && 
    hasValidContact &&
    isMobileValid;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    fontSize: "0.84rem",
    color: "#111827",
    background: "#FAFAFA",
    fontFamily: "Inter, sans-serif",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <div
      className="bg-white mt-6"
      style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}
    >
      <div className="px-6 py-5 border-b" style={{ borderColor: "#F3F4F6" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
          Permission & Role Provisioning
        </h2>
        <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2 }}>
          Create a new system user and assign role-based access permissions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 grid grid-cols-2 gap-5">
        {/* Row 1 */}
        <div className="col-span-1">
          <label htmlFor="firstName" style={labelStyle}>First Name</label>
          <input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="e.g. Juan"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#4B0082"; e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="lastName" style={labelStyle}>Last Name</label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="e.g. Dela Cruz"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#4B0082"; e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Row 2 */}
        <div className="col-span-1">
          <label htmlFor="role" style={labelStyle}>System Role</label>
          <div className="relative">
            <select
              id="role"
              required
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
              onFocus={(e) => { e.target.style.borderColor = "#4B0082"; e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
            >
              <option value="">Select role…</option>
              <option value="Command Center Officer">Command Center Officer</option>
              <option value="Ground Control Staff">Ground Control Staff</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9CA3AF" }} />
          </div>
        </div>

        <div className="col-span-1">
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="user@lrta.gov.ph"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#4B0082"; e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Row 3 */}
        <div className="col-span-1">
          <label htmlFor="systemUsername" style={labelStyle}>System Username</label>
          <input
            id="systemUsername"
            readOnly
            value={autoUsername}
            placeholder="Auto-generated based on role"
            style={{ 
              ...inputStyle, 
              background: "#F3F4F6", 
              color: "#6B7280", 
              cursor: "not-allowed" 
            }}
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="mobile" style={labelStyle}>Mobile Number</label>
          <input
            id="mobile"
            type="tel"
            value={form.mobile}
            onChange={(e) => {
              const numbersOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
              handleChange("mobile", numbersOnly);
            }}
            placeholder="09123456789"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#4B0082"; e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Row 4 */}
        <div className="col-span-1">
          <div style={labelStyle}>Generated Security Key</div>
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px dashed #D1D5DB",
              borderRadius: 8,
              fontSize: "0.84rem",
              color: autoKey ? "#111827" : "#9CA3AF",
              background: "#F9FAFB",
              fontFamily: "monospace",
              fontWeight: 600,
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              height: "41px"
            }}
          >
            {autoKey || "Pending role selection..."}
          </div>
        </div>

        <div className="col-span-1">
          <div style={labelStyle}>Personnel Image (Optional)</div>
          <label
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed transition-colors relative overflow-hidden group"
            style={{
              height: "41px",
              borderColor: "#D1D5DB",
              background: "#FAFAFA",
              color: "#6B7280",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4B0082"; e.currentTarget.style.background = "#F7F0FF"; e.currentTarget.style.color = "#4B0082"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "#FAFAFA"; e.currentTarget.style.color = "#6B7280"; }}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
            {form.imagePreview ? (
              <>
                <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0 z-0" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                  <span className="text-white text-xs font-medium flex items-center gap-1.5"><Camera size={14} /> Edit</span>
                </div>
              </>
            ) : (
              <>
                <ImagePlus size={16} />
                <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Add Image</span>
              </>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm({ firstName: "", lastName: "", role: "", email: "", mobile: "", imagePreview: null })}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              fontSize: "0.84rem",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!isValid}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              fontSize: "0.84rem",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              border: "none",
              background: isValid ? "#4B0082" : "#D1D5DB",
              color: "#FFFFFF",
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: isValid ? "0 2px 8px rgba(75,0,130,0.30)" : "none",
              transition: "all 0.2s"
            }}
          >
            Provision Account
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Audit Logs Tab ───────────────────────────────────────────────────────────
function AuditLogsTab() {
  const resultConfig = {
    success: { icon: <CheckCircle2 size={14} />, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", label: "SUCCESS" },
    warning: { icon: <AlertTriangle size={14} />,  color: "#CA8A04", bg: "#FEFCE8", border: "#FDE68A", label: "WARNING" },
    error:   { icon: <XCircle size={14} />,        color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "ERROR" },
  };

  return (
    <div
      className="bg-white overflow-hidden mt-6"
      style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}
    >
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>System Audit Logs</h2>
          <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2 }}>
            Full chronological record of all IAM provisioning actions.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: "#EDE9FE", color: "#4B0082", fontSize: "0.72rem", fontWeight: 600 }}
        >
          {AUDIT_LOGS.length} entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Timestamp", "Actor", "Action", "Target", "Result"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "11px 20px",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map((entry, idx) => {
              const cfg = resultConfig[entry.result];
              return (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: idx < AUDIT_LOGS.length - 1 ? "1px solid #F3F4F6" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 20px", fontFamily: "monospace", fontSize: "0.78rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {entry.timestamp}
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: "0.84rem", fontWeight: 600, color: "#1F2937" }}>
                    {entry.actor}
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                        color: "#4B0082",
                        background: "#EDE9FE",
                        padding: "3px 9px",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: "0.84rem", color: "#4B5563" }}>
                    {entry.target}
                  </td>
                  <td style={{ padding: "13px 20px" }}>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── IAM Portal Page ──────────────────────────────────────────────────────────
export function IAMPortal() {
  const [users, setUsers] = useState<DirectoryUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<Tab>("active-directory");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddUser = (newUser: DirectoryUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleProvisionSuccess = () => {
    toast.success("Account successfully provisioned.");
    setActiveTab("active-directory");
  };

  // Add simple check to prevent direct access without login
  React.useEffect(() => {
    if (sessionStorage.getItem("isAuthenticated") !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "active-directory", label: "Global User Directory",          icon: <Users size={16} /> },
    { id: "provision",        label: "Permission & Role Provisioning", icon: <UserPlus size={16} /> },
    { id: "audit-logs",       label: "System Audit Logs",              icon: <ClipboardList size={16} /> },
  ];

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Toaster position="top-right" richColors />
      {/* ── Top Horizontal Navbar ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-8 py-4 shadow-md z-10"
        style={{ background: "#4B0082" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-[52px]">
            <img src={lrtLogo.src} alt="LRT-2 Logo" className="h-full w-auto object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col justify-center h-[52px]">
            <h1 className="text-white font-bold tracking-wide leading-tight" style={{ fontSize: "1.25rem", letterSpacing: "0.02em" }}>Identity & Access Management Portal</h1>
            <span style={{ color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 500, marginTop: "2px" }}>Provision System</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white transition-all duration-200"
          style={{ 
            border: "1px solid rgba(255,255,255,0.4)", 
            background: "transparent",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={16} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="px-6 py-8 flex-1 max-w-7xl mx-auto w-full flex flex-col">
          
          {/* ── Segmented Pill Navigation Tabs ── */}
          <div className="flex justify-center mb-2">
            <div 
              className="inline-flex p-1 rounded-full bg-gray-200/80 border border-gray-200 shadow-inner"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? "bg-white text-[#4B0082] shadow-lg shadow-purple-900/10 scale-[1.02]" 
                        : "text-[#4B0082]/60 hover:text-[#4B0082] hover:bg-white/60"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 transition-opacity duration-300">
            {activeTab === "active-directory" && <ActiveDirectoryTab users={users} setUsers={setUsers} />}
            {activeTab === "provision"        && <ProvisionTab onAddUser={handleAddUser} onSuccess={handleProvisionSuccess} usersLength={users.length} />}
            {activeTab === "audit-logs"       && <AuditLogsTab />}
          </div>
          
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to logout from this session? You will need to re-authenticate to access the portal.
              </p>
            </div>
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                style={{ cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem("isAuthenticated");
                  navigate("/");
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                style={{ cursor: "pointer" }}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
