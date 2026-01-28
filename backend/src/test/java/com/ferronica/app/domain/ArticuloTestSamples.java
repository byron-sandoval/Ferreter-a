package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ArticuloTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Articulo getArticuloSample1() {
        return new Articulo().id(1L).codigo("codigo1").nombre("nombre1").descripcion("descripcion1");
    }

    public static Articulo getArticuloSample2() {
        return new Articulo().id(2L).codigo("codigo2").nombre("nombre2").descripcion("descripcion2");
    }

    public static Articulo getArticuloRandomSampleGenerator() {
        return new Articulo()
            .id(longCount.incrementAndGet())
            .codigo(UUID.randomUUID().toString())
            .nombre(UUID.randomUUID().toString())
            .descripcion(UUID.randomUUID().toString());
    }
}
