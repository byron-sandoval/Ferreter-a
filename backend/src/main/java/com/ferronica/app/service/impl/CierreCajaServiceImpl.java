package com.ferronica.app.service.impl;

import com.ferronica.app.domain.CierreCaja;
import com.ferronica.app.repository.CierreCajaRepository;
import com.ferronica.app.repository.UsuarioRepository;
import com.ferronica.app.security.SecurityUtils;
import com.ferronica.app.service.CierreCajaService;
import com.ferronica.app.service.dto.CierreCajaDTO;
import com.ferronica.app.service.mapper.CierreCajaMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.CierreCaja}.
 */
@Service
@Transactional
public class CierreCajaServiceImpl implements CierreCajaService {

    private static final Logger LOG = LoggerFactory.getLogger(CierreCajaServiceImpl.class);

    private final CierreCajaRepository cierreCajaRepository;

    private final CierreCajaMapper cierreCajaMapper;

    private final UsuarioRepository usuarioRepository;

    public CierreCajaServiceImpl(
            CierreCajaRepository cierreCajaRepository,
            CierreCajaMapper cierreCajaMapper,
            UsuarioRepository usuarioRepository) {
        this.cierreCajaRepository = cierreCajaRepository;
        this.cierreCajaMapper = cierreCajaMapper;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public CierreCajaDTO save(CierreCajaDTO cierreCajaDTO) {
        LOG.debug("Request to save CierreCaja : {}", cierreCajaDTO);
        CierreCaja cierreCaja = cierreCajaMapper.toEntity(cierreCajaDTO);

        // Automatización de Fecha
        if (cierreCaja.getFecha() == null) {
            cierreCaja.setFecha(java.time.Instant.now());
        }

        final CierreCaja finalCierreCaja = cierreCaja;
        // Automatización de Usuario por Usuario Autenticado
        SecurityUtils.getCurrentUserKeycloakId().ifPresent(idKeycloak -> {
            usuarioRepository.findByIdKeycloak(idKeycloak).ifPresent(finalCierreCaja::setUsuario);
        });

        cierreCaja = cierreCajaRepository.save(finalCierreCaja);
        return cierreCajaMapper.toDto(cierreCaja);
    }

    @Override
    public CierreCajaDTO update(CierreCajaDTO cierreCajaDTO) {
        LOG.debug("Request to update CierreCaja : {}", cierreCajaDTO);
        CierreCaja cierreCaja = cierreCajaMapper.toEntity(cierreCajaDTO);
        cierreCaja = cierreCajaRepository.save(cierreCaja);
        return cierreCajaMapper.toDto(cierreCaja);
    }

    @Override
    public Optional<CierreCajaDTO> partialUpdate(CierreCajaDTO cierreCajaDTO) {
        LOG.debug("Request to partially update CierreCaja : {}", cierreCajaDTO);

        return cierreCajaRepository
                .findById(cierreCajaDTO.getId())
                .map(existingCierreCaja -> {
                    cierreCajaMapper.partialUpdate(existingCierreCaja, cierreCajaDTO);

                    return existingCierreCaja;
                })
                .map(cierreCajaRepository::save)
                .map(cierreCajaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CierreCajaDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CierreCajas");
        return cierreCajaRepository.findAll(pageable).map(cierreCajaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CierreCajaDTO> findOne(Long id) {
        LOG.debug("Request to get CierreCaja : {}", id);
        return cierreCajaRepository.findById(id).map(cierreCajaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete CierreCaja : {}", id);
        cierreCajaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CierreCajaDTO> findLast() {
        LOG.debug("Request to get last CierreCaja");
        return cierreCajaRepository.findFirstByOrderByFechaDesc().map(cierreCajaMapper::toDto);
    }
}
