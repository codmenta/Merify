import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import apiClient from '../api/apiClient';
import '../assets/HomePage.css';
import Spinner from '../components/Spinner';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los productos. Asegúrate de que el backend esté funcionando.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h1 className="page-title">Productos Disponibles</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.nombre}</h3>
            <p className="product-description">{product.descripcion}</p>
            <p className="product-price">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.precio)}
            </p>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart({ ...product, precio_final: product.precio }, 1)}
            >
              Añadir al Carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;