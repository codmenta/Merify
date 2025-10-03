import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import apiClient from '../api/apiClient';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  // ✅ Cargar carrito desde el backend cuando el usuario inicia sesión
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart([]); // Limpiar carrito si no hay usuario
    }
  }, [user, token]);

  // Función para obtener el carrito desde el backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/cart');
      setCart(response.data || []);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar un producto al carrito
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      const response = await apiClient.post('/cart', {
        producto_id: product.id,
        cantidad: quantity
      });
      
      // Recargar el carrito desde el backend
      await fetchCart();
      
      return response.data;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      const errorMessage = error.response?.data?.detail || 'Error al agregar el producto al carrito';
      alert(errorMessage);
    }
  };

  // Función para eliminar un producto del carrito
  const removeFromCart = async (itemId) => {
    if (!user) return;

    try {
      await apiClient.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Función para actualizar la cantidad de un producto
  const updateQuantity = async (itemId, newQuantity) => {
    if (!user) return;

    try {
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await apiClient.put(`/cart/${itemId}`, { cantidad: newQuantity });
        await fetchCart();
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar la cantidad');
    }
  };

  // Función para vaciar el carrito
  const clearCart = async () => {
    if (!user) return;

    try {
      await apiClient.delete('/cart');
      setCart([]);
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      alert('Error al vaciar el carrito');
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        loading,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};