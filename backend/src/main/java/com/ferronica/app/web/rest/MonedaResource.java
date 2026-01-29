package com.ferronica.app.web.rest;

import com.ferronica.app.repository.MonedaRepository;
import com.ferronica.app.service.MonedaService;
import com.ferronica.app.service.dto.MonedaDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.Moneda}.
 */
@RestController
@RequestMapping("/api/monedas")
public class MonedaResource {

    private static final Logger LOG = LoggerFactory.getLogger(MonedaResource.class);

    private static final String ENTITY_NAME = "moneda";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MonedaService monedaService;

    private final MonedaRepository monedaRepository;

    public MonedaResource(MonedaService monedaService, MonedaRepository monedaRepository) {
        this.monedaService = monedaService;
        this.monedaRepository = monedaRepository;
    }

    /**
     * {@code POST  /monedas} : Create a new moneda.
     *
     * @param monedaDTO the monedaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new monedaDTO, or with status {@code 400 (Bad Request)} if
     *         the moneda has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<MonedaDTO> createMoneda(@Valid @RequestBody MonedaDTO monedaDTO) throws URISyntaxException {
        LOG.debug("REST request to save Moneda : {}", monedaDTO);
        if (monedaDTO.getId() != null) {
            throw new BadRequestAlertException("A new moneda cannot already have an ID", ENTITY_NAME, "idexists");
        }
        monedaDTO = monedaService.save(monedaDTO);
        return ResponseEntity.created(new URI("/api/monedas/" + monedaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        monedaDTO.getId().toString()))
                .body(monedaDTO);
    }

    /**
     * {@code PUT  /monedas/:id} : Updates an existing moneda.
     *
     * @param id        the id of the monedaDTO to save.
     * @param monedaDTO the monedaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated monedaDTO,
     *         or with status {@code 400 (Bad Request)} if the monedaDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the monedaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MonedaDTO> updateMoneda(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody MonedaDTO monedaDTO) throws URISyntaxException {
        LOG.debug("REST request to update Moneda : {}, {}", id, monedaDTO);
        if (monedaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, monedaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!monedaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        monedaDTO = monedaService.update(monedaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        monedaDTO.getId().toString()))
                .body(monedaDTO);
    }

    /**
     * {@code PATCH  /monedas/:id} : Partial updates given fields of an existing
     * moneda, field will ignore if it is null
     *
     * @param id        the id of the monedaDTO to save.
     * @param monedaDTO the monedaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated monedaDTO,
     *         or with status {@code 400 (Bad Request)} if the monedaDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the monedaDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the monedaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<MonedaDTO> partialUpdateMoneda(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody MonedaDTO monedaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Moneda partially : {}, {}", id, monedaDTO);
        if (monedaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, monedaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!monedaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MonedaDTO> result = monedaService.partialUpdate(monedaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, monedaDTO.getId().toString()));
    }

    /**
     * {@code GET  /monedas} : get all the monedas.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of monedas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public List<MonedaDTO> getAllMonedas() {
        LOG.debug("REST request to get all Monedas");
        return monedaService.findAll();
    }

    /**
     * {@code GET  /monedas/:id} : get the "id" moneda.
     *
     * @param id the id of the monedaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the monedaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<MonedaDTO> getMoneda(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Moneda : {}", id);
        Optional<MonedaDTO> monedaDTO = monedaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(monedaDTO);
    }

    /**
     * {@code DELETE  /monedas/:id} : delete the "id" moneda.
     *
     * @param id the id of the monedaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMoneda(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Moneda : {}", id);
        monedaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
