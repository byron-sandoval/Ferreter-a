package com.ferronica.app.domain;

import static com.ferronica.app.domain.ArticuloTestSamples.*;
import static com.ferronica.app.domain.DetalleVentaTestSamples.*;
import static com.ferronica.app.domain.VentaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DetalleVentaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DetalleVenta.class);
        DetalleVenta detalleVenta1 = getDetalleVentaSample1();
        DetalleVenta detalleVenta2 = new DetalleVenta();
        assertThat(detalleVenta1).isNotEqualTo(detalleVenta2);

        detalleVenta2.setId(detalleVenta1.getId());
        assertThat(detalleVenta1).isEqualTo(detalleVenta2);

        detalleVenta2 = getDetalleVentaSample2();
        assertThat(detalleVenta1).isNotEqualTo(detalleVenta2);
    }

    @Test
    void articuloTest() {
        DetalleVenta detalleVenta = getDetalleVentaRandomSampleGenerator();
        Articulo articuloBack = getArticuloRandomSampleGenerator();

        detalleVenta.setArticulo(articuloBack);
        assertThat(detalleVenta.getArticulo()).isEqualTo(articuloBack);

        detalleVenta.articulo(null);
        assertThat(detalleVenta.getArticulo()).isNull();
    }

    @Test
    void ventaTest() {
        DetalleVenta detalleVenta = getDetalleVentaRandomSampleGenerator();
        Venta ventaBack = getVentaRandomSampleGenerator();

        detalleVenta.setVenta(ventaBack);
        assertThat(detalleVenta.getVenta()).isEqualTo(ventaBack);

        detalleVenta.venta(null);
        assertThat(detalleVenta.getVenta()).isNull();
    }
}
