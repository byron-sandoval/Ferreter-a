package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.DetalleIngresoAsserts.*;
import static com.ferronica.app.domain.DetalleIngresoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DetalleIngresoMapperTest {

    private DetalleIngresoMapper detalleIngresoMapper;

    @BeforeEach
    void setUp() {
        detalleIngresoMapper = new DetalleIngresoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDetalleIngresoSample1();
        var actual = detalleIngresoMapper.toEntity(detalleIngresoMapper.toDto(expected));
        assertDetalleIngresoAllPropertiesEquals(expected, actual);
    }
}
