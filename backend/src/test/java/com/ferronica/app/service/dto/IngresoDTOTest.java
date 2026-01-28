package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class IngresoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(IngresoDTO.class);
        IngresoDTO ingresoDTO1 = new IngresoDTO();
        ingresoDTO1.setId(1L);
        IngresoDTO ingresoDTO2 = new IngresoDTO();
        assertThat(ingresoDTO1).isNotEqualTo(ingresoDTO2);
        ingresoDTO2.setId(ingresoDTO1.getId());
        assertThat(ingresoDTO1).isEqualTo(ingresoDTO2);
        ingresoDTO2.setId(2L);
        assertThat(ingresoDTO1).isNotEqualTo(ingresoDTO2);
        ingresoDTO1.setId(null);
        assertThat(ingresoDTO1).isNotEqualTo(ingresoDTO2);
    }
}
