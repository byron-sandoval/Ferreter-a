package com.ferronica.app.domain;

import static com.ferronica.app.domain.DetalleIngresoTestSamples.*;
import static com.ferronica.app.domain.IngresoTestSamples.*;
import static com.ferronica.app.domain.ProveedorTestSamples.*;
import static com.ferronica.app.domain.VendedorTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class IngresoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Ingreso.class);
        Ingreso ingreso1 = getIngresoSample1();
        Ingreso ingreso2 = new Ingreso();
        assertThat(ingreso1).isNotEqualTo(ingreso2);

        ingreso2.setId(ingreso1.getId());
        assertThat(ingreso1).isEqualTo(ingreso2);

        ingreso2 = getIngresoSample2();
        assertThat(ingreso1).isNotEqualTo(ingreso2);
    }

    @Test
    void detallesTest() {
        Ingreso ingreso = getIngresoRandomSampleGenerator();
        DetalleIngreso detalleIngresoBack = getDetalleIngresoRandomSampleGenerator();

        ingreso.addDetalles(detalleIngresoBack);
        assertThat(ingreso.getDetalles()).containsOnly(detalleIngresoBack);
        assertThat(detalleIngresoBack.getIngreso()).isEqualTo(ingreso);

        ingreso.removeDetalles(detalleIngresoBack);
        assertThat(ingreso.getDetalles()).doesNotContain(detalleIngresoBack);
        assertThat(detalleIngresoBack.getIngreso()).isNull();

        ingreso.detalles(new HashSet<>(Set.of(detalleIngresoBack)));
        assertThat(ingreso.getDetalles()).containsOnly(detalleIngresoBack);
        assertThat(detalleIngresoBack.getIngreso()).isEqualTo(ingreso);

        ingreso.setDetalles(new HashSet<>());
        assertThat(ingreso.getDetalles()).doesNotContain(detalleIngresoBack);
        assertThat(detalleIngresoBack.getIngreso()).isNull();
    }

    @Test
    void vendedorTest() {
        Ingreso ingreso = getIngresoRandomSampleGenerator();
        Vendedor vendedorBack = getVendedorRandomSampleGenerator();

        ingreso.setVendedor(vendedorBack);
        assertThat(ingreso.getVendedor()).isEqualTo(vendedorBack);

        ingreso.vendedor(null);
        assertThat(ingreso.getVendedor()).isNull();
    }

    @Test
    void proveedorTest() {
        Ingreso ingreso = getIngresoRandomSampleGenerator();
        Proveedor proveedorBack = getProveedorRandomSampleGenerator();

        ingreso.setProveedor(proveedorBack);
        assertThat(ingreso.getProveedor()).isEqualTo(proveedorBack);

        ingreso.proveedor(null);
        assertThat(ingreso.getProveedor()).isNull();
    }
}
