package com.ferronica.app.service;

import com.ferronica.app.service.dto.MonedaDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Moneda}.
 */
public interface MonedaService {
    /**
     * Save a moneda.
     *
     * @param monedaDTO the entity to save.
     * @return the persisted entity.
     */
    MonedaDTO save(MonedaDTO monedaDTO);

    /**
     * Updates a moneda.
     *
     * @param monedaDTO the entity to update.
     * @return the persisted entity.
     */
    MonedaDTO update(MonedaDTO monedaDTO);

    /**
     * Partially updates a moneda.
     *
     * @param monedaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<MonedaDTO> partialUpdate(MonedaDTO monedaDTO);

    /**
     * Get all the monedas.
     *
     * @return the list of entities.
     */
    List<MonedaDTO> findAll();

    /**
     * Get the "id" moneda.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<MonedaDTO> findOne(Long id);

    /**
     * Delete the "id" moneda.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
