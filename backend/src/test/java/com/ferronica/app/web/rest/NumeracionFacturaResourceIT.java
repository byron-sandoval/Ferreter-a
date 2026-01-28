package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.NumeracionFacturaAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.NumeracionFactura;
import com.ferronica.app.repository.NumeracionFacturaRepository;
import com.ferronica.app.service.dto.NumeracionFacturaDTO;
import com.ferronica.app.service.mapper.NumeracionFacturaMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link NumeracionFacturaResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class NumeracionFacturaResourceIT {

    private static final String DEFAULT_SERIE = "AAAAAAAAAA";
    private static final String UPDATED_SERIE = "BBBBBBBBBB";

    private static final Long DEFAULT_CORRELATIVO_ACTUAL = 1L;
    private static final Long UPDATED_CORRELATIVO_ACTUAL = 2L;

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/numeracion-facturas";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private NumeracionFacturaRepository numeracionFacturaRepository;

    @Autowired
    private NumeracionFacturaMapper numeracionFacturaMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNumeracionFacturaMockMvc;

    private NumeracionFactura numeracionFactura;

    private NumeracionFactura insertedNumeracionFactura;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NumeracionFactura createEntity() {
        return new NumeracionFactura().serie(DEFAULT_SERIE).correlativoActual(DEFAULT_CORRELATIVO_ACTUAL).activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NumeracionFactura createUpdatedEntity() {
        return new NumeracionFactura().serie(UPDATED_SERIE).correlativoActual(UPDATED_CORRELATIVO_ACTUAL).activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        numeracionFactura = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedNumeracionFactura != null) {
            numeracionFacturaRepository.delete(insertedNumeracionFactura);
            insertedNumeracionFactura = null;
        }
    }

    @Test
    @Transactional
    void createNumeracionFactura() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);
        var returnedNumeracionFacturaDTO = om.readValue(
            restNumeracionFacturaMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(numeracionFacturaDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            NumeracionFacturaDTO.class
        );

        // Validate the NumeracionFactura in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedNumeracionFactura = numeracionFacturaMapper.toEntity(returnedNumeracionFacturaDTO);
        assertNumeracionFacturaUpdatableFieldsEquals(returnedNumeracionFactura, getPersistedNumeracionFactura(returnedNumeracionFactura));

        insertedNumeracionFactura = returnedNumeracionFactura;
    }

    @Test
    @Transactional
    void createNumeracionFacturaWithExistingId() throws Exception {
        // Create the NumeracionFactura with an existing ID
        numeracionFactura.setId(1L);
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNumeracionFacturaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSerieIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        numeracionFactura.setSerie(null);

        // Create the NumeracionFactura, which fails.
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        restNumeracionFacturaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCorrelativoActualIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        numeracionFactura.setCorrelativoActual(null);

        // Create the NumeracionFactura, which fails.
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        restNumeracionFacturaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNumeracionFacturas() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        // Get all the numeracionFacturaList
        restNumeracionFacturaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(numeracionFactura.getId().intValue())))
            .andExpect(jsonPath("$.[*].serie").value(hasItem(DEFAULT_SERIE)))
            .andExpect(jsonPath("$.[*].correlativoActual").value(hasItem(DEFAULT_CORRELATIVO_ACTUAL.intValue())))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getNumeracionFactura() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        // Get the numeracionFactura
        restNumeracionFacturaMockMvc
            .perform(get(ENTITY_API_URL_ID, numeracionFactura.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(numeracionFactura.getId().intValue()))
            .andExpect(jsonPath("$.serie").value(DEFAULT_SERIE))
            .andExpect(jsonPath("$.correlativoActual").value(DEFAULT_CORRELATIVO_ACTUAL.intValue()))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingNumeracionFactura() throws Exception {
        // Get the numeracionFactura
        restNumeracionFacturaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNumeracionFactura() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the numeracionFactura
        NumeracionFactura updatedNumeracionFactura = numeracionFacturaRepository.findById(numeracionFactura.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedNumeracionFactura are not directly saved in db
        em.detach(updatedNumeracionFactura);
        updatedNumeracionFactura.serie(UPDATED_SERIE).correlativoActual(UPDATED_CORRELATIVO_ACTUAL).activo(UPDATED_ACTIVO);
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(updatedNumeracionFactura);

        restNumeracionFacturaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, numeracionFacturaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isOk());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedNumeracionFacturaToMatchAllProperties(updatedNumeracionFactura);
    }

    @Test
    @Transactional
    void putNonExistingNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, numeracionFacturaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNumeracionFacturaWithPatch() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the numeracionFactura using partial update
        NumeracionFactura partialUpdatedNumeracionFactura = new NumeracionFactura();
        partialUpdatedNumeracionFactura.setId(numeracionFactura.getId());

        partialUpdatedNumeracionFactura.correlativoActual(UPDATED_CORRELATIVO_ACTUAL);

        restNumeracionFacturaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNumeracionFactura.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNumeracionFactura))
            )
            .andExpect(status().isOk());

        // Validate the NumeracionFactura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNumeracionFacturaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedNumeracionFactura, numeracionFactura),
            getPersistedNumeracionFactura(numeracionFactura)
        );
    }

    @Test
    @Transactional
    void fullUpdateNumeracionFacturaWithPatch() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the numeracionFactura using partial update
        NumeracionFactura partialUpdatedNumeracionFactura = new NumeracionFactura();
        partialUpdatedNumeracionFactura.setId(numeracionFactura.getId());

        partialUpdatedNumeracionFactura.serie(UPDATED_SERIE).correlativoActual(UPDATED_CORRELATIVO_ACTUAL).activo(UPDATED_ACTIVO);

        restNumeracionFacturaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNumeracionFactura.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNumeracionFactura))
            )
            .andExpect(status().isOk());

        // Validate the NumeracionFactura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNumeracionFacturaUpdatableFieldsEquals(
            partialUpdatedNumeracionFactura,
            getPersistedNumeracionFactura(partialUpdatedNumeracionFactura)
        );
    }

    @Test
    @Transactional
    void patchNonExistingNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, numeracionFacturaDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNumeracionFactura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        numeracionFactura.setId(longCount.incrementAndGet());

        // Create the NumeracionFactura
        NumeracionFacturaDTO numeracionFacturaDTO = numeracionFacturaMapper.toDto(numeracionFactura);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNumeracionFacturaMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(numeracionFacturaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NumeracionFactura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNumeracionFactura() throws Exception {
        // Initialize the database
        insertedNumeracionFactura = numeracionFacturaRepository.saveAndFlush(numeracionFactura);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the numeracionFactura
        restNumeracionFacturaMockMvc
            .perform(delete(ENTITY_API_URL_ID, numeracionFactura.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return numeracionFacturaRepository.count();
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

    protected NumeracionFactura getPersistedNumeracionFactura(NumeracionFactura numeracionFactura) {
        return numeracionFacturaRepository.findById(numeracionFactura.getId()).orElseThrow();
    }

    protected void assertPersistedNumeracionFacturaToMatchAllProperties(NumeracionFactura expectedNumeracionFactura) {
        assertNumeracionFacturaAllPropertiesEquals(expectedNumeracionFactura, getPersistedNumeracionFactura(expectedNumeracionFactura));
    }

    protected void assertPersistedNumeracionFacturaToMatchUpdatableProperties(NumeracionFactura expectedNumeracionFactura) {
        assertNumeracionFacturaAllUpdatablePropertiesEquals(
            expectedNumeracionFactura,
            getPersistedNumeracionFactura(expectedNumeracionFactura)
        );
    }
}
