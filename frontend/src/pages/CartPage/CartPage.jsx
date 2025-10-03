import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import styles from './CartPage.module.css';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, loading } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ CAMBIO: Usar "precio" en lugar de "precio_final"
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      navigate('/login');
      return;
    }
    
    const orderData = {
      items: cart.map(item => ({
        id: item.producto_id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_final: item.precio
      })),
      total: total
    };

    try {
      await apiClient.post('/orders', orderData);
      alert('¡Pedido realizado con éxito!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert('Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
    }
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(value);

  if (!user) {
    return (
      <div className={styles.emptyCart}>
        <h2>Debes iniciar sesión para ver tu carrito</h2>
        <button onClick={() => navigate('/login')} className={styles.loginButton}>
          Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando carrito...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Tu carrito está vacío</h2>
        <button onClick={() => navigate('/')} className={styles.shopButton}>
          Ir a comprar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>Carrito de Compras</h1>
        
        <div className={styles.cartItems}>
          {cart.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <div className={styles.itemPlaceholder}>💻</div>
              </div>
              
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.nombre}</h3>
                <p className={styles.itemPrice}>{formatCurrency(item.precio)}</p>
              </div>
              
              <div className={styles.itemQuantity}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                >
                  -
                </button>
                <span className={styles.quantityValue}>{item.cantidad}</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                >
                  +
                </button>
              </div>
              
              <div className={styles.itemSubtotal}>
                {formatCurrency(item.precio * item.cantidad)}
              </div>
              
              <button 
                className={styles.deleteBtn}
                onClick={() => removeFromCart(item.id)}
                title="Eliminar producto"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal:</span>
            <span className={styles.summaryValue}>{formatCurrency(total)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Envío:</span>
            <span className={styles.summaryValue}>Gratis</span>
          </div>
          <div className={styles.summaryRowTotal}>
            <span className={styles.summaryLabel}>Total:</span>
            <span className={styles.summaryValue}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>  
      <div className={styles.checkoutContainer}>
        <button className={styles.checkoutButton} onClick={handleCheckout}>
          Realizar Pedido
        </button>
      </div>
    </div>
  );
};

export default CartPage;

//