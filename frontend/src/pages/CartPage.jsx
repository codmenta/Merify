import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import '../assets/CartPage.css';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.precio_final * item.cantidad, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      navigate('/login');
      return;
    }
    
    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_final: item.precio_final
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

  if (cart.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Tu carrito está vacío.</h2>;
  }

  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(value);

  return (
    <div className="cart-page">
      <h1>Carrito de Compras</h1>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <div className="item-details">
            <h4>{item.nombre}</h4>
            <p>{formatCurrency(item.precio_final)}</p>
          </div>
          <div className="item-quantity">
            <div className="quantity-controls">
                <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                <span>{item.cantidad}</span>
                <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
            </div>
          </div>
          <div className="item-subtotal">{formatCurrency(item.precio_final * item.cantidad)}</div>
          <div className="item-actions">
            <button className="delete-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
          </div>
        </div>
      ))}
      <div className="cart-summary">
        <div className="cart-total">Total: {formatCurrency(total)}</div>
        <button className="checkout-btn" onClick={handleCheckout}>Finalizar Compra</button>
      </div>
    </div>
  );
};

export default CartPage;