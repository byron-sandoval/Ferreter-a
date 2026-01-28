package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class IngresoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Ingreso getIngresoSample1() {
        return new Ingreso().id(1L).noDocumento("noDocumento1").observaciones("observaciones1");
    }

    public static Ingreso getIngresoSample2() {
        return new Ingreso().id(2L).noDocumento("noDocumento2").observaciones("observaciones2");
    }

    public static Ingreso getIngresoRandomSampleGenerator() {
        return new Ingreso()
            .id(longCount.incrementAndGet())
            .noDocumento(UUID.randomUUID().toString())
            .observaciones(UUID.randomUUID().toString());
    }
}
