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
@Mapper(componentModel = "spring")
public interface VentaMapper extends EntityMapper<VentaDTO, Venta> {
    @Mapping(target = "cliente", source = "cliente", qualifiedByName = "clienteId")
    @Mapping(target = "vendedor", source = "vendedor", qualifiedByName = "vendedorId")
    @Mapping(target = "moneda", source = "moneda", qualifiedByName = "monedaId")
    @Mapping(target = "numeracion", source = "numeracion", qualifiedByName = "numeracionFacturaId")
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
