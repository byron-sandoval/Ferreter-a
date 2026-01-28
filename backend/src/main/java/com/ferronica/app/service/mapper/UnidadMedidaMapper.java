package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.UnidadMedida;
import com.ferronica.app.service.dto.UnidadMedidaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link UnidadMedida} and its DTO {@link UnidadMedidaDTO}.
 */
@Mapper(componentModel = "spring")
public interface UnidadMedidaMapper extends EntityMapper<UnidadMedidaDTO, UnidadMedida> {}
