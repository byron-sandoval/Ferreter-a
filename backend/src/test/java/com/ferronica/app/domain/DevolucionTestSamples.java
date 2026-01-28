package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class DevolucionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Devolucion getDevolucionSample1() {
        return new Devolucion().id(1L).motivo("motivo1");
    }

    public static Devolucion getDevolucionSample2() {
        return new Devolucion().id(2L).motivo("motivo2");
    }

    public static Devolucion getDevolucionRandomSampleGenerator() {
        return new Devolucion().id(longCount.incrementAndGet()).motivo(UUID.randomUUID().toString());
    }
}
