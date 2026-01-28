package com.ferronica.app.domain;

import static com.ferronica.app.domain.ArticuloTestSamples.*;
import static com.ferronica.app.domain.CategoriaTestSamples.*;
import static com.ferronica.app.domain.UnidadMedidaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ArticuloTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Articulo.class);
        Articulo articulo1 = getArticuloSample1();
        Articulo articulo2 = new Articulo();
        assertThat(articulo1).isNotEqualTo(articulo2);

        articulo2.setId(articulo1.getId());
        assertThat(articulo1).isEqualTo(articulo2);

        articulo2 = getArticuloSample2();
        assertThat(articulo1).isNotEqualTo(articulo2);
    }

    @Test
    void categoriaTest() {
        Articulo articulo = getArticuloRandomSampleGenerator();
        Categoria categoriaBack = getCategoriaRandomSampleGenerator();

        articulo.setCategoria(categoriaBack);
        assertThat(articulo.getCategoria()).isEqualTo(categoriaBack);

        articulo.categoria(null);
        assertThat(articulo.getCategoria()).isNull();
    }

    @Test
    void unidadMedidaTest() {
        Articulo articulo = getArticuloRandomSampleGenerator();
        UnidadMedida unidadMedidaBack = getUnidadMedidaRandomSampleGenerator();

        articulo.setUnidadMedida(unidadMedidaBack);
        assertThat(articulo.getUnidadMedida()).isEqualTo(unidadMedidaBack);

        articulo.unidadMedida(null);
        assertThat(articulo.getUnidadMedida()).isNull();
    }
}
