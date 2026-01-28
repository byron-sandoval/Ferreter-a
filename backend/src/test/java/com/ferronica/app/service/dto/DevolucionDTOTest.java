package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DevolucionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DevolucionDTO.class);
        DevolucionDTO devolucionDTO1 = new DevolucionDTO();
        devolucionDTO1.setId(1L);
        DevolucionDTO devolucionDTO2 = new DevolucionDTO();
        assertThat(devolucionDTO1).isNotEqualTo(devolucionDTO2);
        devolucionDTO2.setId(devolucionDTO1.getId());
        assertThat(devolucionDTO1).isEqualTo(devolucionDTO2);
        devolucionDTO2.setId(2L);
        assertThat(devolucionDTO1).isNotEqualTo(devolucionDTO2);
        devolucionDTO1.setId(null);
        assertThat(devolucionDTO1).isNotEqualTo(devolucionDTO2);
    }
}
