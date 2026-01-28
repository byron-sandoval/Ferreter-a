package com.ferronica.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class EmpresaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Empresa getEmpresaSample1() {
        return new Empresa()
            .id(1L)
            .nombre("nombre1")
            .ruc("ruc1")
            .regimenFiscal("regimenFiscal1")
            .direccion("direccion1")
            .telefono("telefono1")
            .correo("correo1")
            .eslogan("eslogan1");
    }

    public static Empresa getEmpresaSample2() {
        return new Empresa()
            .id(2L)
            .nombre("nombre2")
            .ruc("ruc2")
            .regimenFiscal("regimenFiscal2")
            .direccion("direccion2")
            .telefono("telefono2")
            .correo("correo2")
            .eslogan("eslogan2");
    }

    public static Empresa getEmpresaRandomSampleGenerator() {
        return new Empresa()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .ruc(UUID.randomUUID().toString())
            .regimenFiscal(UUID.randomUUID().toString())
            .direccion(UUID.randomUUID().toString())
            .telefono(UUID.randomUUID().toString())
            .correo(UUID.randomUUID().toString())
            .eslogan(UUID.randomUUID().toString());
    }
}
