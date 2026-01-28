package com.ferronica.app.service;

import com.ferronica.app.service.dto.NumeracionFacturaDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.NumeracionFactura}.
 */
public interface NumeracionFacturaService {
    /**
     * Save a numeracionFactura.
     *
     * @param numeracionFacturaDTO the entity to save.
     * @return the persisted entity.
     */
    NumeracionFacturaDTO save(NumeracionFacturaDTO numeracionFacturaDTO);

    /**
     * Updates a numeracionFactura.
     *
     * @param numeracionFacturaDTO the entity to update.
     * @return the persisted entity.
     */
    NumeracionFacturaDTO update(NumeracionFacturaDTO numeracionFacturaDTO);

    /**
     * Partially updates a numeracionFactura.
     *
     * @param numeracionFacturaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<NumeracionFacturaDTO> partialUpdate(NumeracionFacturaDTO numeracionFacturaDTO);

    /**
     * Get all the numeracionFacturas.
     *
     * @return the list of entities.
     */
    List<NumeracionFacturaDTO> findAll();

    /**
     * Get the "id" numeracionFactura.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<NumeracionFacturaDTO> findOne(Long id);

    /**
     * Delete the "id" numeracionFactura.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
