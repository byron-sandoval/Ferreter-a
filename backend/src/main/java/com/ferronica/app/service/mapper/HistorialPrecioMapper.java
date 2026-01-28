package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.HistorialPrecio;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.HistorialPrecioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link HistorialPrecio} and its DTO {@link HistorialPrecioDTO}.
 */
@Mapper(componentModel = "spring")
public interface HistorialPrecioMapper extends EntityMapper<HistorialPrecioDTO, HistorialPrecio> {
    @Mapping(target = "articulo", source = "articulo", qualifiedByName = "articuloId")
    HistorialPrecioDTO toDto(HistorialPrecio s);

    @Named("articuloId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ArticuloDTO toDtoArticuloId(Articulo articulo);
}
