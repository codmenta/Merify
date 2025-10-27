import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const resp = await apiClient.post('/auth/forgot', { email });
      setMessage(resp.data.msg || 'Revisa tu correo (simulado)');
      
      // ✅ Si el backend devuelve reset_token, lo guardamos automáticamente
      if (resp.data.reset_token) {
        setToken(resp.data.reset_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al solicitar reseteo');
      console.error(err);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    try {
      const resp = await apiClient.post('/auth/reset', { 
        token, 
        new_password: newPassword 
      });
      setMessage(resp.data.msg || 'Contraseña actualizada');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al resetear la contraseña');
      console.error(err);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Recuperar Contraseña</h2>

      {/* Formulario para solicitar token */}
      <form onSubmit={handleRequest}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <button className={styles.formButton} type="submit">
          Solicitar reseteo
        </button>
      </form>

      {/* Mensajes */}
      {message && <p className={styles.formSuccess}>{message}</p>}
      {error && <p className={styles.formError}>{error}</p>}
      
      {/* Mostrar token solo si existe */}
      {token && (
        <div className={styles.formGroup}>
          <label>Token de reseteo (simulado)</label>
          <textarea 
            readOnly 
            value={token} 
            rows={3}
            className={styles.formGroup}
          />
        </div>
      )}

      {/* Formulario para cambiar contraseña - SOLO se muestra si hay token */}
      {token && (
        <>
          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#212529' }}>
            Cambiar Contraseña
          </h3>
          <form onSubmit={handleReset}>
            <div className={styles.formGroup}>
              <label htmlFor="token">Token</label>
              <input 
                id="token" 
                type="text" 
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <button className={styles.formButton} type="submit">
              Cambiar contraseña
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordPage;