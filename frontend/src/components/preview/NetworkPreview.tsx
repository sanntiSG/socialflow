import React from 'react';
import { NetworkType, MediaType } from '../../types';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Eye, Video } from 'lucide-react';

export interface PreviewProps {
  network: NetworkType;
  mediaUrl?: string;
  mediaType?: MediaType;
  text: string;
  username?: string;
  avatar?: string;
  orientation?: 'v' | 'h';
  options?: Record<string, any>;
  mediaDimensions?: { width: number; height: number };
}

const Avatar = ({ src, name, size = 32 }: { src?: string; name?: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: src ? 'transparent' : '#6366f1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontSize: size * 0.4, fontWeight: 600 }}>{name?.[0] || 'U'}</span>}
  </div>
);

const MediaDisplay = ({ url, type, style, orientation }: { url?: string; type?: MediaType; style?: React.CSSProperties; orientation?: 'v' | 'h' }) => {
  if (!url) return (
    <div style={{ ...style, background: 'linear-gradient(135deg, #e0e7ff, #f0abfc)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
      <Video size={32} color="#6366f1" />
      <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 500 }}>Sin contenido seleccionado</span>
    </div>
  );
  if (type === 'video') return (
    <div style={{ ...style, position: 'relative', overflow: 'hidden', background: '#000' }}>
      <video src={url} style={{ width: '100%', height: '100%', objectFit: orientation === 'v' ? 'cover' : 'contain' }} controls playsInline />
    </div>
  );
  return <img src={url} alt="preview" style={{ ...style, objectFit: orientation === 'v' ? 'cover' : 'contain' }} />;
};

// TikTok Preview
const TikTokPreview = ({ mediaUrl, mediaType, text, username, avatar, orientation }: PreviewProps) => (
  <div style={{ width: 220, height: 390, borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#000', fontFamily: '-apple-system, sans-serif', flexShrink: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
    <MediaDisplay url={mediaUrl} type={mediaType} orientation={orientation} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
    {/* Right actions */}
    <div style={{ position: 'absolute', right: 8, bottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <Avatar src={avatar} name={username} size={36} />
      {[
        { icon: <Heart size={18} fill="white" color="white" />, count: '24.5K' },
        { icon: <MessageCircle size={18} color="white" />, count: '1.2K' },
        { icon: <Bookmark size={18} color="white" />, count: '3.4K' },
        { icon: <Share2 size={18} color="white" />, count: '892' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {item.icon}
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>{item.count}</span>
        </div>
      ))}
    </div>
    {/* Bottom info */}
    <div style={{ position: 'absolute', left: 8, right: 60, bottom: 16 }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>@{username || 'usuario'}</p>
      <p style={{ color: '#fff', fontSize: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text || 'Tu descripción aquí...'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', animation: 'spin 3s linear infinite' }} />
        <span style={{ color: '#fff', fontSize: 9 }}>Sonido original</span>
      </div>
    </div>
    {/* TikTok badge */}
    <div style={{ position: 'absolute', top: 10, left: 10, background: '#000', borderRadius: 6, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.53V6.77a4.86 4.86 0 01-1.01-.08z" /></svg>
      <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>TikTok</span>
    </div>
  </div>
);

// Instagram Reel Preview
const InstagramPreview = ({ mediaUrl, mediaType, text, username, avatar, orientation }: PreviewProps) => (
  <div style={{ width: 220, height: 390, borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#000', fontFamily: '-apple-system, sans-serif', flexShrink: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
    <MediaDisplay url={mediaUrl} type={mediaType} orientation={orientation} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)' }} />
    {/* Top bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" fill="white" /></svg>
        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>Reels</span>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="white" /><circle cx="12" cy="12" r="1.5" fill="white" /><circle cx="12" cy="19" r="1.5" fill="white" /></svg>
    </div>
    {/* Right actions */}
    <div style={{ position: 'absolute', right: 8, bottom: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {[
        { icon: <Heart size={18} color="white" />, count: '18.2K' },
        { icon: <MessageCircle size={18} color="white" />, count: '943' },
        { icon: <Share2 size={18} color="white" />, count: 'Enviar' },
        { icon: <MoreHorizontal size={18} color="white" /> },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {item.icon}
          {item.count && <span style={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>{item.count}</span>}
        </div>
      ))}
    </div>
    {/* Bottom */}
    <div style={{ position: 'absolute', left: 8, right: 50, bottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Avatar src={avatar} name={username} size={24} />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 11 }}>{username || 'usuario'}</span>
        <span style={{ color: '#fff', fontSize: 10, border: '1px solid rgba(255,255,255,0.6)', borderRadius: 4, padding: '1px 4px' }}>Seguir</span>
      </div>
      <p style={{ color: '#fff', fontSize: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text || 'Tu descripción aquí...'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366)' }} />
        <span style={{ color: '#fff', fontSize: 9 }}>Sonido original</span>
      </div>
    </div>
  </div>
);

// YouTube Short Preview
const YouTubePreview = ({ mediaUrl, mediaType, text, username, avatar, orientation }: PreviewProps) => (
  <div style={{ width: 220, height: 390, borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#0f0f0f', fontFamily: 'Roboto, sans-serif', flexShrink: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
    <MediaDisplay url={mediaUrl} type={mediaType} orientation={orientation} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }} />
    {/* Top */}
    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="14" height="10" viewBox="0 0 24 16"><path fill="#FF0000" d="M23.5 2.5s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.7-2 12-2 12-2s-4.7 0-7.3.4c-.6.1-1.9.1-3 1.3C.7.5.5 2.5.5 2.5S.3 4.8.3 7.2v2.2c0 2.3.2 4.7.2 4.7s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C6.9 18 12 18 12 18s4.7 0 7.3-.4c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.2-2.3.2-4.7V6.7C23.7 4.4 23.5 2.5 23.5 2.5z" /><path fill="white" d="M9.7 12.4V4.8l8.1 3.8z" /></svg>
      <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>Shorts</span>
    </div>
    {/* Right actions */}
    <div style={{ position: 'absolute', right: 8, bottom: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <Avatar src={avatar} name={username} size={32} />
      {[
        { icon: <ThumbsUp size={18} color="white" />, count: '12.4K' },
        { icon: <MessageCircle size={18} color="white" />, count: '542' },
        { icon: <Share2 size={18} color="white" />, count: 'Comp.' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {item.icon}
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>{item.count}</span>
        </div>
      ))}
    </div>
    {/* Bottom */}
    <div style={{ position: 'absolute', left: 8, right: 50, bottom: 12 }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>@{username || 'usuario'}</p>
      <p style={{ color: '#fff', fontSize: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text || 'Tu descripción aquí...'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <Eye size={10} color="rgba(255,255,255,0.7)" />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>12K vistas</span>
      </div>
    </div>
  </div>
);

// Facebook Post Preview
const FacebookPreview = ({ mediaUrl, mediaType, text, username, avatar, orientation }: PreviewProps) => (
  <div style={{ width: 240, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.1)', fontFamily: 'Helvetica, sans-serif', flexShrink: 0 }}>
    {/* Header */}
    <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar src={avatar} name={username} size={32} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1c1e21' }}>{username || 'Usuario'}</p>
        <p style={{ fontSize: 10, color: '#65676b' }}>Ahora · 🌐</p>
      </div>
      <MoreHorizontal size={16} color="#65676b" />
    </div>
    {/* Text */}
    <div style={{ padding: '0 12px 8px' }}>
      <p style={{ fontSize: 13, color: '#1c1e21', lineHeight: 1.4 }}>{text || 'Tu publicación aquí...'}</p>
    </div>
    {/* Media */}
    {(mediaUrl || true) && (
      <MediaDisplay url={mediaUrl} type={mediaType} orientation={orientation} style={{ width: '100%', height: 160, display: 'block' }} />
    )}
    {/* Reactions */}
    <div style={{ padding: '6px 12px', borderBottom: '1px solid #e4e6eb', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {['👍', '❤️', '😮'].map(e => <span key={e} style={{ fontSize: 12 }}>{e}</span>)}
        <span style={{ fontSize: 11, color: '#65676b', marginLeft: 4 }}>1.2K</span>
      </div>
      <span style={{ fontSize: 11, color: '#65676b' }}>48 comentarios</span>
    </div>
    {/* Actions */}
    <div style={{ display: 'flex', padding: '4px 8px' }}>
      {[
        { icon: <ThumbsUp size={14} />, label: 'Me gusta' },
        { icon: <MessageCircle size={14} />, label: 'Comentar' },
        { icon: <Share2 size={14} />, label: 'Compartir' },
      ].map(a => (
        <button key={a.label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#65676b', fontSize: 11, fontWeight: 600, borderRadius: 4 }}>
          {a.icon}{a.label}
        </button>
      ))}
    </div>
  </div>
);

// Instagram Post (square image)
const InstagramPostPreview = ({ mediaUrl, mediaType, text, username, avatar, orientation }: PreviewProps) => (
  <div style={{ width: 220, borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #dbdbdb', fontFamily: '-apple-system, sans-serif', flexShrink: 0 }}>
    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden' }}>
          <Avatar src={avatar} name={username} size={22} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#262626', flex: 1 }}>{username || 'usuario'}</span>
      <MoreHorizontal size={14} color="#262626" />
    </div>
    <MediaDisplay url={mediaUrl} type={mediaType} orientation={orientation} style={{ width: '100%', height: 220, display: 'block' }} />
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Heart size={16} color="#262626" />
          <MessageCircle size={16} color="#262626" />
          <Share2 size={16} color="#262626" />
        </div>
        <Bookmark size={16} color="#262626" />
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#262626', marginBottom: 2 }}>1,234 me gusta</p>
      <p style={{ fontSize: 11, color: '#262626', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        <span style={{ fontWeight: 600 }}>{username || 'usuario'} </span>{text || 'Tu descripción aquí...'}
      </p>
    </div>
  </div>
);

export const NetworkPreview = ({ network, mediaUrl, mediaType, text, username, avatar, options, mediaDimensions }: PreviewProps) => {
  const isVideo = mediaType === 'video' || mediaType === 'gif';
  const orientation: 'v' | 'h' = mediaDimensions && mediaDimensions.height > mediaDimensions.width ? 'v' : 'h';
  const postType = options?.postType || 'auto';

  // Determine actual display format
  let displayType = postType;
  if (displayType === 'auto') {
    if (network === 'youtube') displayType = (isVideo && orientation === 'v') ? 'short' : 'video';
    if (network === 'instagram') displayType = (isVideo && orientation === 'v') ? 'reel' : 'post';
  }

  const props = { network, mediaUrl, mediaType, text, username, avatar, orientation };

  switch (network) {
    case 'tiktok': return <TikTokPreview {...props} />;
    case 'youtube':
      return displayType === 'short'
        ? <YouTubePreview {...props} />
        : <FacebookPreview {...props} />;
    case 'facebook': return <FacebookPreview {...props} />;
    case 'instagram':
      if (displayType === 'reel') return <InstagramPreview {...props} />;
      if (displayType === 'story') return <InstagramPreview {...props} />;
      return <InstagramPostPreview {...props} />;
    default:
      return <FacebookPreview {...props} />;
  }
};

export default NetworkPreview;
