package com.ferronica.app.service;

import com.ferronica.app.service.dto.DetalleIngresoDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.DetalleIngreso}.
 */
public interface DetalleIngresoService {
    /**
     * Save a detalleIngreso.
     *
     * @param detalleIngresoDTO the entity to save.
     * @return the persisted entity.
     */
    DetalleIngresoDTO save(DetalleIngresoDTO detalleIngresoDTO);

    /**
     * Updates a detalleIngreso.
     *
     * @param detalleIngresoDTO the entity to update.
     * @return the persisted entity.
     */
    DetalleIngresoDTO update(DetalleIngresoDTO detalleIngresoDTO);

    /**
     * Partially updates a detalleIngreso.
     *
     * @param detalleIngresoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<DetalleIngresoDTO> partialUpdate(DetalleIngresoDTO detalleIngresoDTO);

    /**
     * Get all the detalleIngresos.
     *
     * @return the list of entities.
     */
    List<DetalleIngresoDTO> findAll();

    /**
     * Get the "id" detalleIngreso.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<DetalleIngresoDTO> findOne(Long id);

    /**
     * Delete the "id" detalleIngreso.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
