import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Columna 1 - Marca */}
          <div className={styles.column}>
            <h3 className={styles.brand}>SHOP.CO</h3>
            <p className={styles.description}>
              Tenemos productos que se adaptan a tu estilo y de los cuales te sentirás orgulloso de usar.
              Desde tecnología hasta accesorios.
            </p>
            <div className={styles.social}>
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"/>
                </svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2 - Compañía */}
          <div className={styles.column}>
            <h4 className={styles.title}>COMPANY</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>About</a></li>
              <li><a href="#" className={styles.link}>Features</a></li>
              <li><a href="#" className={styles.link}>Works</a></li>
              <li><a href="#" className={styles.link}>Career</a></li>
            </ul>
          </div>

          {/* Columna 3 - Ayuda */}
          <div className={styles.column}>
            <h4 className={styles.title}>HELP</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Customer Support</a></li>
              <li><a href="#" className={styles.link}>Delivery Details</a></li>
              <li><a href="#" className={styles.link}>Terms & Conditions</a></li>
              <li><a href="#" className={styles.link}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Columna 4 - FAQ */}
          <div className={styles.column}>
            <h4 className={styles.title}>FAQ</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Account</a></li>
              <li><a href="#" className={styles.link}>Manage Deliveries</a></li>
              <li><a href="#" className={styles.link}>Orders</a></li>
              <li><a href="#" className={styles.link}>Payments</a></li>
            </ul>
          </div>

          {/* Columna 5 - Recursos */}
          <div className={styles.column}>
            <h4 className={styles.title}>RESOURCES</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Free eBooks</a></li>
              <li><a href="#" className={styles.link}>Development Tutorial</a></li>
              <li><a href="#" className={styles.link}>How to - Blog</a></li>
              <li><a href="#" className={styles.link}>Youtube Playlist</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Shop.co © 2000-2023, All Rights Reserved
          </p>
          <div className={styles.payment}>
            <div className={styles.paymentBadge}>
              <svg viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <text x="24" y="20" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
              </svg>
            </div>
            <div className={styles.paymentBadge}>
              <svg viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#EB001B"/>
                <circle cx="18" cy="16" r="8" fill="#FF5F00"/>
                <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
              </svg>
            </div>
            <div className={styles.paymentBadge}>
              <svg viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#003087"/>
                <text x="24" y="20" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">PayPal</text>
              </svg>
            </div>
            <div className={styles.paymentBadge}>
              <svg viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="black"/>
                <text x="24" y="20" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">Apple Pay</text>
              </svg>
            </div>
            <div className={styles.paymentBadge}>
              <svg viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="white" stroke="#E5E7EB"/>
                <text x="24" y="20" fontSize="7" fill="#5F6368" textAnchor="middle" fontWeight="bold">G Pay</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;