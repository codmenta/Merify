// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useToast } from './ToastContext'; // NUEVO
import apiClient from '../api/apiClient';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);
  const { toast } = useToast(); // NUEVO

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
      toast.error('Error al cargar el carrito'); // NUEVO
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar un producto al carrito
  const addToCart = async (product, quantity = 1) => {
    const isLoggedIn = Boolean(user && token);
    if (!isLoggedIn) {
      toast.warning('Debes iniciar sesión para agregar productos al carrito'); // NUEVO
      return;
    }

    try {
      const response = await apiClient.post('/cart', {
        producto_id: product.id,
        cantidad: quantity
      });
      
      // Recargar el carrito desde el backend
      await fetchCart();
      
      // NUEVO: Toast de éxito — mostrar sólo si el usuario está logeado y la petición fue exitosa
      if (isLoggedIn && response && response.status && response.status < 400) {
        toast.success(`${product.nombre} agregado al carrito`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      const errorMessage = error.response?.data?.detail || 'Error al agregar el producto al carrito';
      toast.error(errorMessage); // NUEVO
    }
  };

  // Función para eliminar un producto del carrito
  const removeFromCart = async (itemId) => {
    const isLoggedIn = Boolean(user && token);
    if (!isLoggedIn) return;

    try {
      await apiClient.delete(`/cart/${itemId}`);
      await fetchCart();
  if (isLoggedIn) toast.success('Producto eliminado del carrito'); // NUEVO
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      toast.error('Error al eliminar el producto'); // NUEVO
    }
  };

  // Función para actualizar la cantidad de un producto
  const updateQuantity = async (itemId, newQuantity) => {
    const isLoggedIn = Boolean(user && token);
    if (!isLoggedIn) return;

    try {
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await apiClient.put(`/cart/${itemId}`, { cantidad: newQuantity });
        await fetchCart();
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error('Error al actualizar la cantidad'); // NUEVO
    }
  };

  // Función para vaciar el carrito
  const clearCart = async () => {
    const isLoggedIn = Boolean(user && token);
    if (!isLoggedIn) return;

    try {
      await apiClient.delete('/cart');
      setCart([]);
  if (isLoggedIn) toast.success('Carrito vaciado'); // NUEVO
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      toast.error('Error al vaciar el carrito'); // NUEVO
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