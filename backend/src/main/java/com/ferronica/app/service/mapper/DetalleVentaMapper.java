package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.DetalleVenta;
import com.ferronica.app.domain.Venta;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.DetalleVentaDTO;
import com.ferronica.app.service.dto.VentaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DetalleVenta} and its DTO {@link DetalleVentaDTO}.
 */
@Mapper(componentModel = "spring")
public interface DetalleVentaMapper extends EntityMapper<DetalleVentaDTO, DetalleVenta> {
    @Mapping(target = "articulo", source = "articulo", qualifiedByName = "articuloId")
    @Mapping(target = "venta", source = "venta", qualifiedByName = "ventaId")
    DetalleVentaDTO toDto(DetalleVenta s);

    @Named("articuloId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ArticuloDTO toDtoArticuloId(Articulo articulo);

    @Named("ventaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    VentaDTO toDtoVentaId(Venta venta);
}
