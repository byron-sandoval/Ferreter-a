package com.ferronica.app.web.rest;

import com.ferronica.app.repository.ProveedorRepository;
import com.ferronica.app.service.ProveedorService;
import com.ferronica.app.service.dto.ProveedorDTO;
import com.ferronica.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.Proveedor}.
 */
@RestController
@RequestMapping("/api/proveedors")
public class ProveedorResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProveedorResource.class);

    private static final String ENTITY_NAME = "proveedor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProveedorService proveedorService;

    private final ProveedorRepository proveedorRepository;

    public ProveedorResource(ProveedorService proveedorService, ProveedorRepository proveedorRepository) {
        this.proveedorService = proveedorService;
        this.proveedorRepository = proveedorRepository;
    }

    /**
     * {@code POST  /proveedors} : Create a new proveedor.
     *
     * @param proveedorDTO the proveedorDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new proveedorDTO, or with status {@code 400 (Bad Request)}
     *         if the proveedor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PostMapping("")
    public ResponseEntity<ProveedorDTO> createProveedor(@Valid @RequestBody ProveedorDTO proveedorDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Proveedor : {}", proveedorDTO);
        if (proveedorDTO.getId() != null) {
            throw new BadRequestAlertException("A new proveedor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        proveedorDTO = proveedorService.save(proveedorDTO);
        return ResponseEntity.created(new URI("/api/proveedors/" + proveedorDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        proveedorDTO.getId().toString()))
                .body(proveedorDTO);
    }

    /**
     * {@code PUT  /proveedors/:id} : Updates an existing proveedor.
     *
     * @param id           the id of the proveedorDTO to save.
     * @param proveedorDTO the proveedorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated proveedorDTO,
     *         or with status {@code 400 (Bad Request)} if the proveedorDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         proveedorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PutMapping("/{id}")
    public ResponseEntity<ProveedorDTO> updateProveedor(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ProveedorDTO proveedorDTO) throws URISyntaxException {
        LOG.debug("REST request to update Proveedor : {}, {}", id, proveedorDTO);
        if (proveedorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, proveedorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!proveedorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        proveedorDTO = proveedorService.update(proveedorDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        proveedorDTO.getId().toString()))
                .body(proveedorDTO);
    }

    /**
     * {@code PATCH  /proveedors/:id} : Partial updates given fields of an existing
     * proveedor, field will ignore if it is null
     *
     * @param id           the id of the proveedorDTO to save.
     * @param proveedorDTO the proveedorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated proveedorDTO,
     *         or with status {@code 400 (Bad Request)} if the proveedorDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the proveedorDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         proveedorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProveedorDTO> partialUpdateProveedor(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ProveedorDTO proveedorDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Proveedor partially : {}, {}", id, proveedorDTO);
        if (proveedorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, proveedorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!proveedorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProveedorDTO> result = proveedorService.partialUpdate(proveedorDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        proveedorDTO.getId().toString()));
    }

    /**
     * {@code GET  /proveedors} : get all the proveedors.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of proveedors in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("")
    public ResponseEntity<List<ProveedorDTO>> getAllProveedors(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Proveedors");
        Page<ProveedorDTO> page = proveedorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /proveedors/:id} : get the "id" proveedor.
     *
     * @param id the id of the proveedorDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the proveedorDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("/{id}")
    public ResponseEntity<ProveedorDTO> getProveedor(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Proveedor : {}", id);
        Optional<ProveedorDTO> proveedorDTO = proveedorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(proveedorDTO);
    }

    /**
     * {@code DELETE  /proveedors/:id} : delete the "id" proveedor.
     *
     * @param id the id of the proveedorDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProveedor(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Proveedor : {}", id);
        proveedorService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
