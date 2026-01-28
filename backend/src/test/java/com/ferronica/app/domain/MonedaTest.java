package com.ferronica.app.domain;

import static com.ferronica.app.domain.MonedaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class MonedaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Moneda.class);
        Moneda moneda1 = getMonedaSample1();
        Moneda moneda2 = new Moneda();
        assertThat(moneda1).isNotEqualTo(moneda2);

        moneda2.setId(moneda1.getId());
        assertThat(moneda1).isEqualTo(moneda2);

        moneda2 = getMonedaSample2();
        assertThat(moneda1).isNotEqualTo(moneda2);
    }
}
