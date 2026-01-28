package com.ferronica.app.domain;

import static com.ferronica.app.domain.ArticuloTestSamples.*;
import static com.ferronica.app.domain.HistorialPrecioTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HistorialPrecioTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HistorialPrecio.class);
        HistorialPrecio historialPrecio1 = getHistorialPrecioSample1();
        HistorialPrecio historialPrecio2 = new HistorialPrecio();
        assertThat(historialPrecio1).isNotEqualTo(historialPrecio2);

        historialPrecio2.setId(historialPrecio1.getId());
        assertThat(historialPrecio1).isEqualTo(historialPrecio2);

        historialPrecio2 = getHistorialPrecioSample2();
        assertThat(historialPrecio1).isNotEqualTo(historialPrecio2);
    }

    @Test
    void articuloTest() {
        HistorialPrecio historialPrecio = getHistorialPrecioRandomSampleGenerator();
        Articulo articuloBack = getArticuloRandomSampleGenerator();

        historialPrecio.setArticulo(articuloBack);
        assertThat(historialPrecio.getArticulo()).isEqualTo(articuloBack);

        historialPrecio.articulo(null);
        assertThat(historialPrecio.getArticulo()).isNull();
    }
}
