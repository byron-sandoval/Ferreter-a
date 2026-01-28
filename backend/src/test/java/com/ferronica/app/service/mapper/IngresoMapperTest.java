package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.IngresoAsserts.*;
import static com.ferronica.app.domain.IngresoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class IngresoMapperTest {

    private IngresoMapper ingresoMapper;

    @BeforeEach
    void setUp() {
        ingresoMapper = new IngresoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getIngresoSample1();
        var actual = ingresoMapper.toEntity(ingresoMapper.toDto(expected));
        assertIngresoAllPropertiesEquals(expected, actual);
    }
}
