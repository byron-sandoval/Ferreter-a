package com.ferronica.app.web.rest;

import static com.ferronica.app.domain.DetalleVentaAsserts.*;
import static com.ferronica.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.ferronica.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferronica.app.IntegrationTest;
import com.ferronica.app.domain.DetalleVenta;
import com.ferronica.app.repository.DetalleVentaRepository;
import com.ferronica.app.service.dto.DetalleVentaDTO;
import com.ferronica.app.service.mapper.DetalleVentaMapper;
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
 * Integration tests for the {@link DetalleVentaResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DetalleVentaResourceIT {

    private static final BigDecimal DEFAULT_CANTIDAD = new BigDecimal(0);
    private static final BigDecimal UPDATED_CANTIDAD = new BigDecimal(1);

    private static final BigDecimal DEFAULT_PRECIO_VENTA = new BigDecimal(0);
    private static final BigDecimal UPDATED_PRECIO_VENTA = new BigDecimal(1);

    private static final BigDecimal DEFAULT_DESCUENTO = new BigDecimal(0);
    private static final BigDecimal UPDATED_DESCUENTO = new BigDecimal(1);

    private static final BigDecimal DEFAULT_MONTO = new BigDecimal(0);
    private static final BigDecimal UPDATED_MONTO = new BigDecimal(1);

    private static final String ENTITY_API_URL = "/api/detalle-ventas";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Autowired
    private DetalleVentaMapper detalleVentaMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDetalleVentaMockMvc;

    private DetalleVenta detalleVenta;

    private DetalleVenta insertedDetalleVenta;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DetalleVenta createEntity() {
        return new DetalleVenta()
            .cantidad(DEFAULT_CANTIDAD)
            .precioVenta(DEFAULT_PRECIO_VENTA)
            .descuento(DEFAULT_DESCUENTO)
            .monto(DEFAULT_MONTO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DetalleVenta createUpdatedEntity() {
        return new DetalleVenta()
            .cantidad(UPDATED_CANTIDAD)
            .precioVenta(UPDATED_PRECIO_VENTA)
            .descuento(UPDATED_DESCUENTO)
            .monto(UPDATED_MONTO);
    }

    @BeforeEach
    void initTest() {
        detalleVenta = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDetalleVenta != null) {
            detalleVentaRepository.delete(insertedDetalleVenta);
            insertedDetalleVenta = null;
        }
    }

    @Test
    @Transactional
    void createDetalleVenta() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);
        var returnedDetalleVentaDTO = om.readValue(
            restDetalleVentaMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DetalleVentaDTO.class
        );

        // Validate the DetalleVenta in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDetalleVenta = detalleVentaMapper.toEntity(returnedDetalleVentaDTO);
        assertDetalleVentaUpdatableFieldsEquals(returnedDetalleVenta, getPersistedDetalleVenta(returnedDetalleVenta));

        insertedDetalleVenta = returnedDetalleVenta;
    }

    @Test
    @Transactional
    void createDetalleVentaWithExistingId() throws Exception {
        // Create the DetalleVenta with an existing ID
        detalleVenta.setId(1L);
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDetalleVentaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCantidadIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleVenta.setCantidad(null);

        // Create the DetalleVenta, which fails.
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        restDetalleVentaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPrecioVentaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleVenta.setPrecioVenta(null);

        // Create the DetalleVenta, which fails.
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        restDetalleVentaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMontoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        detalleVenta.setMonto(null);

        // Create the DetalleVenta, which fails.
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        restDetalleVentaMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDetalleVentas() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        // Get all the detalleVentaList
        restDetalleVentaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(detalleVenta.getId().intValue())))
            .andExpect(jsonPath("$.[*].cantidad").value(hasItem(sameNumber(DEFAULT_CANTIDAD))))
            .andExpect(jsonPath("$.[*].precioVenta").value(hasItem(sameNumber(DEFAULT_PRECIO_VENTA))))
            .andExpect(jsonPath("$.[*].descuento").value(hasItem(sameNumber(DEFAULT_DESCUENTO))))
            .andExpect(jsonPath("$.[*].monto").value(hasItem(sameNumber(DEFAULT_MONTO))));
    }

    @Test
    @Transactional
    void getDetalleVenta() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        // Get the detalleVenta
        restDetalleVentaMockMvc
            .perform(get(ENTITY_API_URL_ID, detalleVenta.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(detalleVenta.getId().intValue()))
            .andExpect(jsonPath("$.cantidad").value(sameNumber(DEFAULT_CANTIDAD)))
            .andExpect(jsonPath("$.precioVenta").value(sameNumber(DEFAULT_PRECIO_VENTA)))
            .andExpect(jsonPath("$.descuento").value(sameNumber(DEFAULT_DESCUENTO)))
            .andExpect(jsonPath("$.monto").value(sameNumber(DEFAULT_MONTO)));
    }

    @Test
    @Transactional
    void getNonExistingDetalleVenta() throws Exception {
        // Get the detalleVenta
        restDetalleVentaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDetalleVenta() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleVenta
        DetalleVenta updatedDetalleVenta = detalleVentaRepository.findById(detalleVenta.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDetalleVenta are not directly saved in db
        em.detach(updatedDetalleVenta);
        updatedDetalleVenta.cantidad(UPDATED_CANTIDAD).precioVenta(UPDATED_PRECIO_VENTA).descuento(UPDATED_DESCUENTO).monto(UPDATED_MONTO);
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(updatedDetalleVenta);

        restDetalleVentaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, detalleVentaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isOk());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDetalleVentaToMatchAllProperties(updatedDetalleVenta);
    }

    @Test
    @Transactional
    void putNonExistingDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, detalleVentaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDetalleVentaWithPatch() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleVenta using partial update
        DetalleVenta partialUpdatedDetalleVenta = new DetalleVenta();
        partialUpdatedDetalleVenta.setId(detalleVenta.getId());

        partialUpdatedDetalleVenta.descuento(UPDATED_DESCUENTO).monto(UPDATED_MONTO);

        restDetalleVentaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDetalleVenta.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDetalleVenta))
            )
            .andExpect(status().isOk());

        // Validate the DetalleVenta in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDetalleVentaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDetalleVenta, detalleVenta),
            getPersistedDetalleVenta(detalleVenta)
        );
    }

    @Test
    @Transactional
    void fullUpdateDetalleVentaWithPatch() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the detalleVenta using partial update
        DetalleVenta partialUpdatedDetalleVenta = new DetalleVenta();
        partialUpdatedDetalleVenta.setId(detalleVenta.getId());

        partialUpdatedDetalleVenta
            .cantidad(UPDATED_CANTIDAD)
            .precioVenta(UPDATED_PRECIO_VENTA)
            .descuento(UPDATED_DESCUENTO)
            .monto(UPDATED_MONTO);

        restDetalleVentaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDetalleVenta.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDetalleVenta))
            )
            .andExpect(status().isOk());

        // Validate the DetalleVenta in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDetalleVentaUpdatableFieldsEquals(partialUpdatedDetalleVenta, getPersistedDetalleVenta(partialUpdatedDetalleVenta));
    }

    @Test
    @Transactional
    void patchNonExistingDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, detalleVentaDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDetalleVenta() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        detalleVenta.setId(longCount.incrementAndGet());

        // Create the DetalleVenta
        DetalleVentaDTO detalleVentaDTO = detalleVentaMapper.toDto(detalleVenta);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDetalleVentaMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(detalleVentaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DetalleVenta in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDetalleVenta() throws Exception {
        // Initialize the database
        insertedDetalleVenta = detalleVentaRepository.saveAndFlush(detalleVenta);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the detalleVenta
        restDetalleVentaMockMvc
            .perform(delete(ENTITY_API_URL_ID, detalleVenta.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return detalleVentaRepository.count();
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

    protected DetalleVenta getPersistedDetalleVenta(DetalleVenta detalleVenta) {
        return detalleVentaRepository.findById(detalleVenta.getId()).orElseThrow();
    }

    protected void assertPersistedDetalleVentaToMatchAllProperties(DetalleVenta expectedDetalleVenta) {
        assertDetalleVentaAllPropertiesEquals(expectedDetalleVenta, getPersistedDetalleVenta(expectedDetalleVenta));
    }

    protected void assertPersistedDetalleVentaToMatchUpdatableProperties(DetalleVenta expectedDetalleVenta) {
        assertDetalleVentaAllUpdatablePropertiesEquals(expectedDetalleVenta, getPersistedDetalleVenta(expectedDetalleVenta));
    }
}
