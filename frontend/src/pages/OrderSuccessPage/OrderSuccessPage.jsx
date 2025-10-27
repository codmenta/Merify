// frontend/src/pages/OrderSuccessPage/OrderSuccessPage.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import styles from './OrderSuccessPage.module.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useContext(CartContext);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Vaciar el carrito después de un pago exitoso
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className={styles.successPage}>
      <div className={styles.successContainer}>
        
        {/* Icono de éxito animado */}
        <div className={styles.successIcon}>
          <CheckCircle size={80} />
        </div>

        {/* Título */}
        <h1 className={styles.successTitle}>
          ¡Pedido realizado con éxito!
        </h1>

        {/* Descripción */}
        <p className={styles.successDescription}>
          Tu pago ha sido procesado correctamente. 
          Recibirás un correo de confirmación en breve.
        </p>

        {/* ID de sesión (opcional) */}
        {sessionId && (
          <div className={styles.sessionInfo}>
            <Package size={20} />
            <div>
              <span className={styles.sessionLabel}>ID de transacción:</span>
              <span className={styles.sessionId}>{sessionId.slice(0, 20)}...</span>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className={styles.infoCard}>
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>📧 Recibirás un correo de confirmación</li>
            <li>📦 Prepararemos tu pedido en 24-48 horas</li>
            <li>🚚 Te notificaremos cuando esté en camino</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button 
            onClick={() => navigate('/')}
            className={styles.primaryButton}
          >
            Seguir comprando
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Mensaje de soporte */}
        <p className={styles.supportText}>
          ¿Necesitas ayuda? Contáctanos en{' '}
          <a href="mailto:soporte@tutienda.com">soporte@tutienda.com</a>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;