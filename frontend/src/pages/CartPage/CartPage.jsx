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
        // Imprimimos la respuesta completa para ver qué recibimos
        console.log("Respuesta completa del backend (/payments/config):", response.data);

        // La API del backend devuelve la clave dentro de la propiedad `stripe.publishableKey`.
        // Conservamos compatibilidad con respuestas planas por si cambió la forma.
        const publishableKey = response.data?.stripe?.publishableKey || response.data?.publishableKey;

        // Imprimimos la clave extraída
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
    console.group('🛒 Proceso de Checkout');
    console.log('Estado inicial:', {
      usuario: user?.email || 'No autenticado',
      totalCarrito: total,
      itemsEnCarrito: cart.length
    });

    // Verificación de seguridad: El usuario debe estar logueado.
    if (!user) {
      console.log('❌ Checkout cancelado: Usuario no autenticado');
      console.groupEnd();
      toast.warning("Debes iniciar sesión para proceder al pago");
      navigate('/login');
      return;
    }

    // Verificación de seguridad: No hacer nada si Stripe no está listo.
    if (!stripePromise) {
      console.log('❌ Checkout cancelado: Stripe no está inicializado');
      console.groupEnd();
      alert("La pasarela de pago no está lista. Por favor, espera un momento.");
      return;
    }

    console.log('✅ Validaciones iniciales pasadas, inicializando Stripe...');
    const stripe = await stripePromise;

    console.log('🔄 Preparando datos para Stripe...');
    const line_items = cart.map(item => {
      const lineItem = {
        price_data: {
          currency: 'cop',
          product_data: {
            name: item.nombre,
          },
          unit_amount: Math.round(item.precio * 100),
        },
        quantity: item.cantidad,
      };
      console.log(`📦 Producto preparado:`, {
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad
      });
      return lineItem;
    });

    try {
      console.log('📤 Enviando datos al backend para crear sesión de pago...');
      const response = await apiClient.post('/payments/create-checkout-session', {
        gateway: 'stripe',
        line_items: line_items,
        customer_email: user.email,
      });

      const { sessionId } = response.data;
      console.log('✅ Sesión de pago creada:', { sessionId });

      console.log('🔄 Redirigiendo a Stripe Checkout...');
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('❌ Error en Stripe Checkout:', error);
        alert(error.message);
      }
      
    } catch (error) {
      console.group('❌ Error en el proceso de checkout');
      console.error('Detalles del error:', error);
      console.log('Respuesta del servidor:', error.response?.data);
      console.groupEnd();
      
      toast.error("Hubo un error al preparar tu pago");
      const errorMessage = error.response?.data?.detail || "Hubo un error al preparar tu pago.";
      alert(errorMessage);
      throw error;
    } finally {
      console.groupEnd(); // Cierra el grupo de logs del checkout
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