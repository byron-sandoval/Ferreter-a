package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class VendedorTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Vendedor getVendedorSample1() {
        return new Vendedor()
            .id(1L)
            .idKeycloak("idKeycloak1")
            .cedula("cedula1")
            .nombre("nombre1")
            .apellido("apellido1")
            .telefono("telefono1");
    }

    public static Vendedor getVendedorSample2() {
        return new Vendedor()
            .id(2L)
            .idKeycloak("idKeycloak2")
            .cedula("cedula2")
            .nombre("nombre2")
            .apellido("apellido2")
            .telefono("telefono2");
    }

    public static Vendedor getVendedorRandomSampleGenerator() {
        return new Vendedor()
            .id(longCount.incrementAndGet())
            .idKeycloak(UUID.randomUUID().toString())
            .cedula(UUID.randomUUID().toString())
            .nombre(UUID.randomUUID().toString())
            .apellido(UUID.randomUUID().toString())
            .telefono(UUID.randomUUID().toString());
    }
}
