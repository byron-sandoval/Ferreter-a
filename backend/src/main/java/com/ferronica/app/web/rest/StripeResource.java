package com.ferronica.app.web.rest;

import com.ferronica.app.service.StripeService;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeResource {

    private static final Logger log = LoggerFactory.getLogger(StripeResource.class);

    private final StripeService stripeService;

    public StripeResource(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    /**
     * POST /api/stripe/create-payment-intent
     * Crea un PaymentIntent de Stripe y retorna el clientSecret al frontend.
     *
     * Body esperado: { "amount": 5000, "currency": "usd" }
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> payload) {
        try {
            long amount = Long.parseLong(payload.get("amount").toString());
            String currency = payload.getOrDefault("currency", "usd").toString();

            String clientSecret = stripeService.createPaymentIntent(amount, currency);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", clientSecret);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error al crear PaymentIntent de Stripe: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
