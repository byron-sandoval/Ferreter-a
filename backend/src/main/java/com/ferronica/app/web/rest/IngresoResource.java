package com.ferronica.app.web.rest;

import com.ferronica.app.repository.IngresoRepository;
import com.ferronica.app.service.IngresoQueryService;
import com.ferronica.app.service.IngresoService;
import com.ferronica.app.service.criteria.IngresoCriteria;
import com.ferronica.app.service.dto.IngresoDTO;
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
 * REST controller for managing {@link com.ferronica.app.domain.Ingreso}.
 */
@RestController
@RequestMapping("/api/ingresos")
public class IngresoResource {

    private static final Logger LOG = LoggerFactory.getLogger(IngresoResource.class);

    private static final String ENTITY_NAME = "ingreso";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final IngresoService ingresoService;

    private final IngresoRepository ingresoRepository;

    private final IngresoQueryService ingresoQueryService;

    public IngresoResource(IngresoService ingresoService, IngresoRepository ingresoRepository, IngresoQueryService ingresoQueryService) {
        this.ingresoService = ingresoService;
        this.ingresoRepository = ingresoRepository;
        this.ingresoQueryService = ingresoQueryService;
    }

    /**
     * {@code POST  /ingresos} : Create a new ingreso.
     *
     * @param ingresoDTO the ingresoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new ingresoDTO, or with status {@code 400 (Bad Request)} if the ingreso has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<IngresoDTO> createIngreso(@Valid @RequestBody IngresoDTO ingresoDTO) throws URISyntaxException {
        LOG.debug("REST request to save Ingreso : {}", ingresoDTO);
        if (ingresoDTO.getId() != null) {
            throw new BadRequestAlertException("A new ingreso cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ingresoDTO = ingresoService.save(ingresoDTO);
        return ResponseEntity.created(new URI("/api/ingresos/" + ingresoDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, ingresoDTO.getId().toString()))
            .body(ingresoDTO);
    }

    /**
     * {@code PUT  /ingresos/:id} : Updates an existing ingreso.
     *
     * @param id the id of the ingresoDTO to save.
     * @param ingresoDTO the ingresoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ingresoDTO,
     * or with status {@code 400 (Bad Request)} if the ingresoDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the ingresoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<IngresoDTO> updateIngreso(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody IngresoDTO ingresoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Ingreso : {}, {}", id, ingresoDTO);
        if (ingresoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ingresoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ingresoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ingresoDTO = ingresoService.update(ingresoDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ingresoDTO.getId().toString()))
            .body(ingresoDTO);
    }

    /**
     * {@code PATCH  /ingresos/:id} : Partial updates given fields of an existing ingreso, field will ignore if it is null
     *
     * @param id the id of the ingresoDTO to save.
     * @param ingresoDTO the ingresoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated ingresoDTO,
     * or with status {@code 400 (Bad Request)} if the ingresoDTO is not valid,
     * or with status {@code 404 (Not Found)} if the ingresoDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the ingresoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<IngresoDTO> partialUpdateIngreso(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody IngresoDTO ingresoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Ingreso partially : {}, {}", id, ingresoDTO);
        if (ingresoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ingresoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ingresoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<IngresoDTO> result = ingresoService.partialUpdate(ingresoDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ingresoDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /ingresos} : get all the ingresos.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of ingresos in body.
     */
    @GetMapping("")
    public ResponseEntity<List<IngresoDTO>> getAllIngresos(
        IngresoCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Ingresos by criteria: {}", criteria);

        Page<IngresoDTO> page = ingresoQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /ingresos/count} : count all the ingresos.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countIngresos(IngresoCriteria criteria) {
        LOG.debug("REST request to count Ingresos by criteria: {}", criteria);
        return ResponseEntity.ok().body(ingresoQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /ingresos/:id} : get the "id" ingreso.
     *
     * @param id the id of the ingresoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the ingresoDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<IngresoDTO> getIngreso(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Ingreso : {}", id);
        Optional<IngresoDTO> ingresoDTO = ingresoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(ingresoDTO);
    }

    /**
     * {@code DELETE  /ingresos/:id} : delete the "id" ingreso.
     *
     * @param id the id of the ingresoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngreso(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Ingreso : {}", id);
        ingresoService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
