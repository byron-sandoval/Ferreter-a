package com.ferronica.app.web.rest;

import com.ferronica.app.repository.VendedorRepository;
import com.ferronica.app.service.VendedorService;
import com.ferronica.app.service.dto.VendedorDTO;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.Vendedor}.
 */
@RestController
@RequestMapping("/api/vendedors")
public class VendedorResource {

    private static final Logger LOG = LoggerFactory.getLogger(VendedorResource.class);

    private static final String ENTITY_NAME = "vendedor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final VendedorService vendedorService;

    private final VendedorRepository vendedorRepository;

    public VendedorResource(VendedorService vendedorService, VendedorRepository vendedorRepository) {
        this.vendedorService = vendedorService;
        this.vendedorRepository = vendedorRepository;
    }

    /**
     * {@code POST  /vendedors} : Create a new vendedor.
     *
     * @param vendedorDTO the vendedorDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new vendedorDTO, or with status {@code 400 (Bad Request)} if the vendedor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<VendedorDTO> createVendedor(@Valid @RequestBody VendedorDTO vendedorDTO) throws URISyntaxException {
        LOG.debug("REST request to save Vendedor : {}", vendedorDTO);
        if (vendedorDTO.getId() != null) {
            throw new BadRequestAlertException("A new vendedor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        vendedorDTO = vendedorService.save(vendedorDTO);
        return ResponseEntity.created(new URI("/api/vendedors/" + vendedorDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, vendedorDTO.getId().toString()))
            .body(vendedorDTO);
    }

    /**
     * {@code PUT  /vendedors/:id} : Updates an existing vendedor.
     *
     * @param id the id of the vendedorDTO to save.
     * @param vendedorDTO the vendedorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated vendedorDTO,
     * or with status {@code 400 (Bad Request)} if the vendedorDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the vendedorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<VendedorDTO> updateVendedor(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody VendedorDTO vendedorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Vendedor : {}, {}", id, vendedorDTO);
        if (vendedorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, vendedorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!vendedorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        vendedorDTO = vendedorService.update(vendedorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, vendedorDTO.getId().toString()))
            .body(vendedorDTO);
    }

    /**
     * {@code PATCH  /vendedors/:id} : Partial updates given fields of an existing vendedor, field will ignore if it is null
     *
     * @param id the id of the vendedorDTO to save.
     * @param vendedorDTO the vendedorDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated vendedorDTO,
     * or with status {@code 400 (Bad Request)} if the vendedorDTO is not valid,
     * or with status {@code 404 (Not Found)} if the vendedorDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the vendedorDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<VendedorDTO> partialUpdateVendedor(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody VendedorDTO vendedorDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Vendedor partially : {}, {}", id, vendedorDTO);
        if (vendedorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, vendedorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!vendedorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<VendedorDTO> result = vendedorService.partialUpdate(vendedorDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, vendedorDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /vendedors} : get all the vendedors.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of vendedors in body.
     */
    @GetMapping("")
    public ResponseEntity<List<VendedorDTO>> getAllVendedors(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Vendedors");
        Page<VendedorDTO> page = vendedorService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /vendedors/:id} : get the "id" vendedor.
     *
     * @param id the id of the vendedorDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the vendedorDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VendedorDTO> getVendedor(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Vendedor : {}", id);
        Optional<VendedorDTO> vendedorDTO = vendedorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(vendedorDTO);
    }

    /**
     * {@code DELETE  /vendedors/:id} : delete the "id" vendedor.
     *
     * @param id the id of the vendedorDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendedor(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Vendedor : {}", id);
        vendedorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
