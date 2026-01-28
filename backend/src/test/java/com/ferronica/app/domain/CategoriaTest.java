package com.ferronica.app.domain;

import static com.ferronica.app.domain.CategoriaTestSamples.*;
import static com.ferronica.app.domain.CategoriaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CategoriaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Categoria.class);
        Categoria categoria1 = getCategoriaSample1();
        Categoria categoria2 = new Categoria();
        assertThat(categoria1).isNotEqualTo(categoria2);

        categoria2.setId(categoria1.getId());
        assertThat(categoria1).isEqualTo(categoria2);

        categoria2 = getCategoriaSample2();
        assertThat(categoria1).isNotEqualTo(categoria2);
    }

    @Test
    void padreTest() {
        Categoria categoria = getCategoriaRandomSampleGenerator();
        Categoria categoriaBack = getCategoriaRandomSampleGenerator();

        categoria.setPadre(categoriaBack);
        assertThat(categoria.getPadre()).isEqualTo(categoriaBack);

        categoria.padre(null);
        assertThat(categoria.getPadre()).isNull();
    }
}
