import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI, getSocialAuthUrl } from '../services/api';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Link, Unlink, Instagram, Youtube, Facebook, Twitter, Linkedin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/* ---------- Icon SVGs for networks not present / official logos ---------- */

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M33.5 12.5c0 4.69 3.81 8.5 8.5 8.5v3.5a12 12 0 01-12-12V12.5h3.5z" fill="#00F2EA" />
    <path d="M29 8h3.5v20.5A8.5 8.5 0 1124 20v3.5A11.5 11.5 0 1032.5 35H29V8z" fill="#FF004F" />
    <path d="M29 8h3.5v12.5A6 6 0 1124 20v3.5A9.5 9.5 0 0029 8z" fill="#010101" />
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M5 4L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 4L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ----------------------------------------------------------------------- */

const SUPPORTED_NETWORKS = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', bg: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', desc: 'Posts, Reels, Stories' },
  { id: 'tiktok', name: 'TikTok', color: '#000', bg: '#000', desc: 'Videos y Shorts' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', bg: '#FF0000', desc: 'Videos y Shorts' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', bg: '#1877F2', desc: 'Posts y Videos' },
  { id: 'twitter', name: 'X (Twitter)', color: '#000', bg: '#000', desc: 'Tweets y videos' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', bg: '#0A66C2', desc: 'Posts profesionales' },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [showIPHelper, setShowIPHelper] = useState(false);

  const connectedIds = user?.connectedNetworks?.map(n => n.network) || [];

  const disconnectMutation = useMutation({
    mutationFn: (network: string) => authAPI.disconnectNetwork(network),
    onSuccess: () => { refreshUser(); toast.success('Red social desconectada'); },
    onError: () => toast.error('Error al desconectar'),
  });

  const handleConnect = (networkId: string) => {
    window.location.href = getSocialAuthUrl(networkId);
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const renderNetworkIcon = (networkId: string) => {
    // Usamos lucide-react cuando existe y SVGs oficiales cuando hace falta
    switch (networkId) {
      case 'instagram':
        return <Instagram size={18} color="#ffffff" />;
      case 'tiktok':
        return <TikTokIcon size={18} />;
      case 'youtube':
        return <Youtube size={18} color="#ffffff" />;
      case 'facebook':
        return <Facebook size={18} color="#ffffff" />;
      case 'twitter':
        // usamos el icono de Twitter (lucide) como sustituto visual de X
        return <Twitter size={18} color="#ffffff" />;
      case 'linkedin':
        return <Linkedin size={18} color="#ffffff" />;
      default:
        return <div style={{ width: 18, height: 18 }} />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Configuración</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Conectá tus redes sociales y gestioná tu cuenta</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Mi perfil</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{user?.name?.[0]}</span>
            </div>
          )}
          <div>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>{user?.name}</p>
            <p style={{ fontSize: 14, color: '#64748b' }}>{user?.email}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Cuenta Google</p>
          </div>
        </div>
      </motion.div>

      {/* Networks */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Redes sociales conectadas</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Conectá cada red para poder publicar contenido. Cada red requiere autenticarse en su plataforma.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {SUPPORTED_NETWORKS.map((network, i) => {
            const connected = connectedIds.includes(network.id as any);
            const connInfo = user?.connectedNetworks?.find(n => n.network === network.id);

            return (
              <motion.div key={network.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                style={{
                  borderRadius: 12, border: `1.5px solid ${connected ? network.color + '30' : '#f1f5f9'}`,
                  padding: '14px 16px', background: connected ? `${network.color}05` : '#fafafa',
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: network.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff',
                    overflow: 'hidden'
                  }}>
                    {renderNetworkIcon(network.id)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{network.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{network.desc}</p>
                  </div>
                  {connected && <CheckCircle2 size={18} color="#10b981" />}
                </div>

                {connected && connInfo ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {connInfo.avatar && <img src={connInfo.avatar} alt={connInfo.username} style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>@{connInfo.username}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
                      Conectado {format(parseISO(connInfo.connectedAt), "d MMM yyyy", { locale: es })}
                    </p>
                    <button onClick={() => disconnectMutation.mutate(network.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                      <Unlink size={11} />Desconectar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleConnect(network.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px', borderRadius: 8, border: `1.5px solid ${network.color}`,
                      background: '#fff', color: network.color, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${network.color}10`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                    <Link size={13} />
                    Conectar {network.name}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* IP Helper */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Acceso desde red local</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Configuración para usar Google OAuth desde otros dispositivos</p>
          </div>
          <button onClick={() => setShowIPHelper(!showIPHelper)} style={{ fontSize: 12, color: '#6366f1', background: '#eef2ff', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            {showIPHelper ? 'Ocultar' : 'Ver instrucciones'}
          </button>
        </div>

        {showIPHelper && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 16 }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 13, color: '#475569', marginBottom: 10, fontWeight: 500 }}>
                Para usar Google OAuth con tu IP local, seguí estos pasos:
              </p>
              <ol style={{ fontSize: 12, color: '#64748b', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.6 }}>
                <li>Obtené tu IP local: ejecutá <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>ipconfig</code> (Win) o <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>ifconfig</code> (Mac/Linux)</li>
                <li>Tu URL nip.io sería: <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>http://TU_IP.nip.io:3000</code></li>
                <li>Agregá esa URL en <strong>Google Cloud Console → Credentials → OAuth Client → Authorized JavaScript origins</strong></li>
                <li>También agregá <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>http://TU_IP.nip.io:5000/api/auth/google/callback</code> en Authorized redirect URIs</li>
                <li>Actualizá las variables de entorno en el .env del backend y frontend</li>
              </ol>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                <p style={{ fontSize: 11, color: '#92400e' }}>
                  💡 <strong>Ejemplo:</strong> Si tu IP es 192.168.1.100, usá:<br />
                  Frontend: <code>http://192.168.1.100.nip.io:3000</code><br />
                  Backend: <code>http://192.168.1.100.nip.io:5000</code>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ background: '#f0fdf4', borderRadius: 16, padding: 20, border: '1px solid #bbf7d0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>📋 Información del sistema</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 12, color: '#166534' }}>Backend URL: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>{API_URL}</code></p>
          <p style={{ fontSize: 12, color: '#166534' }}>Redes conectadas: <strong>{connectedIds.length}</strong></p>
          <p style={{ fontSize: 12, color: '#166534' }}>Almacenamiento: Cloudinary (solo publicaciones programadas)</p>
        </div>
      </motion.div>
    </div>
  );
}