package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HistorialPrecioDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HistorialPrecioDTO.class);
        HistorialPrecioDTO historialPrecioDTO1 = new HistorialPrecioDTO();
        historialPrecioDTO1.setId(1L);
        HistorialPrecioDTO historialPrecioDTO2 = new HistorialPrecioDTO();
        assertThat(historialPrecioDTO1).isNotEqualTo(historialPrecioDTO2);
        historialPrecioDTO2.setId(historialPrecioDTO1.getId());
        assertThat(historialPrecioDTO1).isEqualTo(historialPrecioDTO2);
        historialPrecioDTO2.setId(2L);
        assertThat(historialPrecioDTO1).isNotEqualTo(historialPrecioDTO2);
        historialPrecioDTO1.setId(null);
        assertThat(historialPrecioDTO1).isNotEqualTo(historialPrecioDTO2);
    }
}
