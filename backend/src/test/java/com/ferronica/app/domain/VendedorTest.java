package com.ferronica.app.domain;

import static com.ferronica.app.domain.VendedorTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class VendedorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Vendedor.class);
        Vendedor vendedor1 = getVendedorSample1();
        Vendedor vendedor2 = new Vendedor();
        assertThat(vendedor1).isNotEqualTo(vendedor2);

        vendedor2.setId(vendedor1.getId());
        assertThat(vendedor1).isEqualTo(vendedor2);

        vendedor2 = getVendedorSample2();
        assertThat(vendedor1).isNotEqualTo(vendedor2);
    }
}
