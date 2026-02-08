package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.UsuarioAsserts.*;
import static com.ferronica.app.domain.UsuarioTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UsuarioMapperTest {

    private UsuarioMapper usuarioMapper;

    @BeforeEach
    void setUp() {
        usuarioMapper = new UsuarioMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getUsuarioSample1();
        var actual = usuarioMapper.toEntity(usuarioMapper.toDto(expected));
        assertUsuarioAllPropertiesEquals(expected, actual);
    }
}
