package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.UnidadMedidaAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.UnidadMedida;
import com.ferronica.app.repository.UnidadMedidaRepository;
import com.ferronica.app.service.dto.UnidadMedidaDTO;
import com.ferronica.app.service.mapper.UnidadMedidaMapper;
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
 * Integration tests for the {@link UnidadMedidaResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class UnidadMedidaResourceIT {

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_SIMBOLO = "AAAAAAAAAA";
    private static final String UPDATED_SIMBOLO = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/unidad-medidas";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UnidadMedidaRepository unidadMedidaRepository;

    @Autowired
    private UnidadMedidaMapper unidadMedidaMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUnidadMedidaMockMvc;

    private UnidadMedida unidadMedida;

    private UnidadMedida insertedUnidadMedida;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnidadMedida createEntity() {
        return new UnidadMedida().nombre(DEFAULT_NOMBRE).simbolo(DEFAULT_SIMBOLO).activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnidadMedida createUpdatedEntity() {
        return new UnidadMedida().nombre(UPDATED_NOMBRE).simbolo(UPDATED_SIMBOLO).activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        unidadMedida = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUnidadMedida != null) {
            unidadMedidaRepository.delete(insertedUnidadMedida);
            insertedUnidadMedida = null;
        }
    }

    @Test
    @Transactional
    void createUnidadMedida() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);
        var returnedUnidadMedidaDTO = om.readValue(
            restUnidadMedidaMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unidadMedidaDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UnidadMedidaDTO.class
        );

        // Validate the UnidadMedida in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedUnidadMedida = unidadMedidaMapper.toEntity(returnedUnidadMedidaDTO);
        assertUnidadMedidaUpdatableFieldsEquals(returnedUnidadMedida, getPersistedUnidadMedida(returnedUnidadMedida));

        insertedUnidadMedida = returnedUnidadMedida;
    }

    @Test
    @Transactional
    void createUnidadMedidaWithExistingId() throws Exception {
        // Create the UnidadMedida with an existing ID
        unidadMedida.setId(1L);
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUnidadMedidaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        unidadMedida.setNombre(null);

        // Create the UnidadMedida, which fails.
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        restUnidadMedidaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUnidadMedidas() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        // Get all the unidadMedidaList
        restUnidadMedidaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(unidadMedida.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].simbolo").value(hasItem(DEFAULT_SIMBOLO)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getUnidadMedida() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        // Get the unidadMedida
        restUnidadMedidaMockMvc
            .perform(get(ENTITY_API_URL_ID, unidadMedida.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(unidadMedida.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.simbolo").value(DEFAULT_SIMBOLO))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingUnidadMedida() throws Exception {
        // Get the unidadMedida
        restUnidadMedidaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUnidadMedida() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unidadMedida
        UnidadMedida updatedUnidadMedida = unidadMedidaRepository.findById(unidadMedida.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUnidadMedida are not directly saved in db
        em.detach(updatedUnidadMedida);
        updatedUnidadMedida.nombre(UPDATED_NOMBRE).simbolo(UPDATED_SIMBOLO).activo(UPDATED_ACTIVO);
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(updatedUnidadMedida);

        restUnidadMedidaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, unidadMedidaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isOk());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUnidadMedidaToMatchAllProperties(updatedUnidadMedida);
    }

    @Test
    @Transactional
    void putNonExistingUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, unidadMedidaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUnidadMedidaWithPatch() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unidadMedida using partial update
        UnidadMedida partialUpdatedUnidadMedida = new UnidadMedida();
        partialUpdatedUnidadMedida.setId(unidadMedida.getId());

        partialUpdatedUnidadMedida.simbolo(UPDATED_SIMBOLO).activo(UPDATED_ACTIVO);

        restUnidadMedidaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnidadMedida.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnidadMedida))
            )
            .andExpect(status().isOk());

        // Validate the UnidadMedida in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnidadMedidaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUnidadMedida, unidadMedida),
            getPersistedUnidadMedida(unidadMedida)
        );
    }

    @Test
    @Transactional
    void fullUpdateUnidadMedidaWithPatch() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unidadMedida using partial update
        UnidadMedida partialUpdatedUnidadMedida = new UnidadMedida();
        partialUpdatedUnidadMedida.setId(unidadMedida.getId());

        partialUpdatedUnidadMedida.nombre(UPDATED_NOMBRE).simbolo(UPDATED_SIMBOLO).activo(UPDATED_ACTIVO);

        restUnidadMedidaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnidadMedida.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnidadMedida))
            )
            .andExpect(status().isOk());

        // Validate the UnidadMedida in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnidadMedidaUpdatableFieldsEquals(partialUpdatedUnidadMedida, getPersistedUnidadMedida(partialUpdatedUnidadMedida));
    }

    @Test
    @Transactional
    void patchNonExistingUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, unidadMedidaDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUnidadMedida() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unidadMedida.setId(longCount.incrementAndGet());

        // Create the UnidadMedida
        UnidadMedidaDTO unidadMedidaDTO = unidadMedidaMapper.toDto(unidadMedida);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnidadMedidaMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unidadMedidaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnidadMedida in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUnidadMedida() throws Exception {
        // Initialize the database
        insertedUnidadMedida = unidadMedidaRepository.saveAndFlush(unidadMedida);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the unidadMedida
        restUnidadMedidaMockMvc
            .perform(delete(ENTITY_API_URL_ID, unidadMedida.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return unidadMedidaRepository.count();
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

    protected UnidadMedida getPersistedUnidadMedida(UnidadMedida unidadMedida) {
        return unidadMedidaRepository.findById(unidadMedida.getId()).orElseThrow();
    }

    protected void assertPersistedUnidadMedidaToMatchAllProperties(UnidadMedida expectedUnidadMedida) {
        assertUnidadMedidaAllPropertiesEquals(expectedUnidadMedida, getPersistedUnidadMedida(expectedUnidadMedida));
    }

    protected void assertPersistedUnidadMedidaToMatchUpdatableProperties(UnidadMedida expectedUnidadMedida) {
        assertUnidadMedidaAllUpdatablePropertiesEquals(expectedUnidadMedida, getPersistedUnidadMedida(expectedUnidadMedida));
    }
}
