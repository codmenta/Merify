import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../assets/Form.css';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, setError } = useContext(AuthContext);

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!nombre || !email || !password) {
        setError("Por favor, completa todos los campos.");
        return;
    }
    if (password.length < 4) {
        setError("La contraseña debe tener al menos 4 caracteres.");
        return;
    }
    await register(nombre, email, password);
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="form-button">Registrar</button>
      </form>
       <Link to="/login" className="form-link">¿Ya tienes cuenta? Inicia sesión</Link>
    </div>
  );
};

export default RegisterPage;