package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.service.dto.VendedorDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Vendedor} and its DTO {@link VendedorDTO}.
 */
@Mapper(componentModel = "spring")
public interface VendedorMapper extends EntityMapper<VendedorDTO, Vendedor> {}
