package com.ferronica.app.service.dto;

import com.ferronica.app.domain.enumeration.MetodoPagoEnum;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Venta} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class VentaDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant fecha;

    @NotNull
    private Long noFactura;

    @NotNull
    private BigDecimal subtotal;

    @NotNull
    private BigDecimal iva;

    @NotNull
    private BigDecimal total;

    private BigDecimal totalEnMonedaBase;

    @NotNull
    private MetodoPagoEnum metodoPago;

    private String stripeId;

    @NotNull
    private Boolean esContado;

    private BigDecimal tipoCambioVenta;

    private Boolean anulada;

    private ClienteDTO cliente;

    private VendedorDTO vendedor;

    private MonedaDTO moneda;

    private NumeracionFacturaDTO numeracion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFecha() {
        return fecha;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public Long getNoFactura() {
        return noFactura;
    }

    public void setNoFactura(Long noFactura) {
        this.noFactura = noFactura;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getIva() {
        return iva;
    }

    public void setIva(BigDecimal iva) {
        this.iva = iva;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getTotalEnMonedaBase() {
        return totalEnMonedaBase;
    }

    public void setTotalEnMonedaBase(BigDecimal totalEnMonedaBase) {
        this.totalEnMonedaBase = totalEnMonedaBase;
    }

    public MetodoPagoEnum getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPagoEnum metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getStripeId() {
        return stripeId;
    }

    public void setStripeId(String stripeId) {
        this.stripeId = stripeId;
    }

    public Boolean getEsContado() {
        return esContado;
    }

    public void setEsContado(Boolean esContado) {
        this.esContado = esContado;
    }

    public BigDecimal getTipoCambioVenta() {
        return tipoCambioVenta;
    }

    public void setTipoCambioVenta(BigDecimal tipoCambioVenta) {
        this.tipoCambioVenta = tipoCambioVenta;
    }

    public Boolean getAnulada() {
        return anulada;
    }

    public void setAnulada(Boolean anulada) {
        this.anulada = anulada;
    }

    public ClienteDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteDTO cliente) {
        this.cliente = cliente;
    }

    public VendedorDTO getVendedor() {
        return vendedor;
    }

    public void setVendedor(VendedorDTO vendedor) {
        this.vendedor = vendedor;
    }

    public MonedaDTO getMoneda() {
        return moneda;
    }

    public void setMoneda(MonedaDTO moneda) {
        this.moneda = moneda;
    }

    public NumeracionFacturaDTO getNumeracion() {
        return numeracion;
    }

    public void setNumeracion(NumeracionFacturaDTO numeracion) {
        this.numeracion = numeracion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VentaDTO)) {
            return false;
        }

        VentaDTO ventaDTO = (VentaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, ventaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VentaDTO{" +
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
            ", cliente=" + getCliente() +
            ", vendedor=" + getVendedor() +
            ", moneda=" + getMoneda() +
            ", numeracion=" + getNumeracion() +
            "}";
    }
}
