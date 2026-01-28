package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.HistorialPrecioAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.HistorialPrecio;
import com.ferronica.app.repository.HistorialPrecioRepository;
import com.ferronica.app.service.dto.HistorialPrecioDTO;
import com.ferronica.app.service.mapper.HistorialPrecioMapper;
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
 * Integration tests for the {@link HistorialPrecioResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HistorialPrecioResourceIT {

    private static final BigDecimal DEFAULT_PRECIO_ANTERIOR = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRECIO_ANTERIOR = new BigDecimal(2);

    private static final BigDecimal DEFAULT_PRECIO_NUEVO = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRECIO_NUEVO = new BigDecimal(2);

    private static final Instant DEFAULT_FECHA = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_MOTIVO = "AAAAAAAAAA";
    private static final String UPDATED_MOTIVO = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/historial-precios";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HistorialPrecioRepository historialPrecioRepository;

    @Autowired
    private HistorialPrecioMapper historialPrecioMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHistorialPrecioMockMvc;

    private HistorialPrecio historialPrecio;

    private HistorialPrecio insertedHistorialPrecio;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HistorialPrecio createEntity() {
        return new HistorialPrecio()
            .precioAnterior(DEFAULT_PRECIO_ANTERIOR)
            .precioNuevo(DEFAULT_PRECIO_NUEVO)
            .fecha(DEFAULT_FECHA)
            .motivo(DEFAULT_MOTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HistorialPrecio createUpdatedEntity() {
        return new HistorialPrecio()
            .precioAnterior(UPDATED_PRECIO_ANTERIOR)
            .precioNuevo(UPDATED_PRECIO_NUEVO)
            .fecha(UPDATED_FECHA)
            .motivo(UPDATED_MOTIVO);
    }

    @BeforeEach
    void initTest() {
        historialPrecio = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedHistorialPrecio != null) {
            historialPrecioRepository.delete(insertedHistorialPrecio);
            insertedHistorialPrecio = null;
        }
    }

    @Test
    @Transactional
    void createHistorialPrecio() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);
        var returnedHistorialPrecioDTO = om.readValue(
            restHistorialPrecioMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(historialPrecioDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HistorialPrecioDTO.class
        );

        // Validate the HistorialPrecio in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHistorialPrecio = historialPrecioMapper.toEntity(returnedHistorialPrecioDTO);
        assertHistorialPrecioUpdatableFieldsEquals(returnedHistorialPrecio, getPersistedHistorialPrecio(returnedHistorialPrecio));

        insertedHistorialPrecio = returnedHistorialPrecio;
    }

    @Test
    @Transactional
    void createHistorialPrecioWithExistingId() throws Exception {
        // Create the HistorialPrecio with an existing ID
        historialPrecio.setId(1L);
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHistorialPrecioMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPrecioAnteriorIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historialPrecio.setPrecioAnterior(null);

        // Create the HistorialPrecio, which fails.
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        restHistorialPrecioMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPrecioNuevoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historialPrecio.setPrecioNuevo(null);

        // Create the HistorialPrecio, which fails.
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        restHistorialPrecioMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFechaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historialPrecio.setFecha(null);

        // Create the HistorialPrecio, which fails.
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        restHistorialPrecioMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHistorialPrecios() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        // Get all the historialPrecioList
        restHistorialPrecioMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(historialPrecio.getId().intValue())))
            .andExpect(jsonPath("$.[*].precioAnterior").value(hasItem(sameNumber(DEFAULT_PRECIO_ANTERIOR))))
            .andExpect(jsonPath("$.[*].precioNuevo").value(hasItem(sameNumber(DEFAULT_PRECIO_NUEVO))))
            .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
            .andExpect(jsonPath("$.[*].motivo").value(hasItem(DEFAULT_MOTIVO)));
    }

    @Test
    @Transactional
    void getHistorialPrecio() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        // Get the historialPrecio
        restHistorialPrecioMockMvc
            .perform(get(ENTITY_API_URL_ID, historialPrecio.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(historialPrecio.getId().intValue()))
            .andExpect(jsonPath("$.precioAnterior").value(sameNumber(DEFAULT_PRECIO_ANTERIOR)))
            .andExpect(jsonPath("$.precioNuevo").value(sameNumber(DEFAULT_PRECIO_NUEVO)))
            .andExpect(jsonPath("$.fecha").value(DEFAULT_FECHA.toString()))
            .andExpect(jsonPath("$.motivo").value(DEFAULT_MOTIVO));
    }

    @Test
    @Transactional
    void getNonExistingHistorialPrecio() throws Exception {
        // Get the historialPrecio
        restHistorialPrecioMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHistorialPrecio() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historialPrecio
        HistorialPrecio updatedHistorialPrecio = historialPrecioRepository.findById(historialPrecio.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHistorialPrecio are not directly saved in db
        em.detach(updatedHistorialPrecio);
        updatedHistorialPrecio
            .precioAnterior(UPDATED_PRECIO_ANTERIOR)
            .precioNuevo(UPDATED_PRECIO_NUEVO)
            .fecha(UPDATED_FECHA)
            .motivo(UPDATED_MOTIVO);
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(updatedHistorialPrecio);

        restHistorialPrecioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, historialPrecioDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isOk());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHistorialPrecioToMatchAllProperties(updatedHistorialPrecio);
    }

    @Test
    @Transactional
    void putNonExistingHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, historialPrecioDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHistorialPrecioWithPatch() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historialPrecio using partial update
        HistorialPrecio partialUpdatedHistorialPrecio = new HistorialPrecio();
        partialUpdatedHistorialPrecio.setId(historialPrecio.getId());

        partialUpdatedHistorialPrecio.precioAnterior(UPDATED_PRECIO_ANTERIOR).precioNuevo(UPDATED_PRECIO_NUEVO).fecha(UPDATED_FECHA);

        restHistorialPrecioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistorialPrecio.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHistorialPrecio))
            )
            .andExpect(status().isOk());

        // Validate the HistorialPrecio in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHistorialPrecioUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHistorialPrecio, historialPrecio),
            getPersistedHistorialPrecio(historialPrecio)
        );
    }

    @Test
    @Transactional
    void fullUpdateHistorialPrecioWithPatch() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historialPrecio using partial update
        HistorialPrecio partialUpdatedHistorialPrecio = new HistorialPrecio();
        partialUpdatedHistorialPrecio.setId(historialPrecio.getId());

        partialUpdatedHistorialPrecio
            .precioAnterior(UPDATED_PRECIO_ANTERIOR)
            .precioNuevo(UPDATED_PRECIO_NUEVO)
            .fecha(UPDATED_FECHA)
            .motivo(UPDATED_MOTIVO);

        restHistorialPrecioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistorialPrecio.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHistorialPrecio))
            )
            .andExpect(status().isOk());

        // Validate the HistorialPrecio in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHistorialPrecioUpdatableFieldsEquals(
            partialUpdatedHistorialPrecio,
            getPersistedHistorialPrecio(partialUpdatedHistorialPrecio)
        );
    }

    @Test
    @Transactional
    void patchNonExistingHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, historialPrecioDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHistorialPrecio() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historialPrecio.setId(longCount.incrementAndGet());

        // Create the HistorialPrecio
        HistorialPrecioDTO historialPrecioDTO = historialPrecioMapper.toDto(historialPrecio);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistorialPrecioMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(historialPrecioDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the HistorialPrecio in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHistorialPrecio() throws Exception {
        // Initialize the database
        insertedHistorialPrecio = historialPrecioRepository.saveAndFlush(historialPrecio);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the historialPrecio
        restHistorialPrecioMockMvc
            .perform(delete(ENTITY_API_URL_ID, historialPrecio.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return historialPrecioRepository.count();
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

    protected HistorialPrecio getPersistedHistorialPrecio(HistorialPrecio historialPrecio) {
        return historialPrecioRepository.findById(historialPrecio.getId()).orElseThrow();
    }

    protected void assertPersistedHistorialPrecioToMatchAllProperties(HistorialPrecio expectedHistorialPrecio) {
        assertHistorialPrecioAllPropertiesEquals(expectedHistorialPrecio, getPersistedHistorialPrecio(expectedHistorialPrecio));
    }

    protected void assertPersistedHistorialPrecioToMatchUpdatableProperties(HistorialPrecio expectedHistorialPrecio) {
        assertHistorialPrecioAllUpdatablePropertiesEquals(expectedHistorialPrecio, getPersistedHistorialPrecio(expectedHistorialPrecio));
    }
}
