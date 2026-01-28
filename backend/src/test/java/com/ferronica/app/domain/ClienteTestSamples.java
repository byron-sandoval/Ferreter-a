package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ClienteTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Cliente getClienteSample1() {
        return new Cliente().id(1L).cedula("cedula1").nombre("nombre1").direccion("direccion1").telefono("telefono1");
    }

    public static Cliente getClienteSample2() {
        return new Cliente().id(2L).cedula("cedula2").nombre("nombre2").direccion("direccion2").telefono("telefono2");
    }

    public static Cliente getClienteRandomSampleGenerator() {
        return new Cliente()
            .id(longCount.incrementAndGet())
            .cedula(UUID.randomUUID().toString())
            .nombre(UUID.randomUUID().toString())
            .direccion(UUID.randomUUID().toString())
            .telefono(UUID.randomUUID().toString());
    }
}
