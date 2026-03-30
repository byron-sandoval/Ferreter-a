package com.ferronica.app.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    /**
     * Crea un PaymentIntent en Stripe.
     *
     * @param amount   monto en centavos (ej: 5000 = $50.00)
     * @param currency moneda (ej: "usd" o "nic")
     * @return clientSecret del PaymentIntent
     */
    public String createPaymentIntent(long amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount)
            .setCurrency(currency)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();

        PaymentIntent intent = PaymentIntent.create(params);
        log.debug("PaymentIntent creado: {}", intent.getId());
        return intent.getClientSecret();
    }
}
