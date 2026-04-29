package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.HistorialPrecio;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.repository.HistorialPrecioRepository;
import com.ferronica.app.service.ArticuloService;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.mapper.ArticuloMapper;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.Articulo}.
 */
@Service
@Transactional
public class ArticuloServiceImpl implements ArticuloService {

    private static final Logger LOG = LoggerFactory.getLogger(ArticuloServiceImpl.class);

    private final ArticuloRepository articuloRepository;
    private final ArticuloMapper articuloMapper;
    private final HistorialPrecioRepository historialPrecioRepository;

    public ArticuloServiceImpl(ArticuloRepository articuloRepository, ArticuloMapper articuloMapper,
            HistorialPrecioRepository historialPrecioRepository) {
        this.articuloRepository = articuloRepository;
        this.articuloMapper = articuloMapper;
        this.historialPrecioRepository = historialPrecioRepository;
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

        // Tracking de Historial de Precios
        articuloRepository.findById(articuloDTO.getId()).ifPresent(existingArticulo -> {
            if (articuloDTO.getPrecio() != null && existingArticulo.getPrecio() != null) {
                if (articuloDTO.getPrecio().compareTo(existingArticulo.getPrecio()) != 0) {
                    saveHistorialPrecio(existingArticulo, existingArticulo.getPrecio(), articuloDTO.getPrecio(),
                            articuloDTO.getPriceChangeReason());
                }
            }
        });

        Articulo articulo = articuloMapper.toEntity(articuloDTO);
        articulo = articuloRepository.save(articulo);
        return articuloMapper.toDto(articulo);
    }

    private void saveHistorialPrecio(Articulo articulo, BigDecimal anterior, BigDecimal nuevo, String motivo) {
        LOG.debug("Saving HistorialPrecio for Articulo ID {}: {} -> {} (Motivo: {})", articulo.getId(), anterior, nuevo,
                motivo);
        HistorialPrecio historial = new HistorialPrecio();
        historial.setArticulo(articulo);
        historial.setPrecioAnterior(anterior);
        historial.setPrecioNuevo(nuevo);
        historial.setFecha(Instant.now());
        historial.setMotivo(motivo != null && !motivo.isBlank() ? motivo : "Actualización de precio");
        historialPrecioRepository.save(historial);
    }

    @Override
    public Optional<ArticuloDTO> partialUpdate(ArticuloDTO articuloDTO) {
        LOG.debug("Request to partially update Articulo : {}", articuloDTO);

        return articuloRepository
                .findById(articuloDTO.getId())
                .map(existingArticulo -> {
                    // Tracking de Historial de Precios en Partial Update
                    if (articuloDTO.getPrecio() != null && existingArticulo.getPrecio() != null) {
                        if (articuloDTO.getPrecio().compareTo(existingArticulo.getPrecio()) != 0) {
                            saveHistorialPrecio(existingArticulo, existingArticulo.getPrecio(),
                                    articuloDTO.getPrecio(), articuloDTO.getPriceChangeReason());
                        }
                    }

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
        LOG.debug("Request to delete Articulo (Logical) : {}", id);
        articuloRepository.findById(id).ifPresent(articulo -> {
            articulo.setActivo(false);
            articuloRepository.save(articulo);
        });
    }
}
