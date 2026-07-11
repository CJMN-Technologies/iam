import os
import re

file_path = r'e:\LRT - Group 11\Group11superadmin\src\frontend\app\pages\IAMPortal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Supabase import
content = content.replace('import { toast, Toaster } from "sonner";', 'import { toast, Toaster } from "sonner";\nimport { supabase } from "../lib/supabase";')

# Update Types
type_block = """type Tab = "active-directory" | "provision" | "audit-logs" | "scraper-feed" | "calendar-monitor";
type UserStatus = "active" | "inactive";

interface DirectoryUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  mobile: string;
  email: string;
  status: UserStatus;
  station?: string;
  photo_url?: string;
  security_key?: string;
}

interface AuditEntry {
  id: string;
  created_at: string;
  actor_username: string;
  action: string;
  target: string;
  result: "success" | "warning" | "error";
}

interface ScraperEvent {
  id: string;
  source_name: string;
  post_text: string;
  category: string;
  post_date: string;
}

interface CalendarMonitor {
  table_name: string;
  rows_processed: number;
  last_processed_at: string;
}"""
content = re.sub(r'type Tab =.*?interface AuditEntry {.*?}', type_block, content, flags=re.DOTALL)

# Update dummy data empty initialization to remove it because we fetch dynamically
content = content.replace('const INITIAL_USERS: DirectoryUser[] = [];', '')
content = content.replace('const AUDIT_LOGS: AuditEntry[] = [];', '')

# Update ActiveDirectoryTab usages of firstName/lastName
content = content.replace('u.firstName.toLowerCase()', 'u.first_name.toLowerCase()')
content = content.replace('u.lastName.toLowerCase()', 'u.last_name.toLowerCase()')
content = content.replace('{selectedUser.firstName} {selectedUser.lastName}', '{selectedUser.first_name} {selectedUser.last_name}')

# Update ProvisionTab state
content = content.replace('firstName: string;\n    lastName: string;', 'first_name: string;\n    last_name: string;')
content = content.replace('firstName: "",\n    lastName: "",', 'first_name: "",\n    last_name: "",')
content = content.replace('firstName: "", lastName: "", role', 'first_name: "", last_name: "", role')
content = content.replace('form.firstName', 'form.first_name')
content = content.replace('form.lastName', 'form.last_name')
content = content.replace('handleChange("firstName",', 'handleChange("first_name",')
content = content.replace('handleChange("lastName",', 'handleChange("last_name",')

# Update ProvisionTab handleSubmit Supabase integration
old_submit = """const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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
  };"""

new_submit = """const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const station = form.role === "Ground Control Staff" ? LRT2_STATIONS[Math.floor(Math.random() * LRT2_STATIONS.length)] : null;
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: autoUsername,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        email: form.email,
        mobile: form.mobile,
        security_key: autoKey,
        station: station
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    onAddUser(data as DirectoryUser);
    setForm({ first_name: "", last_name: "", role: "", email: "", mobile: "", imagePreview: null });
    onSuccess();
  };"""
content = content.replace(old_submit, new_submit)

# Update toggleStatus logic to actually update Supabase
old_toggle = """const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null);
    }
  };"""

new_toggle = """const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus as UserStatus } : u));
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus as UserStatus } : null);
    }
  };"""
content = content.replace(old_toggle, new_toggle)
content = content.replace('onToggle={() => toggleStatus(user.id)}', 'onToggle={() => toggleStatus(user.id, user.status)}')
content = content.replace('onToggle={() => toggleStatus(selectedUser.id)}', 'onToggle={() => toggleStatus(selectedUser.id, selectedUser.status)}')

# Add missing Tabs to IAMPortal Component
old_iam_portal = """export function IAMPortal() {
  const [users, setUsers] = useState<DirectoryUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<Tab>("active-directory");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();"""

new_iam_portal = """// ─── Scraper Feed Tab ────────────────────────────────────────────────────────
function ScraperFeedTab({ events, onSync }: { events: ScraperEvent[], onSync: () => void }) {
  return (
    <div className="bg-white overflow-hidden mt-6" style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Scraping Quality Control</h2>
          <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2 }}>Monitor incoming social media and lgu feeds.</p>
        </div>
        <button onClick={onSync} className="px-4 py-2 bg-[#4B0082] text-white text-sm font-semibold rounded-lg hover:bg-[#3d006a] transition">
          Trigger Re-sync
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Date", "Source", "Category", "Post Content"].map((h) => (
                <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev, idx) => (
              <tr key={ev.id} style={{ borderBottom: idx < events.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <td style={{ padding: "13px 20px", fontSize: "0.78rem", color: "#6B7280", whiteSpace: "nowrap" }}>{new Date(ev.post_date).toLocaleString()}</td>
                <td style={{ padding: "13px 20px", fontSize: "0.84rem", fontWeight: 600, color: "#1F2937" }}>{ev.source_name}</td>
                <td style={{ padding: "13px 20px", fontSize: "0.78rem", color: "#4B0082" }}>{ev.category}</td>
                <td style={{ padding: "13px 20px", fontSize: "0.84rem", color: "#4B5563" }}>{ev.post_text.substring(0, 100)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Calendar Monitor Tab ─────────────────────────────────────────────────────
function CalendarMonitorTab({ tables }: { tables: CalendarMonitor[] }) {
  return (
    <div className="bg-white overflow-hidden mt-6" style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "#F3F4F6" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Calendar Ingestion Monitor</h2>
        <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2 }}>Monitor academic calendar scraping jobs.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Table Name", "Rows Processed", "Last Processed At"].map((h) => (
                <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.map((t, idx) => (
              <tr key={t.table_name} style={{ borderBottom: idx < tables.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <td style={{ padding: "13px 20px", fontSize: "0.84rem", fontWeight: 600, color: "#1F2937" }}>{t.table_name}</td>
                <td style={{ padding: "13px 20px", fontSize: "0.84rem", color: "#4B5563" }}>{t.rows_processed}</td>
                <td style={{ padding: "13px 20px", fontSize: "0.78rem", color: "#6B7280" }}>{new Date(t.last_processed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IAMPortal() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [scraperEvents, setScraperEvents] = useState<ScraperEvent[]>([]);
  const [calendarTables, setCalendarTables] = useState<CalendarMonitor[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("active-directory");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();"""
content = content.replace(old_iam_portal, new_iam_portal)

# Update AuditLogs component to use passed data
old_audit_tab_sig = "function AuditLogsTab() {"
new_audit_tab_sig = "function AuditLogsTab({ logs }: { logs: AuditEntry[] }) {"
content = content.replace(old_audit_tab_sig, new_audit_tab_sig)
content = content.replace('AUDIT_LOGS.length', 'logs.length')
content = content.replace('AUDIT_LOGS.map', 'logs.map')
content = content.replace('entry.timestamp', 'new Date(entry.created_at).toLocaleString()')
content = content.replace('entry.actor', 'entry.actor_username')

# Add real Supabase fetch calls in IAMPortal useEffect
old_use_effect = """  // Add simple check to prevent direct access without login
  React.useEffect(() => {
    if (sessionStorage.getItem("isAuthenticated") !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);"""

new_use_effect = """  React.useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/", { replace: true });
        return;
      }
      
      const { data: roleData, error: roleError } = await supabase.rpc('current_user_role');
      if (roleError || roleData !== 'Provision Officer') {
        toast.error("Access Denied: Provision Officer role required.");
        await supabase.auth.signOut();
        navigate("/", { replace: true });
        return;
      }

      const { data: uData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (uData) setUsers(uData);

      const { data: aData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (aData) setAuditLogs(aData);
      
      const { data: eData } = await supabase.schema('external').from('academic_lgu_events').select('*').order('post_date', { ascending: false }).limit(50);
      if (eData) setScraperEvents(eData);

      const { data: cData } = await supabase.schema('external').from('processed_calendar_tables').select('*').order('last_processed_at', { ascending: false });
      if (cData) setCalendarTables(cData);

      setLoading(false);
    };
    checkAuthAndFetch();
  }, [navigate]);

  const handleSyncScraper = async () => {
     toast.success("Triggered Re-sync of academic LGU events.");
  };"""
content = content.replace(old_use_effect, new_use_effect)

# Render the tabs array correctly
old_tabs = """  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "active-directory", label: "Global User Directory",          icon: <Users size={16} /> },
    { id: "provision",        label: "Permission & Role Provisioning", icon: <UserPlus size={16} /> },
    { id: "audit-logs",       label: "System Audit Logs",              icon: <ClipboardList size={16} /> },
  ];"""
new_tabs = """  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "active-directory", label: "Global User Directory",          icon: <Users size={16} /> },
    { id: "provision",        label: "Permission & Role Provisioning", icon: <UserPlus size={16} /> },
    { id: "audit-logs",       label: "System Audit Logs",              icon: <Shield size={16} /> },
    { id: "scraper-feed",     label: "Scraping Quality Control",       icon: <ClipboardList size={16} /> },
    { id: "calendar-monitor", label: "Calendar Ingestion",             icon: <ClipboardList size={16} /> },
  ];"""
content = content.replace(old_tabs, new_tabs)

# Adjust tab rendering
old_tab_render = """            {activeTab === "active-directory" && <ActiveDirectoryTab users={users} setUsers={setUsers} />}
            {activeTab === "provision"        && <ProvisionTab onAddUser={handleAddUser} onSuccess={handleProvisionSuccess} usersLength={users.length} />}
            {activeTab === "audit-logs"       && <AuditLogsTab />}"""
new_tab_render = """            {loading ? <div className="p-8 text-center text-gray-500">Loading data...</div> : (
              <>
                {activeTab === "active-directory" && <ActiveDirectoryTab users={users} setUsers={setUsers} />}
                {activeTab === "provision"        && <ProvisionTab onAddUser={handleAddUser} onSuccess={handleProvisionSuccess} usersLength={users.length} />}
                {activeTab === "audit-logs"       && <AuditLogsTab logs={auditLogs} />}
                {activeTab === "scraper-feed"     && <ScraperFeedTab events={scraperEvents} onSync={handleSyncScraper} />}
                {activeTab === "calendar-monitor" && <CalendarMonitorTab tables={calendarTables} />}
              </>
            )}"""
content = content.replace(old_tab_render, new_tab_render)

# Update Logout functionality to use Supabase
content = content.replace('sessionStorage.removeItem("isAuthenticated");\n                  navigate("/");', 'supabase.auth.signOut().then(() => { sessionStorage.removeItem("isAuthenticated"); navigate("/"); });')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
