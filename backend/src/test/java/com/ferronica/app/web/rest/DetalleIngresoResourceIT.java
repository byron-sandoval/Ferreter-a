package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.DetalleIngresoAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.DetalleIngreso;
import com.ferronica.app.repository.DetalleIngresoRepository;
import com.ferronica.app.service.dto.DetalleIngresoDTO;
import com.ferronica.app.service.mapper.DetalleIngresoMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link DetalleIngresoResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DetalleIngresoResourceIT {

    private static final BigDecimal DEFAULT_CANTIDAD = new BigDecimal(0);
    private static final BigDecimal UPDATED_CANTIDAD = new BigDecimal(1);

    private static final BigDecimal DEFAULT_COSTO_UNITARIO = new BigDecimal(0);
    private static final BigDecimal UPDATED_COSTO_UNITARIO = new BigDecimal(1);

    private static final BigDecimal DEFAULT_MONTO = new BigDecimal(0);
    private static final BigDecimal UPDATED_MONTO = new BigDecimal(1);

    private static final String ENTITY_API_URL = "/api/detalle-ingresos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DetalleIngresoRepository detalleIngresoRepository;

    @Autowired
    private DetalleIngresoMapper detalleIngresoMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDetalleIngresoMockMvc;

    private DetalleIngreso detalleIngreso;

    private DetalleIngreso insertedDetalleIngreso;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DetalleIngreso createEntity() {
        return new DetalleIngreso().cantidad(DEFAULT_CANTIDAD).costoUnitario(DEFAULT_COSTO_UNITARIO).monto(DEFAULT_MONTO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DetalleIngreso createUpdatedEntity() {
        return new DetalleIngreso().cantidad(UPDATED_CANTIDAD).costoUnitario(UPDATED_COSTO_UNITARIO).monto(UPDATED_MONTO);
    }

    @BeforeEach
    void initTest() {
        detalleIngreso = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDetalleIngreso != null) {
            detalleIngresoRepository.delete(insertedDetalleIngreso);
            insertedDetalleIngreso = null;
        }
    }

    @Test
    @Transactional
    void createDetalleIngreso() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);
        var returnedDetalleIngresoDTO = om.readValue(
            restDetalleIngresoMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(detalleIngresoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DetalleIngresoDTO.class
        );

        // Validate the DetalleIngreso in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDetalleIngreso = detalleIngresoMapper.toEntity(returnedDetalleIngresoDTO);
        assertDetalleIngresoUpdatableFieldsEquals(returnedDetalleIngreso, getPersistedDetalleIngreso(returnedDetalleIngreso));

        insertedDetalleIngreso = returnedDetalleIngreso;
    }

    @Test
    @Transactional
    void createDetalleIngresoWithExistingId() throws Exception {
        // Create the DetalleIngreso with an existing ID
        detalleIngreso.setId(1L);
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDetalleIngresoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCantidadIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleIngreso.setCantidad(null);

        // Create the DetalleIngreso, which fails.
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        restDetalleIngresoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCostoUnitarioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleIngreso.setCostoUnitario(null);

        // Create the DetalleIngreso, which fails.
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        restDetalleIngresoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMontoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleIngreso.setMonto(null);

        // Create the DetalleIngreso, which fails.
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        restDetalleIngresoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDetalleIngresos() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        // Get all the detalleIngresoList
        restDetalleIngresoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(detalleIngreso.getId().intValue())))
            .andExpect(jsonPath("$.[*].cantidad").value(hasItem(sameNumber(DEFAULT_CANTIDAD))))
            .andExpect(jsonPath("$.[*].costoUnitario").value(hasItem(sameNumber(DEFAULT_COSTO_UNITARIO))))
            .andExpect(jsonPath("$.[*].monto").value(hasItem(sameNumber(DEFAULT_MONTO))));
    }

    @Test
    @Transactional
    void getDetalleIngreso() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        // Get the detalleIngreso
        restDetalleIngresoMockMvc
            .perform(get(ENTITY_API_URL_ID, detalleIngreso.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(detalleIngreso.getId().intValue()))
            .andExpect(jsonPath("$.cantidad").value(sameNumber(DEFAULT_CANTIDAD)))
            .andExpect(jsonPath("$.costoUnitario").value(sameNumber(DEFAULT_COSTO_UNITARIO)))
            .andExpect(jsonPath("$.monto").value(sameNumber(DEFAULT_MONTO)));
    }

    @Test
    @Transactional
    void getNonExistingDetalleIngreso() throws Exception {
        // Get the detalleIngreso
        restDetalleIngresoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDetalleIngreso() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleIngreso
        DetalleIngreso updatedDetalleIngreso = detalleIngresoRepository.findById(detalleIngreso.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDetalleIngreso are not directly saved in db
        em.detach(updatedDetalleIngreso);
        updatedDetalleIngreso.cantidad(UPDATED_CANTIDAD).costoUnitario(UPDATED_COSTO_UNITARIO).monto(UPDATED_MONTO);
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(updatedDetalleIngreso);

        restDetalleIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, detalleIngresoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isOk());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDetalleIngresoToMatchAllProperties(updatedDetalleIngreso);
    }

    @Test
    @Transactional
    void putNonExistingDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, detalleIngresoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDetalleIngresoWithPatch() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleIngreso using partial update
        DetalleIngreso partialUpdatedDetalleIngreso = new DetalleIngreso();
        partialUpdatedDetalleIngreso.setId(detalleIngreso.getId());

        partialUpdatedDetalleIngreso.cantidad(UPDATED_CANTIDAD).monto(UPDATED_MONTO);

        restDetalleIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDetalleIngreso.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDetalleIngreso))
            )
            .andExpect(status().isOk());

        // Validate the DetalleIngreso in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDetalleIngresoUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDetalleIngreso, detalleIngreso),
            getPersistedDetalleIngreso(detalleIngreso)
        );
    }

    @Test
    @Transactional
    void fullUpdateDetalleIngresoWithPatch() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleIngreso using partial update
        DetalleIngreso partialUpdatedDetalleIngreso = new DetalleIngreso();
        partialUpdatedDetalleIngreso.setId(detalleIngreso.getId());

        partialUpdatedDetalleIngreso.cantidad(UPDATED_CANTIDAD).costoUnitario(UPDATED_COSTO_UNITARIO).monto(UPDATED_MONTO);

        restDetalleIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDetalleIngreso.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDetalleIngreso))
            )
            .andExpect(status().isOk());

        // Validate the DetalleIngreso in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDetalleIngresoUpdatableFieldsEquals(partialUpdatedDetalleIngreso, getPersistedDetalleIngreso(partialUpdatedDetalleIngreso));
    }

    @Test
    @Transactional
    void patchNonExistingDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, detalleIngresoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDetalleIngreso() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleIngreso.setId(longCount.incrementAndGet());

        // Create the DetalleIngreso
        DetalleIngresoDTO detalleIngresoDTO = detalleIngresoMapper.toDto(detalleIngreso);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleIngresoMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleIngresoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DetalleIngreso in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDetalleIngreso() throws Exception {
        // Initialize the database
        insertedDetalleIngreso = detalleIngresoRepository.saveAndFlush(detalleIngreso);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the detalleIngreso
        restDetalleIngresoMockMvc
            .perform(delete(ENTITY_API_URL_ID, detalleIngreso.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return detalleIngresoRepository.count();
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

    protected DetalleIngreso getPersistedDetalleIngreso(DetalleIngreso detalleIngreso) {
        return detalleIngresoRepository.findById(detalleIngreso.getId()).orElseThrow();
    }

    protected void assertPersistedDetalleIngresoToMatchAllProperties(DetalleIngreso expectedDetalleIngreso) {
        assertDetalleIngresoAllPropertiesEquals(expectedDetalleIngreso, getPersistedDetalleIngreso(expectedDetalleIngreso));
    }

    protected void assertPersistedDetalleIngresoToMatchUpdatableProperties(DetalleIngreso expectedDetalleIngreso) {
        assertDetalleIngresoAllUpdatablePropertiesEquals(expectedDetalleIngreso, getPersistedDetalleIngreso(expectedDetalleIngreso));
    }
}
