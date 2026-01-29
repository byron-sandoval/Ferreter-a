package com.ferronica.app.web.rest;

import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.service.ArticuloQueryService;
import com.ferronica.app.service.ArticuloService;
import com.ferronica.app.service.criteria.ArticuloCriteria;
import com.ferronica.app.service.dto.ArticuloDTO;
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
 * REST controller for managing {@link com.ferronica.app.domain.Articulo}.
 */
@RestController
@RequestMapping("/api/articulos")
public class ArticuloResource {

    private static final Logger LOG = LoggerFactory.getLogger(ArticuloResource.class);

    private static final String ENTITY_NAME = "articulo";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ArticuloService articuloService;

    private final ArticuloRepository articuloRepository;

    private final ArticuloQueryService articuloQueryService;

    public ArticuloResource(
            ArticuloService articuloService,
            ArticuloRepository articuloRepository,
            ArticuloQueryService articuloQueryService) {
        this.articuloService = articuloService;
        this.articuloRepository = articuloRepository;
        this.articuloQueryService = articuloQueryService;
    }

    /**
     * {@code POST  /articulos} : Create a new articulo.
     *
     * @param articuloDTO the articuloDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new articuloDTO, or with status {@code 400 (Bad Request)} if
     *         the articulo has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PostMapping("")
    public ResponseEntity<ArticuloDTO> createArticulo(@Valid @RequestBody ArticuloDTO articuloDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Articulo : {}", articuloDTO);
        if (articuloDTO.getId() != null) {
            throw new BadRequestAlertException("A new articulo cannot already have an ID", ENTITY_NAME, "idexists");
        }
        articuloDTO = articuloService.save(articuloDTO);
        return ResponseEntity.created(new URI("/api/articulos/" + articuloDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        articuloDTO.getId().toString()))
                .body(articuloDTO);
    }

    /**
     * {@code PUT  /articulos/:id} : Updates an existing articulo.
     *
     * @param id          the id of the articuloDTO to save.
     * @param articuloDTO the articuloDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated articuloDTO,
     *         or with status {@code 400 (Bad Request)} if the articuloDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the articuloDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PutMapping("/{id}")
    public ResponseEntity<ArticuloDTO> updateArticulo(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody ArticuloDTO articuloDTO) throws URISyntaxException {
        LOG.debug("REST request to update Articulo : {}, {}", id, articuloDTO);
        if (articuloDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, articuloDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!articuloRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        articuloDTO = articuloService.update(articuloDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        articuloDTO.getId().toString()))
                .body(articuloDTO);
    }

    /**
     * {@code PATCH  /articulos/:id} : Partial updates given fields of an existing
     * articulo, field will ignore if it is null
     *
     * @param id          the id of the articuloDTO to save.
     * @param articuloDTO the articuloDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated articuloDTO,
     *         or with status {@code 400 (Bad Request)} if the articuloDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the articuloDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the articuloDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ArticuloDTO> partialUpdateArticulo(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody ArticuloDTO articuloDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Articulo partially : {}, {}", id, articuloDTO);
        if (articuloDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, articuloDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!articuloRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ArticuloDTO> result = articuloService.partialUpdate(articuloDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        articuloDTO.getId().toString()));
    }

    /**
     * {@code GET  /articulos} : get all the articulos.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of articulos in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public ResponseEntity<List<ArticuloDTO>> getAllArticulos(
            ArticuloCriteria criteria,
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get Articulos by criteria: {}", criteria);

        Page<ArticuloDTO> page = articuloQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /articulos/count} : count all the articulos.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count
     *         in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/count")
    public ResponseEntity<Long> countArticulos(ArticuloCriteria criteria) {
        LOG.debug("REST request to count Articulos by criteria: {}", criteria);
        return ResponseEntity.ok().body(articuloQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /articulos/:id} : get the "id" articulo.
     *
     * @param id the id of the articuloDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the articuloDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ArticuloDTO> getArticulo(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Articulo : {}", id);
        Optional<ArticuloDTO> articuloDTO = articuloService.findOne(id);
        return ResponseUtil.wrapOrNotFound(articuloDTO);
    }

    /**
     * {@code DELETE  /articulos/:id} : delete the "id" articulo.
     *
     * @param id the id of the articuloDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticulo(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Articulo : {}", id);
        articuloService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
