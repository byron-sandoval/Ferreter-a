/**
 * Configuración de Stripe para el frontend.
 *
 * La clave pública se toma de la variable de entorno REACT_APP_STRIPE_PUBLISHABLE_KEY
 * definida en el archivo frontend/.env
 */

import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('⚠️  REACT_APP_STRIPE_PUBLISHABLE_KEY no está definida en el .env');
}

// Singleton de Stripe para reutilizar en toda la app
export const stripePromise = loadStripe(stripePublishableKey || '');

export default stripePromise;
