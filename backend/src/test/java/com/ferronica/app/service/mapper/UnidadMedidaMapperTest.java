package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.UnidadMedidaAsserts.*;
import static com.ferronica.app.domain.UnidadMedidaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UnidadMedidaMapperTest {

    private UnidadMedidaMapper unidadMedidaMapper;

    @BeforeEach
    void setUp() {
        unidadMedidaMapper = new UnidadMedidaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getUnidadMedidaSample1();
        var actual = unidadMedidaMapper.toEntity(unidadMedidaMapper.toDto(expected));
        assertUnidadMedidaAllPropertiesEquals(expected, actual);
    }
}
