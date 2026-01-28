package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.repository.IngresoRepository;
import com.ferronica.app.service.IngresoService;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.mapper.IngresoMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Ingreso}.
 */
@Service
@Transactional
public class IngresoServiceImpl implements IngresoService {

    private static final Logger LOG = LoggerFactory.getLogger(IngresoServiceImpl.class);

    private final IngresoRepository ingresoRepository;

    private final IngresoMapper ingresoMapper;

    public IngresoServiceImpl(IngresoRepository ingresoRepository, IngresoMapper ingresoMapper) {
        this.ingresoRepository = ingresoRepository;
        this.ingresoMapper = ingresoMapper;
    }

    @Override
    public IngresoDTO save(IngresoDTO ingresoDTO) {
        LOG.debug("Request to save Ingreso : {}", ingresoDTO);
        Ingreso ingreso = ingresoMapper.toEntity(ingresoDTO);
        ingreso = ingresoRepository.save(ingreso);
        return ingresoMapper.toDto(ingreso);
    }

    @Override
    public IngresoDTO update(IngresoDTO ingresoDTO) {
        LOG.debug("Request to update Ingreso : {}", ingresoDTO);
        Ingreso ingreso = ingresoMapper.toEntity(ingresoDTO);
        ingreso = ingresoRepository.save(ingreso);
        return ingresoMapper.toDto(ingreso);
    }

    @Override
    public Optional<IngresoDTO> partialUpdate(IngresoDTO ingresoDTO) {
        LOG.debug("Request to partially update Ingreso : {}", ingresoDTO);

        return ingresoRepository
            .findById(ingresoDTO.getId())
            .map(existingIngreso -> {
                ingresoMapper.partialUpdate(existingIngreso, ingresoDTO);

                return existingIngreso;
            })
            .map(ingresoRepository::save)
            .map(ingresoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<IngresoDTO> findOne(Long id) {
        LOG.debug("Request to get Ingreso : {}", id);
        return ingresoRepository.findById(id).map(ingresoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Ingreso : {}", id);
        ingresoRepository.deleteById(id);
    }
}
