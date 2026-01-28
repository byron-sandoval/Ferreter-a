package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.ArticuloAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Articulo;
import com.ferronica.app.domain.Categoria;
import com.ferronica.app.domain.UnidadMedida;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.mapper.ArticuloMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link ArticuloResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ArticuloResourceIT {

    private static final String DEFAULT_CODIGO = "AAAAAAAAAA";
    private static final String UPDATED_CODIGO = "BBBBBBBBBB";

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_EXISTENCIA = new BigDecimal(0);
    private static final BigDecimal UPDATED_EXISTENCIA = new BigDecimal(1);
    private static final BigDecimal SMALLER_EXISTENCIA = new BigDecimal(0 - 1);

    private static final BigDecimal DEFAULT_EXISTENCIA_MINIMA = new BigDecimal(0);
    private static final BigDecimal UPDATED_EXISTENCIA_MINIMA = new BigDecimal(1);
    private static final BigDecimal SMALLER_EXISTENCIA_MINIMA = new BigDecimal(0 - 1);

    private static final BigDecimal DEFAULT_PRECIO = new BigDecimal(0);
    private static final BigDecimal UPDATED_PRECIO = new BigDecimal(1);
    private static final BigDecimal SMALLER_PRECIO = new BigDecimal(0 - 1);

    private static final BigDecimal DEFAULT_COSTO = new BigDecimal(0);
    private static final BigDecimal UPDATED_COSTO = new BigDecimal(1);
    private static final BigDecimal SMALLER_COSTO = new BigDecimal(0 - 1);

    private static final byte[] DEFAULT_IMAGEN = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_IMAGEN = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_IMAGEN_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_IMAGEN_CONTENT_TYPE = "image/png";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/articulos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private ArticuloMapper articuloMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restArticuloMockMvc;

    private Articulo articulo;

    private Articulo insertedArticulo;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Articulo createEntity() {
        return new Articulo()
            .codigo(DEFAULT_CODIGO)
            .nombre(DEFAULT_NOMBRE)
            .descripcion(DEFAULT_DESCRIPCION)
            .existencia(DEFAULT_EXISTENCIA)
            .existenciaMinima(DEFAULT_EXISTENCIA_MINIMA)
            .precio(DEFAULT_PRECIO)
            .costo(DEFAULT_COSTO)
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
    public static Articulo createUpdatedEntity() {
        return new Articulo()
            .codigo(UPDATED_CODIGO)
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .existencia(UPDATED_EXISTENCIA)
            .existenciaMinima(UPDATED_EXISTENCIA_MINIMA)
            .precio(UPDATED_PRECIO)
            .costo(UPDATED_COSTO)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        articulo = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedArticulo != null) {
            articuloRepository.delete(insertedArticulo);
            insertedArticulo = null;
        }
    }

    @Test
    @Transactional
    void createArticulo() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);
        var returnedArticuloDTO = om.readValue(
            restArticuloMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ArticuloDTO.class
        );

        // Validate the Articulo in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedArticulo = articuloMapper.toEntity(returnedArticuloDTO);
        assertArticuloUpdatableFieldsEquals(returnedArticulo, getPersistedArticulo(returnedArticulo));

        insertedArticulo = returnedArticulo;
    }

    @Test
    @Transactional
    void createArticuloWithExistingId() throws Exception {
        // Create the Articulo with an existing ID
        articulo.setId(1L);
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodigoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setCodigo(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setNombre(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkExistenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setExistencia(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkExistenciaMinimaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setExistenciaMinima(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPrecioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setPrecio(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCostoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        articulo.setCosto(null);

        // Create the Articulo, which fails.
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        restArticuloMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllArticulos() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(articulo.getId().intValue())))
            .andExpect(jsonPath("$.[*].codigo").value(hasItem(DEFAULT_CODIGO)))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].existencia").value(hasItem(sameNumber(DEFAULT_EXISTENCIA))))
            .andExpect(jsonPath("$.[*].existenciaMinima").value(hasItem(sameNumber(DEFAULT_EXISTENCIA_MINIMA))))
            .andExpect(jsonPath("$.[*].precio").value(hasItem(sameNumber(DEFAULT_PRECIO))))
            .andExpect(jsonPath("$.[*].costo").value(hasItem(sameNumber(DEFAULT_COSTO))))
            .andExpect(jsonPath("$.[*].imagenContentType").value(hasItem(DEFAULT_IMAGEN_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].imagen").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_IMAGEN))))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getArticulo() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get the articulo
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL_ID, articulo.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(articulo.getId().intValue()))
            .andExpect(jsonPath("$.codigo").value(DEFAULT_CODIGO))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.existencia").value(sameNumber(DEFAULT_EXISTENCIA)))
            .andExpect(jsonPath("$.existenciaMinima").value(sameNumber(DEFAULT_EXISTENCIA_MINIMA)))
            .andExpect(jsonPath("$.precio").value(sameNumber(DEFAULT_PRECIO)))
            .andExpect(jsonPath("$.costo").value(sameNumber(DEFAULT_COSTO)))
            .andExpect(jsonPath("$.imagenContentType").value(DEFAULT_IMAGEN_CONTENT_TYPE))
            .andExpect(jsonPath("$.imagen").value(Base64.getEncoder().encodeToString(DEFAULT_IMAGEN)))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getArticulosByIdFiltering() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        Long id = articulo.getId();

        defaultArticuloFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultArticuloFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultArticuloFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllArticulosByCodigoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where codigo equals to
        defaultArticuloFiltering("codigo.equals=" + DEFAULT_CODIGO, "codigo.equals=" + UPDATED_CODIGO);
    }

    @Test
    @Transactional
    void getAllArticulosByCodigoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where codigo in
        defaultArticuloFiltering("codigo.in=" + DEFAULT_CODIGO + "," + UPDATED_CODIGO, "codigo.in=" + UPDATED_CODIGO);
    }

    @Test
    @Transactional
    void getAllArticulosByCodigoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where codigo is not null
        defaultArticuloFiltering("codigo.specified=true", "codigo.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByCodigoContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where codigo contains
        defaultArticuloFiltering("codigo.contains=" + DEFAULT_CODIGO, "codigo.contains=" + UPDATED_CODIGO);
    }

    @Test
    @Transactional
    void getAllArticulosByCodigoNotContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where codigo does not contain
        defaultArticuloFiltering("codigo.doesNotContain=" + UPDATED_CODIGO, "codigo.doesNotContain=" + DEFAULT_CODIGO);
    }

    @Test
    @Transactional
    void getAllArticulosByNombreIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where nombre equals to
        defaultArticuloFiltering("nombre.equals=" + DEFAULT_NOMBRE, "nombre.equals=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllArticulosByNombreIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where nombre in
        defaultArticuloFiltering("nombre.in=" + DEFAULT_NOMBRE + "," + UPDATED_NOMBRE, "nombre.in=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllArticulosByNombreIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where nombre is not null
        defaultArticuloFiltering("nombre.specified=true", "nombre.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByNombreContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where nombre contains
        defaultArticuloFiltering("nombre.contains=" + DEFAULT_NOMBRE, "nombre.contains=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllArticulosByNombreNotContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where nombre does not contain
        defaultArticuloFiltering("nombre.doesNotContain=" + UPDATED_NOMBRE, "nombre.doesNotContain=" + DEFAULT_NOMBRE);
    }

    @Test
    @Transactional
    void getAllArticulosByDescripcionIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where descripcion equals to
        defaultArticuloFiltering("descripcion.equals=" + DEFAULT_DESCRIPCION, "descripcion.equals=" + UPDATED_DESCRIPCION);
    }

    @Test
    @Transactional
    void getAllArticulosByDescripcionIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where descripcion in
        defaultArticuloFiltering(
            "descripcion.in=" + DEFAULT_DESCRIPCION + "," + UPDATED_DESCRIPCION,
            "descripcion.in=" + UPDATED_DESCRIPCION
        );
    }

    @Test
    @Transactional
    void getAllArticulosByDescripcionIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where descripcion is not null
        defaultArticuloFiltering("descripcion.specified=true", "descripcion.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByDescripcionContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where descripcion contains
        defaultArticuloFiltering("descripcion.contains=" + DEFAULT_DESCRIPCION, "descripcion.contains=" + UPDATED_DESCRIPCION);
    }

    @Test
    @Transactional
    void getAllArticulosByDescripcionNotContainsSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where descripcion does not contain
        defaultArticuloFiltering("descripcion.doesNotContain=" + UPDATED_DESCRIPCION, "descripcion.doesNotContain=" + DEFAULT_DESCRIPCION);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia equals to
        defaultArticuloFiltering("existencia.equals=" + DEFAULT_EXISTENCIA, "existencia.equals=" + UPDATED_EXISTENCIA);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia in
        defaultArticuloFiltering("existencia.in=" + DEFAULT_EXISTENCIA + "," + UPDATED_EXISTENCIA, "existencia.in=" + UPDATED_EXISTENCIA);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia is not null
        defaultArticuloFiltering("existencia.specified=true", "existencia.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia is greater than or equal to
        defaultArticuloFiltering(
            "existencia.greaterThanOrEqual=" + DEFAULT_EXISTENCIA,
            "existencia.greaterThanOrEqual=" + UPDATED_EXISTENCIA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia is less than or equal to
        defaultArticuloFiltering("existencia.lessThanOrEqual=" + DEFAULT_EXISTENCIA, "existencia.lessThanOrEqual=" + SMALLER_EXISTENCIA);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia is less than
        defaultArticuloFiltering("existencia.lessThan=" + UPDATED_EXISTENCIA, "existencia.lessThan=" + DEFAULT_EXISTENCIA);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existencia is greater than
        defaultArticuloFiltering("existencia.greaterThan=" + SMALLER_EXISTENCIA, "existencia.greaterThan=" + DEFAULT_EXISTENCIA);
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima equals to
        defaultArticuloFiltering(
            "existenciaMinima.equals=" + DEFAULT_EXISTENCIA_MINIMA,
            "existenciaMinima.equals=" + UPDATED_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima in
        defaultArticuloFiltering(
            "existenciaMinima.in=" + DEFAULT_EXISTENCIA_MINIMA + "," + UPDATED_EXISTENCIA_MINIMA,
            "existenciaMinima.in=" + UPDATED_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima is not null
        defaultArticuloFiltering("existenciaMinima.specified=true", "existenciaMinima.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima is greater than or equal to
        defaultArticuloFiltering(
            "existenciaMinima.greaterThanOrEqual=" + DEFAULT_EXISTENCIA_MINIMA,
            "existenciaMinima.greaterThanOrEqual=" + UPDATED_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima is less than or equal to
        defaultArticuloFiltering(
            "existenciaMinima.lessThanOrEqual=" + DEFAULT_EXISTENCIA_MINIMA,
            "existenciaMinima.lessThanOrEqual=" + SMALLER_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima is less than
        defaultArticuloFiltering(
            "existenciaMinima.lessThan=" + UPDATED_EXISTENCIA_MINIMA,
            "existenciaMinima.lessThan=" + DEFAULT_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByExistenciaMinimaIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where existenciaMinima is greater than
        defaultArticuloFiltering(
            "existenciaMinima.greaterThan=" + SMALLER_EXISTENCIA_MINIMA,
            "existenciaMinima.greaterThan=" + DEFAULT_EXISTENCIA_MINIMA
        );
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio equals to
        defaultArticuloFiltering("precio.equals=" + DEFAULT_PRECIO, "precio.equals=" + UPDATED_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio in
        defaultArticuloFiltering("precio.in=" + DEFAULT_PRECIO + "," + UPDATED_PRECIO, "precio.in=" + UPDATED_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio is not null
        defaultArticuloFiltering("precio.specified=true", "precio.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio is greater than or equal to
        defaultArticuloFiltering("precio.greaterThanOrEqual=" + DEFAULT_PRECIO, "precio.greaterThanOrEqual=" + UPDATED_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio is less than or equal to
        defaultArticuloFiltering("precio.lessThanOrEqual=" + DEFAULT_PRECIO, "precio.lessThanOrEqual=" + SMALLER_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio is less than
        defaultArticuloFiltering("precio.lessThan=" + UPDATED_PRECIO, "precio.lessThan=" + DEFAULT_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByPrecioIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where precio is greater than
        defaultArticuloFiltering("precio.greaterThan=" + SMALLER_PRECIO, "precio.greaterThan=" + DEFAULT_PRECIO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo equals to
        defaultArticuloFiltering("costo.equals=" + DEFAULT_COSTO, "costo.equals=" + UPDATED_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo in
        defaultArticuloFiltering("costo.in=" + DEFAULT_COSTO + "," + UPDATED_COSTO, "costo.in=" + UPDATED_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo is not null
        defaultArticuloFiltering("costo.specified=true", "costo.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo is greater than or equal to
        defaultArticuloFiltering("costo.greaterThanOrEqual=" + DEFAULT_COSTO, "costo.greaterThanOrEqual=" + UPDATED_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo is less than or equal to
        defaultArticuloFiltering("costo.lessThanOrEqual=" + DEFAULT_COSTO, "costo.lessThanOrEqual=" + SMALLER_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo is less than
        defaultArticuloFiltering("costo.lessThan=" + UPDATED_COSTO, "costo.lessThan=" + DEFAULT_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByCostoIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where costo is greater than
        defaultArticuloFiltering("costo.greaterThan=" + SMALLER_COSTO, "costo.greaterThan=" + DEFAULT_COSTO);
    }

    @Test
    @Transactional
    void getAllArticulosByActivoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where activo equals to
        defaultArticuloFiltering("activo.equals=" + DEFAULT_ACTIVO, "activo.equals=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllArticulosByActivoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where activo in
        defaultArticuloFiltering("activo.in=" + DEFAULT_ACTIVO + "," + UPDATED_ACTIVO, "activo.in=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllArticulosByActivoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        // Get all the articuloList where activo is not null
        defaultArticuloFiltering("activo.specified=true", "activo.specified=false");
    }

    @Test
    @Transactional
    void getAllArticulosByCategoriaIsEqualToSomething() throws Exception {
        Categoria categoria;
        if (TestUtil.findAll(em, Categoria.class).isEmpty()) {
            articuloRepository.saveAndFlush(articulo);
            categoria = CategoriaResourceIT.createEntity();
        } else {
            categoria = TestUtil.findAll(em, Categoria.class).get(0);
        }
        em.persist(categoria);
        em.flush();
        articulo.setCategoria(categoria);
        articuloRepository.saveAndFlush(articulo);
        Long categoriaId = categoria.getId();
        // Get all the articuloList where categoria equals to categoriaId
        defaultArticuloShouldBeFound("categoriaId.equals=" + categoriaId);

        // Get all the articuloList where categoria equals to (categoriaId + 1)
        defaultArticuloShouldNotBeFound("categoriaId.equals=" + (categoriaId + 1));
    }

    @Test
    @Transactional
    void getAllArticulosByUnidadMedidaIsEqualToSomething() throws Exception {
        UnidadMedida unidadMedida;
        if (TestUtil.findAll(em, UnidadMedida.class).isEmpty()) {
            articuloRepository.saveAndFlush(articulo);
            unidadMedida = UnidadMedidaResourceIT.createEntity();
        } else {
            unidadMedida = TestUtil.findAll(em, UnidadMedida.class).get(0);
        }
        em.persist(unidadMedida);
        em.flush();
        articulo.setUnidadMedida(unidadMedida);
        articuloRepository.saveAndFlush(articulo);
        Long unidadMedidaId = unidadMedida.getId();
        // Get all the articuloList where unidadMedida equals to unidadMedidaId
        defaultArticuloShouldBeFound("unidadMedidaId.equals=" + unidadMedidaId);

        // Get all the articuloList where unidadMedida equals to (unidadMedidaId + 1)
        defaultArticuloShouldNotBeFound("unidadMedidaId.equals=" + (unidadMedidaId + 1));
    }

    private void defaultArticuloFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultArticuloShouldBeFound(shouldBeFound);
        defaultArticuloShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultArticuloShouldBeFound(String filter) throws Exception {
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(articulo.getId().intValue())))
            .andExpect(jsonPath("$.[*].codigo").value(hasItem(DEFAULT_CODIGO)))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].existencia").value(hasItem(sameNumber(DEFAULT_EXISTENCIA))))
            .andExpect(jsonPath("$.[*].existenciaMinima").value(hasItem(sameNumber(DEFAULT_EXISTENCIA_MINIMA))))
            .andExpect(jsonPath("$.[*].precio").value(hasItem(sameNumber(DEFAULT_PRECIO))))
            .andExpect(jsonPath("$.[*].costo").value(hasItem(sameNumber(DEFAULT_COSTO))))
            .andExpect(jsonPath("$.[*].imagenContentType").value(hasItem(DEFAULT_IMAGEN_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].imagen").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_IMAGEN))))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));

        // Check, that the count call also returns 1
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultArticuloShouldNotBeFound(String filter) throws Exception {
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restArticuloMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingArticulo() throws Exception {
        // Get the articulo
        restArticuloMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingArticulo() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the articulo
        Articulo updatedArticulo = articuloRepository.findById(articulo.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedArticulo are not directly saved in db
        em.detach(updatedArticulo);
        updatedArticulo
            .codigo(UPDATED_CODIGO)
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .existencia(UPDATED_EXISTENCIA)
            .existenciaMinima(UPDATED_EXISTENCIA_MINIMA)
            .precio(UPDATED_PRECIO)
            .costo(UPDATED_COSTO)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);
        ArticuloDTO articuloDTO = articuloMapper.toDto(updatedArticulo);

        restArticuloMockMvc
            .perform(
                put(ENTITY_API_URL_ID, articuloDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isOk());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedArticuloToMatchAllProperties(updatedArticulo);
    }

    @Test
    @Transactional
    void putNonExistingArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(
                put(ENTITY_API_URL_ID, articuloDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(articuloDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateArticuloWithPatch() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the articulo using partial update
        Articulo partialUpdatedArticulo = new Articulo();
        partialUpdatedArticulo.setId(articulo.getId());

        partialUpdatedArticulo.codigo(UPDATED_CODIGO).existenciaMinima(UPDATED_EXISTENCIA_MINIMA).precio(UPDATED_PRECIO);

        restArticuloMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticulo.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedArticulo))
            )
            .andExpect(status().isOk());

        // Validate the Articulo in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertArticuloUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedArticulo, articulo), getPersistedArticulo(articulo));
    }

    @Test
    @Transactional
    void fullUpdateArticuloWithPatch() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the articulo using partial update
        Articulo partialUpdatedArticulo = new Articulo();
        partialUpdatedArticulo.setId(articulo.getId());

        partialUpdatedArticulo
            .codigo(UPDATED_CODIGO)
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .existencia(UPDATED_EXISTENCIA)
            .existenciaMinima(UPDATED_EXISTENCIA_MINIMA)
            .precio(UPDATED_PRECIO)
            .costo(UPDATED_COSTO)
            .imagen(UPDATED_IMAGEN)
            .imagenContentType(UPDATED_IMAGEN_CONTENT_TYPE)
            .activo(UPDATED_ACTIVO);

        restArticuloMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticulo.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedArticulo))
            )
            .andExpect(status().isOk());

        // Validate the Articulo in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertArticuloUpdatableFieldsEquals(partialUpdatedArticulo, getPersistedArticulo(partialUpdatedArticulo));
    }

    @Test
    @Transactional
    void patchNonExistingArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, articuloDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamArticulo() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        articulo.setId(longCount.incrementAndGet());

        // Create the Articulo
        ArticuloDTO articuloDTO = articuloMapper.toDto(articulo);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticuloMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(articuloDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Articulo in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteArticulo() throws Exception {
        // Initialize the database
        insertedArticulo = articuloRepository.saveAndFlush(articulo);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the articulo
        restArticuloMockMvc
            .perform(delete(ENTITY_API_URL_ID, articulo.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return articuloRepository.count();
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

    protected Articulo getPersistedArticulo(Articulo articulo) {
        return articuloRepository.findById(articulo.getId()).orElseThrow();
    }

    protected void assertPersistedArticuloToMatchAllProperties(Articulo expectedArticulo) {
        assertArticuloAllPropertiesEquals(expectedArticulo, getPersistedArticulo(expectedArticulo));
    }

    protected void assertPersistedArticuloToMatchUpdatableProperties(Articulo expectedArticulo) {
        assertArticuloAllUpdatablePropertiesEquals(expectedArticulo, getPersistedArticulo(expectedArticulo));
    }
}
