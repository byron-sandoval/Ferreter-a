package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.CierreCaja;
import com.ferronica.app.domain.Usuario;
import com.ferronica.app.service.dto.CierreCajaDTO;
import com.ferronica.app.service.dto.UsuarioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CierreCaja} and its DTO {@link CierreCajaDTO}.
 */
@Mapper(componentModel = "spring", uses = { UsuarioMapper.class })
public interface CierreCajaMapper extends EntityMapper<CierreCajaDTO, CierreCaja> {
    @Mapping(target = "usuario", source = "usuario")
    CierreCajaDTO toDto(CierreCaja s);

    @Named("usuarioId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UsuarioDTO toDtoUsuarioId(Usuario usuario);
}
