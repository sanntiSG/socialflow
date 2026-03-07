import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import NetworkPreview from '../components/preview/NetworkPreview';
import { NetworkType, MediaType, PrivacyType } from '../types';
import toast from 'react-hot-toast';
import {
  Upload, X, Image, Video, Send, ChevronDown, ChevronUp,
  Globe, Lock, Users, Eye, Hash, AlertCircle
} from 'lucide-react';

const NETWORKS: { id: NetworkType; name: string; color: string; emoji: string }[] = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', emoji: '📸' },
  { id: 'tiktok', name: 'TikTok', color: '#000', emoji: '🎵' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', emoji: '▶️' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', emoji: '👥' },
];

interface NetworkConfig {
  enabled: boolean;
  text: string;
  hashtags: string;
  privacy: PrivacyType;
  scheduleOverride?: string;
}

const defaultNetworkConfig = (): NetworkConfig => ({
  enabled: false, text: '', hashtags: '', privacy: 'public', scheduleOverride: undefined,
});

const privacyOptions: { value: PrivacyType; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: 'Público', icon: <Globe size={13} /> },
  { value: 'friends', label: 'Amigos', icon: <Users size={13} /> },
  { value: 'private', label: 'Privado', icon: <Lock size={13} /> },
  { value: 'unlisted', label: 'No listado', icon: <Eye size={13} /> },
];

export default function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [globalText, setGlobalText] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [publishNow, setPublishNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNetwork, setExpandedNetwork] = useState<NetworkType | null>(null);
  const [networkConfigs, setNetworkConfigs] = useState<Record<NetworkType, NetworkConfig>>({
    instagram: defaultNetworkConfig(),
    tiktok: defaultNetworkConfig(),
    youtube: defaultNetworkConfig(),
    facebook: defaultNetworkConfig(),
    twitter: defaultNetworkConfig(),
    linkedin: defaultNetworkConfig(),
  });

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
    if (file.type.startsWith('video/')) setMediaType('video');
    else if (file.type === 'image/gif') setMediaType('gif');
    else setMediaType('image');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1,
  });

  const toggleNetwork = (id: NetworkType) => {
    setNetworkConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const updateNetworkConfig = (id: NetworkType, updates: Partial<NetworkConfig>) => {
    setNetworkConfigs(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };

  const selectedNetworks = NETWORKS.filter(n => networkConfigs[n.id]?.enabled);
  const activePreview = expandedNetwork || selectedNetworks[0]?.id || 'instagram';

  const getNetworkText = (id: NetworkType) => networkConfigs[id]?.text || globalText;

  const connectedNetworkIds = user?.connectedNetworks?.map(n => n.network) || [];
  const isConnected = (id: NetworkType) => connectedNetworkIds.includes(id);

  const handleSubmit = async () => {
    if (!selectedNetworks.length) return toast.error('Seleccioná al menos una red social');
    setIsSubmitting(true);

    try {
      let mediaUrl: string | undefined;
      let mediaPublicId: string | undefined;

      // Upload to Cloudinary (always if media exists, so backend can access it)
      if (mediaFile) {
        const { data } = await postsAPI.upload(mediaFile);
        mediaUrl = data.url;
        mediaPublicId = data.publicId;
      }

      const networks = selectedNetworks.map(n => ({
        network: n.id,
        text: networkConfigs[n.id]?.text || globalText,
        hashtags: networkConfigs[n.id]?.hashtags || '',
        privacy: networkConfigs[n.id]?.privacy || 'public',
        scheduledAt: networkConfigs[n.id]?.scheduleOverride || scheduledAt || undefined,
      }));

      await postsAPI.create({
        mediaUrl,
        mediaPublicId,
        mediaType,
        mediaMimeType: mediaFile?.type,
        networks,
        globalText,
        scheduledAt: !publishNow && scheduledAt ? scheduledAt : undefined,
        publishNow,
        title: globalText.slice(0, 50),
      });

      toast.success(publishNow ? '🚀 ¡Publicado correctamente!' : '⏰ Publicación programada');
      navigate('/posts');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Nueva publicación</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Creá y publicá en todas tus redes desde un lugar</p>
      </div>

      <div className="create-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Media Upload */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Contenido</h3>
            {!mediaFile ? (
              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? '#6366f1' : '#e2e8f0'}`,
                borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                background: isDragActive ? '#eef2ff' : '#f8fafc',
                transition: 'all 0.2s',
              }}>
                <input {...getInputProps()} />
                <div style={{ marginBottom: 10 }}>
                  <Upload size={28} color={isDragActive ? '#6366f1' : '#94a3b8'} style={{ margin: '0 auto' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  {isDragActive ? 'Soltá el archivo aquí' : 'Arrastrá o hacé clic para subir'}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Imágenes, videos, GIFs (máx 100MB)</p>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {mediaType === 'video' ? (
                  <video src={mediaPreviewUrl} controls style={{ width: '100%', maxHeight: 220, display: 'block', background: '#000' }} />
                ) : (
                  <img src={mediaPreviewUrl} alt="preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                )}
                <button onClick={() => { setMediaFile(null); setMediaPreviewUrl(''); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color="white" />
                </button>
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {mediaType === 'video' ? <Video size={11} color="white" /> : <Image size={11} color="white" />}
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{mediaFile.name.slice(0, 20)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Global text */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Texto principal</h3>
            <textarea
              value={globalText}
              onChange={e => setGlobalText(e.target.value)}
              placeholder="Escribí el texto de tu publicación..."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 14, resize: 'vertical',
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, color: '#0f172a',
                outline: 'none', background: '#f8fafc', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Este texto se usará en todas las redes (se puede personalizar por red)</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{globalText.length}</span>
            </div>
          </div>

          {/* Networks */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Redes sociales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NETWORKS.map(network => {
                const cfg = networkConfigs[network.id];
                const connected = isConnected(network.id);
                const isExpanded = expandedNetwork === network.id;

                return (
                  <div key={network.id} style={{ border: `1.5px solid ${cfg.enabled ? network.color + '40' : '#f1f5f9'}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                      <button
                        onClick={() => connected && toggleNetwork(network.id)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, border: `2px solid ${cfg.enabled ? network.color : '#e2e8f0'}`,
                          background: cfg.enabled ? network.color : 'transparent',
                          cursor: connected ? 'pointer' : 'not-allowed', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        }}
                      >
                        {cfg.enabled && <span style={{ fontSize: 12, color: '#fff' }}>✓</span>}
                      </button>
                      <span style={{ fontSize: 16 }}>{network.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{network.name}</span>
                      {!connected && (
                        <span style={{ fontSize: 10, color: '#94a3b8', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>No conectado</span>
                      )}
                      {cfg.enabled && (
                        <button onClick={() => { setExpandedNetwork(isExpanded ? null : network.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {cfg.enabled && isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          style={{ overflow: 'hidden', borderTop: `1px solid ${network.color}20` }}>
                          <div style={{ padding: '14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>
                                Texto personalizado para {network.name}
                              </label>
                              <textarea
                                value={cfg.text}
                                onChange={e => updateNetworkConfig(network.id, { text: e.target.value })}
                                placeholder={`Personalizar para ${network.name} (opcional, usa el texto principal si está vacío)`}
                                rows={2}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, resize: 'vertical', fontFamily: 'DM Sans, sans-serif', background: '#fff', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = network.color}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>
                                <Hash size={11} style={{ display: 'inline', marginRight: 3 }} />
                                Hashtags
                              </label>
                              <input
                                value={cfg.hashtags}
                                onChange={e => updateNetworkConfig(network.id, { hashtags: e.target.value })}
                                placeholder="#hashtag1 #hashtag2"
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, fontFamily: 'DM Sans, sans-serif', background: '#fff', outline: 'none' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Privacidad</label>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {privacyOptions.map(p => (
                                  <button key={p.value}
                                    onClick={() => updateNetworkConfig(network.id, { privacy: p.value })}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                                      borderRadius: 6, border: `1.5px solid ${cfg.privacy === p.value ? network.color : '#e2e8f0'}`,
                                      background: cfg.privacy === p.value ? `${network.color}10` : '#fff',
                                      color: cfg.privacy === p.value ? network.color : '#64748b',
                                      fontSize: 11, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                                    }}>
                                    {p.icon}{p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule / Publish */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Publicación</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[{ val: true, label: '🚀 Publicar ahora' }, { val: false, label: '⏰ Programar' }].map(opt => (
                <button key={String(opt.val)} onClick={() => setPublishNow(opt.val)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    border: `1.5px solid ${publishNow === opt.val ? '#6366f1' : '#e2e8f0'}`,
                    background: publishNow === opt.val ? '#eef2ff' : '#f8fafc',
                    color: publishNow === opt.val ? '#6366f1' : '#64748b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {!publishNow && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                  Fecha y hora de publicación
                </label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', background: '#f8fafc' }}
                />
                <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={11} />
                  Las publicaciones programadas guardan el archivo temporalmente en Cloudinary
                </p>
              </motion.div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedNetworks.length}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: selectedNetworks.length ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0',
              color: selectedNetworks.length ? '#fff' : '#94a3b8',
              border: 'none', fontSize: 15, fontWeight: 600, cursor: selectedNetworks.length ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: selectedNetworks.length ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
            }}>
            {isSubmitting ? (
              <><div className="spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />Procesando...</>
            ) : (
              <><Send size={17} />{publishNow ? `Publicar en ${selectedNetworks.length} red${selectedNetworks.length !== 1 ? 'es' : ''}` : 'Programar publicación'}</>
            )}
          </motion.button>
        </div>

        {/* Right: Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>Vista previa</h3>

            {/* Network tabs */}
            {selectedNetworks.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {selectedNetworks.map(n => (
                  <button key={n.id} onClick={() => setExpandedNetwork(n.id === expandedNetwork ? null : n.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                      border: `1.5px solid ${activePreview === n.id ? n.color : '#e2e8f0'}`,
                      background: activePreview === n.id ? `${n.color}12` : '#f8fafc',
                      color: activePreview === n.id ? n.color : '#64748b',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                    }}>
                    <span>{n.emoji}</span>
                    <span>{n.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 300, alignItems: 'center' }}>
              {selectedNetworks.length > 0 ? (
                <NetworkPreview
                  network={activePreview as NetworkType}
                  mediaUrl={mediaPreviewUrl || undefined}
                  mediaType={mediaType}
                  text={getNetworkText(activePreview as NetworkType)}
                  username={user?.connectedNetworks?.find(n => n.network === activePreview)?.username || user?.name}
                  avatar={user?.avatar}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>👆</div>
                  <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>Seleccioná una red social</p>
                  <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>La vista previa aparecerá aquí</p>
                </div>
              )}
            </div>

            {/* Connected hint */}
            {NETWORKS.some(n => !isConnected(n.id)) && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                <p style={{ fontSize: 11, color: '#92400e' }}>
                  💡 Conectá tus redes en <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0 }}>Configuración</button> para habilitar la publicación
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .create-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
