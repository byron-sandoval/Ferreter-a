package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Venta;
import com.ferronica.app.repository.VentaRepository;
import com.ferronica.app.service.VentaService;
import com.ferronica.app.service.dto.VentaDTO;
import com.ferronica.app.service.mapper.VentaMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Venta}.
 */
@Service
@Transactional
public class VentaServiceImpl implements VentaService {

    private static final Logger LOG = LoggerFactory.getLogger(VentaServiceImpl.class);

    private final VentaRepository ventaRepository;

    private final VentaMapper ventaMapper;

    private final com.ferronica.app.repository.NumeracionFacturaRepository numeracionFacturaRepository;

    public VentaServiceImpl(
            VentaRepository ventaRepository,
            VentaMapper ventaMapper,
            com.ferronica.app.repository.NumeracionFacturaRepository numeracionFacturaRepository) {
        this.ventaRepository = ventaRepository;
        this.ventaMapper = ventaMapper;
        this.numeracionFacturaRepository = numeracionFacturaRepository;
    }

    @Override
    public VentaDTO save(VentaDTO ventaDTO) {
        LOG.debug("Request to save Venta : {}", ventaDTO);
        final Venta venta = ventaMapper.toEntity(ventaDTO);

        // Automatización de Fecha
        venta.setFecha(java.time.Instant.now());

        // Automatización de Numeración
        numeracionFacturaRepository
                .findByActivoTrue()
                .ifPresent(numeracion -> {
                    Long proximoCorrelativo = numeracion.getCorrelativoActual() + 1;
                    numeracion.setCorrelativoActual(proximoCorrelativo);
                    numeracionFacturaRepository.save(numeracion);

                    venta.setNoFactura(proximoCorrelativo);
                    venta.setNumeracion(numeracion);
                });

        // Estado inicial
        if (venta.getAnulada() == null) {
            venta.setAnulada(false);
        }

        Venta savedVenta = ventaRepository.save(venta);
        return ventaMapper.toDto(savedVenta);
    }

    @Override
    public VentaDTO update(VentaDTO ventaDTO) {
        LOG.debug("Request to update Venta : {}", ventaDTO);
        Venta venta = ventaMapper.toEntity(ventaDTO);
        venta = ventaRepository.save(venta);
        return ventaMapper.toDto(venta);
    }

    @Override
    public Optional<VentaDTO> partialUpdate(VentaDTO ventaDTO) {
        LOG.debug("Request to partially update Venta : {}", ventaDTO);

        return ventaRepository
                .findById(ventaDTO.getId())
                .map(existingVenta -> {
                    ventaMapper.partialUpdate(existingVenta, ventaDTO);

                    return existingVenta;
                })
                .map(ventaRepository::save)
                .map(ventaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<VentaDTO> findOne(Long id) {
        LOG.debug("Request to get Venta : {}", id);
        return ventaRepository.findOneWithEagerRelationships(id).map(ventaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Venta (Anulacion Logica) : {}", id);
        ventaRepository.findById(id).ifPresent(venta -> {
            venta.setAnulada(true);
            ventaRepository.save(venta);
        });
    }
}
