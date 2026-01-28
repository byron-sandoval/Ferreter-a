package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.EmpresaAsserts.*;
import static com.ferronica.app.domain.EmpresaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EmpresaMapperTest {

    private EmpresaMapper empresaMapper;

    @BeforeEach
    void setUp() {
        empresaMapper = new EmpresaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getEmpresaSample1();
        var actual = empresaMapper.toEntity(empresaMapper.toDto(expected));
        assertEmpresaAllPropertiesEquals(expected, actual);
    }
}
