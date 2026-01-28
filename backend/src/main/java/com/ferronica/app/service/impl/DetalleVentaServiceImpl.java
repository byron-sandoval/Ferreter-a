package com.ferronica.app.service.impl;

import com.ferronica.app.domain.DetalleVenta;
import com.ferronica.app.repository.DetalleVentaRepository;
import com.ferronica.app.service.DetalleVentaService;
import com.ferronica.app.service.dto.DetalleVentaDTO;
import com.ferronica.app.service.mapper.DetalleVentaMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.DetalleVenta}.
 */
@Service
@Transactional
public class DetalleVentaServiceImpl implements DetalleVentaService {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleVentaServiceImpl.class);

    private final DetalleVentaRepository detalleVentaRepository;

    private final DetalleVentaMapper detalleVentaMapper;

    public DetalleVentaServiceImpl(DetalleVentaRepository detalleVentaRepository, DetalleVentaMapper detalleVentaMapper) {
        this.detalleVentaRepository = detalleVentaRepository;
        this.detalleVentaMapper = detalleVentaMapper;
    }

    @Override
    public DetalleVentaDTO save(DetalleVentaDTO detalleVentaDTO) {
        LOG.debug("Request to save DetalleVenta : {}", detalleVentaDTO);
        DetalleVenta detalleVenta = detalleVentaMapper.toEntity(detalleVentaDTO);
        detalleVenta = detalleVentaRepository.save(detalleVenta);
        return detalleVentaMapper.toDto(detalleVenta);
    }

    @Override
    public DetalleVentaDTO update(DetalleVentaDTO detalleVentaDTO) {
        LOG.debug("Request to update DetalleVenta : {}", detalleVentaDTO);
        DetalleVenta detalleVenta = detalleVentaMapper.toEntity(detalleVentaDTO);
        detalleVenta = detalleVentaRepository.save(detalleVenta);
        return detalleVentaMapper.toDto(detalleVenta);
    }

    @Override
    public Optional<DetalleVentaDTO> partialUpdate(DetalleVentaDTO detalleVentaDTO) {
        LOG.debug("Request to partially update DetalleVenta : {}", detalleVentaDTO);

        return detalleVentaRepository
            .findById(detalleVentaDTO.getId())
            .map(existingDetalleVenta -> {
                detalleVentaMapper.partialUpdate(existingDetalleVenta, detalleVentaDTO);

                return existingDetalleVenta;
            })
            .map(detalleVentaRepository::save)
            .map(detalleVentaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleVentaDTO> findAll() {
        LOG.debug("Request to get all DetalleVentas");
        return detalleVentaRepository.findAll().stream().map(detalleVentaMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DetalleVentaDTO> findOne(Long id) {
        LOG.debug("Request to get DetalleVenta : {}", id);
        return detalleVentaRepository.findById(id).map(detalleVentaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete DetalleVenta : {}", id);
        detalleVentaRepository.deleteById(id);
    }
}
