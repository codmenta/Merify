// frontend/src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Package, Users, CreditCard, Settings, Check, X, Trash2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css'; // ¡IMPORTADO!

const AdminPage = () => {
  // --- (TODA LA LÓGICA DE ESTADOS Y FUNCIONES SE MANTIENE EXACTAMENTE IGUAL) ---
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  // ... resto de estados ...
  const { user, logout } = useAuth();
  // ... resto de lógica ...
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    // loadData(); // Consider loading data inside each tab's effect if they grow large
  }, [user, navigate]);

  useEffect(() => {
      loadData();
  }, [activeTab]);


  const loadData = async () => { /* ... lógica sin cambios ... */ };
  const approveProduct = async (productId) => { /* ... lógica sin cambios ... */ };
  const deleteProduct = async (productId) => { /* ... lógica sin cambios ... */ };
  const toggleUserStatus = async (userId, currentStatus) => { /* ... lógica sin cambios ... */ };
  const saveConfig = async () => { /* ... lógica sin cambios ... */ };
  
  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Panel Administrador</h1>
            <p className={styles.headerSubtitle}>Gestión completa de Merify</p>
          </div>
          <button onClick={logout} className={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Tabs */}
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

      {/* Content */}
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

// Componentes internos usando `styles`
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
            <h3 className={styles.itemName}>{product.name}</h3>
            <p className={styles.itemDetails}>Vendedor: {product.vendor_name || 'N/A'} • ${product.price}</p>
          </div>
          <div className={styles.itemActions}>
            <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusPending}`}>
              {product.status === 'active' ? 'Activo' : 'Pendiente'}
            </span>
            {product.status === 'pending' && (
              <button onClick={() => onApprove(product.id)} className={`${styles.actionButton} ${styles.actionApprove}`} title="Aprobar"><Check size={18} /></button>
            )}
            <button onClick={() => onDelete(product.id)} className={`${styles.actionButton} ${styles.actionDelete}`} title="Eliminar"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
      {products.length === 0 && <p className={styles.emptyState}>No hay productos</p>}
    </div>
  </div>
);

const UsersManagement = ({ users, onToggleStatus }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
      <span className="text-sm text-gray-600">{users.length} usuarios</span>
    </div>

    <div className="space-y-3">
      {users.map(user => (
        <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-600">
              {user.email} • {user.role === 'vendor' ? 'Vendedor' : user.role === 'admin' ? 'Admin' : 'Cliente'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {user.status === 'active' ? 'Activo' : 'Bloqueado'}
            </span>
            <button
              onClick={() => onToggleStatus(user.id, user.status)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
              title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
            >
              {user.status === 'active' ? <X size={18} /> : <Check size={18} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsManagement = ({ payments }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-bold mb-6">Historial de Pagos</h2>
    <div className="space-y-3">
      {payments.map(payment => (
        <div key={payment.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Orden #{payment.id}</h3>
              <p className="text-sm text-gray-600">
                {new Date(payment.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">${payment.total}</p>
              <p className="text-xs text-gray-500">{payment.status}</p>
            </div>
          </div>
        </div>
      ))}
      {payments.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hay pagos registrados</p>
      )}
    </div>
  </div>
);

const SettingsManagement = ({ config, onChange, onSave }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-bold mb-6">Configuración de la Plataforma</h2>
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <label className="block font-semibold mb-2">Descuento General (%)</label>
        <input
          type="number"
          value={config.discount}
          onChange={(e) => onChange({ ...config, discount: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          min="0"
          max="100"
        />
      </div>
      <div className="border rounded-lg p-4">
        <label className="block font-semibold mb-2">Políticas de Envío</label>
        <textarea
          value={config.shipping_policy}
          onChange={(e) => onChange({ ...config, shipping_policy: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="4"
          placeholder="Describe las políticas de envío..."
        />
      </div>
      <button 
        onClick={onSave}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
      >
        Guardar Cambios
      </button>
    </div>
  </div>
);

export default AdminPage;