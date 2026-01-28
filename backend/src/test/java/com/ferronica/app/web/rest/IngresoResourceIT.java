package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.IngresoAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.domain.Proveedor;
import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.repository.IngresoRepository;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.mapper.IngresoMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link IngresoResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class IngresoResourceIT {

    private static final Instant DEFAULT_FECHA = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_NO_DOCUMENTO = "AAAAAAAAAA";
    private static final String UPDATED_NO_DOCUMENTO = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_TOTAL = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL = new BigDecimal(1 - 1);

    private static final String DEFAULT_OBSERVACIONES = "AAAAAAAAAA";
    private static final String UPDATED_OBSERVACIONES = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/ingresos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private IngresoRepository ingresoRepository;

    @Autowired
    private IngresoMapper ingresoMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restIngresoMockMvc;

    private Ingreso ingreso;

    private Ingreso insertedIngreso;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Ingreso createEntity() {
        return new Ingreso()
            .fecha(DEFAULT_FECHA)
            .noDocumento(DEFAULT_NO_DOCUMENTO)
            .total(DEFAULT_TOTAL)
            .observaciones(DEFAULT_OBSERVACIONES)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Ingreso createUpdatedEntity() {
        return new Ingreso()
            .fecha(UPDATED_FECHA)
            .noDocumento(UPDATED_NO_DOCUMENTO)
            .total(UPDATED_TOTAL)
            .observaciones(UPDATED_OBSERVACIONES)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        ingreso = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedIngreso != null) {
            ingresoRepository.delete(insertedIngreso);
            insertedIngreso = null;
        }
    }

    @Test
    @Transactional
    void createIngreso() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);
        var returnedIngresoDTO = om.readValue(
            restIngresoMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            IngresoDTO.class
        );

        // Validate the Ingreso in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedIngreso = ingresoMapper.toEntity(returnedIngresoDTO);
        assertIngresoUpdatableFieldsEquals(returnedIngreso, getPersistedIngreso(returnedIngreso));

        insertedIngreso = returnedIngreso;
    }

    @Test
    @Transactional
    void createIngresoWithExistingId() throws Exception {
        // Create the Ingreso with an existing ID
        ingreso.setId(1L);
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restIngresoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        ingreso.setFecha(null);

        // Create the Ingreso, which fails.
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        restIngresoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNoDocumentoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        ingreso.setNoDocumento(null);

        // Create the Ingreso, which fails.
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        restIngresoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTotalIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        ingreso.setTotal(null);

        // Create the Ingreso, which fails.
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        restIngresoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllIngresos() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(ingreso.getId().intValue())))
            .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
            .andExpect(jsonPath("$.[*].noDocumento").value(hasItem(DEFAULT_NO_DOCUMENTO)))
            .andExpect(jsonPath("$.[*].total").value(hasItem(sameNumber(DEFAULT_TOTAL))))
            .andExpect(jsonPath("$.[*].observaciones").value(hasItem(DEFAULT_OBSERVACIONES)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getIngreso() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get the ingreso
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL_ID, ingreso.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(ingreso.getId().intValue()))
            .andExpect(jsonPath("$.fecha").value(DEFAULT_FECHA.toString()))
            .andExpect(jsonPath("$.noDocumento").value(DEFAULT_NO_DOCUMENTO))
            .andExpect(jsonPath("$.total").value(sameNumber(DEFAULT_TOTAL)))
            .andExpect(jsonPath("$.observaciones").value(DEFAULT_OBSERVACIONES))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getIngresosByIdFiltering() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        Long id = ingreso.getId();

        defaultIngresoFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultIngresoFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultIngresoFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllIngresosByFechaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where fecha equals to
        defaultIngresoFiltering("fecha.equals=" + DEFAULT_FECHA, "fecha.equals=" + UPDATED_FECHA);
    }

    @Test
    @Transactional
    void getAllIngresosByFechaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where fecha in
        defaultIngresoFiltering("fecha.in=" + DEFAULT_FECHA + "," + UPDATED_FECHA, "fecha.in=" + UPDATED_FECHA);
    }

    @Test
    @Transactional
    void getAllIngresosByFechaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where fecha is not null
        defaultIngresoFiltering("fecha.specified=true", "fecha.specified=false");
    }

    @Test
    @Transactional
    void getAllIngresosByNoDocumentoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where noDocumento equals to
        defaultIngresoFiltering("noDocumento.equals=" + DEFAULT_NO_DOCUMENTO, "noDocumento.equals=" + UPDATED_NO_DOCUMENTO);
    }

    @Test
    @Transactional
    void getAllIngresosByNoDocumentoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where noDocumento in
        defaultIngresoFiltering(
            "noDocumento.in=" + DEFAULT_NO_DOCUMENTO + "," + UPDATED_NO_DOCUMENTO,
            "noDocumento.in=" + UPDATED_NO_DOCUMENTO
        );
    }

    @Test
    @Transactional
    void getAllIngresosByNoDocumentoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where noDocumento is not null
        defaultIngresoFiltering("noDocumento.specified=true", "noDocumento.specified=false");
    }

    @Test
    @Transactional
    void getAllIngresosByNoDocumentoContainsSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where noDocumento contains
        defaultIngresoFiltering("noDocumento.contains=" + DEFAULT_NO_DOCUMENTO, "noDocumento.contains=" + UPDATED_NO_DOCUMENTO);
    }

    @Test
    @Transactional
    void getAllIngresosByNoDocumentoNotContainsSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where noDocumento does not contain
        defaultIngresoFiltering("noDocumento.doesNotContain=" + UPDATED_NO_DOCUMENTO, "noDocumento.doesNotContain=" + DEFAULT_NO_DOCUMENTO);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total equals to
        defaultIngresoFiltering("total.equals=" + DEFAULT_TOTAL, "total.equals=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsInShouldWork() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total in
        defaultIngresoFiltering("total.in=" + DEFAULT_TOTAL + "," + UPDATED_TOTAL, "total.in=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total is not null
        defaultIngresoFiltering("total.specified=true", "total.specified=false");
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total is greater than or equal to
        defaultIngresoFiltering("total.greaterThanOrEqual=" + DEFAULT_TOTAL, "total.greaterThanOrEqual=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total is less than or equal to
        defaultIngresoFiltering("total.lessThanOrEqual=" + DEFAULT_TOTAL, "total.lessThanOrEqual=" + SMALLER_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total is less than
        defaultIngresoFiltering("total.lessThan=" + UPDATED_TOTAL, "total.lessThan=" + DEFAULT_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByTotalIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where total is greater than
        defaultIngresoFiltering("total.greaterThan=" + SMALLER_TOTAL, "total.greaterThan=" + DEFAULT_TOTAL);
    }

    @Test
    @Transactional
    void getAllIngresosByObservacionesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where observaciones equals to
        defaultIngresoFiltering("observaciones.equals=" + DEFAULT_OBSERVACIONES, "observaciones.equals=" + UPDATED_OBSERVACIONES);
    }

    @Test
    @Transactional
    void getAllIngresosByObservacionesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where observaciones in
        defaultIngresoFiltering(
            "observaciones.in=" + DEFAULT_OBSERVACIONES + "," + UPDATED_OBSERVACIONES,
            "observaciones.in=" + UPDATED_OBSERVACIONES
        );
    }

    @Test
    @Transactional
    void getAllIngresosByObservacionesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where observaciones is not null
        defaultIngresoFiltering("observaciones.specified=true", "observaciones.specified=false");
    }

    @Test
    @Transactional
    void getAllIngresosByObservacionesContainsSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where observaciones contains
        defaultIngresoFiltering("observaciones.contains=" + DEFAULT_OBSERVACIONES, "observaciones.contains=" + UPDATED_OBSERVACIONES);
    }

    @Test
    @Transactional
    void getAllIngresosByObservacionesNotContainsSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where observaciones does not contain
        defaultIngresoFiltering(
            "observaciones.doesNotContain=" + UPDATED_OBSERVACIONES,
            "observaciones.doesNotContain=" + DEFAULT_OBSERVACIONES
        );
    }

    @Test
    @Transactional
    void getAllIngresosByActivoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where activo equals to
        defaultIngresoFiltering("activo.equals=" + DEFAULT_ACTIVO, "activo.equals=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllIngresosByActivoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where activo in
        defaultIngresoFiltering("activo.in=" + DEFAULT_ACTIVO + "," + UPDATED_ACTIVO, "activo.in=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllIngresosByActivoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        // Get all the ingresoList where activo is not null
        defaultIngresoFiltering("activo.specified=true", "activo.specified=false");
    }

    @Test
    @Transactional
    void getAllIngresosByVendedorIsEqualToSomething() throws Exception {
        Vendedor vendedor;
        if (TestUtil.findAll(em, Vendedor.class).isEmpty()) {
            ingresoRepository.saveAndFlush(ingreso);
            vendedor = VendedorResourceIT.createEntity();
        } else {
            vendedor = TestUtil.findAll(em, Vendedor.class).get(0);
        }
        em.persist(vendedor);
        em.flush();
        ingreso.setVendedor(vendedor);
        ingresoRepository.saveAndFlush(ingreso);
        Long vendedorId = vendedor.getId();
        // Get all the ingresoList where vendedor equals to vendedorId
        defaultIngresoShouldBeFound("vendedorId.equals=" + vendedorId);

        // Get all the ingresoList where vendedor equals to (vendedorId + 1)
        defaultIngresoShouldNotBeFound("vendedorId.equals=" + (vendedorId + 1));
    }

    @Test
    @Transactional
    void getAllIngresosByProveedorIsEqualToSomething() throws Exception {
        Proveedor proveedor;
        if (TestUtil.findAll(em, Proveedor.class).isEmpty()) {
            ingresoRepository.saveAndFlush(ingreso);
            proveedor = ProveedorResourceIT.createEntity();
        } else {
            proveedor = TestUtil.findAll(em, Proveedor.class).get(0);
        }
        em.persist(proveedor);
        em.flush();
        ingreso.setProveedor(proveedor);
        ingresoRepository.saveAndFlush(ingreso);
        Long proveedorId = proveedor.getId();
        // Get all the ingresoList where proveedor equals to proveedorId
        defaultIngresoShouldBeFound("proveedorId.equals=" + proveedorId);

        // Get all the ingresoList where proveedor equals to (proveedorId + 1)
        defaultIngresoShouldNotBeFound("proveedorId.equals=" + (proveedorId + 1));
    }

    private void defaultIngresoFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultIngresoShouldBeFound(shouldBeFound);
        defaultIngresoShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultIngresoShouldBeFound(String filter) throws Exception {
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(ingreso.getId().intValue())))
            .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
            .andExpect(jsonPath("$.[*].noDocumento").value(hasItem(DEFAULT_NO_DOCUMENTO)))
            .andExpect(jsonPath("$.[*].total").value(hasItem(sameNumber(DEFAULT_TOTAL))))
            .andExpect(jsonPath("$.[*].observaciones").value(hasItem(DEFAULT_OBSERVACIONES)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));

        // Check, that the count call also returns 1
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultIngresoShouldNotBeFound(String filter) throws Exception {
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restIngresoMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingIngreso() throws Exception {
        // Get the ingreso
        restIngresoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingIngreso() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the ingreso
        Ingreso updatedIngreso = ingresoRepository.findById(ingreso.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedIngreso are not directly saved in db
        em.detach(updatedIngreso);
        updatedIngreso
            .fecha(UPDATED_FECHA)
            .noDocumento(UPDATED_NO_DOCUMENTO)
            .total(UPDATED_TOTAL)
            .observaciones(UPDATED_OBSERVACIONES)
            .activo(UPDATED_ACTIVO);
        IngresoDTO ingresoDTO = ingresoMapper.toDto(updatedIngreso);

        restIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, ingresoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isOk());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedIngresoToMatchAllProperties(updatedIngreso);
    }

    @Test
    @Transactional
    void putNonExistingIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, ingresoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(ingresoDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateIngresoWithPatch() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the ingreso using partial update
        Ingreso partialUpdatedIngreso = new Ingreso();
        partialUpdatedIngreso.setId(ingreso.getId());

        partialUpdatedIngreso
            .fecha(UPDATED_FECHA)
            .noDocumento(UPDATED_NO_DOCUMENTO)
            .observaciones(UPDATED_OBSERVACIONES)
            .activo(UPDATED_ACTIVO);

        restIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedIngreso.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedIngreso))
            )
            .andExpect(status().isOk());

        // Validate the Ingreso in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertIngresoUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedIngreso, ingreso), getPersistedIngreso(ingreso));
    }

    @Test
    @Transactional
    void fullUpdateIngresoWithPatch() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the ingreso using partial update
        Ingreso partialUpdatedIngreso = new Ingreso();
        partialUpdatedIngreso.setId(ingreso.getId());

        partialUpdatedIngreso
            .fecha(UPDATED_FECHA)
            .noDocumento(UPDATED_NO_DOCUMENTO)
            .total(UPDATED_TOTAL)
            .observaciones(UPDATED_OBSERVACIONES)
            .activo(UPDATED_ACTIVO);

        restIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedIngreso.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedIngreso))
            )
            .andExpect(status().isOk());

        // Validate the Ingreso in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertIngresoUpdatableFieldsEquals(partialUpdatedIngreso, getPersistedIngreso(partialUpdatedIngreso));
    }

    @Test
    @Transactional
    void patchNonExistingIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, ingresoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        ingreso.setId(longCount.incrementAndGet());

        // Create the Ingreso
        IngresoDTO ingresoDTO = ingresoMapper.toDto(ingreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(ingresoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Ingreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteIngreso() throws Exception {
        // Initialize the database
        insertedIngreso = ingresoRepository.saveAndFlush(ingreso);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the ingreso
        restIngresoMockMvc
            .perform(delete(ENTITY_API_URL_ID, ingreso.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return ingresoRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Ingreso getPersistedIngreso(Ingreso ingreso) {
        return ingresoRepository.findById(ingreso.getId()).orElseThrow();
    }

    protected void assertPersistedIngresoToMatchAllProperties(Ingreso expectedIngreso) {
        assertIngresoAllPropertiesEquals(expectedIngreso, getPersistedIngreso(expectedIngreso));
    }

    protected void assertPersistedIngresoToMatchUpdatableProperties(Ingreso expectedIngreso) {
        assertIngresoAllUpdatablePropertiesEquals(expectedIngreso, getPersistedIngreso(expectedIngreso));
    }
}
