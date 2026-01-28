package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.VendedorAsserts.*;
import static com.ferronica.app.domain.VendedorTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VendedorMapperTest {

    private VendedorMapper vendedorMapper;

    @BeforeEach
    void setUp() {
        vendedorMapper = new VendedorMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getVendedorSample1();
        var actual = vendedorMapper.toEntity(vendedorMapper.toDto(expected));
        assertVendedorAllPropertiesEquals(expected, actual);
    }
}
