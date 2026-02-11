package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.DetalleDevolucion;
import com.ferronica.app.domain.Devolucion;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.DetalleDevolucionDTO;
import com.ferronica.app.service.dto.DevolucionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DetalleDevolucion} and its DTO
 * {@link DetalleDevolucionDTO}.
 */
@Mapper(componentModel = "spring")
public interface DetalleDevolucionMapper extends EntityMapper<DetalleDevolucionDTO, DetalleDevolucion> {
    @Mapping(target = "articulo", source = "articulo", qualifiedByName = "articuloId")
    @Mapping(target = "devolucion", source = "devolucion", qualifiedByName = "devolucionId")
    DetalleDevolucionDTO toDto(DetalleDevolucion s);

    @Named("articuloId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "codigo", source = "codigo")
    ArticuloDTO toDtoArticuloId(Articulo articulo);

    @Named("devolucionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DevolucionDTO toDtoDevolucionId(Devolucion devolucion);
}
