package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Cliente;
import com.ferronica.app.domain.Moneda;
import com.ferronica.app.domain.NumeracionFactura;
import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.domain.Venta;
import com.ferronica.app.service.dto.ClienteDTO;
import com.ferronica.app.service.dto.MonedaDTO;
import com.ferronica.app.service.dto.NumeracionFacturaDTO;
import com.ferronica.app.service.dto.VendedorDTO;
import com.ferronica.app.service.dto.VentaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Venta} and its DTO {@link VentaDTO}.
 */
@Mapper(componentModel = "spring", uses = { DetalleVentaMapper.class, ClienteMapper.class, VendedorMapper.class,
        MonedaMapper.class, NumeracionFacturaMapper.class })
public interface VentaMapper extends EntityMapper<VentaDTO, Venta> {
    @Mapping(target = "cliente", source = "cliente")
    @Mapping(target = "vendedor", source = "vendedor")
    @Mapping(target = "moneda", source = "moneda")
    @Mapping(target = "numeracion", source = "numeracion")
    @Mapping(target = "detalles", source = "detalles")
    VentaDTO toDto(Venta s);

    @Named("clienteId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ClienteDTO toDtoClienteId(Cliente cliente);

    @Named("vendedorId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    VendedorDTO toDtoVendedorId(Vendedor vendedor);

    @Named("monedaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    MonedaDTO toDtoMonedaId(Moneda moneda);

    @Named("numeracionFacturaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    NumeracionFacturaDTO toDtoNumeracionFacturaId(NumeracionFactura numeracionFactura);
}
