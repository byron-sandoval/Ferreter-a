package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.VendedorAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.repository.VendedorRepository;
import com.ferronica.app.service.dto.VendedorDTO;
import com.ferronica.app.service.mapper.VendedorMapper;
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
 * Integration tests for the {@link VendedorResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class VendedorResourceIT {

    private static final String DEFAULT_ID_KEYCLOAK = "AAAAAAAAAA";
    private static final String UPDATED_ID_KEYCLOAK = "BBBBBBBBBB";

    private static final String DEFAULT_CEDULA = "AAAAAAAAAA";
    private static final String UPDATED_CEDULA = "BBBBBBBBBB";

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_APELLIDO = "AAAAAAAAAA";
    private static final String UPDATED_APELLIDO = "BBBBBBBBBB";

    private static final String DEFAULT_TELEFONO = "AAAAAAAAAA";
    private static final String UPDATED_TELEFONO = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/vendedors";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private VendedorMapper vendedorMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restVendedorMockMvc;

    private Vendedor vendedor;

    private Vendedor insertedVendedor;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Vendedor createEntity() {
        return new Vendedor()
            .idKeycloak(DEFAULT_ID_KEYCLOAK)
            .cedula(DEFAULT_CEDULA)
            .nombre(DEFAULT_NOMBRE)
            .apellido(DEFAULT_APELLIDO)
            .telefono(DEFAULT_TELEFONO)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Vendedor createUpdatedEntity() {
        return new Vendedor()
            .idKeycloak(UPDATED_ID_KEYCLOAK)
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .apellido(UPDATED_APELLIDO)
            .telefono(UPDATED_TELEFONO)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        vendedor = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedVendedor != null) {
            vendedorRepository.delete(insertedVendedor);
            insertedVendedor = null;
        }
    }

    @Test
    @Transactional
    void createVendedor() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);
        var returnedVendedorDTO = om.readValue(
            restVendedorMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            VendedorDTO.class
        );

        // Validate the Vendedor in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedVendedor = vendedorMapper.toEntity(returnedVendedorDTO);
        assertVendedorUpdatableFieldsEquals(returnedVendedor, getPersistedVendedor(returnedVendedor));

        insertedVendedor = returnedVendedor;
    }

    @Test
    @Transactional
    void createVendedorWithExistingId() throws Exception {
        // Create the Vendedor with an existing ID
        vendedor.setId(1L);
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restVendedorMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkIdKeycloakIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        vendedor.setIdKeycloak(null);

        // Create the Vendedor, which fails.
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        restVendedorMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCedulaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        vendedor.setCedula(null);

        // Create the Vendedor, which fails.
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        restVendedorMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        vendedor.setNombre(null);

        // Create the Vendedor, which fails.
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        restVendedorMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllVendedors() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        // Get all the vendedorList
        restVendedorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(vendedor.getId().intValue())))
            .andExpect(jsonPath("$.[*].idKeycloak").value(hasItem(DEFAULT_ID_KEYCLOAK)))
            .andExpect(jsonPath("$.[*].cedula").value(hasItem(DEFAULT_CEDULA)))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].apellido").value(hasItem(DEFAULT_APELLIDO)))
            .andExpect(jsonPath("$.[*].telefono").value(hasItem(DEFAULT_TELEFONO)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getVendedor() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        // Get the vendedor
        restVendedorMockMvc
            .perform(get(ENTITY_API_URL_ID, vendedor.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(vendedor.getId().intValue()))
            .andExpect(jsonPath("$.idKeycloak").value(DEFAULT_ID_KEYCLOAK))
            .andExpect(jsonPath("$.cedula").value(DEFAULT_CEDULA))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.apellido").value(DEFAULT_APELLIDO))
            .andExpect(jsonPath("$.telefono").value(DEFAULT_TELEFONO))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingVendedor() throws Exception {
        // Get the vendedor
        restVendedorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingVendedor() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the vendedor
        Vendedor updatedVendedor = vendedorRepository.findById(vendedor.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedVendedor are not directly saved in db
        em.detach(updatedVendedor);
        updatedVendedor
            .idKeycloak(UPDATED_ID_KEYCLOAK)
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .apellido(UPDATED_APELLIDO)
            .telefono(UPDATED_TELEFONO)
            .activo(UPDATED_ACTIVO);
        VendedorDTO vendedorDTO = vendedorMapper.toDto(updatedVendedor);

        restVendedorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, vendedorDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isOk());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedVendedorToMatchAllProperties(updatedVendedor);
    }

    @Test
    @Transactional
    void putNonExistingVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, vendedorDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(vendedorDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateVendedorWithPatch() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the vendedor using partial update
        Vendedor partialUpdatedVendedor = new Vendedor();
        partialUpdatedVendedor.setId(vendedor.getId());

        partialUpdatedVendedor.apellido(UPDATED_APELLIDO);

        restVendedorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVendedor.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedVendedor))
            )
            .andExpect(status().isOk());

        // Validate the Vendedor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVendedorUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedVendedor, vendedor), getPersistedVendedor(vendedor));
    }

    @Test
    @Transactional
    void fullUpdateVendedorWithPatch() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the vendedor using partial update
        Vendedor partialUpdatedVendedor = new Vendedor();
        partialUpdatedVendedor.setId(vendedor.getId());

        partialUpdatedVendedor
            .idKeycloak(UPDATED_ID_KEYCLOAK)
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .apellido(UPDATED_APELLIDO)
            .telefono(UPDATED_TELEFONO)
            .activo(UPDATED_ACTIVO);

        restVendedorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVendedor.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedVendedor))
            )
            .andExpect(status().isOk());

        // Validate the Vendedor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVendedorUpdatableFieldsEquals(partialUpdatedVendedor, getPersistedVendedor(partialUpdatedVendedor));
    }

    @Test
    @Transactional
    void patchNonExistingVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, vendedorDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamVendedor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        vendedor.setId(longCount.incrementAndGet());

        // Create the Vendedor
        VendedorDTO vendedorDTO = vendedorMapper.toDto(vendedor);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVendedorMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(vendedorDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Vendedor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteVendedor() throws Exception {
        // Initialize the database
        insertedVendedor = vendedorRepository.saveAndFlush(vendedor);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the vendedor
        restVendedorMockMvc
            .perform(delete(ENTITY_API_URL_ID, vendedor.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return vendedorRepository.count();
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

    protected Vendedor getPersistedVendedor(Vendedor vendedor) {
        return vendedorRepository.findById(vendedor.getId()).orElseThrow();
    }

    protected void assertPersistedVendedorToMatchAllProperties(Vendedor expectedVendedor) {
        assertVendedorAllPropertiesEquals(expectedVendedor, getPersistedVendedor(expectedVendedor));
    }

    protected void assertPersistedVendedorToMatchUpdatableProperties(Vendedor expectedVendedor) {
        assertVendedorAllUpdatablePropertiesEquals(expectedVendedor, getPersistedVendedor(expectedVendedor));
    }
}
