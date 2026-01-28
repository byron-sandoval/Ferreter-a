package com.ferronica.app.domain;

import static com.ferronica.app.domain.ArticuloTestSamples.*;
import static com.ferronica.app.domain.DetalleIngresoTestSamples.*;
import static com.ferronica.app.domain.IngresoTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DetalleIngresoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DetalleIngreso.class);
        DetalleIngreso detalleIngreso1 = getDetalleIngresoSample1();
        DetalleIngreso detalleIngreso2 = new DetalleIngreso();
        assertThat(detalleIngreso1).isNotEqualTo(detalleIngreso2);

        detalleIngreso2.setId(detalleIngreso1.getId());
        assertThat(detalleIngreso1).isEqualTo(detalleIngreso2);

        detalleIngreso2 = getDetalleIngresoSample2();
        assertThat(detalleIngreso1).isNotEqualTo(detalleIngreso2);
    }

    @Test
    void articuloTest() {
        DetalleIngreso detalleIngreso = getDetalleIngresoRandomSampleGenerator();
        Articulo articuloBack = getArticuloRandomSampleGenerator();

        detalleIngreso.setArticulo(articuloBack);
        assertThat(detalleIngreso.getArticulo()).isEqualTo(articuloBack);

        detalleIngreso.articulo(null);
        assertThat(detalleIngreso.getArticulo()).isNull();
    }

    @Test
    void ingresoTest() {
        DetalleIngreso detalleIngreso = getDetalleIngresoRandomSampleGenerator();
        Ingreso ingresoBack = getIngresoRandomSampleGenerator();

        detalleIngreso.setIngreso(ingresoBack);
        assertThat(detalleIngreso.getIngreso()).isEqualTo(ingresoBack);

        detalleIngreso.ingreso(null);
        assertThat(detalleIngreso.getIngreso()).isNull();
    }
}
