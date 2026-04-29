package com.ferronica.app.service.impl;

import com.ferronica.app.domain.DetalleDevolucion;
import com.ferronica.app.repository.DetalleDevolucionRepository;
import com.ferronica.app.service.DetalleDevolucionService;
import com.ferronica.app.service.dto.DetalleDevolucionDTO;
import com.ferronica.app.service.mapper.DetalleDevolucionMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.DetalleDevolucion}.
 */
@Service
@Transactional
public class DetalleDevolucionServiceImpl implements DetalleDevolucionService {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleDevolucionServiceImpl.class);

    private final DetalleDevolucionRepository detalleDevolucionRepository;

    private final DetalleDevolucionMapper detalleDevolucionMapper;

    public DetalleDevolucionServiceImpl(
            DetalleDevolucionRepository detalleDevolucionRepository,
            DetalleDevolucionMapper detalleDevolucionMapper) {
        this.detalleDevolucionRepository = detalleDevolucionRepository;
        this.detalleDevolucionMapper = detalleDevolucionMapper;
    }

    @Override
    public DetalleDevolucionDTO save(DetalleDevolucionDTO detalleDevolucionDTO) {
        LOG.debug("Request to save DetalleDevolucion : {}", detalleDevolucionDTO);
        DetalleDevolucion detalleDevolucion = detalleDevolucionMapper.toEntity(detalleDevolucionDTO);
        detalleDevolucion = detalleDevolucionRepository.save(detalleDevolucion);
        return detalleDevolucionMapper.toDto(detalleDevolucion);
    }

    @Override
    public DetalleDevolucionDTO update(DetalleDevolucionDTO detalleDevolucionDTO) {
        LOG.debug("Request to update DetalleDevolucion : {}", detalleDevolucionDTO);
        DetalleDevolucion detalleDevolucion = detalleDevolucionMapper.toEntity(detalleDevolucionDTO);
        detalleDevolucion = detalleDevolucionRepository.save(detalleDevolucion);
        return detalleDevolucionMapper.toDto(detalleDevolucion);
    }

    @Override
    public Optional<DetalleDevolucionDTO> partialUpdate(DetalleDevolucionDTO detalleDevolucionDTO) {
        LOG.debug("Request to partially update DetalleDevolucion : {}", detalleDevolucionDTO);

        return detalleDevolucionRepository
                .findById(detalleDevolucionDTO.getId())
                .map(existingDetalleDevolucion -> {
                    detalleDevolucionMapper.partialUpdate(existingDetalleDevolucion, detalleDevolucionDTO);

                    return existingDetalleDevolucion;
                })
                .map(detalleDevolucionRepository::save)
                .map(detalleDevolucionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DetalleDevolucionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all DetalleDevolucions");
        return detalleDevolucionRepository.findAll(pageable).map(detalleDevolucionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DetalleDevolucionDTO> findOne(Long id) {
        LOG.debug("Request to get DetalleDevolucion : {}", id);
        return detalleDevolucionRepository.findById(id).map(detalleDevolucionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete DetalleDevolucion : {}", id);
        detalleDevolucionRepository.deleteById(id);
    }
}
