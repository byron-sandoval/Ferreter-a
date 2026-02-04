package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.Categoria;
import com.ferronica.app.domain.UnidadMedida;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.CategoriaDTO;
import com.ferronica.app.service.dto.UnidadMedidaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Articulo} and its DTO {@link ArticuloDTO}.
 */
@Mapper(componentModel = "spring")
public interface ArticuloMapper extends EntityMapper<ArticuloDTO, Articulo> {
    @Mapping(target = "categoria", source = "categoria", qualifiedByName = "categoriaId")
    @Mapping(target = "unidadMedida", source = "unidadMedida", qualifiedByName = "unidadMedidaId")
    ArticuloDTO toDto(Articulo s);

    @Named("categoriaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    CategoriaDTO toDtoCategoriaId(Categoria categoria);

    @Named("unidadMedidaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UnidadMedidaDTO toDtoUnidadMedidaId(UnidadMedida unidadMedida);
}
