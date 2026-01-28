package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class HistorialPrecioTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static HistorialPrecio getHistorialPrecioSample1() {
        return new HistorialPrecio().id(1L).motivo("motivo1");
    }

    public static HistorialPrecio getHistorialPrecioSample2() {
        return new HistorialPrecio().id(2L).motivo("motivo2");
    }

    public static HistorialPrecio getHistorialPrecioRandomSampleGenerator() {
        return new HistorialPrecio().id(longCount.incrementAndGet()).motivo(UUID.randomUUID().toString());
    }
}
