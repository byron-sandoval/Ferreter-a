package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.DevolucionAsserts.*;
import static com.ferronica.app.domain.DevolucionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DevolucionMapperTest {

    private DevolucionMapper devolucionMapper;

    @BeforeEach
    void setUp() {
        devolucionMapper = new DevolucionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDevolucionSample1();
        var actual = devolucionMapper.toEntity(devolucionMapper.toDto(expected));
        assertDevolucionAllPropertiesEquals(expected, actual);
    }
}
