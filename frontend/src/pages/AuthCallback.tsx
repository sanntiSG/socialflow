import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (token) {
      login(token).then(() => navigate('/', { replace: true }));
    } else {
      navigate('/login?error=' + (error || 'unknown'), { replace: true });
    }
  }, [login, navigate, params]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spin" style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Iniciando sesión...</p>
      </div>
    </div>
  );
}
