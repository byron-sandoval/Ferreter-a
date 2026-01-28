package com.ferronica.app.service;

import com.ferronica.app.service.dto.IngresoDTO;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Ingreso}.
 */
public interface IngresoService {
    /**
     * Save a ingreso.
     *
     * @param ingresoDTO the entity to save.
     * @return the persisted entity.
     */
    IngresoDTO save(IngresoDTO ingresoDTO);

    /**
     * Updates a ingreso.
     *
     * @param ingresoDTO the entity to update.
     * @return the persisted entity.
     */
    IngresoDTO update(IngresoDTO ingresoDTO);

    /**
     * Partially updates a ingreso.
     *
     * @param ingresoDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<IngresoDTO> partialUpdate(IngresoDTO ingresoDTO);

    /**
     * Get the "id" ingreso.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<IngresoDTO> findOne(Long id);

    /**
     * Delete the "id" ingreso.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
