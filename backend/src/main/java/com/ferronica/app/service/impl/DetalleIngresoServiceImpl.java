package com.ferronica.app.service.impl;

import com.ferronica.app.domain.DetalleIngreso;
import com.ferronica.app.repository.DetalleIngresoRepository;
import com.ferronica.app.service.DetalleIngresoService;
import com.ferronica.app.service.dto.DetalleIngresoDTO;
import com.ferronica.app.service.mapper.DetalleIngresoMapper;
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
 * {@link com.ferronica.app.domain.DetalleIngreso}.
 */
@Service
@Transactional
public class DetalleIngresoServiceImpl implements DetalleIngresoService {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleIngresoServiceImpl.class);

    private final DetalleIngresoRepository detalleIngresoRepository;

    private final DetalleIngresoMapper detalleIngresoMapper;

    private final com.ferronica.app.repository.ArticuloRepository articuloRepository;

    public DetalleIngresoServiceImpl(
            DetalleIngresoRepository detalleIngresoRepository,
            DetalleIngresoMapper detalleIngresoMapper,
            com.ferronica.app.repository.ArticuloRepository articuloRepository) {
        this.detalleIngresoRepository = detalleIngresoRepository;
        this.detalleIngresoMapper = detalleIngresoMapper;
        this.articuloRepository = articuloRepository;
    }

    @Override
    public DetalleIngresoDTO save(DetalleIngresoDTO detalleIngresoDTO) {
        LOG.debug("Request to save DetalleIngreso : {}", detalleIngresoDTO);
        final DetalleIngreso detalleIngreso = detalleIngresoMapper.toEntity(detalleIngresoDTO);

        // Actualización de Inventario (Suma)
        if (detalleIngreso.getArticulo() != null) {
            articuloRepository
                    .findByIdWithLock(detalleIngreso.getArticulo().getId())
                    .ifPresent(articulo -> {
                        articulo.setExistencia(articulo.getExistencia().add(detalleIngreso.getCantidad()));
                        articuloRepository.save(articulo);
                    });
        }

        DetalleIngreso savedDetalleIngreso = detalleIngresoRepository.save(detalleIngreso);
        return detalleIngresoMapper.toDto(savedDetalleIngreso);
    }

    @Override
    public DetalleIngresoDTO update(DetalleIngresoDTO detalleIngresoDTO) {
        LOG.debug("Request to update DetalleIngreso : {}", detalleIngresoDTO);
        DetalleIngreso detalleIngreso = detalleIngresoMapper.toEntity(detalleIngresoDTO);
        detalleIngreso = detalleIngresoRepository.save(detalleIngreso);
        return detalleIngresoMapper.toDto(detalleIngreso);
    }

    @Override
    public Optional<DetalleIngresoDTO> partialUpdate(DetalleIngresoDTO detalleIngresoDTO) {
        LOG.debug("Request to partially update DetalleIngreso : {}", detalleIngresoDTO);

        return detalleIngresoRepository
                .findById(detalleIngresoDTO.getId())
                .map(existingDetalleIngreso -> {
                    detalleIngresoMapper.partialUpdate(existingDetalleIngreso, detalleIngresoDTO);

                    return existingDetalleIngreso;
                })
                .map(detalleIngresoRepository::save)
                .map(detalleIngresoMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleIngresoDTO> findAll() {
        LOG.debug("Request to get all DetalleIngresos");
        return detalleIngresoRepository
                .findAll()
                .stream()
                .map(detalleIngresoMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DetalleIngresoDTO> findOne(Long id) {
        LOG.debug("Request to get DetalleIngreso : {}", id);
        return detalleIngresoRepository.findById(id).map(detalleIngresoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete DetalleIngreso : {}", id);
        detalleIngresoRepository.deleteById(id);
    }
}
