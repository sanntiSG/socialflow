import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusSquare, Clock, CheckCircle2, XCircle, FileText, TrendingUp, Video, Image } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardStats, Post } from '../types';

const networkColors: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#000', youtube: '#FF0000',
  facebook: '#1877F2', twitter: '#1DA1F2', linkedin: '#0A66C2',
};

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', gap: 16,
    }}
  >
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</p>
    </div>
  </motion.div>
);

const statusLabel: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programada', publishing: 'Publicando', published: 'Publicada', failed: 'Fallida',
};
const statusColor: Record<string, string> = {
  draft: '#94a3b8', scheduled: '#f59e0b', publishing: '#6366f1', published: '#10b981', failed: '#ef4444',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => (await statsAPI.getDashboard()).data,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Aquí está el resumen de tu actividad</p>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pulse" style={{ height: 96, borderRadius: 16, background: '#f1f5f9' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon={FileText} label="Total publicaciones" value={data?.stats.total || 0} color="#6366f1" delay={0} />
            <StatCard icon={CheckCircle2} label="Publicadas" value={data?.stats.published || 0} color="#10b981" delay={0.05} />
            <StatCard icon={Clock} label="Programadas" value={data?.stats.scheduled || 0} color="#f59e0b" delay={0.1} />
            <StatCard icon={XCircle} label="Fallidas" value={data?.stats.failed || 0} color="#ef4444" delay={0.15} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <TrendingUp size={18} color="#6366f1" />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Publicaciones (últimos 30 días)</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data?.postsByDay || []}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* By network */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Por red social</h3>
              {data?.byNetwork?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.byNetwork.map((n: any) => (
                    <div key={n._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: networkColors[n._id] || '#6366f1', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#64748b', flex: 1, textTransform: 'capitalize' }}>{n._id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{n.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingTop: 16 }}>Sin datos aún</p>
              )}
            </motion.div>
          </div>

          {/* Recent posts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: 28 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Publicaciones recientes</h3>
              <button onClick={() => navigate('/posts')} style={{ fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Ver todas</button>
            </div>
            {data?.recent?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recent.map((post: Post) => (
                  <div key={post._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6366f1' }}>
                      {post.mediaType === 'video' ? <Video size={18} /> : post.mediaType === 'image' ? <Image size={18} /> : <FileText size={18} />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.globalText || post.title || 'Sin título'}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>
                        {format(parseISO(post.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {post.networks.slice(0, 3).map((n: any) => (
                        <span key={n.network} style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500, textTransform: 'capitalize',
                          background: `${networkColors[n.network] || '#6366f1'}15`,
                          color: networkColors[n.network] || '#6366f1',
                        }}>{n.network}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: `${statusColor[post.status]}15`, color: statusColor[post.status], fontWeight: 500, flexShrink: 0 }}>
                      {statusLabel[post.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>No hay publicaciones aún</p>
                <button onClick={() => navigate('/create')} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  Crear primera publicación
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick action */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            onClick={() => navigate('/create')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 16, padding: '20px 24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'transform 0.2s',
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusSquare size={22} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>Crear nueva publicación</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Publica en todas tus redes de una vez</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
