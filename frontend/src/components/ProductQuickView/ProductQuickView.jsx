import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, ShoppingCart, Star, Zap, Shield, Truck } from 'lucide-react';

// ==========================================
// COMPONENTE PRINCIPAL: ProductQuickView
// ==========================================
const ProductQuickView = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  // Imágenes de ejemplo (en tu app real vendrían del producto)
  const productImages = [
    { id: 1, emoji: '💻', label: 'Vista frontal' },
    { id: 2, emoji: '🖥️', label: 'Vista lateral' },
    { id: 3, emoji: '⌨️', label: 'Vista superior' },
    { id: 4, emoji: '🖱️', label: 'Accesorios' },
  ];

  // ==========================================
  // EFECTO: Prevenir scroll del body cuando el modal está abierto
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      // Guarda el elemento que tenía el foco antes de abrir
      previousFocus.current = document.activeElement;
      
      // Previene scroll del body
      document.body.style.overflow = 'hidden';
      
      // Mueve el foco al modal
      modalRef.current?.focus();
    } else {
      // Restaura scroll del body
      document.body.style.overflow = 'unset';
      
      // Restaura el foco al elemento anterior
      previousFocus.current?.focus();
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ==========================================
  // EFECTO: Cerrar con tecla ESC
  // ==========================================
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ==========================================
  // FUNCIONES
  // ==========================================
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);

  // No renderizar si no está abierto
  if (!isOpen || !product) return null;

  const rating = product.rating || 4.5;
  const savings = product.oldPrice ? product.oldPrice - product.precio : 0;
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.precio) / product.oldPrice) * 100)
    : 0;

  // ==========================================
  // RENDER con Portal
  // ==========================================
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Overlay (fondo oscuro) */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        aria-hidden="true"
      />

      {/* Contenido del Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '1.5rem',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <X size={20} color="#6b7280" />
        </button>

        {/* Contenido en Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          padding: '2rem',
        }}>
          
          {/* LADO IZQUIERDO: Galería de Imágenes */}
          <div>
            {/* Imagen principal */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '1rem',
              padding: '3rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Badge de descuento */}
              {discount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                }}>
                  -{discount}% OFF
                </div>
              )}
              
              <div style={{
                fontSize: '8rem',
                animation: 'float 3s ease-in-out infinite',
              }}>
                {productImages[selectedImage].emoji}
              </div>
            </div>

            {/* Miniaturas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
            }}>
              {productImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={img.label}
                  style={{
                    background: selectedImage === idx 
                      ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                      : '#f3f4f6',
                    border: selectedImage === idx ? '3px solid #667eea' : '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '2rem',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedImage !== idx) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedImage !== idx) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  {img.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* LADO DERECHO: Información del Producto */}
          <div>
            {/* Categoría */}
            <div style={{
              fontSize: '0.875rem',
              color: '#667eea',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}>
              {product.categoria || 'Tecnología'}
            </div>

            {/* Título */}
            <h2
              id="modal-title"
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#1f2937',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              {product.nombre}
            </h2>

            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.125rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
                    color={i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {rating} ({Math.floor(Math.random() * 200 + 50)} reseñas)
              </span>
            </div>

            {/* Precio */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatPrice(product.precio)}
              </span>
              {product.oldPrice && (
                <span style={{
                  fontSize: '1.25rem',
                  color: '#9ca3af',
                  textDecoration: 'line-through',
                }}>
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Ahorro */}
            {savings > 0 && (
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}>
                🎉 Ahorras {formatPrice(savings)} con esta oferta
              </div>
            )}

            {/* Descripción */}
            <p style={{
              color: '#6b7280',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}>
              Producto de alta calidad con características premium. 
              Garantía del fabricante incluida. Envío rápido y seguro a todo el país.
            </p>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <Feature icon={<Zap />} label="Envío Rápido" />
              <Feature icon={<Shield />} label="Garantía" />
              <Feature icon={<Truck />} label="Devolución" />
            </div>

            {/* Selector de cantidad */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem',
              }}>
                Cantidad
              </label>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    border: 'none',
                    cursor: quantity > 1 ? 'pointer' : 'not-allowed',
                    opacity: quantity > 1 ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (quantity > 1) e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                >
                  <Minus size={18} />
                </button>
                <div style={{
                  width: '4rem',
                  textAlign: 'center',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#1f2937',
                }}>
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  aria-label="Aumentar cantidad"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    border: 'none',
                    cursor: quantity < 99 ? 'pointer' : 'not-allowed',
                    opacity: quantity < 99 ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (quantity < 99) e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <ShoppingCart size={22} />
              Agregar al carrito
            </button>

            {/* Stock info */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f0fdf4',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#166534',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#22c55e',
                borderRadius: '50%',
              }} />
              En stock - Envío inmediato
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          div[role="dialog"] > div {
            grid-template-columns: 1fr !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>,
    document.body // Portal: renderiza en el body, fuera del árbol de componentes
  );
};

// ==========================================
// COMPONENTE: Feature Icon
// ==========================================
const Feature = ({ icon, label }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '0.75rem',
    textAlign: 'center',
  }}>
    <div style={{ color: '#667eea' }}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
      {label}
    </span>
  </div>
);

// ==========================================
// DEMO: Ejemplo de uso
// ==========================================
export default function DemoQuickView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const exampleProduct = {
    id: 1,
    nombre: 'MacBook Pro 16" M3 Max',
    precio: 4500000,
    oldPrice: 5500000,
    categoria: 'Computadores',
    rating: 4.8,
  };

  const handleAddToCart = (product, quantity) => {
    alert(`Agregado: ${quantity}x ${product.nombre}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem', fontWeight: 900 }}>
          Modal de Vista Rápida
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Click para ver el producto en detalle
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '1.25rem 2.5rem',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1.125rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
          }}
        >
          Abrir Vista Rápida
        </button>
      </div>

      <ProductQuickView
        product={exampleProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}