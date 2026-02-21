package com.ferronica.app.service;

import com.ferronica.app.service.dto.CierreCajaDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.CierreCaja}.
 */
public interface CierreCajaService {
    /**
     * Save a cierreCaja.
     *
     * @param cierreCajaDTO the entity to save.
     * @return the persisted entity.
     */
    CierreCajaDTO save(CierreCajaDTO cierreCajaDTO);

    /**
     * Updates a cierreCaja.
     *
     * @param cierreCajaDTO the entity to update.
     * @return the persisted entity.
     */
    CierreCajaDTO update(CierreCajaDTO cierreCajaDTO);

    /**
     * Partially updates a cierreCaja.
     *
     * @param cierreCajaDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<CierreCajaDTO> partialUpdate(CierreCajaDTO cierreCajaDTO);

    /**
     * Get all the cierreCajas.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<CierreCajaDTO> findAll(Pageable pageable);

    /**
     * Get the "id" cierreCaja.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<CierreCajaDTO> findOne(Long id);

    /**
     * Delete the "id" cierreCaja.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get the last closure.
     *
     * @return the entity.
     */
    Optional<CierreCajaDTO> findLast();
}
