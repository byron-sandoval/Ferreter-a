package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.VentaAsserts.*;
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
import com.ferronica.app.domain.Moneda;
import com.ferronica.app.domain.NumeracionFactura;
import com.ferronica.app.domain.Usuario;
import com.ferronica.app.domain.Venta;
import com.ferronica.app.domain.enumeration.MetodoPagoEnum;
import com.ferronica.app.repository.VentaRepository;
import com.ferronica.app.service.dto.VentaDTO;
import com.ferronica.app.service.mapper.VentaMapper;
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
 * Integration tests for the {@link VentaResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class VentaResourceIT {

    private static final Instant DEFAULT_FECHA = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Long DEFAULT_NO_FACTURA = 1L;
    private static final Long UPDATED_NO_FACTURA = 2L;
    private static final Long SMALLER_NO_FACTURA = 1L - 1L;

    private static final BigDecimal DEFAULT_SUBTOTAL = new BigDecimal(1);
    private static final BigDecimal UPDATED_SUBTOTAL = new BigDecimal(2);
    private static final BigDecimal SMALLER_SUBTOTAL = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_IVA = new BigDecimal(1);
    private static final BigDecimal UPDATED_IVA = new BigDecimal(2);
    private static final BigDecimal SMALLER_IVA = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL_EN_MONEDA_BASE = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_EN_MONEDA_BASE = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_EN_MONEDA_BASE = new BigDecimal(1 - 1);

    private static final MetodoPagoEnum DEFAULT_METODO_PAGO = MetodoPagoEnum.EFECTIVO;
    private static final MetodoPagoEnum UPDATED_METODO_PAGO = MetodoPagoEnum.TARJETA_STRIPE;

    private static final String DEFAULT_STRIPE_ID = "AAAAAAAAAA";
    private static final String UPDATED_STRIPE_ID = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ES_CONTADO = false;
    private static final Boolean UPDATED_ES_CONTADO = true;

    private static final BigDecimal DEFAULT_TIPO_CAMBIO_VENTA = new BigDecimal(1);
    private static final BigDecimal UPDATED_TIPO_CAMBIO_VENTA = new BigDecimal(2);
    private static final BigDecimal SMALLER_TIPO_CAMBIO_VENTA = new BigDecimal(1 - 1);

    private static final Boolean DEFAULT_ANULADA = false;
    private static final Boolean UPDATED_ANULADA = true;

    private static final String ENTITY_API_URL = "/api/ventas";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private VentaMapper ventaMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restVentaMockMvc;

    private Venta venta;

    private Venta insertedVenta;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Venta createEntity() {
        return new Venta()
                .fecha(DEFAULT_FECHA)
                .noFactura(DEFAULT_NO_FACTURA)
                .subtotal(DEFAULT_SUBTOTAL)
                .iva(DEFAULT_IVA)
                .total(DEFAULT_TOTAL)
                .totalEnMonedaBase(DEFAULT_TOTAL_EN_MONEDA_BASE)
                .metodoPago(DEFAULT_METODO_PAGO)
                .stripeId(DEFAULT_STRIPE_ID)
                .esContado(DEFAULT_ES_CONTADO)
                .tipoCambioVenta(DEFAULT_TIPO_CAMBIO_VENTA)
                .anulada(DEFAULT_ANULADA);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Venta createUpdatedEntity() {
        return new Venta()
                .fecha(UPDATED_FECHA)
                .noFactura(UPDATED_NO_FACTURA)
                .subtotal(UPDATED_SUBTOTAL)
                .iva(UPDATED_IVA)
                .total(UPDATED_TOTAL)
                .totalEnMonedaBase(UPDATED_TOTAL_EN_MONEDA_BASE)
                .metodoPago(UPDATED_METODO_PAGO)
                .stripeId(UPDATED_STRIPE_ID)
                .esContado(UPDATED_ES_CONTADO)
                .tipoCambioVenta(UPDATED_TIPO_CAMBIO_VENTA)
                .anulada(UPDATED_ANULADA);
    }

    @BeforeEach
    void initTest() {
        venta = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedVenta != null) {
            ventaRepository.delete(insertedVenta);
            insertedVenta = null;
        }
    }

    @Test
    @Transactional
    void createVenta() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);
        var returnedVentaDTO = om.readValue(
                restVentaMockMvc
                        .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                                .content(om.writeValueAsBytes(ventaDTO)))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                VentaDTO.class);

        // Validate the Venta in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedVenta = ventaMapper.toEntity(returnedVentaDTO);
        assertVentaUpdatableFieldsEquals(returnedVenta, getPersistedVenta(returnedVenta));

        insertedVenta = returnedVenta;
    }

    @Test
    @Transactional
    void createVentaWithExistingId() throws Exception {
        // Create the Venta with an existing ID
        venta.setId(1L);
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setFecha(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNoFacturaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setNoFactura(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSubtotalIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setSubtotal(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIvaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setIva(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTotalIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setTotal(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMetodoPagoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setMetodoPago(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEsContadoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venta.setEsContado(null);

        // Create the Venta, which fails.
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        restVentaMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllVentas() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList
        restVentaMockMvc
                .perform(get(ENTITY_API_URL + "?sort=id,desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(venta.getId().intValue())))
                .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
                .andExpect(jsonPath("$.[*].noFactura").value(hasItem(DEFAULT_NO_FACTURA.intValue())))
                .andExpect(jsonPath("$.[*].subtotal").value(hasItem(sameNumber(DEFAULT_SUBTOTAL))))
                .andExpect(jsonPath("$.[*].iva").value(hasItem(sameNumber(DEFAULT_IVA))))
                .andExpect(jsonPath("$.[*].total").value(hasItem(sameNumber(DEFAULT_TOTAL))))
                .andExpect(jsonPath("$.[*].totalEnMonedaBase").value(hasItem(sameNumber(DEFAULT_TOTAL_EN_MONEDA_BASE))))
                .andExpect(jsonPath("$.[*].metodoPago").value(hasItem(DEFAULT_METODO_PAGO.toString())))
                .andExpect(jsonPath("$.[*].stripeId").value(hasItem(DEFAULT_STRIPE_ID)))
                .andExpect(jsonPath("$.[*].esContado").value(hasItem(DEFAULT_ES_CONTADO)))
                .andExpect(jsonPath("$.[*].tipoCambioVenta").value(hasItem(sameNumber(DEFAULT_TIPO_CAMBIO_VENTA))))
                .andExpect(jsonPath("$.[*].anulada").value(hasItem(DEFAULT_ANULADA)));
    }

    @Test
    @Transactional
    void getVenta() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get the venta
        restVentaMockMvc
                .perform(get(ENTITY_API_URL_ID, venta.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.id").value(venta.getId().intValue()))
                .andExpect(jsonPath("$.fecha").value(DEFAULT_FECHA.toString()))
                .andExpect(jsonPath("$.noFactura").value(DEFAULT_NO_FACTURA.intValue()))
                .andExpect(jsonPath("$.subtotal").value(sameNumber(DEFAULT_SUBTOTAL)))
                .andExpect(jsonPath("$.iva").value(sameNumber(DEFAULT_IVA)))
                .andExpect(jsonPath("$.total").value(sameNumber(DEFAULT_TOTAL)))
                .andExpect(jsonPath("$.totalEnMonedaBase").value(sameNumber(DEFAULT_TOTAL_EN_MONEDA_BASE)))
                .andExpect(jsonPath("$.metodoPago").value(DEFAULT_METODO_PAGO.toString()))
                .andExpect(jsonPath("$.stripeId").value(DEFAULT_STRIPE_ID))
                .andExpect(jsonPath("$.esContado").value(DEFAULT_ES_CONTADO))
                .andExpect(jsonPath("$.tipoCambioVenta").value(sameNumber(DEFAULT_TIPO_CAMBIO_VENTA)))
                .andExpect(jsonPath("$.anulada").value(DEFAULT_ANULADA));
    }

    @Test
    @Transactional
    void getVentasByIdFiltering() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        Long id = venta.getId();

        defaultVentaFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultVentaFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultVentaFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllVentasByFechaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where fecha equals to
        defaultVentaFiltering("fecha.equals=" + DEFAULT_FECHA, "fecha.equals=" + UPDATED_FECHA);
    }

    @Test
    @Transactional
    void getAllVentasByFechaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where fecha in
        defaultVentaFiltering("fecha.in=" + DEFAULT_FECHA + "," + UPDATED_FECHA, "fecha.in=" + UPDATED_FECHA);
    }

    @Test
    @Transactional
    void getAllVentasByFechaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where fecha is not null
        defaultVentaFiltering("fecha.specified=true", "fecha.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura equals to
        defaultVentaFiltering("noFactura.equals=" + DEFAULT_NO_FACTURA, "noFactura.equals=" + UPDATED_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura in
        defaultVentaFiltering("noFactura.in=" + DEFAULT_NO_FACTURA + "," + UPDATED_NO_FACTURA,
                "noFactura.in=" + UPDATED_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura is not null
        defaultVentaFiltering("noFactura.specified=true", "noFactura.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura is greater than or equal to
        defaultVentaFiltering("noFactura.greaterThanOrEqual=" + DEFAULT_NO_FACTURA,
                "noFactura.greaterThanOrEqual=" + UPDATED_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura is less than or equal to
        defaultVentaFiltering("noFactura.lessThanOrEqual=" + DEFAULT_NO_FACTURA,
                "noFactura.lessThanOrEqual=" + SMALLER_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura is less than
        defaultVentaFiltering("noFactura.lessThan=" + UPDATED_NO_FACTURA, "noFactura.lessThan=" + DEFAULT_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasByNoFacturaIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where noFactura is greater than
        defaultVentaFiltering("noFactura.greaterThan=" + SMALLER_NO_FACTURA,
                "noFactura.greaterThan=" + DEFAULT_NO_FACTURA);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal equals to
        defaultVentaFiltering("subtotal.equals=" + DEFAULT_SUBTOTAL, "subtotal.equals=" + UPDATED_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal in
        defaultVentaFiltering("subtotal.in=" + DEFAULT_SUBTOTAL + "," + UPDATED_SUBTOTAL,
                "subtotal.in=" + UPDATED_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal is not null
        defaultVentaFiltering("subtotal.specified=true", "subtotal.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal is greater than or equal to
        defaultVentaFiltering("subtotal.greaterThanOrEqual=" + DEFAULT_SUBTOTAL,
                "subtotal.greaterThanOrEqual=" + UPDATED_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal is less than or equal to
        defaultVentaFiltering("subtotal.lessThanOrEqual=" + DEFAULT_SUBTOTAL,
                "subtotal.lessThanOrEqual=" + SMALLER_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal is less than
        defaultVentaFiltering("subtotal.lessThan=" + UPDATED_SUBTOTAL, "subtotal.lessThan=" + DEFAULT_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasBySubtotalIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where subtotal is greater than
        defaultVentaFiltering("subtotal.greaterThan=" + SMALLER_SUBTOTAL, "subtotal.greaterThan=" + DEFAULT_SUBTOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva equals to
        defaultVentaFiltering("iva.equals=" + DEFAULT_IVA, "iva.equals=" + UPDATED_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva in
        defaultVentaFiltering("iva.in=" + DEFAULT_IVA + "," + UPDATED_IVA, "iva.in=" + UPDATED_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva is not null
        defaultVentaFiltering("iva.specified=true", "iva.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva is greater than or equal to
        defaultVentaFiltering("iva.greaterThanOrEqual=" + DEFAULT_IVA, "iva.greaterThanOrEqual=" + UPDATED_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva is less than or equal to
        defaultVentaFiltering("iva.lessThanOrEqual=" + DEFAULT_IVA, "iva.lessThanOrEqual=" + SMALLER_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva is less than
        defaultVentaFiltering("iva.lessThan=" + UPDATED_IVA, "iva.lessThan=" + DEFAULT_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByIvaIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where iva is greater than
        defaultVentaFiltering("iva.greaterThan=" + SMALLER_IVA, "iva.greaterThan=" + DEFAULT_IVA);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total equals to
        defaultVentaFiltering("total.equals=" + DEFAULT_TOTAL, "total.equals=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total in
        defaultVentaFiltering("total.in=" + DEFAULT_TOTAL + "," + UPDATED_TOTAL, "total.in=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total is not null
        defaultVentaFiltering("total.specified=true", "total.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total is greater than or equal to
        defaultVentaFiltering("total.greaterThanOrEqual=" + DEFAULT_TOTAL, "total.greaterThanOrEqual=" + UPDATED_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total is less than or equal to
        defaultVentaFiltering("total.lessThanOrEqual=" + DEFAULT_TOTAL, "total.lessThanOrEqual=" + SMALLER_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total is less than
        defaultVentaFiltering("total.lessThan=" + UPDATED_TOTAL, "total.lessThan=" + DEFAULT_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where total is greater than
        defaultVentaFiltering("total.greaterThan=" + SMALLER_TOTAL, "total.greaterThan=" + DEFAULT_TOTAL);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase equals to
        defaultVentaFiltering(
                "totalEnMonedaBase.equals=" + DEFAULT_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.equals=" + UPDATED_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase in
        defaultVentaFiltering(
                "totalEnMonedaBase.in=" + DEFAULT_TOTAL_EN_MONEDA_BASE + "," + UPDATED_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.in=" + UPDATED_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase is not null
        defaultVentaFiltering("totalEnMonedaBase.specified=true", "totalEnMonedaBase.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase is greater than or equal to
        defaultVentaFiltering(
                "totalEnMonedaBase.greaterThanOrEqual=" + DEFAULT_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.greaterThanOrEqual=" + UPDATED_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase is less than or equal to
        defaultVentaFiltering(
                "totalEnMonedaBase.lessThanOrEqual=" + DEFAULT_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.lessThanOrEqual=" + SMALLER_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase is less than
        defaultVentaFiltering(
                "totalEnMonedaBase.lessThan=" + UPDATED_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.lessThan=" + DEFAULT_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByTotalEnMonedaBaseIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where totalEnMonedaBase is greater than
        defaultVentaFiltering(
                "totalEnMonedaBase.greaterThan=" + SMALLER_TOTAL_EN_MONEDA_BASE,
                "totalEnMonedaBase.greaterThan=" + DEFAULT_TOTAL_EN_MONEDA_BASE);
    }

    @Test
    @Transactional
    void getAllVentasByMetodoPagoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where metodoPago equals to
        defaultVentaFiltering("metodoPago.equals=" + DEFAULT_METODO_PAGO, "metodoPago.equals=" + UPDATED_METODO_PAGO);
    }

    @Test
    @Transactional
    void getAllVentasByMetodoPagoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where metodoPago in
        defaultVentaFiltering("metodoPago.in=" + DEFAULT_METODO_PAGO + "," + UPDATED_METODO_PAGO,
                "metodoPago.in=" + UPDATED_METODO_PAGO);
    }

    @Test
    @Transactional
    void getAllVentasByMetodoPagoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where metodoPago is not null
        defaultVentaFiltering("metodoPago.specified=true", "metodoPago.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByStripeIdIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where stripeId equals to
        defaultVentaFiltering("stripeId.equals=" + DEFAULT_STRIPE_ID, "stripeId.equals=" + UPDATED_STRIPE_ID);
    }

    @Test
    @Transactional
    void getAllVentasByStripeIdIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where stripeId in
        defaultVentaFiltering("stripeId.in=" + DEFAULT_STRIPE_ID + "," + UPDATED_STRIPE_ID,
                "stripeId.in=" + UPDATED_STRIPE_ID);
    }

    @Test
    @Transactional
    void getAllVentasByStripeIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where stripeId is not null
        defaultVentaFiltering("stripeId.specified=true", "stripeId.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByStripeIdContainsSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where stripeId contains
        defaultVentaFiltering("stripeId.contains=" + DEFAULT_STRIPE_ID, "stripeId.contains=" + UPDATED_STRIPE_ID);
    }

    @Test
    @Transactional
    void getAllVentasByStripeIdNotContainsSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where stripeId does not contain
        defaultVentaFiltering("stripeId.doesNotContain=" + UPDATED_STRIPE_ID,
                "stripeId.doesNotContain=" + DEFAULT_STRIPE_ID);
    }

    @Test
    @Transactional
    void getAllVentasByEsContadoIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where esContado equals to
        defaultVentaFiltering("esContado.equals=" + DEFAULT_ES_CONTADO, "esContado.equals=" + UPDATED_ES_CONTADO);
    }

    @Test
    @Transactional
    void getAllVentasByEsContadoIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where esContado in
        defaultVentaFiltering("esContado.in=" + DEFAULT_ES_CONTADO + "," + UPDATED_ES_CONTADO,
                "esContado.in=" + UPDATED_ES_CONTADO);
    }

    @Test
    @Transactional
    void getAllVentasByEsContadoIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where esContado is not null
        defaultVentaFiltering("esContado.specified=true", "esContado.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta equals to
        defaultVentaFiltering("tipoCambioVenta.equals=" + DEFAULT_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.equals=" + UPDATED_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta in
        defaultVentaFiltering(
                "tipoCambioVenta.in=" + DEFAULT_TIPO_CAMBIO_VENTA + "," + UPDATED_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.in=" + UPDATED_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta is not null
        defaultVentaFiltering("tipoCambioVenta.specified=true", "tipoCambioVenta.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta is greater than or equal to
        defaultVentaFiltering(
                "tipoCambioVenta.greaterThanOrEqual=" + DEFAULT_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.greaterThanOrEqual=" + UPDATED_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta is less than or equal to
        defaultVentaFiltering(
                "tipoCambioVenta.lessThanOrEqual=" + DEFAULT_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.lessThanOrEqual=" + SMALLER_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta is less than
        defaultVentaFiltering(
                "tipoCambioVenta.lessThan=" + UPDATED_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.lessThan=" + DEFAULT_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByTipoCambioVentaIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where tipoCambioVenta is greater than
        defaultVentaFiltering(
                "tipoCambioVenta.greaterThan=" + SMALLER_TIPO_CAMBIO_VENTA,
                "tipoCambioVenta.greaterThan=" + DEFAULT_TIPO_CAMBIO_VENTA);
    }

    @Test
    @Transactional
    void getAllVentasByAnuladaIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where anulada equals to
        defaultVentaFiltering("anulada.equals=" + DEFAULT_ANULADA, "anulada.equals=" + UPDATED_ANULADA);
    }

    @Test
    @Transactional
    void getAllVentasByAnuladaIsInShouldWork() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where anulada in
        defaultVentaFiltering("anulada.in=" + DEFAULT_ANULADA + "," + UPDATED_ANULADA, "anulada.in=" + UPDATED_ANULADA);
    }

    @Test
    @Transactional
    void getAllVentasByAnuladaIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        // Get all the ventaList where anulada is not null
        defaultVentaFiltering("anulada.specified=true", "anulada.specified=false");
    }

    @Test
    @Transactional
    void getAllVentasByClienteIsEqualToSomething() throws Exception {
        Cliente cliente;
        if (TestUtil.findAll(em, Cliente.class).isEmpty()) {
            ventaRepository.saveAndFlush(venta);
            cliente = ClienteResourceIT.createEntity();
        } else {
            cliente = TestUtil.findAll(em, Cliente.class).get(0);
        }
        em.persist(cliente);
        em.flush();
        venta.setCliente(cliente);
        ventaRepository.saveAndFlush(venta);
        Long clienteId = cliente.getId();
        // Get all the ventaList where cliente equals to clienteId
        defaultVentaShouldBeFound("clienteId.equals=" + clienteId);

        // Get all the ventaList where cliente equals to (clienteId + 1)
        defaultVentaShouldNotBeFound("clienteId.equals=" + (clienteId + 1));
    }

    @Test
    @Transactional
    void getAllVentasByUsuarioIsEqualToSomething() throws Exception {
        Usuario usuario;
        if (TestUtil.findAll(em, Usuario.class).isEmpty()) {
            ventaRepository.saveAndFlush(venta);
            usuario = UsuarioResourceIT.createEntity();
        } else {
            usuario = TestUtil.findAll(em, Usuario.class).get(0);
        }
        em.persist(usuario);
        em.flush();
        venta.setUsuario(usuario);
        ventaRepository.saveAndFlush(venta);
        Long usuarioId = usuario.getId();
        // Get all the ventaList where usuario equals to usuarioId
        defaultVentaShouldBeFound("usuarioId.equals=" + usuarioId);

        // Get all the ventaList where usuario equals to (usuarioId + 1)
        defaultVentaShouldNotBeFound("usuarioId.equals=" + (usuarioId + 1));
    }

    @Test
    @Transactional
    void getAllVentasByMonedaIsEqualToSomething() throws Exception {
        Moneda moneda;
        if (TestUtil.findAll(em, Moneda.class).isEmpty()) {
            ventaRepository.saveAndFlush(venta);
            moneda = MonedaResourceIT.createEntity();
        } else {
            moneda = TestUtil.findAll(em, Moneda.class).get(0);
        }
        em.persist(moneda);
        em.flush();
        venta.setMoneda(moneda);
        ventaRepository.saveAndFlush(venta);
        Long monedaId = moneda.getId();
        // Get all the ventaList where moneda equals to monedaId
        defaultVentaShouldBeFound("monedaId.equals=" + monedaId);

        // Get all the ventaList where moneda equals to (monedaId + 1)
        defaultVentaShouldNotBeFound("monedaId.equals=" + (monedaId + 1));
    }

    @Test
    @Transactional
    void getAllVentasByNumeracionIsEqualToSomething() throws Exception {
        NumeracionFactura numeracion;
        if (TestUtil.findAll(em, NumeracionFactura.class).isEmpty()) {
            ventaRepository.saveAndFlush(venta);
            numeracion = NumeracionFacturaResourceIT.createEntity();
        } else {
            numeracion = TestUtil.findAll(em, NumeracionFactura.class).get(0);
        }
        em.persist(numeracion);
        em.flush();
        venta.setNumeracion(numeracion);
        ventaRepository.saveAndFlush(venta);
        Long numeracionId = numeracion.getId();
        // Get all the ventaList where numeracion equals to numeracionId
        defaultVentaShouldBeFound("numeracionId.equals=" + numeracionId);

        // Get all the ventaList where numeracion equals to (numeracionId + 1)
        defaultVentaShouldNotBeFound("numeracionId.equals=" + (numeracionId + 1));
    }

    private void defaultVentaFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultVentaShouldBeFound(shouldBeFound);
        defaultVentaShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultVentaShouldBeFound(String filter) throws Exception {
        restVentaMockMvc
                .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(venta.getId().intValue())))
                .andExpect(jsonPath("$.[*].fecha").value(hasItem(DEFAULT_FECHA.toString())))
                .andExpect(jsonPath("$.[*].noFactura").value(hasItem(DEFAULT_NO_FACTURA.intValue())))
                .andExpect(jsonPath("$.[*].subtotal").value(hasItem(sameNumber(DEFAULT_SUBTOTAL))))
                .andExpect(jsonPath("$.[*].iva").value(hasItem(sameNumber(DEFAULT_IVA))))
                .andExpect(jsonPath("$.[*].total").value(hasItem(sameNumber(DEFAULT_TOTAL))))
                .andExpect(jsonPath("$.[*].totalEnMonedaBase").value(hasItem(sameNumber(DEFAULT_TOTAL_EN_MONEDA_BASE))))
                .andExpect(jsonPath("$.[*].metodoPago").value(hasItem(DEFAULT_METODO_PAGO.toString())))
                .andExpect(jsonPath("$.[*].stripeId").value(hasItem(DEFAULT_STRIPE_ID)))
                .andExpect(jsonPath("$.[*].esContado").value(hasItem(DEFAULT_ES_CONTADO)))
                .andExpect(jsonPath("$.[*].tipoCambioVenta").value(hasItem(sameNumber(DEFAULT_TIPO_CAMBIO_VENTA))))
                .andExpect(jsonPath("$.[*].anulada").value(hasItem(DEFAULT_ANULADA)));

        // Check, that the count call also returns 1
        restVentaMockMvc
                .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultVentaShouldNotBeFound(String filter) throws Exception {
        restVentaMockMvc
                .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restVentaMockMvc
                .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingVenta() throws Exception {
        // Get the venta
        restVentaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingVenta() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venta
        Venta updatedVenta = ventaRepository.findById(venta.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedVenta are not directly
        // saved in db
        em.detach(updatedVenta);
        updatedVenta
                .fecha(UPDATED_FECHA)
                .noFactura(UPDATED_NO_FACTURA)
                .subtotal(UPDATED_SUBTOTAL)
                .iva(UPDATED_IVA)
                .total(UPDATED_TOTAL)
                .totalEnMonedaBase(UPDATED_TOTAL_EN_MONEDA_BASE)
                .metodoPago(UPDATED_METODO_PAGO)
                .stripeId(UPDATED_STRIPE_ID)
                .esContado(UPDATED_ES_CONTADO)
                .tipoCambioVenta(UPDATED_TIPO_CAMBIO_VENTA)
                .anulada(UPDATED_ANULADA);
        VentaDTO ventaDTO = ventaMapper.toDto(updatedVenta);

        restVentaMockMvc
                .perform(
                        put(ENTITY_API_URL_ID, ventaDTO.getId())
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isOk());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedVentaToMatchAllProperties(updatedVenta);
    }

    @Test
    @Transactional
    void putNonExistingVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(
                        put(ENTITY_API_URL_ID, ventaDTO.getId())
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(
                        put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isMethodNotAllowed());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateVentaWithPatch() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venta using partial update
        Venta partialUpdatedVenta = new Venta();
        partialUpdatedVenta.setId(venta.getId());

        partialUpdatedVenta
                .noFactura(UPDATED_NO_FACTURA)
                .total(UPDATED_TOTAL)
                .totalEnMonedaBase(UPDATED_TOTAL_EN_MONEDA_BASE)
                .stripeId(UPDATED_STRIPE_ID)
                .anulada(UPDATED_ANULADA);

        restVentaMockMvc
                .perform(
                        patch(ENTITY_API_URL_ID, partialUpdatedVenta.getId())
                                .with(csrf())
                                .contentType("application/merge-patch+json")
                                .content(om.writeValueAsBytes(partialUpdatedVenta)))
                .andExpect(status().isOk());

        // Validate the Venta in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVentaUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedVenta, venta),
                getPersistedVenta(venta));
    }

    @Test
    @Transactional
    void fullUpdateVentaWithPatch() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venta using partial update
        Venta partialUpdatedVenta = new Venta();
        partialUpdatedVenta.setId(venta.getId());

        partialUpdatedVenta
                .fecha(UPDATED_FECHA)
                .noFactura(UPDATED_NO_FACTURA)
                .subtotal(UPDATED_SUBTOTAL)
                .iva(UPDATED_IVA)
                .total(UPDATED_TOTAL)
                .totalEnMonedaBase(UPDATED_TOTAL_EN_MONEDA_BASE)
                .metodoPago(UPDATED_METODO_PAGO)
                .stripeId(UPDATED_STRIPE_ID)
                .esContado(UPDATED_ES_CONTADO)
                .tipoCambioVenta(UPDATED_TIPO_CAMBIO_VENTA)
                .anulada(UPDATED_ANULADA);

        restVentaMockMvc
                .perform(
                        patch(ENTITY_API_URL_ID, partialUpdatedVenta.getId())
                                .with(csrf())
                                .contentType("application/merge-patch+json")
                                .content(om.writeValueAsBytes(partialUpdatedVenta)))
                .andExpect(status().isOk());

        // Validate the Venta in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVentaUpdatableFieldsEquals(partialUpdatedVenta, getPersistedVenta(partialUpdatedVenta));
    }

    @Test
    @Transactional
    void patchNonExistingVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(
                        patch(ENTITY_API_URL_ID, ventaDTO.getId())
                                .with(csrf())
                                .contentType("application/merge-patch+json")
                                .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(
                        patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                                .with(csrf())
                                .contentType("application/merge-patch+json")
                                .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isBadRequest());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venta.setId(longCount.incrementAndGet());

        // Create the Venta
        VentaDTO ventaDTO = ventaMapper.toDto(venta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVentaMockMvc
                .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json")
                        .content(om.writeValueAsBytes(ventaDTO)))
                .andExpect(status().isMethodNotAllowed());

        // Validate the Venta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteVenta() throws Exception {
        // Initialize the database
        insertedVenta = ventaRepository.saveAndFlush(venta);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the venta
        restVentaMockMvc
                .perform(delete(ENTITY_API_URL_ID, venta.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return ventaRepository.count();
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

    protected Venta getPersistedVenta(Venta venta) {
        return ventaRepository.findById(venta.getId()).orElseThrow();
    }

    protected void assertPersistedVentaToMatchAllProperties(Venta expectedVenta) {
        assertVentaAllPropertiesEquals(expectedVenta, getPersistedVenta(expectedVenta));
    }

    protected void assertPersistedVentaToMatchUpdatableProperties(Venta expectedVenta) {
        assertVentaAllUpdatablePropertiesEquals(expectedVenta, getPersistedVenta(expectedVenta));
    }
}
