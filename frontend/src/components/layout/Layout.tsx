import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, PlusSquare, FileText, Calendar,
  Settings, LogOut, Menu, Layers
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/create', icon: PlusSquare, label: 'Nueva publicación' },
  { to: '/posts', icon: FileText, label: 'Publicaciones' },
  { to: '/scheduled', icon: Calendar, label: 'Programadas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}>
            <Layers size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: "'Instrument Serif', serif" }}>
            SocialFlow
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#6366f1' : '#64748b',
              background: isActive ? '#eef2ff' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, background: '#f8fafc',
          marginBottom: 8,
        }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name?.[0]}</span>
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#94a3b8', fontSize: 13,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'var(--sidebar-w)', background: '#fff',
        borderRight: '1px solid #f1f5f9', zIndex: 100,
        display: 'none',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar (visible) */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 260, background: '#fff',
        borderRight: '1px solid #f1f5f9', zIndex: 100,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}>
                <Layers size={18} color="white" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: "'Instrument Serif', serif" }}>
                SocialFlow
              </span>
            </div>
          </div>
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#6366f1' : '#64748b',
                  background: isActive ? '#eef2ff' : 'transparent',
                  transition: 'all 0.15s',
                })}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', marginBottom: 8 }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name?.[0]}</span>
                </div>
              )}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="main-content" style={{ minHeight: '100vh' }}>
        {/* Mobile header */}
        <div style={{
          display: 'none', position: 'sticky', top: 0, zIndex: 50,
          background: '#fff', borderBottom: '1px solid #f1f5f9',
          padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between',
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
              <Menu size={20} color="#64748b" />
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Instrument Serif', serif" }}>SocialFlow</span>
          </div>
        </div>

        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-left: 0 !important; }
          .main-content > div { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
