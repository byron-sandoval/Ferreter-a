package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.Categoria;
import com.ferronica.app.domain.DetalleVenta;
import com.ferronica.app.domain.Venta;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.dto.CategoriaDTO;
import com.ferronica.app.service.dto.DetalleVentaDTO;
import com.ferronica.app.service.dto.VentaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DetalleVenta} and its DTO
 * {@link DetalleVentaDTO}.
 */
@Mapper(componentModel = "spring")
public interface DetalleVentaMapper extends EntityMapper<DetalleVentaDTO, DetalleVenta> {
    @Mapping(target = "articulo", source = "articulo", qualifiedByName = "articuloId")
    @Mapping(target = "venta", source = "venta", qualifiedByName = "ventaId")
    DetalleVentaDTO toDto(DetalleVenta s);

    @Named("articuloId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "codigo", source = "codigo")
    @Mapping(target = "costo", source = "costo")
    @Mapping(target = "categoria", source = "categoria", qualifiedByName = "articuloCategoriaId")
    ArticuloDTO toDtoArticuloId(Articulo articulo);

    @Named("articuloCategoriaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    CategoriaDTO toDtoArticuloCategoriaId(Categoria categoria);

    @Named("ventaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "fecha", source = "fecha")
    @Mapping(target = "anulada", source = "anulada")
    @Mapping(target = "noFactura", source = "noFactura")
    VentaDTO toDtoVentaId(Venta venta);
}
