package com.ferronica.app.service.mapper;

import com.ferronica.app.domain.Empresa;
import com.ferronica.app.service.dto.EmpresaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Empresa} and its DTO {@link EmpresaDTO}.
 */
@Mapper(componentModel = "spring")
public interface EmpresaMapper extends EntityMapper<EmpresaDTO, Empresa> {}
