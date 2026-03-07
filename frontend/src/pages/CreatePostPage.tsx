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
  Globe, Lock, Users, Eye, Hash, AlertCircle, CheckCircle2, Layout
} from 'lucide-react';

const NETWORKS: { id: NetworkType; name: string }[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'facebook', name: 'Facebook' },
];

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M33.5 12.5c0 4.69 3.81 8.5 8.5 8.5v3.5a12 12 0 01-12-12V12.5h3.5z" fill="#00F2EA" />
    <path d="M29 8h3.5v20.5A8.5 8.5 0 1124 20v3.5A11.5 11.5 0 1032.5 35H29V8z" fill="#FF004F" />
    <path d="M29 8h3.5v12.5A6 6 0 1124 20v3.5A9.5 9.5 0 0029 8z" fill="#010101" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YouTubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const getNetworkIcon = (id: string, size = 18) => {
  switch (id) {
    case 'instagram': return <InstagramIcon size={size} />;
    case 'tiktok': return <TikTokIcon size={size} />;
    case 'youtube': return <YouTubeIcon size={size} />;
    case 'facebook': return <FacebookIcon size={size} />;
    default: return null;
  }
};

const getNetworkColor = (id: string) => {
  switch (id) {
    case 'instagram': return '#E1306C';
    case 'tiktok': return '#000';
    case 'youtube': return '#FF0000';
    case 'facebook': return '#1877F2';
    default: return '#6366f1';
  }
};

interface NetworkConfig {
  enabled: boolean;
  text: string;
  hashtags: string;
  privacy: PrivacyType;
  scheduleOverride?: string;
  extraOptions?: Record<string, any>;
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
  const [mediaDimensions, setMediaDimensions] = useState({ width: 0, height: 0 });
  const [duration, setDuration] = useState(0);
  const [networkConfigs, setNetworkConfigs] = useState<Record<NetworkType, NetworkConfig>>({
    instagram: { ...defaultNetworkConfig(), extraOptions: { postType: 'auto' } },
    tiktok: defaultNetworkConfig(),
    youtube: { ...defaultNetworkConfig(), extraOptions: { postType: 'auto' } },
    facebook: defaultNetworkConfig(),
    twitter: defaultNetworkConfig(),
    linkedin: defaultNetworkConfig(),
  });

  const handleMediaLoad = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const target = e.currentTarget;
    const w = 'videoWidth' in target ? target.videoWidth : target.naturalWidth;
    const h = 'videoHeight' in target ? target.videoHeight : target.naturalHeight;
    setMediaDimensions({ width: w, height: h });
    if ('duration' in target) setDuration(target.duration);
  };

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
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000' }}>
                {mediaType === 'video' ? (
                  <video src={mediaPreviewUrl} controls onLoadedMetadata={handleMediaLoad} style={{ width: '100%', maxHeight: 300, display: 'block' }} />
                ) : (
                  <img src={mediaPreviewUrl} alt="preview" onLoad={handleMediaLoad} style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }} />
                )}
                <button onClick={() => { setMediaFile(null); setMediaPreviewUrl(''); setMediaDimensions({ width: 0, height: 0 }); setDuration(0); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <X size={14} color="white" />
                </button>
                {mediaDimensions.width > 0 && (
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6, zIndex: 5 }}>
                    {mediaType === 'video' ? <Video size={12} color="white" /> : <Image size={12} color="white" />}
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>
                      {mediaDimensions.width}x{mediaDimensions.height} · {mediaDimensions.height > mediaDimensions.width ? 'Vertical' : 'Horizontal'}
                      {duration > 0 && ` · ${Math.round(duration)}s`}
                    </span>
                  </div>
                )}
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
                const color = getNetworkColor(network.id);
                const icon = getNetworkIcon(network.id);
                const cfg = networkConfigs[network.id];
                const connected = isConnected(network.id);
                const isExpanded = expandedNetwork === network.id;

                return (
                  <div key={network.id} style={{ border: `1.5px solid ${cfg.enabled ? color + '40' : '#f1f5f9'}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                      <button
                        onClick={() => connected && toggleNetwork(network.id)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, border: `2px solid ${cfg.enabled ? color : '#e2e8f0'}`,
                          background: cfg.enabled ? color : 'transparent',
                          cursor: connected ? 'pointer' : 'not-allowed', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        }}
                      >
                        {cfg.enabled && <CheckCircle2 size={14} color="#fff" />}
                      </button>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        {icon}
                      </div>
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
                          style={{ overflow: 'hidden', borderTop: `1px solid ${getNetworkColor(network.id)}20` }}>
                          <div style={{ padding: '14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Smart Format Options */}
                            {(network.id === 'youtube' || network.id === 'instagram') && (
                              <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 8 }}>Formato inteligente</label>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {network.id === 'youtube' ? (
                                    <>
                                      {['auto', 'video', 'short'].map(type => (
                                        <button key={type} onClick={() => updateNetworkConfig('youtube', { extraOptions: { ...cfg.extraOptions, postType: type } })}
                                          style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', border: '1.5px solid', borderColor: cfg.extraOptions?.postType === type ? '#FF0000' : '#e2e8f0', background: cfg.extraOptions?.postType === type ? '#FF000010' : '#fff', color: cfg.extraOptions?.postType === type ? '#FF0000' : '#64748b' }}>
                                          {type}
                                        </button>
                                      ))}
                                    </>
                                  ) : (
                                    <>
                                      {['auto', 'reel', 'post', 'story'].map(type => (
                                        <button key={type} onClick={() => updateNetworkConfig('instagram', { extraOptions: { ...cfg.extraOptions, postType: type } })}
                                          style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', border: '1.5px solid', borderColor: cfg.extraOptions?.postType === type ? '#E1306C' : '#e2e8f0', background: cfg.extraOptions?.postType === type ? '#E1306C10' : '#fff', color: cfg.extraOptions?.postType === type ? '#E1306C' : '#64748b' }}>
                                          {type}
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

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
                                onFocus={e => e.target.style.borderColor = getNetworkColor(network.id)}
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
                                      borderRadius: 6, border: `1.5px solid ${cfg.privacy === p.value ? getNetworkColor(network.id) : '#e2e8f0'}`,
                                      background: cfg.privacy === p.value ? `${getNetworkColor(network.id)}10` : '#fff',
                                      color: cfg.privacy === p.value ? getNetworkColor(network.id) : '#64748b',
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
                      border: `1.5px solid ${activePreview === n.id ? getNetworkColor(n.id) : '#e2e8f0'}`,
                      background: activePreview === n.id ? `${getNetworkColor(n.id)}12` : '#f8fafc',
                      color: activePreview === n.id ? getNetworkColor(n.id) : '#64748b',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                    }}>
                    <div style={{ color: activePreview === n.id ? getNetworkColor(n.id) : '#94a3b8', display: 'flex' }}>
                      {getNetworkIcon(n.id, 14)}
                    </div>
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
                  options={networkConfigs[activePreview as NetworkType]?.extraOptions}
                  mediaDimensions={mediaDimensions}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ color: '#cbd5e1', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                    <Layout size={48} strokeWidth={1.5} />
                  </div>
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
