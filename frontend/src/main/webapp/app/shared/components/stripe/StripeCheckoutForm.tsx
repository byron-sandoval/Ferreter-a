import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faExclamationCircle, faTimes, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// ─── Estilos del CardElement de Stripe ───────────────────────────────────────
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1e293b',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// ─── Props del componente ─────────────────────────────────────────────────────
interface StripeCheckoutFormProps {
  /** Monto total a cobrar en la moneda seleccionada */
  amount: number;
  /** Moneda, ej: 'usd'. Por defecto 'usd' */
  currency?: string;
  /** Símbolo a mostrar para el monto, ej: '$' */
  currencySymbol?: string;
  /** Callback cuando el pago es exitoso. Recibe el paymentIntentId */
  onSuccess: (paymentIntentId: string) => void;
  /** Callback cuando el usuario cancela/cierra */
  onCancel: () => void;
  /** Descripción opcional de la venta para mostrar en el header */
  description?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────
const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  currency = 'usd',
  currencySymbol = '$',
  onSuccess,
  onCancel,
  description,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // ── Formato del monto ────────────────────────────────────────────────────
  // Stripe trabaja en centavos (la unidad más pequeña de la moneda)
  const amountInCents = Math.round(amount * 100);

  // ── Manejo de cambios en el CardElement ─────────────────────────────────
  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  // ── Enviar el pago ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js aún no ha cargado
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setCardError(null);

    try {
      // 1. Obtener el clientSecret desde nuestro backend
      const { data } = await axios.post<{ clientSecret: string; error?: string }>(
        '/api/stripe/create-payment-intent',
        { amount: amountInCents, currency },
      );

      if (data.error || !data.clientSecret) {
        setCardError(data.error || 'Error al iniciar el pago. Intenta nuevamente.');
        setProcessing(false);
        return;
      }

      // 2. Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setCardError(stripeError.message || 'Error al procesar el pago.');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        // Esperar un momento para mostrar el éxito antes de cerrar
        setTimeout(() => {
          onSuccess(paymentIntent.id);
        }, 1800);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Error inesperado. Intenta nuevamente.';
      setCardError(msg);
      setProcessing(false);
    }
  };

  // ─── Render: pantalla de éxito ───────────────────────────────────────────
  if (succeeded) {
    return (
      <div className="stripe-success-box">
        <div className="success-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h6>¡Pago Exitoso!</h6>
        <p>El pago de {currencySymbol}{amount.toLocaleString()} fue procesado correctamente.</p>
      </div>
    );
  }

  // ─── Render: formulario ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Resumen del monto */}
      <div className="stripe-amount-summary">
        <div>
          <div className="stripe-amount-label">Total a pagar</div>
          {description && (
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{description}</div>
          )}
        </div>
        <div className="stripe-amount-value">
          {currencySymbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Campo de tarjeta */}
      <label className="stripe-card-label" htmlFor="stripe-card-element">
        <FontAwesomeIcon icon={faCreditCard} className="me-1" style={{ color: '#4f46e5' }} />
        Información de Tarjeta
      </label>
      <div className={`stripe-card-field-wrapper${cardError ? ' is-error' : ''}`}>
        <CardElement
          id="stripe-card-element"
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleCardChange}
        />
      </div>

      {/* Error de tarjeta */}
      {cardError && (
        <div className="stripe-error-msg" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {cardError}
        </div>
      )}

      {/* Botón de pago */}
      <button
        id="stripe-pay-button"
        type="submit"
        className="stripe-pay-btn"
        disabled={!stripe || !cardComplete || processing}
      >
        {processing ? (
          <>
            <div className="stripe-spinner" />
            Procesando...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faLock} />
            Pagar {currencySymbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </>
        )}
      </button>

      {/* Nota de seguridad */}
      <div className="stripe-secure-note">
        <FontAwesomeIcon icon={faLock} />
        Pago seguro cifrado con SSL · Powered by Stripe
      </div>
    </form>
  );
};

export default StripeCheckoutForm;
