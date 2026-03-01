import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Shield, ScanSearch, History, FileText, MessageSquare, ChevronLeft, ChevronRight, Mail, MessageSquareWarning, IndianRupee } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Shield, group: 'main' },
  { to: '/scan', label: 'File / URL Scan', icon: ScanSearch, group: 'main' },
  { to: '/email-scan', label: 'Email Scan', icon: Mail, group: 'fraud' },
  { to: '/sms-scan', label: 'SMS Scan', icon: MessageSquareWarning, group: 'fraud' },
  { to: '/upi-scan', label: 'UPI Scan', icon: IndianRupee, group: 'fraud' },
  { to: '/history', label: 'History', icon: History, group: 'tools' },
  { to: '/reports', label: 'Reports', icon: FileText, group: 'tools' },
  { to: '/assistant', label: 'Assistant', icon: MessageSquare, group: 'tools' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center cyber-glow-sm">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            Sentinel<span className="text-primary">X</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {['main', 'fraud', 'tools'].map(group => (
          <div key={group}>
            {!collapsed && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group === 'main' ? 'Analysis' : group === 'fraud' ? 'Fraud Detection' : 'Tools'}
              </p>
            )}
            {navItems.filter(item => item.group === group).map(item => {
              const isActive = location.pathname === item.to;
              return (
                <RouterNavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary cyber-glow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </RouterNavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
