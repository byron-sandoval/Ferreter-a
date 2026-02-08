package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.domain.Proveedor;
import com.ferronica.app.domain.Usuario;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.dto.ProveedorDTO;
import com.ferronica.app.service.dto.UsuarioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Ingreso} and its DTO {@link IngresoDTO}.
 */
@Mapper(componentModel = "spring", uses = { DetalleIngresoMapper.class, UsuarioMapper.class, ProveedorMapper.class })
public interface IngresoMapper extends EntityMapper<IngresoDTO, Ingreso> {
    @Mapping(target = "usuario", source = "usuario")
    @Mapping(target = "proveedor", source = "proveedor")
    @Mapping(target = "detalles", source = "detalles")
    IngresoDTO toDto(Ingreso s);
}
