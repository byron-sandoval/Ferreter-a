package com.ferronica.app.service;

import com.ferronica.app.service.dto.DetalleVentaDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.DetalleVenta}.
 */
public interface DetalleVentaService {
    /**
     * Save a detalleVenta.
     *
     * @param detalleVentaDTO the entity to save.
     * @return the persisted entity.
     */
    DetalleVentaDTO save(DetalleVentaDTO detalleVentaDTO);

    /**
     * Updates a detalleVenta.
     *
     * @param detalleVentaDTO the entity to update.
     * @return the persisted entity.
     */
    DetalleVentaDTO update(DetalleVentaDTO detalleVentaDTO);

    /**
     * Partially updates a detalleVenta.
     *
     * @param detalleVentaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<DetalleVentaDTO> partialUpdate(DetalleVentaDTO detalleVentaDTO);

    /**
     * Get all the detalleVentas.
     *
     * @return the list of entities.
     */
    List<DetalleVentaDTO> findAll();

    /**
     * Get the "id" detalleVenta.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<DetalleVentaDTO> findOne(Long id);

    /**
     * Delete the "id" detalleVenta.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
