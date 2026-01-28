package com.ferronica.app.domain;

import static com.ferronica.app.domain.UnidadMedidaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UnidadMedidaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UnidadMedida.class);
        UnidadMedida unidadMedida1 = getUnidadMedidaSample1();
        UnidadMedida unidadMedida2 = new UnidadMedida();
        assertThat(unidadMedida1).isNotEqualTo(unidadMedida2);

        unidadMedida2.setId(unidadMedida1.getId());
        assertThat(unidadMedida1).isEqualTo(unidadMedida2);

        unidadMedida2 = getUnidadMedidaSample2();
        assertThat(unidadMedida1).isNotEqualTo(unidadMedida2);
    }
}
