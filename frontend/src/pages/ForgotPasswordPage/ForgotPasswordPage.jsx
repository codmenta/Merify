import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

import './ForgotPasswordPage.module.css'; // Importación global, sin el 'styles from'

const ForgotPasswordPage = () => {
  // --- La lógica del componente (useState, handlers) no cambia ---
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
      if (resp.data.reset_token) setToken(resp.data.reset_token);
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
      const resp = await apiClient.post('/auth/reset', { token, new_password: newPassword });
      setMessage(resp.data.msg || 'Contraseña actualizada');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al resetear la contraseña');
      console.error(err);
    }
  };
  // --- Fin de la lógica ---


  return (
    // 2. CAMBIO: Usamos las clases desde el objeto 'styles'
    <div className="formContainer">
        <h2 className="formTitle">...</h2>

      <form onSubmit={handleRequest}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className={styles.formButton} type="submit">Solicitar reseteo</button>
      </form>

      {/* Usamos la clase .formSuccess que definimos */}
      {message && <p className={styles.formSuccess}>{message}</p>}
      
      {token && (
        <div className={styles.formGroup}>
          <label>Token de reseteo (simulado)</label>
          {/* El textarea ahora tendrá el estilo de .formGroup textarea */}
          <textarea readOnly value={token} rows={3} />
        </div>
      )}

      {token && (
        <form onSubmit={handleReset}>
          <div className={styles.formGroup}>
            <label htmlFor="token">Token</label>
            <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <button className={styles.formButton} type="submit">Cambiar contraseña</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;