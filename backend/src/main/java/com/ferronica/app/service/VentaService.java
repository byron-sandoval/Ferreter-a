package com.ferronica.app.service;

import com.ferronica.app.service.dto.VentaDTO;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Venta}.
 */
public interface VentaService {
    /**
     * Save a venta.
     *
     * @param ventaDTO the entity to save.
     * @return the persisted entity.
     */
    VentaDTO save(VentaDTO ventaDTO);

    /**
     * Updates a venta.
     *
     * @param ventaDTO the entity to update.
     * @return the persisted entity.
     */
    VentaDTO update(VentaDTO ventaDTO);

    /**
     * Partially updates a venta.
     *
     * @param ventaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<VentaDTO> partialUpdate(VentaDTO ventaDTO);

    /**
     * Get the "id" venta.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<VentaDTO> findOne(Long id);

    /**
     * Delete the "id" venta.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
