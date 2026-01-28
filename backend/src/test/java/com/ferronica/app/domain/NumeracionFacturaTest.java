package com.ferronica.app.domain;

import static com.ferronica.app.domain.NumeracionFacturaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NumeracionFacturaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(NumeracionFactura.class);
        NumeracionFactura numeracionFactura1 = getNumeracionFacturaSample1();
        NumeracionFactura numeracionFactura2 = new NumeracionFactura();
        assertThat(numeracionFactura1).isNotEqualTo(numeracionFactura2);

        numeracionFactura2.setId(numeracionFactura1.getId());
        assertThat(numeracionFactura1).isEqualTo(numeracionFactura2);

        numeracionFactura2 = getNumeracionFacturaSample2();
        assertThat(numeracionFactura1).isNotEqualTo(numeracionFactura2);
    }
}
