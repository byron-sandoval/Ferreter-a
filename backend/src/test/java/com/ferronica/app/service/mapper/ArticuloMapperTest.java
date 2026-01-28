package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.ArticuloAsserts.*;
import static com.ferronica.app.domain.ArticuloTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ArticuloMapperTest {

    private ArticuloMapper articuloMapper;

    @BeforeEach
    void setUp() {
        articuloMapper = new ArticuloMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getArticuloSample1();
        var actual = articuloMapper.toEntity(articuloMapper.toDto(expected));
        assertArticuloAllPropertiesEquals(expected, actual);
    }
}
