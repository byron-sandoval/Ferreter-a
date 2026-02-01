package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.DetalleIngreso;
import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.DetalleIngresoDTO;
import com.ferronica.app.service.dto.IngresoDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DetalleIngreso} and its DTO
 * {@link DetalleIngresoDTO}.
 */
@Mapper(componentModel = "spring")
public interface DetalleIngresoMapper extends EntityMapper<DetalleIngresoDTO, DetalleIngreso> {
    @Mapping(target = "articulo", source = "articulo", qualifiedByName = "articuloId")
    @Mapping(target = "ingreso", source = "ingreso", qualifiedByName = "ingresoId")
    DetalleIngresoDTO toDto(DetalleIngreso s);

    @Named("articuloId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ArticuloDTO toDtoArticuloId(Articulo articulo);

    @Named("ingresoId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    IngresoDTO toDtoIngresoId(Ingreso ingreso);
}
