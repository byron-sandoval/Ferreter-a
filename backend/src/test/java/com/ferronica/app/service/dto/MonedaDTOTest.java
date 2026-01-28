package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class MonedaDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(MonedaDTO.class);
        MonedaDTO monedaDTO1 = new MonedaDTO();
        monedaDTO1.setId(1L);
        MonedaDTO monedaDTO2 = new MonedaDTO();
        assertThat(monedaDTO1).isNotEqualTo(monedaDTO2);
        monedaDTO2.setId(monedaDTO1.getId());
        assertThat(monedaDTO1).isEqualTo(monedaDTO2);
        monedaDTO2.setId(2L);
        assertThat(monedaDTO1).isNotEqualTo(monedaDTO2);
        monedaDTO1.setId(null);
        assertThat(monedaDTO1).isNotEqualTo(monedaDTO2);
    }
}
