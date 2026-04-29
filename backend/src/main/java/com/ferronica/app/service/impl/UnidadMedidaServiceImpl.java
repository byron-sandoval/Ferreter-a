package com.ferronica.app.service.impl;

import com.ferronica.app.domain.UnidadMedida;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.repository.UnidadMedidaRepository;
import com.ferronica.app.service.UnidadMedidaService;
import com.ferronica.app.service.dto.UnidadMedidaDTO;
import com.ferronica.app.service.mapper.UnidadMedidaMapper;
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
 * {@link com.ferronica.app.domain.UnidadMedida}.
 */
@Service
@Transactional
public class UnidadMedidaServiceImpl implements UnidadMedidaService {

    private static final Logger LOG = LoggerFactory.getLogger(UnidadMedidaServiceImpl.class);

    private final UnidadMedidaRepository unidadMedidaRepository;
    private final ArticuloRepository articuloRepository;
    private final UnidadMedidaMapper unidadMedidaMapper;

    public UnidadMedidaServiceImpl(UnidadMedidaRepository unidadMedidaRepository,
            ArticuloRepository articuloRepository,
            UnidadMedidaMapper unidadMedidaMapper) {
        this.unidadMedidaRepository = unidadMedidaRepository;
        this.articuloRepository = articuloRepository;
        this.unidadMedidaMapper = unidadMedidaMapper;
    }

    @Override
    public UnidadMedidaDTO save(UnidadMedidaDTO unidadMedidaDTO) {
        LOG.debug("Request to save UnidadMedida : {}", unidadMedidaDTO);
        UnidadMedida unidadMedida = unidadMedidaMapper.toEntity(unidadMedidaDTO);
        unidadMedida = unidadMedidaRepository.save(unidadMedida);
        return unidadMedidaMapper.toDto(unidadMedida);
    }

    @Override
    public UnidadMedidaDTO update(UnidadMedidaDTO unidadMedidaDTO) {
        LOG.debug("Request to update UnidadMedida : {}", unidadMedidaDTO);
        UnidadMedida unidadMedida = unidadMedidaMapper.toEntity(unidadMedidaDTO);
        unidadMedida = unidadMedidaRepository.save(unidadMedida);
        return unidadMedidaMapper.toDto(unidadMedida);
    }

    @Override
    public Optional<UnidadMedidaDTO> partialUpdate(UnidadMedidaDTO unidadMedidaDTO) {
        LOG.debug("Request to partially update UnidadMedida : {}", unidadMedidaDTO);

        return unidadMedidaRepository
                .findById(unidadMedidaDTO.getId())
                .map(existingUnidadMedida -> {
                    unidadMedidaMapper.partialUpdate(existingUnidadMedida, unidadMedidaDTO);

                    return existingUnidadMedida;
                })
                .map(unidadMedidaRepository::save)
                .map(unidadMedidaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnidadMedidaDTO> findAll() {
        LOG.debug("Request to get all UnidadMedidas");
        return unidadMedidaRepository.findAll().stream().map(unidadMedidaMapper::toDto)
                .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UnidadMedidaDTO> findOne(Long id) {
        LOG.debug("Request to get UnidadMedida : {}", id);
        return unidadMedidaRepository.findById(id).map(unidadMedidaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete UnidadMedida and products using it (Logical) : {}", id);
        unidadMedidaRepository.findById(id).ifPresent(unidadMedida -> {
            unidadMedida.setActivo(false);
            unidadMedidaRepository.save(unidadMedida);
            // Cascada: desactivar todos los productos que usen esta unidad
            articuloRepository.findAll().stream()
                    .filter(a -> a.getUnidadMedida() != null && a.getUnidadMedida().getId().equals(id))
                    .forEach(articulo -> {
                        articulo.setActivo(false);
                        articuloRepository.save(articulo);
                    });
        });
    }
}
