package com.ferronica.app.domain;

import static com.ferronica.app.domain.ClienteTestSamples.*;
import static com.ferronica.app.domain.DetalleVentaTestSamples.*;
import static com.ferronica.app.domain.MonedaTestSamples.*;
import static com.ferronica.app.domain.NumeracionFacturaTestSamples.*;
import static com.ferronica.app.domain.VendedorTestSamples.*;
import static com.ferronica.app.domain.VentaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class VentaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Venta.class);
        Venta venta1 = getVentaSample1();
        Venta venta2 = new Venta();
        assertThat(venta1).isNotEqualTo(venta2);

        venta2.setId(venta1.getId());
        assertThat(venta1).isEqualTo(venta2);

        venta2 = getVentaSample2();
        assertThat(venta1).isNotEqualTo(venta2);
    }

    @Test
    void detallesTest() {
        Venta venta = getVentaRandomSampleGenerator();
        DetalleVenta detalleVentaBack = getDetalleVentaRandomSampleGenerator();

        venta.addDetalles(detalleVentaBack);
        assertThat(venta.getDetalles()).containsOnly(detalleVentaBack);
        assertThat(detalleVentaBack.getVenta()).isEqualTo(venta);

        venta.removeDetalles(detalleVentaBack);
        assertThat(venta.getDetalles()).doesNotContain(detalleVentaBack);
        assertThat(detalleVentaBack.getVenta()).isNull();

        venta.detalles(new HashSet<>(Set.of(detalleVentaBack)));
        assertThat(venta.getDetalles()).containsOnly(detalleVentaBack);
        assertThat(detalleVentaBack.getVenta()).isEqualTo(venta);

        venta.setDetalles(new HashSet<>());
        assertThat(venta.getDetalles()).doesNotContain(detalleVentaBack);
        assertThat(detalleVentaBack.getVenta()).isNull();
    }

    @Test
    void clienteTest() {
        Venta venta = getVentaRandomSampleGenerator();
        Cliente clienteBack = getClienteRandomSampleGenerator();

        venta.setCliente(clienteBack);
        assertThat(venta.getCliente()).isEqualTo(clienteBack);

        venta.cliente(null);
        assertThat(venta.getCliente()).isNull();
    }

    @Test
    void vendedorTest() {
        Venta venta = getVentaRandomSampleGenerator();
        Vendedor vendedorBack = getVendedorRandomSampleGenerator();

        venta.setVendedor(vendedorBack);
        assertThat(venta.getVendedor()).isEqualTo(vendedorBack);

        venta.vendedor(null);
        assertThat(venta.getVendedor()).isNull();
    }

    @Test
    void monedaTest() {
        Venta venta = getVentaRandomSampleGenerator();
        Moneda monedaBack = getMonedaRandomSampleGenerator();

        venta.setMoneda(monedaBack);
        assertThat(venta.getMoneda()).isEqualTo(monedaBack);

        venta.moneda(null);
        assertThat(venta.getMoneda()).isNull();
    }

    @Test
    void numeracionTest() {
        Venta venta = getVentaRandomSampleGenerator();
        NumeracionFactura numeracionFacturaBack = getNumeracionFacturaRandomSampleGenerator();

        venta.setNumeracion(numeracionFacturaBack);
        assertThat(venta.getNumeracion()).isEqualTo(numeracionFacturaBack);

        venta.numeracion(null);
        assertThat(venta.getNumeracion()).isNull();
    }
}
