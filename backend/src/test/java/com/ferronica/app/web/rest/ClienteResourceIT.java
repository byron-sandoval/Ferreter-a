package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.ClienteAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.Cliente;
import com.ferronica.app.domain.enumeration.Genero;
import com.ferronica.app.repository.ClienteRepository;
import com.ferronica.app.service.dto.ClienteDTO;
import com.ferronica.app.service.mapper.ClienteMapper;
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
 * Integration tests for the {@link ClienteResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ClienteResourceIT {

    private static final String DEFAULT_CEDULA = "AAAAAAAAAA";
    private static final String UPDATED_CEDULA = "BBBBBBBBBB";

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final Genero DEFAULT_GENERO = Genero.MASCULINO;
    private static final Genero UPDATED_GENERO = Genero.FEMENINO;

    private static final String DEFAULT_DIRECCION = "AAAAAAAAAA";
    private static final String UPDATED_DIRECCION = "BBBBBBBBBB";

    private static final String DEFAULT_TELEFONO = "AAAAAAAAAA";
    private static final String UPDATED_TELEFONO = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_SALDO = new BigDecimal(1);
    private static final BigDecimal UPDATED_SALDO = new BigDecimal(2);
    private static final BigDecimal SMALLER_SALDO = new BigDecimal(1 - 1);

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/clientes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ClienteMapper clienteMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClienteMockMvc;

    private Cliente cliente;

    private Cliente insertedCliente;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Cliente createEntity() {
        return new Cliente()
            .cedula(DEFAULT_CEDULA)
            .nombre(DEFAULT_NOMBRE)
            .genero(DEFAULT_GENERO)
            .direccion(DEFAULT_DIRECCION)
            .telefono(DEFAULT_TELEFONO)
            .saldo(DEFAULT_SALDO)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Cliente createUpdatedEntity() {
        return new Cliente()
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .genero(UPDATED_GENERO)
            .direccion(UPDATED_DIRECCION)
            .telefono(UPDATED_TELEFONO)
            .saldo(UPDATED_SALDO)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        cliente = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCliente != null) {
            clienteRepository.delete(insertedCliente);
            insertedCliente = null;
        }
    }

    @Test
    @Transactional
    void createCliente() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);
        var returnedClienteDTO = om.readValue(
            restClienteMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clienteDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ClienteDTO.class
        );

        // Validate the Cliente in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCliente = clienteMapper.toEntity(returnedClienteDTO);
        assertClienteUpdatableFieldsEquals(returnedCliente, getPersistedCliente(returnedCliente));

        insertedCliente = returnedCliente;
    }

    @Test
    @Transactional
    void createClienteWithExistingId() throws Exception {
        // Create the Cliente with an existing ID
        cliente.setId(1L);
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClienteMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clienteDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCedulaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cliente.setCedula(null);

        // Create the Cliente, which fails.
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        restClienteMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clienteDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cliente.setNombre(null);

        // Create the Cliente, which fails.
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        restClienteMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clienteDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClientes() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList
        restClienteMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cliente.getId().intValue())))
            .andExpect(jsonPath("$.[*].cedula").value(hasItem(DEFAULT_CEDULA)))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].genero").value(hasItem(DEFAULT_GENERO.toString())))
            .andExpect(jsonPath("$.[*].direccion").value(hasItem(DEFAULT_DIRECCION)))
            .andExpect(jsonPath("$.[*].telefono").value(hasItem(DEFAULT_TELEFONO)))
            .andExpect(jsonPath("$.[*].saldo").value(hasItem(sameNumber(DEFAULT_SALDO))))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getCliente() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get the cliente
        restClienteMockMvc
            .perform(get(ENTITY_API_URL_ID, cliente.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cliente.getId().intValue()))
            .andExpect(jsonPath("$.cedula").value(DEFAULT_CEDULA))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.genero").value(DEFAULT_GENERO.toString()))
            .andExpect(jsonPath("$.direccion").value(DEFAULT_DIRECCION))
            .andExpect(jsonPath("$.telefono").value(DEFAULT_TELEFONO))
            .andExpect(jsonPath("$.saldo").value(sameNumber(DEFAULT_SALDO)))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getClientesByIdFiltering() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        Long id = cliente.getId();

        defaultClienteFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultClienteFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultClienteFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllClientesByCedulaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where cedula equals to
        defaultClienteFiltering("cedula.equals=" + DEFAULT_CEDULA, "cedula.equals=" + UPDATED_CEDULA);
    }

    @Test
    @Transactional
    void getAllClientesByCedulaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where cedula in
        defaultClienteFiltering("cedula.in=" + DEFAULT_CEDULA + "," + UPDATED_CEDULA, "cedula.in=" + UPDATED_CEDULA);
    }

    @Test
    @Transactional
    void getAllClientesByCedulaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where cedula is not null
        defaultClienteFiltering("cedula.specified=true", "cedula.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesByCedulaContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where cedula contains
        defaultClienteFiltering("cedula.contains=" + DEFAULT_CEDULA, "cedula.contains=" + UPDATED_CEDULA);
    }

    @Test
    @Transactional
    void getAllClientesByCedulaNotContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where cedula does not contain
        defaultClienteFiltering("cedula.doesNotContain=" + UPDATED_CEDULA, "cedula.doesNotContain=" + DEFAULT_CEDULA);
    }

    @Test
    @Transactional
    void getAllClientesByNombreIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where nombre equals to
        defaultClienteFiltering("nombre.equals=" + DEFAULT_NOMBRE, "nombre.equals=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllClientesByNombreIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where nombre in
        defaultClienteFiltering("nombre.in=" + DEFAULT_NOMBRE + "," + UPDATED_NOMBRE, "nombre.in=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllClientesByNombreIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where nombre is not null
        defaultClienteFiltering("nombre.specified=true", "nombre.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesByNombreContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where nombre contains
        defaultClienteFiltering("nombre.contains=" + DEFAULT_NOMBRE, "nombre.contains=" + UPDATED_NOMBRE);
    }

    @Test
    @Transactional
    void getAllClientesByNombreNotContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where nombre does not contain
        defaultClienteFiltering("nombre.doesNotContain=" + UPDATED_NOMBRE, "nombre.doesNotContain=" + DEFAULT_NOMBRE);
    }

    @Test
    @Transactional
    void getAllClientesByGeneroIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where genero equals to
        defaultClienteFiltering("genero.equals=" + DEFAULT_GENERO, "genero.equals=" + UPDATED_GENERO);
    }

    @Test
    @Transactional
    void getAllClientesByGeneroIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where genero in
        defaultClienteFiltering("genero.in=" + DEFAULT_GENERO + "," + UPDATED_GENERO, "genero.in=" + UPDATED_GENERO);
    }

    @Test
    @Transactional
    void getAllClientesByGeneroIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where genero is not null
        defaultClienteFiltering("genero.specified=true", "genero.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesByDireccionIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where direccion equals to
        defaultClienteFiltering("direccion.equals=" + DEFAULT_DIRECCION, "direccion.equals=" + UPDATED_DIRECCION);
    }

    @Test
    @Transactional
    void getAllClientesByDireccionIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where direccion in
        defaultClienteFiltering("direccion.in=" + DEFAULT_DIRECCION + "," + UPDATED_DIRECCION, "direccion.in=" + UPDATED_DIRECCION);
    }

    @Test
    @Transactional
    void getAllClientesByDireccionIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where direccion is not null
        defaultClienteFiltering("direccion.specified=true", "direccion.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesByDireccionContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where direccion contains
        defaultClienteFiltering("direccion.contains=" + DEFAULT_DIRECCION, "direccion.contains=" + UPDATED_DIRECCION);
    }

    @Test
    @Transactional
    void getAllClientesByDireccionNotContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where direccion does not contain
        defaultClienteFiltering("direccion.doesNotContain=" + UPDATED_DIRECCION, "direccion.doesNotContain=" + DEFAULT_DIRECCION);
    }

    @Test
    @Transactional
    void getAllClientesByTelefonoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where telefono equals to
        defaultClienteFiltering("telefono.equals=" + DEFAULT_TELEFONO, "telefono.equals=" + UPDATED_TELEFONO);
    }

    @Test
    @Transactional
    void getAllClientesByTelefonoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where telefono in
        defaultClienteFiltering("telefono.in=" + DEFAULT_TELEFONO + "," + UPDATED_TELEFONO, "telefono.in=" + UPDATED_TELEFONO);
    }

    @Test
    @Transactional
    void getAllClientesByTelefonoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where telefono is not null
        defaultClienteFiltering("telefono.specified=true", "telefono.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesByTelefonoContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where telefono contains
        defaultClienteFiltering("telefono.contains=" + DEFAULT_TELEFONO, "telefono.contains=" + UPDATED_TELEFONO);
    }

    @Test
    @Transactional
    void getAllClientesByTelefonoNotContainsSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where telefono does not contain
        defaultClienteFiltering("telefono.doesNotContain=" + UPDATED_TELEFONO, "telefono.doesNotContain=" + DEFAULT_TELEFONO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo equals to
        defaultClienteFiltering("saldo.equals=" + DEFAULT_SALDO, "saldo.equals=" + UPDATED_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo in
        defaultClienteFiltering("saldo.in=" + DEFAULT_SALDO + "," + UPDATED_SALDO, "saldo.in=" + UPDATED_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo is not null
        defaultClienteFiltering("saldo.specified=true", "saldo.specified=false");
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo is greater than or equal to
        defaultClienteFiltering("saldo.greaterThanOrEqual=" + DEFAULT_SALDO, "saldo.greaterThanOrEqual=" + UPDATED_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo is less than or equal to
        defaultClienteFiltering("saldo.lessThanOrEqual=" + DEFAULT_SALDO, "saldo.lessThanOrEqual=" + SMALLER_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo is less than
        defaultClienteFiltering("saldo.lessThan=" + UPDATED_SALDO, "saldo.lessThan=" + DEFAULT_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesBySaldoIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where saldo is greater than
        defaultClienteFiltering("saldo.greaterThan=" + SMALLER_SALDO, "saldo.greaterThan=" + DEFAULT_SALDO);
    }

    @Test
    @Transactional
    void getAllClientesByActivoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where activo equals to
        defaultClienteFiltering("activo.equals=" + DEFAULT_ACTIVO, "activo.equals=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllClientesByActivoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where activo in
        defaultClienteFiltering("activo.in=" + DEFAULT_ACTIVO + "," + UPDATED_ACTIVO, "activo.in=" + UPDATED_ACTIVO);
    }

    @Test
    @Transactional
    void getAllClientesByActivoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        // Get all the clienteList where activo is not null
        defaultClienteFiltering("activo.specified=true", "activo.specified=false");
    }

    private void defaultClienteFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultClienteShouldBeFound(shouldBeFound);
        defaultClienteShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultClienteShouldBeFound(String filter) throws Exception {
        restClienteMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cliente.getId().intValue())))
            .andExpect(jsonPath("$.[*].cedula").value(hasItem(DEFAULT_CEDULA)))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].genero").value(hasItem(DEFAULT_GENERO.toString())))
            .andExpect(jsonPath("$.[*].direccion").value(hasItem(DEFAULT_DIRECCION)))
            .andExpect(jsonPath("$.[*].telefono").value(hasItem(DEFAULT_TELEFONO)))
            .andExpect(jsonPath("$.[*].saldo").value(hasItem(sameNumber(DEFAULT_SALDO))))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));

        // Check, that the count call also returns 1
        restClienteMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultClienteShouldNotBeFound(String filter) throws Exception {
        restClienteMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restClienteMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingCliente() throws Exception {
        // Get the cliente
        restClienteMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCliente() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cliente
        Cliente updatedCliente = clienteRepository.findById(cliente.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCliente are not directly saved in db
        em.detach(updatedCliente);
        updatedCliente
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .genero(UPDATED_GENERO)
            .direccion(UPDATED_DIRECCION)
            .telefono(UPDATED_TELEFONO)
            .saldo(UPDATED_SALDO)
            .activo(UPDATED_ACTIVO);
        ClienteDTO clienteDTO = clienteMapper.toDto(updatedCliente);

        restClienteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clienteDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isOk());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedClienteToMatchAllProperties(updatedCliente);
    }

    @Test
    @Transactional
    void putNonExistingCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clienteDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clienteDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClienteWithPatch() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cliente using partial update
        Cliente partialUpdatedCliente = new Cliente();
        partialUpdatedCliente.setId(cliente.getId());

        partialUpdatedCliente
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .genero(UPDATED_GENERO)
            .direccion(UPDATED_DIRECCION)
            .telefono(UPDATED_TELEFONO)
            .activo(UPDATED_ACTIVO);

        restClienteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCliente.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCliente))
            )
            .andExpect(status().isOk());

        // Validate the Cliente in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClienteUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedCliente, cliente), getPersistedCliente(cliente));
    }

    @Test
    @Transactional
    void fullUpdateClienteWithPatch() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cliente using partial update
        Cliente partialUpdatedCliente = new Cliente();
        partialUpdatedCliente.setId(cliente.getId());

        partialUpdatedCliente
            .cedula(UPDATED_CEDULA)
            .nombre(UPDATED_NOMBRE)
            .genero(UPDATED_GENERO)
            .direccion(UPDATED_DIRECCION)
            .telefono(UPDATED_TELEFONO)
            .saldo(UPDATED_SALDO)
            .activo(UPDATED_ACTIVO);

        restClienteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCliente.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCliente))
            )
            .andExpect(status().isOk());

        // Validate the Cliente in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClienteUpdatableFieldsEquals(partialUpdatedCliente, getPersistedCliente(partialUpdatedCliente));
    }

    @Test
    @Transactional
    void patchNonExistingCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clienteDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCliente() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cliente.setId(longCount.incrementAndGet());

        // Create the Cliente
        ClienteDTO clienteDTO = clienteMapper.toDto(cliente);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClienteMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(clienteDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Cliente in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCliente() throws Exception {
        // Initialize the database
        insertedCliente = clienteRepository.saveAndFlush(cliente);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the cliente
        restClienteMockMvc
            .perform(delete(ENTITY_API_URL_ID, cliente.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return clienteRepository.count();
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

    protected Cliente getPersistedCliente(Cliente cliente) {
        return clienteRepository.findById(cliente.getId()).orElseThrow();
    }

    protected void assertPersistedClienteToMatchAllProperties(Cliente expectedCliente) {
        assertClienteAllPropertiesEquals(expectedCliente, getPersistedCliente(expectedCliente));
    }

    protected void assertPersistedClienteToMatchUpdatableProperties(Cliente expectedCliente) {
        assertClienteAllUpdatablePropertiesEquals(expectedCliente, getPersistedCliente(expectedCliente));
    }
}
