package com.ferronica.app.service;

import com.ferronica.app.service.dto.UnidadMedidaDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.UnidadMedida}.
 */
public interface UnidadMedidaService {
    /**
     * Save a unidadMedida.
     *
     * @param unidadMedidaDTO the entity to save.
     * @return the persisted entity.
     */
    UnidadMedidaDTO save(UnidadMedidaDTO unidadMedidaDTO);

    /**
     * Updates a unidadMedida.
     *
     * @param unidadMedidaDTO the entity to update.
     * @return the persisted entity.
     */
    UnidadMedidaDTO update(UnidadMedidaDTO unidadMedidaDTO);

    /**
     * Partially updates a unidadMedida.
     *
     * @param unidadMedidaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<UnidadMedidaDTO> partialUpdate(UnidadMedidaDTO unidadMedidaDTO);

    /**
     * Get all the unidadMedidas.
     *
     * @return the list of entities.
     */
    List<UnidadMedidaDTO> findAll();

    /**
     * Get the "id" unidadMedida.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<UnidadMedidaDTO> findOne(Long id);

    /**
     * Delete the "id" unidadMedida.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
