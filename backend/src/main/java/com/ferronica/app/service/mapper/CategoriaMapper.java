package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Categoria;
import com.ferronica.app.service.dto.CategoriaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Categoria} and its DTO {@link CategoriaDTO}.
 */
@Mapper(componentModel = "spring")
public interface CategoriaMapper extends EntityMapper<CategoriaDTO, Categoria> {
    @Mapping(target = "padre", source = "padre", qualifiedByName = "categoriaId")
    CategoriaDTO toDto(Categoria s);

    @Named("categoriaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CategoriaDTO toDtoCategoriaId(Categoria categoria);
}
