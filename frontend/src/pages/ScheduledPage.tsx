import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import { format, parseISO, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar, Video, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const networkColors: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#000', youtube: '#FF0000', facebook: '#1877F2',
};

export default function ScheduledPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'scheduled'],
    queryFn: async () => (await postsAPI.getAll({ status: 'scheduled' })).data,
    refetchInterval: 30000,
  });

  const posts: Post[] = data?.posts || [];
  const upcoming = posts.filter(p => p.scheduledAt && isFuture(parseISO(p.scheduledAt)));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Publicaciones programadas</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Gestión de contenido programado para publicación automática</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="pulse" style={{ height: 80, borderRadius: 14, background: '#f1f5f9' }} />)}
        </div>
      ) : upcoming.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <Calendar size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Sin publicaciones programadas</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Programá contenido para publicarlo automáticamente</p>
          <button onClick={() => navigate('/create')} style={{ padding: '9px 18px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Programar publicación
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcoming.sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()).map((post, i) => (
            <motion.div key={post._id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {post.mediaType === 'video' ? <Video size={20} color="#6366f1" /> : <FileText size={20} color="#6366f1" />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.globalText || post.title || 'Sin texto'}
                </p>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {post.networks.map(n => (
                    <span key={n.network} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${networkColors[n.network] || '#6366f1'}15`, color: networkColors[n.network] || '#6366f1', fontWeight: 600, textTransform: 'capitalize' }}>
                      {n.network}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                  <Clock size={13} color="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>
                    {format(parseISO(post.scheduledAt!), "d MMM, HH:mm", { locale: es })}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {format(parseISO(post.scheduledAt!), "yyyy", { locale: es })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
