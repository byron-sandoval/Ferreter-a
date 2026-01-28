package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Empresa;
import com.ferronica.app.repository.EmpresaRepository;
import com.ferronica.app.service.EmpresaService;
import com.ferronica.app.service.dto.EmpresaDTO;
import com.ferronica.app.service.mapper.EmpresaMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Empresa}.
 */
@Service
@Transactional
public class EmpresaServiceImpl implements EmpresaService {

    private static final Logger LOG = LoggerFactory.getLogger(EmpresaServiceImpl.class);

    private final EmpresaRepository empresaRepository;

    private final EmpresaMapper empresaMapper;

    public EmpresaServiceImpl(EmpresaRepository empresaRepository, EmpresaMapper empresaMapper) {
        this.empresaRepository = empresaRepository;
        this.empresaMapper = empresaMapper;
    }

    @Override
    public EmpresaDTO save(EmpresaDTO empresaDTO) {
        LOG.debug("Request to save Empresa : {}", empresaDTO);
        Empresa empresa = empresaMapper.toEntity(empresaDTO);
        empresa = empresaRepository.save(empresa);
        return empresaMapper.toDto(empresa);
    }

    @Override
    public EmpresaDTO update(EmpresaDTO empresaDTO) {
        LOG.debug("Request to update Empresa : {}", empresaDTO);
        Empresa empresa = empresaMapper.toEntity(empresaDTO);
        empresa = empresaRepository.save(empresa);
        return empresaMapper.toDto(empresa);
    }

    @Override
    public Optional<EmpresaDTO> partialUpdate(EmpresaDTO empresaDTO) {
        LOG.debug("Request to partially update Empresa : {}", empresaDTO);

        return empresaRepository
            .findById(empresaDTO.getId())
            .map(existingEmpresa -> {
                empresaMapper.partialUpdate(existingEmpresa, empresaDTO);

                return existingEmpresa;
            })
            .map(empresaRepository::save)
            .map(empresaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaDTO> findAll() {
        LOG.debug("Request to get all Empresas");
        return empresaRepository.findAll().stream().map(empresaMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmpresaDTO> findOne(Long id) {
        LOG.debug("Request to get Empresa : {}", id);
        return empresaRepository.findById(id).map(empresaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Empresa : {}", id);
        empresaRepository.deleteById(id);
    }
}
