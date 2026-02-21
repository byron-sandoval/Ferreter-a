package com.ferronica.app.web.rest;

import com.ferronica.app.service.CierreCajaService;
import com.ferronica.app.service.dto.CierreCajaDTO;
import com.ferronica.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
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
 * REST controller for managing {@link com.ferronica.app.domain.CierreCaja}.
 */
@RestController
@RequestMapping("/api/cierre-cajas")
public class CierreCajaResource {

    private static final Logger LOG = LoggerFactory.getLogger(CierreCajaResource.class);

    private static final String ENTITY_NAME = "cierreCaja";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CierreCajaService cierreCajaService;

    public CierreCajaResource(CierreCajaService cierreCajaService) {
        this.cierreCajaService = cierreCajaService;
    }

    /**
     * {@code POST  /cierre-cajas} : Create a new cierreCaja.
     *
     * @param cierreCajaDTO the cierreCajaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new cierreCajaDTO, or with status {@code 400 (Bad Request)}
     *         if the cierreCaja has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    @PostMapping("")
    public ResponseEntity<CierreCajaDTO> createCierreCaja(@Valid @RequestBody CierreCajaDTO cierreCajaDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save CierreCaja : {}", cierreCajaDTO);
        if (cierreCajaDTO.getId() != null) {
            throw new BadRequestAlertException("A new cierreCaja cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cierreCajaDTO = cierreCajaService.save(cierreCajaDTO);
        return ResponseEntity.created(new URI("/api/cierre-cajas/" + cierreCajaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        cierreCajaDTO.getId().toString()))
                .body(cierreCajaDTO);
    }

    /**
     * {@code GET  /cierre-cajas} : get all the cierreCajas.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of cierreCajas in body.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("")
    public ResponseEntity<List<CierreCajaDTO>> getAllCierreCajas(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of CierreCajas");
        Page<CierreCajaDTO> page = cierreCajaService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /cierre-cajas/:id} : get the "id" cierreCaja.
     *
     * @param id the id of the cierreCajaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the cierreCajaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CierreCajaDTO> getCierreCaja(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CierreCaja : {}", id);
        Optional<CierreCajaDTO> cierreCajaDTO = cierreCajaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cierreCajaDTO);
    }

    /**
     * {@code GET  /cierre-cajas/last} : get the last closure.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the cierreCajaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    @GetMapping("/last")
    public ResponseEntity<CierreCajaDTO> getLastCierreCaja() {
        LOG.debug("REST request to get last CierreCaja");
        Optional<CierreCajaDTO> cierreCajaDTO = cierreCajaService.findLast();
        return ResponseUtil.wrapOrNotFound(cierreCajaDTO);
    }

    /**
     * {@code DELETE  /cierre-cajas/:id} : delete the "id" cierreCaja.
     *
     * @param id the id of the cierreCajaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCierreCaja(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CierreCaja : {}", id);
        cierreCajaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}
