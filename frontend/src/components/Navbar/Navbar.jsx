import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo y navegación principal */}
          <div className={styles.left}>
            <Link to="/" className={styles.logo}>E-commerce</Link>
            
            <div className={styles.linksDesktop}>
              <button className={styles.dropdown}>
                Tienda
                <svg className={styles.dropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <NavLink to="/" className={styles.link}>
                En Descuento
              </NavLink>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className={styles.searchDesktop}>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              className={styles.searchInput}
            />
          </div>

          {/* Acciones del usuario */}
          <div className={styles.actions}>
            {/* Botón de búsqueda móvil */}
            <button 
              className={`${styles.icon} ${styles.iconMobile}`}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Carrito */}
            <NavLink to="/cart" className={`${styles.icon} ${styles.cart}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </NavLink>

            {/* Usuario */}
            {user ? (
              <div className={styles.userMenu}>
                <button className={styles.icon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className={styles.userDropdown}>
                  <span className={styles.userName}>Hola, {user.nombre}</span>
                  <button onClick={logout} className={styles.logoutBtn}>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <>
                <NavLink to="/login" className={styles.linkMobile}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </NavLink>
              </>
            )}

            {/* Menú hamburguesa móvil */}
            <button 
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda móvil */}
        {searchOpen && (
          <div className={styles.searchMobile}>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              className={styles.searchInput}
            />
          </div>
        )}

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <NavLink to="/" className={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </NavLink>
            <button className={styles.mobileMenuItem}>
              Tienda
            </button>
            <NavLink to="/" className={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
              En Descuento
            </NavLink>
            {!user && (
              <>
                <NavLink to="/login" className={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
                  Iniciar Sesión
                </NavLink>
                <NavLink to="/register" className={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;