package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class VendedorDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(VendedorDTO.class);
        VendedorDTO vendedorDTO1 = new VendedorDTO();
        vendedorDTO1.setId(1L);
        VendedorDTO vendedorDTO2 = new VendedorDTO();
        assertThat(vendedorDTO1).isNotEqualTo(vendedorDTO2);
        vendedorDTO2.setId(vendedorDTO1.getId());
        assertThat(vendedorDTO1).isEqualTo(vendedorDTO2);
        vendedorDTO2.setId(2L);
        assertThat(vendedorDTO1).isNotEqualTo(vendedorDTO2);
        vendedorDTO1.setId(null);
        assertThat(vendedorDTO1).isNotEqualTo(vendedorDTO2);
    }
}
