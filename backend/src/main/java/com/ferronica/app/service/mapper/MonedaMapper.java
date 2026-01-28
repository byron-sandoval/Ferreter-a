package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Moneda;
import com.ferronica.app.service.dto.MonedaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Moneda} and its DTO {@link MonedaDTO}.
 */
@Mapper(componentModel = "spring")
public interface MonedaMapper extends EntityMapper<MonedaDTO, Moneda> {}
