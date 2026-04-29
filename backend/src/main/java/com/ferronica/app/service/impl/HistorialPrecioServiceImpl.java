package com.ferronica.app.service.impl;

import com.ferronica.app.domain.HistorialPrecio;
import com.ferronica.app.repository.HistorialPrecioRepository;
import com.ferronica.app.service.HistorialPrecioService;
import com.ferronica.app.service.dto.HistorialPrecioDTO;
import com.ferronica.app.service.mapper.HistorialPrecioMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.HistorialPrecio}.
 */
@Service
@Transactional
public class HistorialPrecioServiceImpl implements HistorialPrecioService {

    private static final Logger LOG = LoggerFactory.getLogger(HistorialPrecioServiceImpl.class);

    private final HistorialPrecioRepository historialPrecioRepository;

    private final HistorialPrecioMapper historialPrecioMapper;

    public HistorialPrecioServiceImpl(HistorialPrecioRepository historialPrecioRepository,
            HistorialPrecioMapper historialPrecioMapper) {
        this.historialPrecioRepository = historialPrecioRepository;
        this.historialPrecioMapper = historialPrecioMapper;
    }

    @Override
    public HistorialPrecioDTO save(HistorialPrecioDTO historialPrecioDTO) {
        LOG.debug("Request to save HistorialPrecio : {}", historialPrecioDTO);
        HistorialPrecio historialPrecio = historialPrecioMapper.toEntity(historialPrecioDTO);

        // Automatización de Fecha
        historialPrecio.setFecha(java.time.Instant.now());

        historialPrecio = historialPrecioRepository.save(historialPrecio);
        return historialPrecioMapper.toDto(historialPrecio);
    }

    @Override
    public HistorialPrecioDTO update(HistorialPrecioDTO historialPrecioDTO) {
        LOG.debug("Request to update HistorialPrecio : {}", historialPrecioDTO);
        HistorialPrecio historialPrecio = historialPrecioMapper.toEntity(historialPrecioDTO);
        historialPrecio = historialPrecioRepository.save(historialPrecio);
        return historialPrecioMapper.toDto(historialPrecio);
    }

    @Override
    public Optional<HistorialPrecioDTO> partialUpdate(HistorialPrecioDTO historialPrecioDTO) {
        LOG.debug("Request to partially update HistorialPrecio : {}", historialPrecioDTO);

        return historialPrecioRepository
                .findById(historialPrecioDTO.getId())
                .map(existingHistorialPrecio -> {
                    historialPrecioMapper.partialUpdate(existingHistorialPrecio, historialPrecioDTO);

                    return existingHistorialPrecio;
                })
                .map(historialPrecioRepository::save)
                .map(historialPrecioMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialPrecioDTO> findAll() {
        LOG.debug("Request to get all HistorialPrecios");
        return historialPrecioRepository
                .findAll()
                .stream()
                .map(historialPrecioMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialPrecioDTO> findByArticulo(Long articuloId) {
        LOG.debug("Request to get HistorialPrecios by Articulo : {}", articuloId);
        return historialPrecioRepository
                .findByArticuloIdOrderByFechaDesc(articuloId)
                .stream()
                .map(historialPrecioMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HistorialPrecioDTO> findOne(Long id) {
        LOG.debug("Request to get HistorialPrecio : {}", id);
        return historialPrecioRepository.findById(id).map(historialPrecioMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete HistorialPrecio : {}", id);
        historialPrecioRepository.deleteById(id);
    }
}
