package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.HistorialPrecioAsserts.*;
import static com.ferronica.app.domain.HistorialPrecioTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HistorialPrecioMapperTest {

    private HistorialPrecioMapper historialPrecioMapper;

    @BeforeEach
    void setUp() {
        historialPrecioMapper = new HistorialPrecioMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHistorialPrecioSample1();
        var actual = historialPrecioMapper.toEntity(historialPrecioMapper.toDto(expected));
        assertHistorialPrecioAllPropertiesEquals(expected, actual);
    }
}
