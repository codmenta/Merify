// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [token, setToken] = useLocalStorage('token', null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para obtener el usuario actual desde el backend
  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // Token inválido, limpiar storage sin causar loop infinito
        setUser(null);
        setToken(null);
      }
    }
  }, [token, setUser, setToken]);

  // Cargar usuario al montar el componente si hay token
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);


  // Función de login
  const login = async (email, password) => {
    try {
      // Preparar datos en formato form-urlencoded (OAuth2)
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Llamar al endpoint de login
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Extraer token y usuario de la respuesta
      const { access_token, user: userData } = response.data;
      
      // Guardar en localStorage
      setToken(access_token);
      setUser(userData);

      // Limpiar errores
      setError(null);
      
      // 🔥 NUEVO: Redirigir según el rol del usuario
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError("Email o contraseña incorrectos.");
      console.error("Login failed:", err);
    }
  };

  // Función de registro
  const register = async (nombre, email, password) => {
    try {
      // Preparar datos del usuario
      const userData = { 
        nombre, 
        email, 
        password, 
        tipo: "cliente" 
      };
      
      // Llamar al endpoint de registro
      const response = await apiClient.post('/auth/register', userData);
      
      // Extraer token y usuario de la respuesta
      const { access_token, user: userDataResponse } = response.data;
      
      // Guardar en localStorage
      setToken(access_token);
      setUser(userDataResponse);
      
      // Limpiar errores
      setError(null);
      
      // Redirigir al home
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "El email ya está registrado o hubo un error.";
      setError(errorMessage);
      console.error("Registration failed:", err);
    }
  };
  
  // Función de logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};