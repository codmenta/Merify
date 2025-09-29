import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [token, setToken] = useLocalStorage('token', null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        logout(); // Token is invalid, log out
      }
    }
  }, [token, setUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      setToken(access_token);
      
      const userResponse = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userResponse.data);

      setError(null);
      navigate('/');
    } catch (err) {
      setError("Email o contraseña incorrectos.");
      console.error("Login failed:", err);
    }
  };

  const register = async (nombre, email, password) => {
     try {
        const userData = { nombre, email, password, tipo: "cliente" };
        await apiClient.post(`/auth/register?password=${encodeURIComponent(password)}`, userData);
        setError(null);
        navigate('/login');
    } catch (err) {
        setError("El email ya está registrado o hubo un error.");
        console.error("Registration failed:", err);
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};