package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.CategoriaAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Categoria;
import com.ferronica.app.repository.CategoriaRepository;
import com.ferronica.app.service.dto.CategoriaDTO;
import com.ferronica.app.service.mapper.CategoriaMapper;
import jakarta.persistence.EntityManager;
import java.util.Base64;
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
 * Integration tests for the {@link CategoriaResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CategoriaResourceIT {

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final byte[] DEFAULT_IMAGEN = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_IMAGEN = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_IMAGEN_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_IMAGEN_CONTENT_TYPE = "image/png";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/categorias";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private CategoriaMapper categoriaMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCategoriaMockMvc;

    private Categoria categoria;

    private Categoria insertedCategoria;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Categoria createEntity() {
        return new Categoria()
            .nombre(DEFAULT_NOMBRE)
            .descripcion(DEFAULT_DESCRIPCION)
            .imagen(DEFAULT_IMAGEN)
            .imagenContentType(DEFAULT_IMAGEN_CONTENT_TYPE)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Categoria createUpdatedEntity() {
        return new Categoria()
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        categoria = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCategoria != null) {
            categoriaRepository.delete(insertedCategoria);
            insertedCategoria = null;
        }
    }

    @Test
    @Transactional
    void createCategoria() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);
        var returnedCategoriaDTO = om.readValue(
            restCategoriaMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CategoriaDTO.class
        );

        // Validate the Categoria in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCategoria = categoriaMapper.toEntity(returnedCategoriaDTO);
        assertCategoriaUpdatableFieldsEquals(returnedCategoria, getPersistedCategoria(returnedCategoria));

        insertedCategoria = returnedCategoria;
    }

    @Test
    @Transactional
    void createCategoriaWithExistingId() throws Exception {
        // Create the Categoria with an existing ID
        categoria.setId(1L);
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCategoriaMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        categoria.setNombre(null);

        // Create the Categoria, which fails.
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        restCategoriaMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCategorias() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        // Get all the categoriaList
        restCategoriaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(categoria.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].imagenContentType").value(hasItem(DEFAULT_IMAGEN_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].imagen").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_IMAGEN))))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getCategoria() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        // Get the categoria
        restCategoriaMockMvc
            .perform(get(ENTITY_API_URL_ID, categoria.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(categoria.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.imagenContentType").value(DEFAULT_IMAGEN_CONTENT_TYPE))
            .andExpect(jsonPath("$.imagen").value(Base64.getEncoder().encodeToString(DEFAULT_IMAGEN)))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingCategoria() throws Exception {
        // Get the categoria
        restCategoriaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCategoria() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoria
        Categoria updatedCategoria = categoriaRepository.findById(categoria.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCategoria are not directly saved in db
        em.detach(updatedCategoria);
        updatedCategoria
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(updatedCategoria);

        restCategoriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, categoriaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isOk());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCategoriaToMatchAllProperties(updatedCategoria);
    }

    @Test
    @Transactional
    void putNonExistingCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, categoriaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCategoriaWithPatch() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoria using partial update
        Categoria partialUpdatedCategoria = new Categoria();
        partialUpdatedCategoria.setId(categoria.getId());

        restCategoriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoria.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCategoria))
            )
            .andExpect(status().isOk());

        // Validate the Categoria in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCategoriaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCategoria, categoria),
            getPersistedCategoria(categoria)
        );
    }

    @Test
    @Transactional
    void fullUpdateCategoriaWithPatch() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoria using partial update
        Categoria partialUpdatedCategoria = new Categoria();
        partialUpdatedCategoria.setId(categoria.getId());

        partialUpdatedCategoria
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);

        restCategoriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoria.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCategoria))
            )
            .andExpect(status().isOk());

        // Validate the Categoria in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCategoriaUpdatableFieldsEquals(partialUpdatedCategoria, getPersistedCategoria(partialUpdatedCategoria));
    }

    @Test
    @Transactional
    void patchNonExistingCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, categoriaDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCategoria() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoria.setId(longCount.incrementAndGet());

        // Create the Categoria
        CategoriaDTO categoriaDTO = categoriaMapper.toDto(categoria);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(categoriaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Categoria in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCategoria() throws Exception {
        // Initialize the database
        insertedCategoria = categoriaRepository.saveAndFlush(categoria);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the categoria
        restCategoriaMockMvc
            .perform(delete(ENTITY_API_URL_ID, categoria.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return categoriaRepository.count();
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

    protected Categoria getPersistedCategoria(Categoria categoria) {
        return categoriaRepository.findById(categoria.getId()).orElseThrow();
    }

    protected void assertPersistedCategoriaToMatchAllProperties(Categoria expectedCategoria) {
        assertCategoriaAllPropertiesEquals(expectedCategoria, getPersistedCategoria(expectedCategoria));
    }

    protected void assertPersistedCategoriaToMatchUpdatableProperties(Categoria expectedCategoria) {
        assertCategoriaAllUpdatablePropertiesEquals(expectedCategoria, getPersistedCategoria(expectedCategoria));
    }
}
