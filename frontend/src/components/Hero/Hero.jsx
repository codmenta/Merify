// frontend/src/components/Hero/Hero.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Shield, TrendingUp } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Efecto parallax: el contenido se mueve sutilmente con el mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={styles.heroSection}>
      {/* Fondo con patrón decorativo */}
      <div className={styles.backgroundPattern} />

      {/* Partículas flotantes animadas */}
      <Particles />

      {/* Contenido principal en grid */}
      <div className={styles.heroContent}>
        
        {/* LADO IZQUIERDO: Texto y CTAs */}
        <div 
          className={styles.heroText}
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        >
          {/* Badge con glassmorphism */}
          <div className={styles.heroBadge}>
            <Zap size={16} />
            <span>Nuevos productos cada semana</span>
          </div>

          {/* Título con gradiente */}
          <h1 className={styles.heroTitle}>
            Descubre la mejor
            <span className={styles.heroTitleGradient}>tecnología</span>
            para ti
          </h1>

          {/* Descripción */}
          <p className={styles.heroDescription}>
            Navega por una selección curada de productos premium. 
            Calidad garantizada y envíos rápidos a todo el país.
          </p>

          {/* Botones de acción */}
          <div className={styles.heroButtons}>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              <ShoppingBag size={20} />
              Explorar productos
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              Ver ofertas
            </button>
          </div>

          {/* Estadísticas */}
          <div className={styles.heroStats}>
            <Stat icon={<Shield />} value="100%" label="Seguro" />
            <Stat icon={<TrendingUp />} value="50K+" label="Clientes" />
            <Stat icon={<Zap />} value="24/7" label="Soporte" />
          </div>
        </div>

        {/* LADO DERECHO: Producto destacado */}
        <div 
          className={styles.heroShowcase}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        >
          <ProductShowcase />
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
      </div>
    </section>
  );
};

// Componente de estadística individual
const Stat = ({ icon, value, label }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

// Componente de tarjeta de producto 3D
const ProductShowcase = () => (
  <div className={styles.productWrapper}>
    {/* Círculo giratorio de fondo */}
    <div className={styles.productCircle} />

    {/* Tarjeta del producto */}
    <div className={styles.productCard}>
      {/* Badge de descuento */}
      <div className={styles.productBadge}>-30% OFF</div>

      {/* Imagen/Emoji del producto */}
<div className={styles.productImage}>
  <img 
    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"
    alt="MacBook Pro 2024"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '1rem'
    }}
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.parentElement.innerHTML = '<div style="font-size: 6rem;">💻</div>';
    }}
  />
</div>

      {/* Información del producto */}
      <h3 className={styles.productName}>MacBook Pro 2024</h3>
      <p className={styles.productSpec}>Chip M3 Max, 16GB RAM, 512GB SSD</p>

      {/* Precio */}
      <div className={styles.productPricing}>
        <span className={styles.productPrice}>$3,500,000</span>
        <span className={styles.productOldPrice}>$5,000,000</span>
      </div>

      {/* Rating */}
      <div className={styles.productRating}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={styles.star}>★</span>
        ))}
        <span className={styles.ratingCount}>(128 reseñas)</span>
      </div>
    </div>
  </div>
);

// Componente de partículas flotantes
const Particles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className={styles.particles}>
      {particles.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Hero;