import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { Post, PostStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, FileText, Clock, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const statusLabel: Record<PostStatus, string> = {
  draft: 'Borrador', scheduled: 'Programada', publishing: 'Publicando', published: 'Publicada', failed: 'Fallida',
};
const statusColor: Record<PostStatus, string> = {
  draft: '#94a3b8', scheduled: '#f59e0b', publishing: '#6366f1', published: '#10b981', failed: '#ef4444',
};
const networkColors: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#000', youtube: '#FF0000', facebook: '#1877F2', twitter: '#1DA1F2', linkedin: '#0A66C2',
};

const filters: { value: string; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'published', label: 'Publicadas' },
  { value: 'scheduled', label: 'Programadas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'failed', label: 'Fallidas' },
];

export default function PostsPage() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', filter],
    queryFn: async () => (await postsAPI.getAll(filter !== 'all' ? { status: filter } : {})).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Publicación eliminada'); },
    onError: () => toast.error('Error al eliminar'),
  });

  const posts: Post[] = data?.posts || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Publicaciones</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Historial de todas tus publicaciones</p>
        </div>
        <button onClick={() => navigate('/create')} style={{ padding: '10px 18px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          + Nueva publicación
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${filter === f.value ? '#6366f1' : '#e2e8f0'}`,
              background: filter === f.value ? '#eef2ff' : '#fff', color: filter === f.value ? '#6366f1' : '#64748b',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>{f.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="pulse" style={{ height: 140, borderRadius: 14, background: '#f1f5f9' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 6 }}>No hay publicaciones</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
            {filter !== 'all' ? 'Sin publicaciones en esta categoría' : 'Creá tu primera publicación'}
          </p>
          <button onClick={() => navigate('/create')} style={{ padding: '9px 18px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Crear publicación
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {posts.map((post, i) => (
            <motion.div key={post._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              {/* Media thumbnail */}
              <div style={{ height: 120, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                {post.mediaUrl ? (
                  post.mediaType === 'video' ? (
                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={28} color="#fff" />
                    </div>
                  ) : (
                    <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} color="#94a3b8" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: `${statusColor[post.status]}20`, color: statusColor[post.status], fontWeight: 600 }}>
                    {statusLabel[post.status]}
                  </span>
                </div>
              </div>

              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.globalText || post.title || 'Sin texto'}
                </p>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {post.networks.map(n => (
                    <span key={n.network} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${networkColors[n.network] || '#6366f1'}15`, color: networkColors[n.network] || '#6366f1', fontWeight: 600, textTransform: 'capitalize' }}>
                      {n.network}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {post.scheduledAt ? <><Clock size={11} />{format(parseISO(post.scheduledAt), "d MMM, HH:mm", { locale: es })}</> : format(parseISO(post.createdAt), "d MMM yyyy", { locale: es })}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => deleteMutation.mutate(post._id)}
                      style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: 4, transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
