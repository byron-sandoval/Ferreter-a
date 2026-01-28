package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DetalleIngresoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DetalleIngresoDTO.class);
        DetalleIngresoDTO detalleIngresoDTO1 = new DetalleIngresoDTO();
        detalleIngresoDTO1.setId(1L);
        DetalleIngresoDTO detalleIngresoDTO2 = new DetalleIngresoDTO();
        assertThat(detalleIngresoDTO1).isNotEqualTo(detalleIngresoDTO2);
        detalleIngresoDTO2.setId(detalleIngresoDTO1.getId());
        assertThat(detalleIngresoDTO1).isEqualTo(detalleIngresoDTO2);
        detalleIngresoDTO2.setId(2L);
        assertThat(detalleIngresoDTO1).isNotEqualTo(detalleIngresoDTO2);
        detalleIngresoDTO1.setId(null);
        assertThat(detalleIngresoDTO1).isNotEqualTo(detalleIngresoDTO2);
    }
}
