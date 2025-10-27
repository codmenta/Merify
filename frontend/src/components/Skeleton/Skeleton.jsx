// frontend/src/components/Skeleton/Skeleton.jsx
import React from 'react';
import styles from './Skeleton.module.css';

// ==========================================
// COMPONENTE BASE: Skeleton
// ==========================================
export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '0.5rem',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

// ==========================================
// SKELETON: Tarjeta de Producto
// ==========================================
export const SkeletonProductCard = () => {
  return (
    <div className={styles.productCard}>
      {/* Imagen skeleton */}
      <Skeleton 
        width="100%" 
        height="16rem" 
        borderRadius="0"
        className={styles.productImage}
      />
      
      {/* Contenido */}
      <div className={styles.productContent}>
        {/* Categoría */}
        <Skeleton 
          width="60px" 
          height="14px" 
          style={{ marginBottom: '0.75rem' }}
        />
        
        {/* Título (2 líneas) */}
        <Skeleton 
          width="100%" 
          height="20px" 
          style={{ marginBottom: '0.5rem' }}
        />
        <Skeleton 
          width="80%" 
          height="20px" 
          style={{ marginBottom: '1rem' }}
        />
        
        {/* Rating (estrellas) */}
        <div className={styles.ratingRow}>
          {[...Array(5)].map((_, i) => (
            <Skeleton 
              key={i}
              width="16px" 
              height="16px" 
              borderRadius="2px"
            />
          ))}
        </div>
        
        {/* Precio */}
        <Skeleton 
          width="120px" 
          height="28px" 
          style={{ marginBottom: '1rem' }}
        />
        
        {/* Botón */}
        <Skeleton 
          width="100%" 
          height="44px" 
          borderRadius="0.5rem"
        />
      </div>
    </div>
  );
};

// ==========================================
// SKELETON: Grid de Productos
// ==========================================
export const SkeletonProductGrid = ({ count = 8 }) => {
  return (
    <div className={styles.productGrid}>
      {[...Array(count)].map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
};

// ==========================================
// SKELETON: Filtros Sidebar
// ==========================================
export const SkeletonFilters = () => {
  return (
    <div className={styles.filtersSidebar}>
      {/* Header */}
      <Skeleton 
        width="100px" 
        height="24px" 
        style={{ marginBottom: '1.5rem' }}
      />
      
      {/* Categorías */}
      <Skeleton 
        width="80px" 
        height="14px" 
        style={{ marginBottom: '1rem' }}
      />
      {[...Array(5)].map((_, i) => (
        <div key={i} className={styles.filterItem}>
          <Skeleton width="20px" height="20px" borderRadius="50%" />
          <Skeleton width="100%" height="16px" />
        </div>
      ))}
      
      {/* Separador */}
      <div style={{ height: '2rem' }} />
      
      {/* Precio */}
      <Skeleton 
        width="120px" 
        height="14px" 
        style={{ marginBottom: '1rem' }}
      />
      <Skeleton 
        width="100%" 
        height="80px" 
        borderRadius="0.5rem"
        style={{ marginBottom: '1rem' }}
      />
      <Skeleton 
        width="100%" 
        height="8px" 
        borderRadius="4px"
      />
    </div>
  );
};

// ==========================================
// SKELETON: Barra de búsqueda
// ==========================================
export const SkeletonSearchBar = () => {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchBarContent}>
        <Skeleton width="400px" height="50px" borderRadius="0.75rem" />
        <Skeleton width="120px" height="50px" borderRadius="0.75rem" />
        <Skeleton width="180px" height="50px" borderRadius="0.75rem" />
      </div>
    </div>
  );
};

// ==========================================
// SKELETON: Texto (párrafos)
// ==========================================
export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div>
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="16px"
          style={{ marginBottom: '0.75rem' }}
        />
      ))}
    </div>
  );
};

export default Skeleton;