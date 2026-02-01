package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.domain.Proveedor;
import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.dto.ProveedorDTO;
import com.ferronica.app.service.dto.VendedorDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Ingreso} and its DTO {@link IngresoDTO}.
 */
@Mapper(componentModel = "spring", uses = { DetalleIngresoMapper.class, VendedorMapper.class, ProveedorMapper.class })
public interface IngresoMapper extends EntityMapper<IngresoDTO, Ingreso> {
    @Mapping(target = "vendedor", source = "vendedor")
    @Mapping(target = "proveedor", source = "proveedor")
    @Mapping(target = "detalles", source = "detalles")
    IngresoDTO toDto(Ingreso s);
}
