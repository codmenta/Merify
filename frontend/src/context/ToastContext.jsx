import React, { createContext, useState, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ==========================================
// PASO 1: Context para manejar toasts globalmente
// ==========================================

const ToastContext = createContext();

// Hook personalizado para usar toasts fácilmente
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

// ==========================================
// PASO 2: Provider que envuelve la app
// ==========================================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = React.useRef(0);
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  // Función para agregar un toast
  // useCallback evita que se recree en cada render
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    // Lista de palabras clave que consideramos relacionadas a acciones que
    // sólo deberían mostrarse cuando el usuario está autenticado.
    const blockedKeywords = ['agregado', 'agregó', 'enviado', 'enviar', 'carrito', 'sesión', 'registr'];
    const msgLower = String(message || '').toLowerCase();

    if (!currentUser && type === 'success') {
      for (const kw of blockedKeywords) {
        if (msgLower.includes(kw)) {
          // Ignorar este toast cuando no hay usuario autenticado
          return null;
        }
      }
    }
    // Generador de IDs simple y seguro para evitar colisiones cuando se
    // crean varios toasts rápidamente. Usamos un contador incremental.
    const id = ++idRef.current;
    
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remover después de 'duration' milisegundos
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  // Función para remover un toast específico
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Atajos para diferentes tipos de notificaciones
  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// ==========================================
// PASO 3: Contenedor de toasts
// ==========================================
// Se posiciona en la esquina superior derecha
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      pointerEvents: 'none', // No bloquea clicks en el contenido
      maxWidth: '400px',
    }}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// ==========================================
// PASO 4: Componente Toast individual
// ==========================================
const Toast = ({ id, message, type, onClose }) => {
  // Configuración de colores e iconos según el tipo
  const config = {
    success: {
      bg: '#10b981',
      icon: CheckCircle,
      label: 'Éxito'
    },
    error: {
      bg: '#ef4444',
      icon: AlertCircle,
      label: 'Error'
    },
    warning: {
      bg: '#f59e0b',
      icon: AlertTriangle,
      label: 'Advertencia'
    },
    info: {
      bg: '#3b82f6',
      icon: Info,
      label: 'Información'
    }
  };

  const { bg, icon: Icon, label } = config[type] || config.info;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        padding: '1rem',
        minWidth: '300px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        pointerEvents: 'auto', // Permite interacción
        animation: 'slideIn 0.3s ease-out',
        borderLeft: `4px solid ${bg}`,
      }}
    >
      {/* Icono */}
      <div style={{
        color: bg,
        flexShrink: 0,
      }}>
        <Icon size={24} />
      </div>

      {/* Contenido */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#1f2937',
          marginBottom: '0.25rem',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: 1.5,
        }}>
          {message}
        </div>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.25rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
        aria-label="Cerrar notificación"
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// DEMO: Ejemplo de uso
// ==========================================
const ToastDemo = () => {
  const { toast } = useToast();

  return (
    <div style={{
      padding: '3rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Sistema de Notificaciones Toast
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Sistema moderno de notificaciones para reemplazar los alert() básicos.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <button
          onClick={() => toast.success('¡Producto agregado al carrito!')}
          style={{
            background: '#10b981',
            color: '#fff',
            padding: '1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ✓ Mostrar Éxito
        </button>

        <button
          onClick={() => toast.error('No se pudo procesar el pago')}
          style={{
            background: '#ef4444',
            color: '#fff',
            padding: '1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ✕ Mostrar Error
        </button>

        <button
          onClick={() => toast.warning('Stock limitado disponible')}
          style={{
            background: '#f59e0b',
            color: '#fff',
            padding: '1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⚠ Mostrar Advertencia
        </button>

        <button
          onClick={() => toast.info('Tu pedido será enviado en 24-48 horas')}
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ℹ Mostrar Info
        </button>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          📚 Cómo usar en tu proyecto:
        </h2>
        <pre style={{
          background: '#1f2937',
          color: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.5rem',
          overflow: 'auto',
          fontSize: '0.875rem',
        }}>
{`// 1. En tu componente:
import { useToast } from './context/ToastContext';

function MyComponent() {
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    // Tu lógica...
    toast.success('¡Producto agregado!');
  };
  
  return <button onClick={handleAddToCart}>Agregar</button>;
}`}
        </pre>
      </div>
    </div>
  );
};

// Wrapper principal
export default function App() {
  return (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  );
}