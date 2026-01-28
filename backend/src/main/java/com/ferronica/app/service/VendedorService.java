package com.ferronica.app.service;

import com.ferronica.app.service.dto.VendedorDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Vendedor}.
 */
public interface VendedorService {
    /**
     * Save a vendedor.
     *
     * @param vendedorDTO the entity to save.
     * @return the persisted entity.
     */
    VendedorDTO save(VendedorDTO vendedorDTO);

    /**
     * Updates a vendedor.
     *
     * @param vendedorDTO the entity to update.
     * @return the persisted entity.
     */
    VendedorDTO update(VendedorDTO vendedorDTO);

    /**
     * Partially updates a vendedor.
     *
     * @param vendedorDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<VendedorDTO> partialUpdate(VendedorDTO vendedorDTO);

    /**
     * Get all the vendedors.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<VendedorDTO> findAll(Pageable pageable);

    /**
     * Get the "id" vendedor.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<VendedorDTO> findOne(Long id);

    /**
     * Delete the "id" vendedor.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
