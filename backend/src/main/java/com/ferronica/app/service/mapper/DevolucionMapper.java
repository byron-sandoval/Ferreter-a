package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Devolucion;
import com.ferronica.app.domain.Venta;
import com.ferronica.app.service.dto.DevolucionDTO;
import com.ferronica.app.service.dto.VentaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Devolucion} and its DTO {@link DevolucionDTO}.
 */
@Mapper(componentModel = "spring", uses = { DetalleDevolucionMapper.class, ClienteMapper.class })
public interface DevolucionMapper extends EntityMapper<DevolucionDTO, Devolucion> {
    @Mapping(target = "venta", source = "venta", qualifiedByName = "ventaId")
    DevolucionDTO toDto(Devolucion s);

    @Named("ventaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "noFactura", source = "noFactura")
    @Mapping(target = "cliente", source = "cliente")
    VentaDTO toDtoVentaId(Venta venta);
}
