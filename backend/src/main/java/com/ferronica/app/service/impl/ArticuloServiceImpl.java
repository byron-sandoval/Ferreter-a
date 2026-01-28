package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.service.ArticuloService;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.mapper.ArticuloMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Articulo}.
 */
@Service
@Transactional
public class ArticuloServiceImpl implements ArticuloService {

    private static final Logger LOG = LoggerFactory.getLogger(ArticuloServiceImpl.class);

    private final ArticuloRepository articuloRepository;

    private final ArticuloMapper articuloMapper;

    public ArticuloServiceImpl(ArticuloRepository articuloRepository, ArticuloMapper articuloMapper) {
        this.articuloRepository = articuloRepository;
        this.articuloMapper = articuloMapper;
    }

    @Override
    public ArticuloDTO save(ArticuloDTO articuloDTO) {
        LOG.debug("Request to save Articulo : {}", articuloDTO);
        Articulo articulo = articuloMapper.toEntity(articuloDTO);
        articulo = articuloRepository.save(articulo);
        return articuloMapper.toDto(articulo);
    }

    @Override
    public ArticuloDTO update(ArticuloDTO articuloDTO) {
        LOG.debug("Request to update Articulo : {}", articuloDTO);
        Articulo articulo = articuloMapper.toEntity(articuloDTO);
        articulo = articuloRepository.save(articulo);
        return articuloMapper.toDto(articulo);
    }

    @Override
    public Optional<ArticuloDTO> partialUpdate(ArticuloDTO articuloDTO) {
        LOG.debug("Request to partially update Articulo : {}", articuloDTO);

        return articuloRepository
            .findById(articuloDTO.getId())
            .map(existingArticulo -> {
                articuloMapper.partialUpdate(existingArticulo, articuloDTO);

                return existingArticulo;
            })
            .map(articuloRepository::save)
            .map(articuloMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ArticuloDTO> findOne(Long id) {
        LOG.debug("Request to get Articulo : {}", id);
        return articuloRepository.findById(id).map(articuloMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Articulo : {}", id);
        articuloRepository.deleteById(id);
    }
}
