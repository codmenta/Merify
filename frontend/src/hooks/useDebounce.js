import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

// ==========================================
// HOOK PERSONALIZADO: useDebounce
// ==========================================
// Retrasa la ejecución de una función para no hacer búsquedas
// en cada tecla presionada
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el timeout si el valor cambia antes del delay
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ==========================================
// COMPONENTE PRINCIPAL: ProductFilters
// ==========================================
const ProductFilters = () => {
  // --- ESTADO ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce de búsqueda (espera 500ms después de que el usuario deja de escribir)
  const debouncedSearch = useDebounce(searchQuery, 500);

  // --- DATOS DE EJEMPLO ---
  const allProducts = [
    { id: 1, nombre: 'MacBook Pro M3', precio: 4500000, categoria: 'computadores', rating: 4.8 },
    { id: 2, nombre: 'iPhone 15 Pro', precio: 3200000, categoria: 'tecnologia', rating: 4.7 },
    { id: 3, nombre: 'Teclado Mecánico RGB', precio: 280000, categoria: 'accesorios', rating: 4.5 },
    { id: 4, nombre: 'Monitor 4K 27"', precio: 1200000, categoria: 'computadores', rating: 4.6 },
    { id: 5, nombre: 'Mouse Gamer Inalámbrico', precio: 180000, categoria: 'accesorios', rating: 4.4 },
    { id: 6, nombre: 'Auriculares Bluetooth', precio: 450000, categoria: 'accesorios', rating: 4.3 },
    { id: 7, nombre: 'iPad Air', precio: 2100000, categoria: 'tecnologia', rating: 4.6 },
    { id: 8, nombre: 'SSD 1TB NVMe', precio: 380000, categoria: 'repuestos', rating: 4.7 },
    { id: 9, nombre: 'RAM 32GB DDR5', precio: 520000, categoria: 'repuestos', rating: 4.5 },
    { id: 10, nombre: 'Laptop Gamer RTX', precio: 4800000, categoria: 'computadores', rating: 4.9 },
    { id: 11, nombre: 'Webcam HD 1080p', precio: 220000, categoria: 'accesorios', rating: 4.2 },
    { id: 12, nombre: 'Disco Duro 2TB', precio: 280000, categoria: 'repuestos', rating: 4.4 },
  ];

  const categories = [
    { id: 'all', nombre: 'Todas', count: allProducts.length },
    { id: 'computadores', nombre: 'Computadores', count: allProducts.filter(p => p.categoria === 'computadores').length },
    { id: 'tecnologia', nombre: 'Tecnología', count: allProducts.filter(p => p.categoria === 'tecnologia').length },
    { id: 'accesorios', nombre: 'Accesorios', count: allProducts.filter(p => p.categoria === 'accesorios').length },
    { id: 'repuestos', nombre: 'Repuestos', count: allProducts.filter(p => p.categoria === 'repuestos').length },
  ];

  // --- LÓGICA DE FILTRADO ---
  // useMemo recalcula solo cuando cambian las dependencias
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Filtrar por búsqueda (debounced)
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

    // 4. Ordenar según criterio
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      
      if (field === 'name') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (field === 'price') {
        comparison = a.precio - b.precio;
      } else if (field === 'rating') {
        comparison = a.rating - b.rating;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [debouncedSearch, selectedCategory, priceRange, sortBy]);

  // --- FUNCIONES ---
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 5000000]);
    setSortBy('name-asc');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);

  const activeFiltersCount = [
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 5000000,
  ].filter(Boolean).length;

  // --- RENDER ---
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER CON BÚSQUEDA Y ACCIONES */}
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            
            {/* Barra de búsqueda */}
            <div style={{
              flex: '1 1 300px',
              position: 'relative',
            }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Botón de filtros (móvil) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                background: showFilters ? '#667eea' : '#f3f4f6',
                color: showFilters ? '#fff' : '#374151',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <SlidersHorizontal size={18} />
              Filtros
              {activeFiltersCount > 0 && (
                <span style={{
                  background: showFilters ? 'rgba(255,255,255,0.3)' : '#667eea',
                  color: showFilters ? '#fff' : '#fff',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.875rem 2.5rem 0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#fff',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
            >
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating-desc">Mejor Valorados</option>
            </select>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showFilters ? '280px 1fr' : '1fr',
          gap: '2rem',
        }}>
          
          {/* SIDEBAR DE FILTROS */}
          {showFilters && (
            <aside style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              height: 'fit-content',
              position: 'sticky',
              top: '2rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937' }}>
                  Filtros
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#667eea',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* CATEGORÍAS */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Categorías
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categories.map(cat => (
                    <label
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        background: selectedCategory === cat.id ? '#f3f4f6' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => {
                        if (selectedCategory !== cat.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ marginRight: '0.75rem' }}
                      />
                      <span style={{ flex: 1, color: '#374151' }}>{cat.nombre}</span>
                      <span style={{
                        background: '#e5e7eb',
                        color: '#6b7280',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {cat.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RANGO DE PRECIO */}
              <div>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Rango de Precio
                </h4>
                <div style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#667eea',
                  }}>
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                }}>
                  <span>$0</span>
                  <span>$5,000,000</span>
                </div>
              </div>
            </aside>
          )}

          {/* GRID DE PRODUCTOS */}
          <main>
            {/* Contador de resultados */}
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                Mostrando <strong style={{ color: '#1f2937' }}>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto' : 'productos'}
                {debouncedSearch && ` para "${debouncedSearch}"`}
              </p>
            </div>

            {/* Lista de productos */}
            {filteredProducts.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                  No se encontraron productos
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Intenta ajustar tus filtros o búsqueda
                </p>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: ProductCard
// ==========================================
const ProductCard = ({ product, formatPrice }) => (
  <div style={{
    background: '#fff',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }}
  >
    <div style={{
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '4rem',
    }}>
      💻
    </div>
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        fontSize: '0.75rem',
        color: '#667eea',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}>
        {product.categoria}
      </div>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#1f2937',
        marginBottom: '0.75rem',
      }}>
        {product.nombre}
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        marginBottom: '1rem',
      }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < Math.floor(product.rating) ? '#fbbf24' : '#e5e7eb' }}>
            ★
          </span>
        ))}
        <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
          {product.rating}
        </span>
      </div>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#667eea',
        marginBottom: '1rem',
      }}>
        {formatPrice(product.precio)}
      </div>
      <button style={{
        width: '100%',
        padding: '0.875rem',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={(e) => e.target.style.background = '#5568d3'}
        onMouseLeave={(e) => e.target.style.background = '#667eea'}
      >
        Agregar al carrito
      </button>
    </div>
  </div>
);

export default ProductFilters;