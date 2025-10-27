// frontend/src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Package, Users, CreditCard, Settings, Check, X, Trash2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [config, setConfig] = useState({ discount: 0, shipping_policy: '' });
  const [loading, setLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await apiClient.get('/admin/products');
        setProducts(res.data.products || []);
      } else if (activeTab === 'users') {
        const res = await apiClient.get('/admin/users');
        setUsers(res.data.users || []);
      } else if (activeTab === 'payments') {
        const res = await apiClient.get('/admin/payments');
        setPayments(res.data.payments || []);
      } else if (activeTab === 'settings') {
        const res = await apiClient.get('/admin/config');
        setConfig(res.data || { discount: 0, shipping_policy: '' });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (productId) => {
    try {
      await apiClient.patch(`/admin/products/${productId}`, { status: 'active' });
      toast.success('Producto aprobado');
      loadData();
    } catch (err) {
      toast.error('Error al aprobar producto');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await apiClient.delete(`/admin/products/${productId}`);
      toast.success('Producto eliminado');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar producto');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await apiClient.patch(`/admin/users/${userId}`, { status: newStatus });
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'bloqueado'}`);
      loadData();
    } catch (err) {
      toast.error('Error al actualizar usuario');
    }
  };

  const saveConfig = async () => {
    try {
      await apiClient.post('/admin/config', config);
      toast.success('Configuración guardada');
    } catch (err) {
      toast.error('Error al guardar configuración');
    }
  };

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Panel Administrador</h1>
            <p className={styles.headerSubtitle}>Gestión completa de Merify</p>
          </div>
          <button onClick={logout} className={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>

      <div className={styles.tabsBar}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <>
            {activeTab === 'products' && <ProductsManagement products={products} onApprove={approveProduct} onDelete={deleteProduct} />}
            {activeTab === 'users' && <UsersManagement users={users} onToggleStatus={toggleUserStatus} />}
            {activeTab === 'payments' && <PaymentsManagement payments={payments} />}
            {activeTab === 'settings' && <SettingsManagement config={config} onChange={setConfig} onSave={saveConfig} />}
          </>
        )}
      </div>
    </div>
  );
};

// Componente de Gestión de Productos
const ProductsManagement = ({ products, onApprove, onDelete }) => (
  <div className={styles.managementPanel}>
    <div className={styles.panelHeader}>
      <h2 className={styles.panelTitle}>Gestión de Productos</h2>
      <span className={styles.panelItemCount}>{products.length} productos</span>
    </div>
    <div className={styles.itemList}>
      {products.map(product => (
        <div key={product.id} className={styles.itemCard}>
          <div className={styles.itemInfo}>
            <h3 className={styles.itemName}>{product.nombre}</h3>
            <p className={styles.itemDetails}>Vendedor: {product.vendor_name || 'N/A'} • ${product.precio}</p>
          </div>
          <div className={styles.itemActions}>
            <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusPending}`}>
              {product.status === 'active' ? 'Activo' : 'Pendiente'}
            </span>
            {product.status === 'pending' && (
              <button onClick={() => onApprove(product.id)} className={`${styles.actionButton} ${styles.actionApprove}`} title="Aprobar">
                <Check size={18} />
              </button>
            )}
            <button onClick={() => onDelete(product.id)} className={`${styles.actionButton} ${styles.actionDelete}`} title="Eliminar">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
      {products.length === 0 && <p className={styles.emptyState}>No hay productos</p>}
    </div>
  </div>
);

// Componente de Gestión de Usuarios
const UsersManagement = ({ users, onToggleStatus }) => (
  <div className={styles.managementPanel}>
    <div className={styles.panelHeader}>
      <h2 className={styles.panelTitle}>Gestión de Usuarios</h2>
      <span className={styles.panelItemCount}>{users.length} usuarios</span>
    </div>
    <div className={styles.itemList}>
      {users.map(user => (
        <div key={user.email} className={styles.itemCard}>
          <div className={styles.itemInfo}>
            <h3 className={styles.itemName}>{user.nombre}</h3>
            <p className={styles.itemDetails}>
              {user.email} • {user.role === 'vendor' ? 'Vendedor' : user.role === 'admin' ? 'Admin' : 'Cliente'}
            </p>
          </div>
          <div className={styles.itemActions}>
            <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusBlocked}`}>
              {user.status === 'active' ? 'Activo' : 'Bloqueado'}
            </span>
            <button
              onClick={() => onToggleStatus(user.email, user.status)}
              className={`${styles.actionButton} ${styles.actionToggle}`}
              title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
            >
              {user.status === 'active' ? <X size={18} /> : <Check size={18} />}
            </button>
          </div>
        </div>
      ))}
      {users.length === 0 && <p className={styles.emptyState}>No hay usuarios</p>}
    </div>
  </div>
);

// Componente de Gestión de Pagos
const PaymentsManagement = ({ payments }) => (
  <div className={styles.managementPanel}>
    <h2 className={styles.panelTitle}>Historial de Pagos</h2>
    <div className={styles.itemList}>
      {payments.map(payment => (
        <div key={payment.id} className={styles.itemCard}>
          <div className={styles.itemInfo}>
            <h3 className={styles.itemName}>Orden #{payment.id}</h3>
            <p className={styles.itemDetails}>
              {new Date(payment.fecha).toLocaleDateString()} • ${payment.total}
            </p>
          </div>
          <div className={styles.itemActions}>
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              {payment.estado}
            </span>
          </div>
        </div>
      ))}
      {payments.length === 0 && <p className={styles.emptyState}>No hay pagos registrados</p>}
    </div>
  </div>
);

// Componente de Configuración
const SettingsManagement = ({ config, onChange, onSave }) => (
  <div className={styles.managementPanel}>
    <h2 className={styles.panelTitle}>Configuración de la Plataforma</h2>
    <div className={styles.settingsForm}>
      <div className={styles.formField}>
        <label className={styles.formLabel}>Descuento General (%)</label>
        <input
          type="number"
          value={config.discount}
          onChange={(e) => onChange({ ...config, discount: parseFloat(e.target.value) })}
          className={styles.formInput}
          min="0"
          max="100"
        />
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>Políticas de Envío</label>
        <textarea
          value={config.shipping_policy}
          onChange={(e) => onChange({ ...config, shipping_policy: e.target.value })}
          className={styles.formTextarea}
          rows="4"
          placeholder="Describe las políticas de envío..."
        />
      </div>
      <button onClick={onSave} className={styles.saveButton}>
        Guardar Cambios
      </button>
    </div>
  </div>
);

export default AdminPage;