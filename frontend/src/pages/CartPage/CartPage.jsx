import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import styles from './CartPage.module.css';
import { useToast } from '../../context/ToastContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, loading } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- INICIO DE LA LÓGICA DE STRIPE ---

  // NUEVO ESTADO: Guardará la instancia de Stripe una vez que tengamos la clave.
  const [stripePromise, setStripePromise] = useState(null);

  // NUEVO EFECTO: Se ejecuta una sola vez cuando el componente se monta.
  // Su trabajo es pedirle la clave publicable a nuestro backend.
  useEffect(() => {
    apiClient.get('/payments/config')
      .then(response => {
        // --- LÍNEA DE DEPURACIÓN CRUCIAL ---
        // Vamos a imprimir la respuesta completa para ver qué estamos recibiendo
        console.log("Respuesta completa del backend (/payments/config):", response.data);

        const { publishableKey } = response.data;
        
        // Vamos a imprimir la clave específica que extraemos
        console.log("Clave extraída para usar en Stripe:", publishableKey);
        
        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        } else {
          console.error("Clave publicable no encontrada en la respuesta del backend.");
        }
      })
      .catch(error => {
        console.error("Error al obtener la configuración de pago del backend:", error);
      });
  }, []);


  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleCheckout = async () => {
    // Verificación de seguridad: El usuario debe estar logueado.
    if (!user) {
      toast.warning("Debes iniciar sesión para proceder al pago");
      navigate('/login');
      return;
    }

    // Verificación de seguridad: No hacer nada si Stripe no está listo.
    if (!stripePromise) {
      alert("La pasarela de pago no está lista. Por favor, espera un momento.");
      return;
    }

    const stripe = await stripePromise;

    const line_items = cart.map(item => ({
      price_data: {
        currency: 'cop',
        product_data: {
          name: item.nombre,
        },
        unit_amount: Math.round(item.precio * 100),
      },
      quantity: item.cantidad,
    }));

    try {
      // Llama a tu backend para crear la sesión de pago
      const response = await apiClient.post('/payments/create-checkout-session', {
        line_items: line_items,
        customer_email: user.email,
      });

      const { sessionId } = response.data;

      // Redirige al usuario a la página de pago de Stripe
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        alert(error.message);
      }
      
    } catch (error) {
      toast.error("Hubo un error al preparar tu pago");
      const errorMessage = error.response?.data?.detail || "Hubo un error al preparar tu pago.";
      alert(errorMessage);
      console.error("Error al crear la sesión de pago:", error);
      throw error;
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
              <div className={styles.itemImage}><div className={styles.itemPlaceholder}>💻</div></div>
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.nombre}</h3>
                <p className={styles.itemPrice}>{formatCurrency(item.precio)}</p>
              </div>
              <div className={styles.itemQuantity}>
                <button className={styles.quantityBtn} onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                <span className={styles.quantityValue}>{item.cantidad}</span>
                <button className={styles.quantityBtn} onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
              </div>
              <div className={styles.itemSubtotal}>{formatCurrency(item.precio * item.cantidad)}</div>
              <button className={styles.deleteBtn} onClick={() => removeFromCart(item.id)} title="Eliminar producto">🗑️</button>
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
            <span className={styles.summaryValue}>Por Calcular</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel} style={{fontWeight: 'bold'}}>Total:</span>
            <span className={styles.summaryValue} style={{fontWeight: 'bold'}}>{formatCurrency(total)}</span>
          </div>
          
          <button 
            className={styles.checkoutBtn} 
            onClick={handleCheckout}
            disabled={!stripePromise || loading} 
          >
            {stripePromise ? 'Pagar con Tarjeta' : 'Cargando...'}
          </button>
          
          <button className={styles.clearBtn} onClick={clearCart}>
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;