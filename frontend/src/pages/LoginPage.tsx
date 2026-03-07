import React from 'react';
import { motion } from 'framer-motion';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0f9ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', fontFamily: "'Instrument Serif', serif" }}>
            SocialFlow
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Gestiona todas tus redes sociales desde un solo lugar
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#0f172a' }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
            Inicia sesión para continuar
          </p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            style={{
              width: '100%', padding: '14px 20px',
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12, cursor: 'pointer',
              fontSize: 15, fontWeight: 500, color: '#1e293b',
              transition: 'all 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
              <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
              <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            Continuar con Google
          </motion.button>

          <div style={{ textAlign: 'center', marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              Una vez dentro, podrás conectar Instagram, TikTok, YouTube, Facebook y más
            </p>
          </div>
        </div>

        {/* Networks preview */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
          {[
            { name: 'Instagram', bg: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
            { name: 'TikTok', bg: '#000' },
            { name: 'YouTube', bg: '#FF0000' },
            { name: 'Facebook', bg: '#1877F2' },
          ].map(net => (
            <div key={net.name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', borderRadius: 8, padding: '6px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: net.bg }} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{net.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
