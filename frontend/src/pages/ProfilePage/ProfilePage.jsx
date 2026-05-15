// frontend/src/pages/ProfilePage/ProfilePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo: ''
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        tipo: user.tipo || 'cliente'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {};
      if (formData.nombre !== user.nombre) updateData.nombre = formData.nombre;
      if (formData.tipo !== user.tipo) updateData.tipo = formData.tipo;
      // No permitimos cambiar el email por seguridad

      if (Object.keys(updateData).length === 0) {
        toast.info("No hay cambios para guardar");
        setLoading(false);
        return;
      }

      await apiClient.put('/users/me', updateData);
      toast.success("Perfil actualizado correctamente");
      
      // Recargar datos del usuario
      const response = await apiClient.get('/users/me');
      setFormData({
        nombre: response.data.nombre || '',
        email: response.data.email || '',
        tipo: response.data.tipo || 'cliente'
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error(error.response?.data?.detail || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Las nuevas contraseñas no coinciden");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await apiClient.put('/users/me/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });

      toast.success("Contraseña actualizada correctamente");
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error(error.response?.data?.detail || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return styles.badgeAdmin;
      case 'vendor': return styles.badgeVendor;
      default: return styles.badgeCustomer;
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'vendor': return 'Vendedor';
      default: return 'Cliente';
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <h2>Debes iniciar sesión para ver tu perfil</h2>
        <button onClick={() => navigate('/login')} className={styles.loginButton}>
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mi Perfil</h1>

      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className={styles.userInfo}>
            <h2>{user.nombre}</h2>
            <p>{user.email}</p>
            <span className={`${styles.badge} ${getRoleBadgeColor(user.role)}`}>
              {getRoleName(user.role)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>Editar Información</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              title="El email no se puede modificar"
            />
            <small>El email no se puede modificar</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tipo">Tipo de usuario</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={user.role !== 'admin'}
            >
              <option value="cliente">Cliente</option>
              <option value="vendor">Vendedor</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>

        <div className={styles.passwordSection}>
          <button 
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label htmlFor="old_password">Contraseña Actual</label>
                <input
                  type="password"
                  id="old_password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="new_password">Nueva Contraseña</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirm_password">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>

        <button onClick={logout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
