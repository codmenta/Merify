// frontend/src/pages/VendorPage/VendorPage.jsx
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, Edit2, Trash2, Send, TrendingUp } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './VendorPage.module.css';

const VendorPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
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
        const res = await apiClient.get('/vendor/products');
        setProducts(res.data.products || []);
      } else if (activeTab === 'orders') {
        const res = await apiClient.get('/vendor/orders');
        setOrders(res.data.orders || []);
      } else if (activeTab === 'stats') {
        const res = await apiClient.get('/vendor/stats');
        setStats(res.data || {});
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      await apiClient.post('/vendor/products', productData);
      toast.success('Producto creado (pendiente de aprobación)');
      loadData();
    } catch (err) {
      toast.error('Error al crear producto');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await apiClient.delete(`/vendor/products/${productId}`);
      toast.success('Producto eliminado');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar producto');
    }
  };

  const confirmShipment = async (orderId) => {
    try {
      await apiClient.patch(`/vendor/orders/${orderId}`, { status: 'shipped' });
      toast.success('Envío confirmado');
      loadData();
    } catch (err) {
      toast.error('Error al confirmar envío');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Panel Vendedor</h1>
            <p className={styles.headerSubtitle}>Gestiona tus productos y ventas</p>
          </div>
          <button onClick={logout} className={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>

      <div className={styles.tabsBar}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button 
              onClick={() => setActiveTab('products')} 
              className={`${styles.tabButton} ${activeTab === 'products' ? styles.tabButtonActive : ''}`}
            >
              <Package size={18} /> Mis Productos
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabButtonActive : ''}`}
            >
              <ShoppingBag size={18} /> Órdenes
            </button>
            <button 
              onClick={() => setActiveTab('stats')} 
              className={`${styles.tabButton} ${activeTab === 'stats' ? styles.tabButtonActive : ''}`}
            >
              <TrendingUp size={18} /> Estadísticas
            </button>
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
            {activeTab === 'products' && <ProductsSection products={products} onCreate={createProduct} onDelete={deleteProduct} />}
            {activeTab === 'orders' && <OrdersSection orders={orders} onConfirmShipment={confirmShipment} />}
            {activeTab === 'stats' && <StatsSection stats={stats} />}
          </>
        )}
      </div>
    </div>
  );
};

// Componente de Productos
const ProductsSection = ({ products, onCreate, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: '', 
    categoria: '', 
    marca: '',
    stock: '', 
    imagen: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ 
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      categoria: formData.categoria,
      marca: formData.marca || 'Sin marca',
      stock: parseInt(formData.stock),
      imagen: formData.imagen
    });
    setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', marca: '', stock: '', imagen: '' });
    setShowAddForm(false);
  };

  return (
    <div className={styles.managementPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Mis Productos</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className={styles.addProductButton}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className={styles.productForm}>
          <h3 className={styles.formTitle}>Agregar Producto</h3>
          <div className={styles.formFields}>
            <input 
              type="text" 
              placeholder="Nombre del producto" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              className={styles.formInput} 
              required 
            />
            <textarea 
              placeholder="Descripción detallada" 
              value={formData.descripcion} 
              onChange={e => setFormData({...formData, descripcion: e.target.value})} 
              className={styles.formTextarea} 
              rows="3" 
              required 
            />
            <div className={styles.formGrid}>
              <input 
                type="number" 
                placeholder="Precio" 
                value={formData.precio} 
                onChange={e => setFormData({...formData, precio: e.target.value})} 
                className={styles.formInput} 
                min="0" 
                step="0.01"
                required 
              />
              <input 
                type="number" 
                placeholder="Stock" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
                className={styles.formInput} 
                min="0" 
                required 
              />
            </div>
            <input 
              type="text" 
              placeholder="Categoría (ej: Electrónica)" 
              value={formData.categoria} 
              onChange={e => setFormData({...formData, categoria: e.target.value})} 
              className={styles.formInput} 
              required 
            />
            <input 
              type="text" 
              placeholder="Marca" 
              value={formData.marca} 
              onChange={e => setFormData({...formData, marca: e.target.value})} 
              className={styles.formInput} 
            />
            <input 
              type="url" 
              placeholder="URL de la imagen" 
              value={formData.imagen} 
              onChange={e => setFormData({...formData, imagen: e.target.value})} 
              className={styles.formInput} 
            />
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
              <h3 className={styles.itemName}>{product.nombre}</h3>
              <p className={styles.itemDetails}>${product.precio} • Stock: {product.stock}</p>
            </div>
            <div className={styles.itemActions}>
              <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusPending}`}>
                {product.status === 'active' ? 'Activo' : 'Pendiente'}
              </span>
              <button className={`${styles.actionButton} ${styles.actionEdit}`} title="Editar">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDelete(product.id)} className={`${styles.actionButton} ${styles.actionDelete}`} title="Eliminar">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className={styles.emptyState}>¡Crea tu primer producto!</p>}
      </div>
    </div>
  );
};

// Componente de Órdenes
const OrdersSection = ({ orders, onConfirmShipment }) => (
  <div className={styles.managementPanel}>
    <h2 className={styles.panelTitle}>Órdenes Pendientes</h2>
    <div className={styles.itemList}>
      {orders.map(order => (
        <div key={order.id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <h3 className={styles.orderName}>Orden #{order.id}</h3>
              <p className={styles.orderDetails}>
                {order.items && order.items.map(item => item.nombre || 'Producto').join(', ')}
              </p>
              <p className={styles.orderDate}>
                {new Date(order.fecha).toLocaleDateString()}
              </p>
            </div>
            <p className={styles.orderTotal}>${order.total}</p>
          </div>
          {order.estado === 'Pendiente' && (
            <button onClick={() => onConfirmShipment(order.id)} className={styles.confirmButton}>
              <Send size={18} /> Confirmar Envío
            </button>
          )}
          {order.estado === 'Enviado' && (
            <div className={styles.confirmedLabel}>✓ Envío Confirmado</div>
          )}
        </div>
      ))}
      {orders.length === 0 && <p className={styles.emptyState}>No hay órdenes pendientes</p>}
    </div>
  </div>
);

// Componente de Estadísticas
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
      <div className={`${styles.statIcon} ${styles[`color-${color}`]}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className={styles.statValue}>{value}</p>
  </div>
);

export default VendorPage;