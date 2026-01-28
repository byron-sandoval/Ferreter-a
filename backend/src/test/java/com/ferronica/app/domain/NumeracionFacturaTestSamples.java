package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class NumeracionFacturaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static NumeracionFactura getNumeracionFacturaSample1() {
        return new NumeracionFactura().id(1L).serie("serie1").correlativoActual(1L);
    }

    public static NumeracionFactura getNumeracionFacturaSample2() {
        return new NumeracionFactura().id(2L).serie("serie2").correlativoActual(2L);
    }

    public static NumeracionFactura getNumeracionFacturaRandomSampleGenerator() {
        return new NumeracionFactura()
            .id(longCount.incrementAndGet())
            .serie(UUID.randomUUID().toString())
            .correlativoActual(longCount.incrementAndGet());
    }
}
