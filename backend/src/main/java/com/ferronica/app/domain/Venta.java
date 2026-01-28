package com.ferronica.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ferronica.app.domain.enumeration.MetodoPagoEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A Venta.
 */
@Entity
@Table(name = "venta")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Venta implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private Instant fecha;

    @NotNull
    @Column(name = "no_factura", nullable = false, unique = true)
    private Long noFactura;

    @NotNull
    @Column(name = "subtotal", precision = 21, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @NotNull
    @Column(name = "iva", precision = 21, scale = 2, nullable = false)
    private BigDecimal iva;

    @NotNull
    @Column(name = "total", precision = 21, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "total_en_moneda_base", precision = 21, scale = 2)
    private BigDecimal totalEnMonedaBase;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPagoEnum metodoPago;

    @Column(name = "stripe_id")
    private String stripeId;

    @NotNull
    @Column(name = "es_contado", nullable = false)
    private Boolean esContado;

    @Column(name = "tipo_cambio_venta", precision = 21, scale = 2)
    private BigDecimal tipoCambioVenta;

    @Column(name = "anulada")
    private Boolean anulada;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "venta")
    @JsonIgnoreProperties(value = { "articulo", "venta" }, allowSetters = true)
    private Set<DetalleVenta> detalles = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    private Vendedor vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    private Moneda moneda;

    @ManyToOne(fetch = FetchType.LAZY)
    private NumeracionFactura numeracion;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Venta id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFecha() {
        return this.fecha;
    }

    public Venta fecha(Instant fecha) {
        this.setFecha(fecha);
        return this;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public Long getNoFactura() {
        return this.noFactura;
    }

    public Venta noFactura(Long noFactura) {
        this.setNoFactura(noFactura);
        return this;
    }

    public void setNoFactura(Long noFactura) {
        this.noFactura = noFactura;
    }

    public BigDecimal getSubtotal() {
        return this.subtotal;
    }

    public Venta subtotal(BigDecimal subtotal) {
        this.setSubtotal(subtotal);
        return this;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getIva() {
        return this.iva;
    }

    public Venta iva(BigDecimal iva) {
        this.setIva(iva);
        return this;
    }

    public void setIva(BigDecimal iva) {
        this.iva = iva;
    }

    public BigDecimal getTotal() {
        return this.total;
    }

    public Venta total(BigDecimal total) {
        this.setTotal(total);
        return this;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getTotalEnMonedaBase() {
        return this.totalEnMonedaBase;
    }

    public Venta totalEnMonedaBase(BigDecimal totalEnMonedaBase) {
        this.setTotalEnMonedaBase(totalEnMonedaBase);
        return this;
    }

    public void setTotalEnMonedaBase(BigDecimal totalEnMonedaBase) {
        this.totalEnMonedaBase = totalEnMonedaBase;
    }

    public MetodoPagoEnum getMetodoPago() {
        return this.metodoPago;
    }

    public Venta metodoPago(MetodoPagoEnum metodoPago) {
        this.setMetodoPago(metodoPago);
        return this;
    }

    public void setMetodoPago(MetodoPagoEnum metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getStripeId() {
        return this.stripeId;
    }

    public Venta stripeId(String stripeId) {
        this.setStripeId(stripeId);
        return this;
    }

    public void setStripeId(String stripeId) {
        this.stripeId = stripeId;
    }

    public Boolean getEsContado() {
        return this.esContado;
    }

    public Venta esContado(Boolean esContado) {
        this.setEsContado(esContado);
        return this;
    }

    public void setEsContado(Boolean esContado) {
        this.esContado = esContado;
    }

    public BigDecimal getTipoCambioVenta() {
        return this.tipoCambioVenta;
    }

    public Venta tipoCambioVenta(BigDecimal tipoCambioVenta) {
        this.setTipoCambioVenta(tipoCambioVenta);
        return this;
    }

    public void setTipoCambioVenta(BigDecimal tipoCambioVenta) {
        this.tipoCambioVenta = tipoCambioVenta;
    }

    public Boolean getAnulada() {
        return this.anulada;
    }

    public Venta anulada(Boolean anulada) {
        this.setAnulada(anulada);
        return this;
    }

    public void setAnulada(Boolean anulada) {
        this.anulada = anulada;
    }

    public Set<DetalleVenta> getDetalles() {
        return this.detalles;
    }

    public void setDetalles(Set<DetalleVenta> detalleVentas) {
        if (this.detalles != null) {
            this.detalles.forEach(i -> i.setVenta(null));
        }
        if (detalleVentas != null) {
            detalleVentas.forEach(i -> i.setVenta(this));
        }
        this.detalles = detalleVentas;
    }

    public Venta detalles(Set<DetalleVenta> detalleVentas) {
        this.setDetalles(detalleVentas);
        return this;
    }

    public Venta addDetalles(DetalleVenta detalleVenta) {
        this.detalles.add(detalleVenta);
        detalleVenta.setVenta(this);
        return this;
    }

    public Venta removeDetalles(DetalleVenta detalleVenta) {
        this.detalles.remove(detalleVenta);
        detalleVenta.setVenta(null);
        return this;
    }

    public Cliente getCliente() {
        return this.cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Venta cliente(Cliente cliente) {
        this.setCliente(cliente);
        return this;
    }

    public Vendedor getVendedor() {
        return this.vendedor;
    }

    public void setVendedor(Vendedor vendedor) {
        this.vendedor = vendedor;
    }

    public Venta vendedor(Vendedor vendedor) {
        this.setVendedor(vendedor);
        return this;
    }

    public Moneda getMoneda() {
        return this.moneda;
    }

    public void setMoneda(Moneda moneda) {
        this.moneda = moneda;
    }

    public Venta moneda(Moneda moneda) {
        this.setMoneda(moneda);
        return this;
    }

    public NumeracionFactura getNumeracion() {
        return this.numeracion;
    }

    public void setNumeracion(NumeracionFactura numeracionFactura) {
        this.numeracion = numeracionFactura;
    }

    public Venta numeracion(NumeracionFactura numeracionFactura) {
        this.setNumeracion(numeracionFactura);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Venta)) {
            return false;
        }
        return getId() != null && getId().equals(((Venta) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Venta{" +
            "id=" + getId() +
            ", fecha='" + getFecha() + "'" +
            ", noFactura=" + getNoFactura() +
            ", subtotal=" + getSubtotal() +
            ", iva=" + getIva() +
            ", total=" + getTotal() +
            ", totalEnMonedaBase=" + getTotalEnMonedaBase() +
            ", metodoPago='" + getMetodoPago() + "'" +
            ", stripeId='" + getStripeId() + "'" +
            ", esContado='" + getEsContado() + "'" +
            ", tipoCambioVenta=" + getTipoCambioVenta() +
            ", anulada='" + getAnulada() + "'" +
            "}";
    }
}
