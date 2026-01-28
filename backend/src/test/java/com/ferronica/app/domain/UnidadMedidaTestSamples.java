package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UnidadMedidaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static UnidadMedida getUnidadMedidaSample1() {
        return new UnidadMedida().id(1L).nombre("nombre1").simbolo("simbolo1");
    }

    public static UnidadMedida getUnidadMedidaSample2() {
        return new UnidadMedida().id(2L).nombre("nombre2").simbolo("simbolo2");
    }

    public static UnidadMedida getUnidadMedidaRandomSampleGenerator() {
        return new UnidadMedida()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .simbolo(UUID.randomUUID().toString());
    }
}
