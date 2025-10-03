import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/Spinner/Spinner';
import { Star, StarHalf, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HomePage.module.css';

// Datos adicionales
const mockCategories = [
  { id: 1, nombre: 'Computadores', descripcion: 'Computadores al mejor precio.', emoji: '💻' },
  { id: 2, nombre: 'Repuestos', descripcion: 'Repuestos para tus equipos', emoji: '🔧' },
  { id: 3, nombre: 'Accesorios', descripcion: 'Accesorios para hacer tu día más fácil.', emoji: '🎧' },
];

const testimonials = [
  { id: 1, nombre: 'Sarah M.', texto: 'Increíble calidad en todos los productos. Desde equipos básicos hasta gaming, cada pieza ha superado mis expectativas.', rating: 5 },
  { id: 2, nombre: 'Alex K.', texto: 'Encontrar productos que se alineen con mis necesidades solía ser un desafío. La variedad de opciones que ofrecen es verdaderamente notable.', rating: 5 },
  { id: 3, nombre: 'James L.', texto: 'Como alguien siempre buscando la mejor tecnología, estoy encantado de haber encontrado esta tienda. La selección es diversa y muy actual.', rating: 5 },
];

// Componentes internos
const Hero = () => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            TODO LO QUE NECESITAS EN UN SOLO LUGAR
          </h1>
          <p className={styles.heroDescription}>
            Navega por un diverso rango de productos, diseños para ti
          </p>
          <button className={styles.heroButton}>
            Compra Ahora
          </button>
        </div>
        <div className={styles.heroImage}>
          <div className={`${styles.heroStar} ${styles.heroStar1}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className={styles.heroLaptop}>
            <div className={styles.laptopScreen}>
              <div className={styles.laptopBrand}>ASUS</div>
              <div className={styles.laptopSubtitle}>REPUBLIC OF GAMERS</div>
              <div className={styles.laptopDisplay}>
                <div className={styles.laptopIcon}>🎮</div>
              </div>
            </div>
          </div>
          <div className={`${styles.heroStar} ${styles.heroStar2}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${styles.starIcon} ${styles.filled}`} />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className={`${styles.starIcon} ${styles.filled}`} />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={styles.starIcon} />);
    }
    return stars;
  };

  const rating = product.rating || 4.5;

  return (
    <div className={styles.productCard}>
      <div className={styles.productImage}>
        <div className={styles.productPlaceholder}>💻</div>
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.nombre}</h3>
        <div className={styles.productRating}>
          {renderStars(rating)}
          <span className={styles.ratingValue}>{rating}/5</span>
        </div>
        <div className={styles.productPricing}>
          <span className={styles.productPrice}>{formatPrice(product.precio)}</span>
        </div>
        <button 
          className={styles.addToCart}
          onClick={() => onAddToCart(product, 1)}
        
          aria-label={`Añadir ${product.nombre} al carrito`}
          title={`Añadir ${product.nombre} al carrito`}
        >
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({ category }) => {
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryImage}>
        <div className={styles.categoryIcon}>{category.emoji}</div>
      </div>
      <div className={styles.categoryInfo}>
        <h3 className={styles.categoryName}>{category.nombre}</h3>
        <p className={styles.categoryDescription}>{category.descripcion}</p>
      </div>
    </div>
  );
};

const TestimonialCard = ({ testimonial }) => {
  const renderStars = (rating) => {
    return Array(rating).fill(0).map((_, i) => (
      <Star key={i} className={`${styles.starIcon} ${styles.filled}`} />
    ));
  };

  return (
    <div className={styles.testimonialCard}>
      <div className={styles.testimonialStars}>
        {renderStars(testimonial.rating)}
      </div>
      <div className={styles.testimonialAuthor}>
        <h4>{testimonial.nombre}</h4>
        <svg className={styles.verifiedIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <p className={styles.testimonialText}>{testimonial.texto}</p>
    </div>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('¡Gracias por suscribirte! ' + email);
    setEmail('');
  };

  return (
    <div className={styles.newsletterSection}>
      <div className={styles.newsletterContent}>
        <div className={styles.newsletterText}>
          <h2 className={styles.newsletterTitle}>¡MANTENTE AL DÍA!</h2>
          <p className={styles.newsletterSubtitle}>RECIBE NUESTRAS ÚLTIMAS OFERTAS</p>
        </div>
        <form className={styles.newsletterForm} onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={styles.newsletterInput}
            required
          />
          <button type="submit" className={styles.newsletterButton}>
            Subscribe to Newsletter
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente Principal
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) return <Spinner />;
  if (error) return <p className="error-message">{error}</p>;

  const newProducts = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);

  return (
    <div className={styles.homepage}>
      <Hero />

      {/* Nuevos Productos */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>NUEVOS PRODUCTOS</h2>
        <div className={styles.productsGrid}>
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
        <div className={styles.sectionAction}>
          <button className={styles.expandButton}>Expandir</button>
        </div>
      </section>

      {/* Más Vendidos */}
      {bestSellers.length > 0 && (
        <section className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>MÁS VENDIDOS</h2>
          <div className={styles.productsGrid}>
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
          <div className={styles.sectionAction}>
            <button className={styles.expandButton}>Expandir</button>
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesContainer}>
          <h2 className={styles.sectionTitle}>CATEGORÍAS</h2>
          <div className={styles.categoriesGrid}>
            {mockCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Comentarios */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsHeader}>
          <h2 className={styles.sectionTitle}>COMENTARIOS</h2>
          <div className={styles.testimonialsControls}>
            <button onClick={prevTestimonial} className={styles.testimonialNav}>
              <ChevronLeft />
            </button>
            <button onClick={nextTestimonial} className={styles.testimonialNav}>
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`${styles.testimonialWrapper} ${index === currentTestimonial ? styles.active : ''}`}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default HomePage;