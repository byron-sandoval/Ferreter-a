package com.ferronica.app.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class DetalleVentaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static DetalleVenta getDetalleVentaSample1() {
        return new DetalleVenta().id(1L);
    }

    public static DetalleVenta getDetalleVentaSample2() {
        return new DetalleVenta().id(2L);
    }

    public static DetalleVenta getDetalleVentaRandomSampleGenerator() {
        return new DetalleVenta().id(longCount.incrementAndGet());
    }
}
