import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../assets/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">E-Commerce</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-user">Hola, {user.nombre}</span>
            <NavLink to="/cart" className="navbar-link">
              🛒 Carrito ({totalItems})
            </NavLink>
            <button onClick={logout} className="navbar-button">Cerrar Sesión</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar-link">Iniciar Sesión</NavLink>
            <NavLink to="/register" className="navbar-link">Registrarse</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;