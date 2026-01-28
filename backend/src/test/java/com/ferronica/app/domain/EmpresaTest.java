package com.ferronica.app.domain;

import static com.ferronica.app.domain.EmpresaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.ferronica.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class EmpresaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Empresa.class);
        Empresa empresa1 = getEmpresaSample1();
        Empresa empresa2 = new Empresa();
        assertThat(empresa1).isNotEqualTo(empresa2);

        empresa2.setId(empresa1.getId());
        assertThat(empresa1).isEqualTo(empresa2);

        empresa2 = getEmpresaSample2();
        assertThat(empresa1).isNotEqualTo(empresa2);
    }
}
