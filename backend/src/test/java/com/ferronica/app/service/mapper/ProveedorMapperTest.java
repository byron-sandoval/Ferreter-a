package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.ProveedorAsserts.*;
import static com.ferronica.app.domain.ProveedorTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProveedorMapperTest {

    private ProveedorMapper proveedorMapper;

    @BeforeEach
    void setUp() {
        proveedorMapper = new ProveedorMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getProveedorSample1();
        var actual = proveedorMapper.toEntity(proveedorMapper.toDto(expected));
        assertProveedorAllPropertiesEquals(expected, actual);
    }
}
