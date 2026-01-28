package com.ferronica.app.domain;

import static com.ferronica.app.domain.DevolucionTestSamples.*;
import static com.ferronica.app.domain.VentaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DevolucionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Devolucion.class);
        Devolucion devolucion1 = getDevolucionSample1();
        Devolucion devolucion2 = new Devolucion();
        assertThat(devolucion1).isNotEqualTo(devolucion2);

        devolucion2.setId(devolucion1.getId());
        assertThat(devolucion1).isEqualTo(devolucion2);

        devolucion2 = getDevolucionSample2();
        assertThat(devolucion1).isNotEqualTo(devolucion2);
    }

    @Test
    void ventaTest() {
        Devolucion devolucion = getDevolucionRandomSampleGenerator();
        Venta ventaBack = getVentaRandomSampleGenerator();

        devolucion.setVenta(ventaBack);
        assertThat(devolucion.getVenta()).isEqualTo(ventaBack);

        devolucion.venta(null);
        assertThat(devolucion.getVenta()).isNull();
    }
}
