// frontend/src/pages/HomePage/HomePage.jsx
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { CartContext } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import Hero from '../../components/Hero/Hero';
import ProductQuickView from '../../components/ProductQuickView/ProductQuickView';
import { Search, SlidersHorizontal, X, Eye, Star, StarHalf } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  SkeletonProductGrid, 
  SkeletonFilters, 
  SkeletonSearchBar 
} from '../../components/Skeleton/Skeleton';
import styles from './HomePage.module.css';

const HomePage = () => {
  // ESTADO
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contextos
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  // Estado del modal de vista rápida
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce de búsqueda (espera 500ms después de que el usuario deja de escribir)
  const debouncedSearch = useDebounce(searchQuery, 500);

  // OBTENER PRODUCTOS DEL BACKEND
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los productos. Verifica que el backend esté funcionando.');
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  // CATEGORÍAS DINÁMICAS (desde backend)
  const categories = useMemo(() => {
    // Extraer categorías únicas de los productos
    const uniqueCategories = [...new Set(products.map(p => p.categoria))].filter(Boolean);
    
    return [
      { id: 'all', nombre: 'Todas', count: products.length },
      ...uniqueCategories.map(cat => ({
        id: cat,
        nombre: cat,
        count: products.filter(p => p.categoria === cat).length
      }))
    ];
  }, [products]);

  // LÓGICA DE FILTRADO Y ORDENAMIENTO
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtrar por búsqueda (con debounce)
    if (debouncedSearch) {
      result = result.filter(product =>
        product.nombre.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // 2. Filtrar por categoría
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.categoria === selectedCategory);
    }

    // 3. Filtrar por rango de precio
    result = result.filter(
      product => product.precio >= priceRange[0] && product.precio <= priceRange[1]
    );

    // 4. Ordenar según criterio seleccionado
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      
      if (field === 'name') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (field === 'price') {
        comparison = a.precio - b.precio;
      } else if (field === 'rating') {
        comparison = (a.rating || 0) - (b.rating || 0);
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, debouncedSearch, selectedCategory, priceRange, sortBy]);

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 5000000]);
    setSortBy('name-asc');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 5000000,
  ].filter(Boolean).length;

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);

  // Funciones del modal de vista rápida
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCartFromModal = (product, quantity) => {
    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.nombre} agregado al carrito`);
  };

  // RENDER: Estado de error
  if (error) {
    return (
      <div className={styles.homepage}>
        <Hero />
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error al cargar los productos</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <Hero />

      {/* SECCIÓN DE FILTROS */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          
          {loading ? (
            // Skeleton durante carga
            <SkeletonSearchBar />
          ) : (
            <>
              {/* Header con búsqueda y acciones */}
              <div className={styles.filtersHeader}>
                
                {/* Barra de búsqueda */}
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} size={20} />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={styles.searchClear}
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Botón de filtros (móvil) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${styles.filtersToggle} ${showFilters ? styles.active : ''}`}
                >
                  <SlidersHorizontal size={18} />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className={styles.filtersBadge}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Ordenamiento */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="name-asc">Nombre A-Z</option>
                  <option value="name-desc">Nombre Z-A</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="rating-desc">Mejor Valorados</option>
                </select>
              </div>

              {/* Contador de resultados */}
              <div className={styles.resultsCount}>
                Mostrando <strong>{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'producto' : 'productos'}
                {debouncedSearch && ` para "${debouncedSearch}"`}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL: FILTROS + PRODUCTOS */}
      <section className={styles.productsSection}>
        <div className={styles.productsContainer}>
          
          {/* SIDEBAR DE FILTROS */}
          {showFilters && (
            <>
              {loading ? (
                // Skeleton del sidebar
                <SkeletonFilters />
              ) : (
                <aside className={styles.filtersSidebar}>
                  <div className={styles.filtersHeaderSidebar}>
                    <h3>Filtros</h3>
                    {activeFiltersCount > 0 && (
                      <button onClick={resetFilters} className={styles.clearFilters}>
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  {/* CATEGORÍAS */}
                  <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>Categorías</h4>
                    <div className={styles.categoryList}>
                      {categories.map(cat => (
                        <label
                          key={cat.id}
                          className={`${styles.categoryItem} ${
                            selectedCategory === cat.id ? styles.active : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.id}
                            checked={selectedCategory === cat.id}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                          />
                          <span className={styles.categoryName}>{cat.nombre}</span>
                          <span className={styles.categoryCount}>{cat.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* RANGO DE PRECIO */}
                  <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>Rango de Precio</h4>
                    <div className={styles.priceDisplay}>
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000000"
                      step="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className={styles.priceRange}
                    />
                    <div className={styles.priceLabels}>
                      <span>$0</span>
                      <span>$5,000,000</span>
                    </div>
                  </div>
                </aside>
              )}
            </>
          )}

          {/* GRID DE PRODUCTOS */}
          <main className={styles.productsGrid}>
            {loading ? (
              // Skeleton del grid
              <SkeletonProductGrid count={8} />
            ) : filteredProducts.length === 0 ? (
              // Sin resultados
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar tus filtros o búsqueda</p>
                <button onClick={resetFilters} className={styles.resetButton}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              // Lista de productos
              <div className={styles.productsList}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onQuickView={handleQuickView}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* MODAL DE VISTA RÁPIDA */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
      />
    </div>
  );
};

// ==========================================
// COMPONENTE: ProductCard
// ==========================================
const ProductCard = ({ product, onAddToCart, onQuickView, formatPrice }) => {
  const rating = product.rating || 4.5;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${styles.starIcon} ${styles.filled}`} size={16} />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className={`${styles.starIcon} ${styles.filled}`} size={16} />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={styles.starIcon} size={16} />);
    }
    return stars;
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productImage}>
        <div className={styles.productPlaceholder}>💻</div>
        
        {/* Botón de vista rápida (aparece al hover) */}
        <button
          onClick={() => onQuickView(product)}
          className={styles.quickViewBtn}
          aria-label="Vista rápida del producto"
        >
          <Eye size={18} />
          Vista Rápida
        </button>
      </div>

      <div className={styles.productInfo}>
        {/* Categoría */}
        <div className={styles.productCategory}>
          {product.categoria || 'General'}
        </div>
        
        {/* Nombre */}
        <h3 className={styles.productName}>{product.nombre}</h3>
        
        {/* Rating */}
        <div className={styles.productRating}>
          {renderStars(rating)}
          <span className={styles.ratingValue}>{rating}/5</span>
        </div>
        
        {/* Precio */}
        <div className={styles.productPricing}>
          <span className={styles.productPrice}>{formatPrice(product.precio)}</span>
        </div>
        
        {/* Botón agregar al carrito */}
        <button
          className={styles.addToCart}
          onClick={() => onAddToCart(product, 1)}
          aria-label={`Añadir ${product.nombre} al carrito`}
        >
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
};

export default HomePage;