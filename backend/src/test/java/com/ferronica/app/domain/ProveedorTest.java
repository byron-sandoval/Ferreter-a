package com.ferronica.app.domain;

import static com.ferronica.app.domain.ProveedorTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProveedorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Proveedor.class);
        Proveedor proveedor1 = getProveedorSample1();
        Proveedor proveedor2 = new Proveedor();
        assertThat(proveedor1).isNotEqualTo(proveedor2);

        proveedor2.setId(proveedor1.getId());
        assertThat(proveedor1).isEqualTo(proveedor2);

        proveedor2 = getProveedorSample2();
        assertThat(proveedor1).isNotEqualTo(proveedor2);
    }
}
