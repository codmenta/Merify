// frontend/src/components/ProductQuickView/ProductQuickView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, ShoppingCart, Star, Zap, Shield, Truck } from 'lucide-react';
import styles from './ProductQuickView.module.css'; // ¡Importamos el CSS Module!

const ProductQuickView = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  const productImages = [
    { id: 1, emoji: '💻', label: 'Vista frontal' },
    { id: 2, emoji: '🖥️', label: 'Vista lateral' },
    { id: 3, emoji: '⌨️', label: 'Vista superior' },
    { id: 4, emoji: '🖱️', label: 'Accesorios' },
  ];

  // EFECTOS (Manejo de foco, scroll y ESC)
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Resetea la cantidad cuando el producto cambia
  useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  // FUNCIONES
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };
  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };
  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

  if (!isOpen || !product) return null;

  const rating = product.rating || 4.5;
  const savings = product.oldPrice ? product.oldPrice - product.precio : 0;
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.precio) / product.oldPrice) * 100) : 0;

  // RENDER con Portal y Clases CSS
  return createPortal(
    <div className={styles.modalWrapper} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalOverlay} onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} tabIndex={-1} className={styles.modalContent}>
        
        <button onClick={onClose} aria-label="Cerrar vista rápida" className={styles.closeButton}>
          <X size={20} />
        </button>

        <div className={styles.modalGrid}>
          {/* LADO IZQUIERDO: Galería */}
          <div className={styles.gallery}>
            <div className={styles.mainImageContainer}>
              {discount > 0 && <div className={styles.discountBadge}>-{discount}% OFF</div>}
              <div className={styles.mainImageEmoji}>{productImages[selectedImage].emoji}</div>
            </div>
            <div className={styles.thumbnailGrid}>
              {productImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={img.label}
                  className={`${styles.thumbnailButton} ${selectedImage === idx ? styles.active : ''}`}
                >
                  {img.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* LADO DERECHO: Información */}
          <div className={styles.productInfo}>
            <div className={styles.productCategory}>{product.categoria || 'Tecnología'}</div>
            <h2 id="modal-title" className={styles.productTitle}>{product.nombre}</h2>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => ( <Star key={i} size={18} className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}/> ))}
              </div>
              <span className={styles.ratingText}>{rating} ({Math.floor(Math.random() * 200 + 50)} reseñas)</span>
            </div>
            <div className={styles.price}>
              <span className={styles.currentPrice}>{formatPrice(product.precio)}</span>
              {product.oldPrice && <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>}
            </div>
            {savings > 0 && <div className={styles.savingsBanner}>🎉 Ahorras {formatPrice(savings)}</div>}
            <p className={styles.description}>
              Producto de alta calidad con características premium. Garantía del fabricante incluida. Envío rápido y seguro a todo el país.
            </p>
            <div className={styles.features}>
              <Feature icon={<Zap size={24} />} label="Envío Rápido" />
              <Feature icon={<Shield size={24} />} label="Garantía" />
              <Feature icon={<Truck size={24} />} label="Devolución" />
            </div>
            <div className={styles.quantitySelector}>
              <label className={styles.quantityLabel}>Cantidad</label>
              <div className={styles.quantityControls}>
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Disminuir cantidad"><Minus size={18} /></button>
                <div className={styles.quantityDisplay}>{quantity}</div>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 99} aria-label="Aumentar cantidad"><Plus size={18} /></button>
              </div>
            </div>
            <button onClick={handleAddToCart} className={styles.addToCartButton}>
              <ShoppingCart size={22} />
              Agregar al carrito
            </button>
            <div className={styles.stockInfo}>
              <div className={styles.stockIndicator} /> En stock - Envío inmediato
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// COMPONENTE HELPER
const Feature = ({ icon, label }) => (
  <div className={styles.featureItem}>
    <div className={styles.featureIcon}>{icon}</div>
    <span className={styles.featureLabel}>{label}</span>
  </div>
);

export default ProductQuickView;