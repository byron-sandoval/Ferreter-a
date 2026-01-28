package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.NumeracionFactura;
import com.ferronica.app.service.dto.NumeracionFacturaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link NumeracionFactura} and its DTO {@link NumeracionFacturaDTO}.
 */
@Mapper(componentModel = "spring")
public interface NumeracionFacturaMapper extends EntityMapper<NumeracionFacturaDTO, NumeracionFactura> {}
