package com.ferronica.app.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class DetalleIngresoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static DetalleIngreso getDetalleIngresoSample1() {
        return new DetalleIngreso().id(1L);
    }

    public static DetalleIngreso getDetalleIngresoSample2() {
        return new DetalleIngreso().id(2L);
    }

    public static DetalleIngreso getDetalleIngresoRandomSampleGenerator() {
        return new DetalleIngreso().id(longCount.incrementAndGet());
    }
}
