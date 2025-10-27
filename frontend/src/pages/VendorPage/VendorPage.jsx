// frontend/src/pages/VendorPage/VendorPage.jsx
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, Edit2, Trash2, Send, TrendingUp } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './VendorPage.module.css';

const VendorPage = () => {
  // --- (LÓGICA DEL COMPONENTE PRINCIPAL SIN CAMBIOS) ---
  const [activeTab, setActiveTab] = useState('products');
  // ... resto de la lógica ...
  
  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Panel Vendedor</h1>
            <p className={styles.headerSubtitle}>Gestiona tus productos y ventas</p>
          </div>
          <button onClick={logout} className={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button onClick={() => setActiveTab('products')} className={`${styles.tabButton} ${activeTab === 'products' ? styles.tabButtonActive : ''}`}>
              <Package size={18} /> Mis Productos
            </button>
            <button onClick={() => setActiveTab('orders')} className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabButtonActive : ''}`}>
              <ShoppingBag size={18} /> Órdenes
            </button>
            <button onClick={() => setActiveTab('stats')} className={`${styles.tabButton} ${activeTab === 'stats' ? styles.tabButtonActive : ''}`}>
              <TrendingUp size={18} /> Estadísticas
            </button>
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
            {activeTab === 'products' && <ProductsSection products={products} onCreate={createProduct} onDelete={deleteProduct} />}
            {activeTab === 'orders' && <OrdersSection orders={orders} onConfirmShipment={confirmShipment} />}
            {activeTab === 'stats' && <StatsSection stats={stats} />}
          </>
        )}
      </div>
    </div>
  );
};

// --- Componentes Internos con Estilos Modulares ---
const ProductsSection = ({ products, onCreate, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stock: '', images: [''] });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) });
    setFormData({ name: '', description: '', price: '', category: '', stock: '', images: [''] });
    setShowAddForm(false);
  };

  return (
    <div className={styles.managementPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Mis Productos</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className={styles.addProductButton}><Plus size={18} /> Nuevo Producto</button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className={styles.productForm}>
          <h3 className={styles.formTitle}>Agregar Producto</h3>
          <div className={styles.formFields}>
            <input type="text" placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={styles.formInput} required />
            <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={styles.formTextarea} rows="3" required />
            <div className={styles.formGrid}>
              <input type="number" placeholder="Precio" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={styles.formInput} min="0" required />
              <input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className={styles.formInput} min="0" required />
            </div>
            <input type="text" placeholder="Categoría" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={styles.formInput} required />
            <input type="url" placeholder="URL Imagen" value={formData.images[0]} onChange={e => setFormData({...formData, images: [e.target.value]})} className={styles.formInput} required />
            <div className={styles.formActions}>
              <button type="submit" className={`${styles.formButton} ${styles.submitButton}`}>Publicar</button>
              <button type="button" onClick={() => setShowAddForm(false)} className={`${styles.formButton} ${styles.cancelButton}`}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      <div className={styles.itemList}>
        {products.map(product => (
          <div key={product.id} className={styles.itemCard}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{product.name}</h3>
              <p className={styles.itemDetails}>${product.price} • Stock: {product.stock}</p>
            </div>
            <div className={styles.itemActions}>
              <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusPending}`}>
                {product.status === 'active' ? 'Activo' : 'Pendiente'}
              </span>
              <button className={`${styles.actionButton} ${styles.actionEdit}`} title="Editar"><Edit2 size={18} /></button>
              <button onClick={() => onDelete(product.id)} className={`${styles.actionButton} ${styles.actionDelete}`} title="Eliminar"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className={styles.emptyState}>¡Crea tu primer producto!</p>}
      </div>
    </div>
  );
};

const OrdersSection = ({ orders, onConfirmShipment }) => (
  <div className={styles.managementPanel}>
    <h2 className={styles.panelTitle}>Órdenes Pendientes</h2>
    <div className={styles.itemList}>
      {orders.map(order => (
        <div key={order.id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <h3 className={styles.orderName}>Orden #{order.id}</h3>
              <p className={styles.orderDetails}>{order.items.map(item => item.product_name || 'Producto').join(', ')}</p>
              <p className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <p className={styles.orderTotal}>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
          </div>
          {order.status === 'pending' && <button onClick={() => onConfirmShipment(order.id)} className={styles.confirmButton}><Send size={18} /> Confirmar Envío</button>}
          {order.status === 'shipped' && <div className={styles.confirmedLabel}>✓ Envío Confirmado</div>}
        </div>
      ))}
      {orders.length === 0 && <p className={styles.emptyState}>No hay órdenes pendientes</p>}
    </div>
  </div>
);

const StatsSection = ({ stats }) => (
  <div className={styles.statsGrid}>
    <StatCard title="Total Productos" value={stats.total_products || 0} icon={Package} color="blue" />
    <StatCard title="Productos Activos" value={stats.active_products || 0} icon={Package} color="green" />
    <StatCard title="Total Órdenes" value={stats.total_orders || 0} icon={ShoppingBag} color="purple" />
    <StatCard title="Ventas Totales" value={`$${(stats.total_sales || 0).toFixed(2)}`} icon={TrendingUp} color="orange" />
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <h3 className={styles.statTitle}>{title}</h3>
      <div className={`${styles.statIcon} ${styles[`color-${color}`]}`}><Icon size={20} /></div>
    </div>
    <p className={styles.statValue}>{value}</p>
  </div>
);

export default VendorPage;