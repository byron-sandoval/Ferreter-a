package com.ferronica.app.web.rest;

import com.ferronica.app.repository.UnidadMedidaRepository;
import com.ferronica.app.service.UnidadMedidaService;
import com.ferronica.app.service.dto.UnidadMedidaDTO;
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
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.UnidadMedida}.
 */
@RestController
@RequestMapping("/api/unidad-medidas")
public class UnidadMedidaResource {

    private static final Logger LOG = LoggerFactory.getLogger(UnidadMedidaResource.class);

    private static final String ENTITY_NAME = "unidadMedida";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UnidadMedidaService unidadMedidaService;

    private final UnidadMedidaRepository unidadMedidaRepository;

    public UnidadMedidaResource(UnidadMedidaService unidadMedidaService, UnidadMedidaRepository unidadMedidaRepository) {
        this.unidadMedidaService = unidadMedidaService;
        this.unidadMedidaRepository = unidadMedidaRepository;
    }

    /**
     * {@code POST  /unidad-medidas} : Create a new unidadMedida.
     *
     * @param unidadMedidaDTO the unidadMedidaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new unidadMedidaDTO, or with status {@code 400 (Bad Request)} if the unidadMedida has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UnidadMedidaDTO> createUnidadMedida(@Valid @RequestBody UnidadMedidaDTO unidadMedidaDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save UnidadMedida : {}", unidadMedidaDTO);
        if (unidadMedidaDTO.getId() != null) {
            throw new BadRequestAlertException("A new unidadMedida cannot already have an ID", ENTITY_NAME, "idexists");
        }
        unidadMedidaDTO = unidadMedidaService.save(unidadMedidaDTO);
        return ResponseEntity.created(new URI("/api/unidad-medidas/" + unidadMedidaDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, unidadMedidaDTO.getId().toString()))
            .body(unidadMedidaDTO);
    }

    /**
     * {@code PUT  /unidad-medidas/:id} : Updates an existing unidadMedida.
     *
     * @param id the id of the unidadMedidaDTO to save.
     * @param unidadMedidaDTO the unidadMedidaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unidadMedidaDTO,
     * or with status {@code 400 (Bad Request)} if the unidadMedidaDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the unidadMedidaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnidadMedidaDTO> updateUnidadMedida(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UnidadMedidaDTO unidadMedidaDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update UnidadMedida : {}, {}", id, unidadMedidaDTO);
        if (unidadMedidaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unidadMedidaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unidadMedidaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        unidadMedidaDTO = unidadMedidaService.update(unidadMedidaDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unidadMedidaDTO.getId().toString()))
            .body(unidadMedidaDTO);
    }

    /**
     * {@code PATCH  /unidad-medidas/:id} : Partial updates given fields of an existing unidadMedida, field will ignore if it is null
     *
     * @param id the id of the unidadMedidaDTO to save.
     * @param unidadMedidaDTO the unidadMedidaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unidadMedidaDTO,
     * or with status {@code 400 (Bad Request)} if the unidadMedidaDTO is not valid,
     * or with status {@code 404 (Not Found)} if the unidadMedidaDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the unidadMedidaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UnidadMedidaDTO> partialUpdateUnidadMedida(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UnidadMedidaDTO unidadMedidaDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UnidadMedida partially : {}, {}", id, unidadMedidaDTO);
        if (unidadMedidaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unidadMedidaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unidadMedidaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UnidadMedidaDTO> result = unidadMedidaService.partialUpdate(unidadMedidaDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unidadMedidaDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /unidad-medidas} : get all the unidadMedidas.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of unidadMedidas in body.
     */
    @GetMapping("")
    public List<UnidadMedidaDTO> getAllUnidadMedidas() {
        LOG.debug("REST request to get all UnidadMedidas");
        return unidadMedidaService.findAll();
    }

    /**
     * {@code GET  /unidad-medidas/:id} : get the "id" unidadMedida.
     *
     * @param id the id of the unidadMedidaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the unidadMedidaDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnidadMedidaDTO> getUnidadMedida(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UnidadMedida : {}", id);
        Optional<UnidadMedidaDTO> unidadMedidaDTO = unidadMedidaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(unidadMedidaDTO);
    }

    /**
     * {@code DELETE  /unidad-medidas/:id} : delete the "id" unidadMedida.
     *
     * @param id the id of the unidadMedidaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnidadMedida(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UnidadMedida : {}", id);
        unidadMedidaService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
