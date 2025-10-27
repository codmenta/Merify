import React from 'react';
import { Eye, Star, StarHalf } from 'lucide-react';
import styles from './ProductCard.module.css';

// Funciones helper encapsuladas
const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(price);

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} className={`${styles.starIcon} ${styles.filled}`} size={16} />);
  if (hasHalfStar) stars.push(<StarHalf key="half" className={`${styles.starIcon} ${styles.filled}`} size={16} />);
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) stars.push(<Star key={`empty-${i}`} className={styles.starIcon} size={16} />);
  
  return stars;
};

// Componente principal
const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const rating = product.rating || 4.5; // Rating por defecto

  return (
    <div className={styles.productCard}>
      <div className={styles.productImage}>
        <div className={styles.productPlaceholder}>💻</div>
        <button
          onClick={() => onQuickView(product)}
          className={styles.quickViewBtn}
          aria-label={`Vista rápida de ${product.nombre}`}
        >
          <Eye size={18} />
          Vista Rápida
        </button>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productCategory}>{product.categoria || 'General'}</div>
        <h3 className={styles.productName}>{product.nombre}</h3>
        <div className={styles.productRating}>
          {renderStars(rating)}
          <span className={styles.ratingValue}>{rating.toFixed(1)}/5</span>
        </div>
        <div className={styles.productPricing}>
          <span className={styles.productPrice}>{formatPrice(product.precio)}</span>
        </div>
        <button
          className={styles.addToCart}
          onClick={() => onAddToCart(product)}
          aria-label={`Añadir ${product.nombre} al carrito`}
        >
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;