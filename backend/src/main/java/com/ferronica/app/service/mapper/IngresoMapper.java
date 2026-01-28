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
@Mapper(componentModel = "spring")
public interface IngresoMapper extends EntityMapper<IngresoDTO, Ingreso> {
    @Mapping(target = "vendedor", source = "vendedor", qualifiedByName = "vendedorId")
    @Mapping(target = "proveedor", source = "proveedor", qualifiedByName = "proveedorId")
    IngresoDTO toDto(Ingreso s);

    @Named("vendedorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    VendedorDTO toDtoVendedorId(Vendedor vendedor);

    @Named("proveedorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProveedorDTO toDtoProveedorId(Proveedor proveedor);
}
