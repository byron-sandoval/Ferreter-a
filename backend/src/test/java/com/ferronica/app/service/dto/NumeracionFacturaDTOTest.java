package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NumeracionFacturaDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(NumeracionFacturaDTO.class);
        NumeracionFacturaDTO numeracionFacturaDTO1 = new NumeracionFacturaDTO();
        numeracionFacturaDTO1.setId(1L);
        NumeracionFacturaDTO numeracionFacturaDTO2 = new NumeracionFacturaDTO();
        assertThat(numeracionFacturaDTO1).isNotEqualTo(numeracionFacturaDTO2);
        numeracionFacturaDTO2.setId(numeracionFacturaDTO1.getId());
        assertThat(numeracionFacturaDTO1).isEqualTo(numeracionFacturaDTO2);
        numeracionFacturaDTO2.setId(2L);
        assertThat(numeracionFacturaDTO1).isNotEqualTo(numeracionFacturaDTO2);
        numeracionFacturaDTO1.setId(null);
        assertThat(numeracionFacturaDTO1).isNotEqualTo(numeracionFacturaDTO2);
    }
}
