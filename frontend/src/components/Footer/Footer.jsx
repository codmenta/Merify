import React from 'react';
import styles from './Footer.module.css';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Contenido Principal */}
        <div className={styles.grid}>
          {/* Columna 1 - Marca */}
          <div className={styles.column}>
            <h3 className={styles.brand}>Merify</h3>
            <p className={styles.description}>
              Tu tienda de tecnología de confianza. 
              Calidad, innovación y los mejores precios.
            </p>
            <div className={styles.social}>
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2 - Enlaces Rápidos */}
          <div className={styles.column}>
            <h4 className={styles.title}>Enlaces</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Productos</a></li>
              <li><a href="#" className={styles.link}>Ofertas</a></li>
              <li><a href="#" className={styles.link}>Sobre Nosotros</a></li>
              <li><a href="#" className={styles.link}>Blog</a></li>
            </ul>
          </div>

          {/* Columna 3 - Ayuda */}
          <div className={styles.column}>
            <h4 className={styles.title}>Ayuda</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Preguntas Frecuentes</a></li>
              <li><a href="#" className={styles.link}>Envíos</a></li>
              <li><a href="#" className={styles.link}>Devoluciones</a></li>
              <li><a href="#" className={styles.link}>Garantías</a></li>
            </ul>
          </div>

          {/* Columna 4 - Contacto */}
          <div className={styles.column}>
            <h4 className={styles.title}>Contacto</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <Mail size={16} />
                <span>soporte@merify.com</span>
              </li>
              <li className={styles.contactItem}>
                <Phone size={16} />
                <span>+57 300 123 4567</span>
              </li>
              <li className={styles.contactItem}>
                <MapPin size={16} />
                <span>Popayán, Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Merify. Todos los derechos reservados.
          </p>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Términos</a>
            <span className={styles.separator}>•</span>
            <a href="#" className={styles.legalLink}>Privacidad</a>
            <span className={styles.separator}>•</span>
            <a href="#" className={styles.legalLink}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;