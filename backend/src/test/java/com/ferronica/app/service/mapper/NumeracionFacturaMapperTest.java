package com.ferronica.app.service.mapper;

import static com.ferronica.app.domain.NumeracionFacturaAsserts.*;
import static com.ferronica.app.domain.NumeracionFacturaTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NumeracionFacturaMapperTest {

    private NumeracionFacturaMapper numeracionFacturaMapper;

    @BeforeEach
    void setUp() {
        numeracionFacturaMapper = new NumeracionFacturaMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getNumeracionFacturaSample1();
        var actual = numeracionFacturaMapper.toEntity(numeracionFacturaMapper.toDto(expected));
        assertNumeracionFacturaAllPropertiesEquals(expected, actual);
    }
}
