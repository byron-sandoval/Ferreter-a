package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.repository.IngresoRepository;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.repository.UsuarioRepository;
import com.ferronica.app.security.SecurityUtils;
import com.ferronica.app.service.IngresoService;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.mapper.IngresoMapper;
import java.math.BigDecimal;
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

    private final ArticuloRepository articuloRepository;

    private final UsuarioRepository usuarioRepository;

    public IngresoServiceImpl(IngresoRepository ingresoRepository, IngresoMapper ingresoMapper,
            ArticuloRepository articuloRepository, UsuarioRepository usuarioRepository) {
        this.ingresoRepository = ingresoRepository;
        this.ingresoMapper = ingresoMapper;
        this.articuloRepository = articuloRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public IngresoDTO save(IngresoDTO ingresoDTO) {
        LOG.debug("Request to save Ingreso : {}", ingresoDTO);
        final Ingreso ingreso = ingresoMapper.toEntity(ingresoDTO);

        // Automatización de Fecha
        ingreso.setFecha(java.time.Instant.now());

        // Estado inicial
        if (ingreso.getActivo() == null) {
            ingreso.setActivo(true);
        }

        // Automatización de Usuario por Usuario Autenticado
        SecurityUtils.getCurrentUserKeycloakId().ifPresent(idKeycloak -> {
            usuarioRepository.findByIdKeycloak(idKeycloak).ifPresent(ingreso::setUsuario);
        });

        Ingreso savedIngreso = ingresoRepository.save(ingreso);

        // Actualizar stock de productos
        if (savedIngreso.getDetalles() != null && !savedIngreso.getDetalles().isEmpty()) {
            savedIngreso.getDetalles().forEach(detalle -> {
                if (detalle.getArticulo() != null && detalle.getArticulo().getId() != null) {
                    articuloRepository.findById(detalle.getArticulo().getId()).ifPresent(articulo -> {
                        BigDecimal existenciaActual = articulo.getExistencia() != null ? articulo.getExistencia()
                                : BigDecimal.ZERO;
                        BigDecimal cantidadIngreso = detalle.getCantidad() != null ? detalle.getCantidad()
                                : BigDecimal.ZERO;
                        articulo.setExistencia(existenciaActual.add(cantidadIngreso));
                        articuloRepository.save(articulo);
                        LOG.debug("Stock actualizado para Articulo ID {}: {} + {} = {}",
                                articulo.getId(), existenciaActual, cantidadIngreso, articulo.getExistencia());
                    });
                }
            });
        }

        return ingresoMapper.toDto(savedIngreso);
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
        return ingresoRepository.findOneWithEagerRelationships(id).map(ingresoMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Ingreso (Logical) : {}", id);
        ingresoRepository.findById(id).ifPresent(ingreso -> {
            ingreso.setActivo(false);
            ingresoRepository.save(ingreso);
        });
    }
}
