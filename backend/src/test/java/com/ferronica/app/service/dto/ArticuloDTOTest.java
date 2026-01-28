package com.ferronica.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ArticuloDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ArticuloDTO.class);
        ArticuloDTO articuloDTO1 = new ArticuloDTO();
        articuloDTO1.setId(1L);
        ArticuloDTO articuloDTO2 = new ArticuloDTO();
        assertThat(articuloDTO1).isNotEqualTo(articuloDTO2);
        articuloDTO2.setId(articuloDTO1.getId());
        assertThat(articuloDTO1).isEqualTo(articuloDTO2);
        articuloDTO2.setId(2L);
        assertThat(articuloDTO1).isNotEqualTo(articuloDTO2);
        articuloDTO1.setId(null);
        assertThat(articuloDTO1).isNotEqualTo(articuloDTO2);
    }
}
