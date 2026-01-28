package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.DevolucionAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Devolucion;
import com.ferronica.app.repository.DevolucionRepository;
import com.ferronica.app.service.dto.DevolucionDTO;
import com.ferronica.app.service.mapper.DevolucionMapper;
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
 * Integration tests for the {@link DevolucionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DevolucionResourceIT {

    private static final Instant DEFAULT_FECHA = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_MOTIVO = "AAAAAAAAAA";
    private static final String UPDATED_MOTIVO = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_TOTAL = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL = new BigDecimal(2);

    private static final String ENTITY_API_URL = "/api/devolucions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DevolucionRepository devolucionRepository;

    @Autowired
    private DevolucionMapper devolucionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDevolucionMockMvc;

    private Devolucion devolucion;

    private Devolucion insertedDevolucion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Devolucion createEntity() {
        return new Devolucion().fecha(DEFAULT_FECHA).motivo(DEFAULT_MOTIVO).total(DEFAULT_TOTAL);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Devolucion createUpdatedEntity() {
        return new Devolucion().fecha(UPDATED_FECHA).motivo(UPDATED_MOTIVO).total(UPDATED_TOTAL);
    }

    @BeforeEach
    void initTest() {
        devolucion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDevolucion != null) {
            devolucionRepository.delete(insertedDevolucion);
            insertedDevolucion = null;
        }
    }

    @Test
    @Transactional
    void createDevolucion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);
        var returnedDevolucionDTO = om.readValue(
            restDevolucionMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(devolucionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DevolucionDTO.class
        );

        // Validate the Devolucion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDevolucion = devolucionMapper.toEntity(returnedDevolucionDTO);
        assertDevolucionUpdatableFieldsEquals(returnedDevolucion, getPersistedDevolucion(returnedDevolucion));

        insertedDevolucion = returnedDevolucion;
    }

    @Test
    @Transactional
    void createDevolucionWithExistingId() throws Exception {
        // Create the Devolucion with an existing ID
        devolucion.setId(1L);
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDevolucionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(devolucionDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        devolucion.setFecha(null);

        // Create the Devolucion, which fails.
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        restDevolucionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(devolucionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDevolucions() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        // Get all the devolucionList
        restDevolucionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(devolucion.getId().intValue())))
            .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
            .andExpect(jsonPath("$.[*].motivo").value(hasItem(DEFAULT_MOTIVO)))
            .andExpect(jsonPath("$.[*].total").value(hasItem(sameNumber(DEFAULT_TOTAL))));
    }

    @Test
    @Transactional
    void getDevolucion() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        // Get the devolucion
        restDevolucionMockMvc
            .perform(get(ENTITY_API_URL_ID, devolucion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(devolucion.getId().intValue()))
            .andExpect(jsonPath("$.fecha").value(DEFAULT_FECHA.toString()))
            .andExpect(jsonPath("$.motivo").value(DEFAULT_MOTIVO))
            .andExpect(jsonPath("$.total").value(sameNumber(DEFAULT_TOTAL)));
    }

    @Test
    @Transactional
    void getNonExistingDevolucion() throws Exception {
        // Get the devolucion
        restDevolucionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDevolucion() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the devolucion
        Devolucion updatedDevolucion = devolucionRepository.findById(devolucion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDevolucion are not directly saved in db
        em.detach(updatedDevolucion);
        updatedDevolucion.fecha(UPDATED_FECHA).motivo(UPDATED_MOTIVO).total(UPDATED_TOTAL);
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(updatedDevolucion);

        restDevolucionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, devolucionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isOk());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDevolucionToMatchAllProperties(updatedDevolucion);
    }

    @Test
    @Transactional
    void putNonExistingDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, devolucionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(devolucionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDevolucionWithPatch() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the devolucion using partial update
        Devolucion partialUpdatedDevolucion = new Devolucion();
        partialUpdatedDevolucion.setId(devolucion.getId());

        partialUpdatedDevolucion.motivo(UPDATED_MOTIVO);

        restDevolucionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDevolucion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDevolucion))
            )
            .andExpect(status().isOk());

        // Validate the Devolucion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDevolucionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDevolucion, devolucion),
            getPersistedDevolucion(devolucion)
        );
    }

    @Test
    @Transactional
    void fullUpdateDevolucionWithPatch() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the devolucion using partial update
        Devolucion partialUpdatedDevolucion = new Devolucion();
        partialUpdatedDevolucion.setId(devolucion.getId());

        partialUpdatedDevolucion.fecha(UPDATED_FECHA).motivo(UPDATED_MOTIVO).total(UPDATED_TOTAL);

        restDevolucionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDevolucion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDevolucion))
            )
            .andExpect(status().isOk());

        // Validate the Devolucion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDevolucionUpdatableFieldsEquals(partialUpdatedDevolucion, getPersistedDevolucion(partialUpdatedDevolucion));
    }

    @Test
    @Transactional
    void patchNonExistingDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, devolucionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDevolucion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        devolucion.setId(longCount.incrementAndGet());

        // Create the Devolucion
        DevolucionDTO devolucionDTO = devolucionMapper.toDto(devolucion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDevolucionMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(devolucionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Devolucion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDevolucion() throws Exception {
        // Initialize the database
        insertedDevolucion = devolucionRepository.saveAndFlush(devolucion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the devolucion
        restDevolucionMockMvc
            .perform(delete(ENTITY_API_URL_ID, devolucion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return devolucionRepository.count();
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

    protected Devolucion getPersistedDevolucion(Devolucion devolucion) {
        return devolucionRepository.findById(devolucion.getId()).orElseThrow();
    }

    protected void assertPersistedDevolucionToMatchAllProperties(Devolucion expectedDevolucion) {
        assertDevolucionAllPropertiesEquals(expectedDevolucion, getPersistedDevolucion(expectedDevolucion));
    }

    protected void assertPersistedDevolucionToMatchUpdatableProperties(Devolucion expectedDevolucion) {
        assertDevolucionAllUpdatablePropertiesEquals(expectedDevolucion, getPersistedDevolucion(expectedDevolucion));
    }
}
