// frontend/src/pages/HomePage/HomePage.jsx
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { CartContext } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard'; // <-- NUEVA IMPORTACIÓN
import ProductQuickView from '../../components/ProductQuickView/ProductQuickView';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  SkeletonProductGrid, 
  SkeletonFilters, 
  SkeletonSearchBar 
} from '../../components/Skeleton/Skeleton';
import styles from './HomePage.module.css';

const HomePage = () => {
  // ----- ESTADO -----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contextos
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();

  // Búsqueda y filtros como objetos al mismo nivel
  const [search, setSearch] = useState({ query: '' });
  const [filters, setFilters] = useState({
    selectedCategory: 'all',
    priceRange: 5000000, // <-- Simplificado a un solo valor
    sortBy: 'name-asc'
  });
  const [showFilters, setShowFilters] = useState(false); // Por defecto falso

  // Vista rápida (Modal)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search.query, 500);

  // ----- EFECTOS -----
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('No se pudieron cargar los productos. Asegúrate que el backend funciona.');
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);
  
  // Sincronizar filtros en desktop y móvil
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => setShowFilters(mediaQuery.matches);
    handleResize(); // Estado inicial
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // ----- LÓGICA DE FILTRADO -----
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.categoria))].filter(Boolean);
    return [
      { id: 'all', nombre: 'Todas', count: products.length },
      ...uniqueCategories.map(cat => ({ id: cat, nombre: cat, count: products.filter(p => p.categoria === cat).length }))
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products
      .filter(p => debouncedSearch ? p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) : true)
      .filter(p => filters.selectedCategory !== 'all' ? p.categoria === filters.selectedCategory : true)
      .filter(p => p.precio <= filters.priceRange);

    const [field, order] = filters.sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'name') comparison = a.nombre.localeCompare(b.nombre);
      else if (field === 'price') comparison = a.precio - b.precio;
      else if (field === 'rating') comparison = (b.rating || 0) - (a.rating || 0);
      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, debouncedSearch, filters.selectedCategory, filters.priceRange, filters.sortBy]);

  // ----- HANDLERS -----
  const resetFilters = () => {
    setSearch({ query: '' });
    setFilters({ selectedCategory: 'all', priceRange: 5000000, sortBy: 'name-asc' });
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.nombre} agregado`);
  };

  // Conteo de filtros activos
  const activeFiltersCount = (filters.selectedCategory !== 'all' ? 1 : 0) + (filters.priceRange < 5000000 ? 1 : 0);
  const formatPrice = (price) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  
  // ----- RENDERIZADO -----
  if (error) {
    return (
      <div className={styles.homepage}>
        <Hero />
        <div className={styles.errorContainer}>... (código de error sin cambios) ...</div>
      </div>
    );
  }

  return (
    <div className={styles.homepage}>
      <Hero />

      {/* --- SECCIÓN DE CONTROLES --- */}
      <section className={styles.controlsSection}>
        {loading ? <SkeletonSearchBar /> : (
          <div className={styles.controlsHeader}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input type="text" placeholder="Buscar productos..." value={search.query} onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))} className={styles.searchInput} />
              {search.query && <button onClick={() => setSearch({ query: '' })} className={styles.searchClear}><X size={18} /></button>}
            </div>

            <div className={styles.actionsWrapper}>
                <button onClick={() => setShowFilters(!showFilters)} className={`${styles.filtersToggle} ${showFilters ? styles.active : ''}`}>
                    <SlidersHorizontal size={18} /> Filtros {activeFiltersCount > 0 && <span className={styles.filtersBadge}>{activeFiltersCount}</span>}
                </button>

                <select value={filters.sortBy} onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))} className={styles.sortSelect}>
                    <option value="name-asc">Nombre A-Z</option><option value="name-desc">Nombre Z-A</option>
                    <option value="price-asc">Precio: Menor a Mayor</option><option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="rating-desc">Mejor Valorados</option>
                </select>
            </div>
            
            <div className={styles.resultsCount}>Mostrando <strong>{filteredProducts.length}</strong> productos</div>
          </div>
        )}
      </section>

      {/* --- SECCIÓN PRINCIPAL CON GRID --- */}
      <section className={styles.productsContainer}>
        {/* SIDEBAR DE FILTROS (condicional) */}
        {showFilters && (loading ? <SkeletonFilters /> : (
            <aside className={styles.filtersSidebar}>
              <div className={styles.filtersHeaderSidebar}>
                  <h3>Filtros</h3>
                  {activeFiltersCount > 0 && <button onClick={resetFilters} className={styles.clearFilters}>Limpiar todo</button>}
              </div>
              <div className={styles.filterGroup}>
                  <h4 className={styles.filterTitle}>Categorías</h4>
          {categories.map(cat => (
            <label key={cat.id} className={`${styles.categoryItem} ${filters.selectedCategory === cat.id ? styles.active : ''}`}>
              <input type="radio" name="category" value={cat.id} checked={filters.selectedCategory === cat.id} onChange={(e) => setFilters(prev => ({ ...prev, selectedCategory: e.target.value }))} />
              <span className={styles.categoryName}>{cat.nombre}</span><span className={styles.categoryCount}>{cat.count}</span>
            </label>
          ))}
              </div>
              <div className={styles.filterGroup}>
                  <h4 className={styles.filterTitle}>Precio Máximo</h4>
          <div className={styles.priceDisplay}><span>{formatPrice(0)}</span><span>{formatPrice(filters.priceRange)}</span></div>
          <input type="range" min="0" max="5000000" step="100000" value={filters.priceRange} onChange={(e) => setFilters(prev => ({ ...prev, priceRange: parseInt(e.target.value) }))} className={styles.priceRange} />
              </div>
            </aside>
          )
        )}

        {/* CONTENEDOR DE PRODUCTOS (GRID) */}
        <main className={styles.productsContent}>
            {loading ? <SkeletonProductGrid count={8} /> : 
             filteredProducts.length === 0 ? (
                <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>🔍</div><h3>No se encontraron productos</h3><p>Intenta ajustar tus filtros</p>
                    <button onClick={resetFilters} className={styles.resetButton}>Limpiar filtros</button>
                </div>
            ) : (
                <div className={styles.productsList}>
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={handleQuickView}
                    />
                ))}
                </div>
            )}
        </main>
      </section>
      
      {/* MODAL DE VISTA RÁPIDA */}
      <ProductQuickView product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToCart={handleAddToCart} />
    </div>
  );
};

export default HomePage;