/**
 * StripeCheckoutModal.tsx
 *
 * Modal de pago con Stripe. Envuelve el formulario con el proveedor
 * <Elements> de Stripe y gestiona la apertura/cierre.
 *
 * Uso:
 * ────
 *   <StripeCheckoutModal
 *     isOpen={showPago}
 *     amount={ventaTotal}           // ej: 85.50 (en dólares)
 *     currency="usd"
 *     currencySymbol="$"
 *     description="Venta #2045"
 *     onSuccess={(intentId) => console.log('Pagado:', intentId)}
 *     onCancel={() => setShowPago(false)}
 *   />
 */

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { stripePromise } from 'app/config/stripe';
import StripeCheckoutForm from './StripeCheckoutForm';
import './StripeCheckout.css';

// ─── Props del modal ──────────────────────────────────────────────────────────
export interface StripeCheckoutModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Monto a cobrar (en la moneda indicada) */
  amount: number;
  /** Código de moneda para Stripe, ej: 'usd' */
  currency?: string;
  /** Símbolo a mostrar junto al monto, ej: '$' */
  currencySymbol?: string;
  /** Texto descriptivo de la venta */
  description?: string;
  /** Se llama al completar el pago exitosamente */
  onSuccess: (paymentIntentId: string) => void;
  /** Se llama al cerrar/cancelar el modal */
  onCancel: () => void;
}

// ─── Apariencia de los Elements de Stripe ────────────────────────────────────
const STRIPE_ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    },
  ],
};

// ─── Componente ───────────────────────────────────────────────────────────────
const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  amount,
  currency = 'usd',
  currencySymbol = '$',
  description,
  onSuccess,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Cerrar al hacer clic en el overlay (fuera del panel)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="stripe-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Modal de pago con Stripe"
      onClick={handleOverlayClick}
    >
      <div className="stripe-modal-panel">
        {/* ── Cabecera ── */}
        <div className="stripe-modal-header">
          <h5>
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
            Pago Seguro con Tarjeta
          </h5>
          <div className="stripe-badge">
            <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: '0.6rem' }} />
            Procesado por Stripe
          </div>

          {/* Botón cerrar */}
          <button
            id="stripe-modal-close-btn"
            className="stripe-close-btn"
            onClick={onCancel}
            aria-label="Cerrar modal de pago"
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ── Cuerpo: formulario envuelto con Elements de Stripe ── */}
        <div className="stripe-modal-body">
          {/*
            Elements provee el contexto de Stripe a todos los elementos hijos.
            stripePromise es el singleton inicializado con la publishable key.
          */}
          <Elements stripe={stripePromise} options={STRIPE_ELEMENTS_OPTIONS}>
            <StripeCheckoutForm
              amount={amount}
              currency={currency}
              currencySymbol={currencySymbol}
              description={description}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutModal;
