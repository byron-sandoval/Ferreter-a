package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.MonedaAsserts.*;
import static com.ferronica.app.domain.MonedaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MonedaMapperTest {

    private MonedaMapper monedaMapper;

    @BeforeEach
    void setUp() {
        monedaMapper = new MonedaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getMonedaSample1();
        var actual = monedaMapper.toEntity(monedaMapper.toDto(expected));
        assertMonedaAllPropertiesEquals(expected, actual);
    }
}
