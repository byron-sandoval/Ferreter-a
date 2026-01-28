package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MonedaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Moneda getMonedaSample1() {
        return new Moneda().id(1L).nombre("nombre1").simbolo("simbolo1");
    }

    public static Moneda getMonedaSample2() {
        return new Moneda().id(2L).nombre("nombre2").simbolo("simbolo2");
    }

    public static Moneda getMonedaRandomSampleGenerator() {
        return new Moneda().id(longCount.incrementAndGet()).nombre(UUID.randomUUID().toString()).simbolo(UUID.randomUUID().toString());
    }
}
