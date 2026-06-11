import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import logoSjCiudad from './assets/sj_ciudad.jpg';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales incorrectas. Inténtalo de nuevo.');
        }
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await response.json();
      if (data.token) {
        onLoginSuccess(data.token);
      } else {
        throw new Error('Token no recibido.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 50%, #f1f5f9 0%, #e2e8f0 100%)'
    }}>
      <div className="fade-in" style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        border: '1px solid hsl(var(--border) / 0.5)'
      }}>
        {/* Logo Header */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '32px',
          border: '1px solid #f1f5f9'
        }}>
          <img src={logoSjCiudad} alt="SJ Ciudad" style={{ maxHeight: '42px', objectFit: 'contain' }} />
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '24px'
        }}>Bolsa de Empleo</h2>

        {error && (
          <div style={{
            backgroundColor: 'hsl(var(--color-rechazado) / 0.08)',
            border: '1px solid hsl(var(--color-rechazado) / 0.2)',
            color: 'hsl(var(--color-rechazado))',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px'
          }}>
            <ShieldAlert size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Institucional</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-muted))'
              }} />
              <input
                id="email"
                type="text"
                placeholder="Email Address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '48px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-muted))'
              }} />
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '48px' }}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px'
            }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <a href="#" style={{
            fontSize: '14px',
            color: 'hsl(var(--text-muted))',
            textDecoration: 'none',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary))')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--text-muted))')}
          onClick={(e) => {
            e.preventDefault();
            window.showToast('Por favor, contacte al administrador del sistema para recuperar su contraseña.', 'info');
          }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}
