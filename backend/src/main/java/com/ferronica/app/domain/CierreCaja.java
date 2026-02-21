package com.ferronica.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A CierreCaja.
 */
@Entity
@Table(name = "cierre_caja")
public class CierreCaja implements Serializable {

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
    @Column(name = "monto_apertura", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoApertura;

    @NotNull
    @Column(name = "monto_ventas_efectivo", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoVentasEfectivo;

    @NotNull
    @Column(name = "monto_ventas_tarjeta", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoVentasTarjeta;

    @NotNull
    @Column(name = "monto_ventas_transferencia", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoVentasTransferencia;

    @NotNull
    @Column(name = "monto_devoluciones", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoDevoluciones;

    @NotNull
    @Column(name = "total_ventas_brutas", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalVentasBrutas;

    @NotNull
    @Column(name = "monto_esperado", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoEsperado;

    @NotNull
    @Column(name = "monto_fisico", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoFisico;

    @NotNull
    @Column(name = "monto_siguiente_caja", precision = 21, scale = 2, nullable = false)
    private BigDecimal montoSiguienteCaja;

    @NotNull
    @Column(name = "diferencia", precision = 21, scale = 2, nullable = false)
    private BigDecimal diferencia;

    @Column(name = "observaciones")
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario usuario;

    // Getter and setters
    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFecha() {
        return this.fecha;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getMontoApertura() {
        return this.montoApertura;
    }

    public void setMontoApertura(BigDecimal montoApertura) {
        this.montoApertura = montoApertura;
    }

    public BigDecimal getMontoVentasEfectivo() {
        return this.montoVentasEfectivo;
    }

    public void setMontoVentasEfectivo(BigDecimal montoVentasEfectivo) {
        this.montoVentasEfectivo = montoVentasEfectivo;
    }

    public BigDecimal getMontoVentasTarjeta() {
        return this.montoVentasTarjeta;
    }

    public void setMontoVentasTarjeta(BigDecimal montoVentasTarjeta) {
        this.montoVentasTarjeta = montoVentasTarjeta;
    }

    public BigDecimal getMontoVentasTransferencia() {
        return this.montoVentasTransferencia;
    }

    public void setMontoVentasTransferencia(BigDecimal montoVentasTransferencia) {
        this.montoVentasTransferencia = montoVentasTransferencia;
    }

    public BigDecimal getMontoDevoluciones() {
        return this.montoDevoluciones;
    }

    public void setMontoDevoluciones(BigDecimal montoDevoluciones) {
        this.montoDevoluciones = montoDevoluciones;
    }

    public BigDecimal getTotalVentasBrutas() {
        return this.totalVentasBrutas;
    }

    public void setTotalVentasBrutas(BigDecimal totalVentasBrutas) {
        this.totalVentasBrutas = totalVentasBrutas;
    }

    public BigDecimal getMontoEsperado() {
        return this.montoEsperado;
    }

    public void setMontoEsperado(BigDecimal montoEsperado) {
        this.montoEsperado = montoEsperado;
    }

    public BigDecimal getMontoFisico() {
        return this.montoFisico;
    }

    public void setMontoFisico(BigDecimal montoFisico) {
        this.montoFisico = montoFisico;
    }

    public BigDecimal getMontoSiguienteCaja() {
        return this.montoSiguienteCaja;
    }

    public void setMontoSiguienteCaja(BigDecimal montoSiguienteCaja) {
        this.montoSiguienteCaja = montoSiguienteCaja;
    }

    public BigDecimal getDiferencia() {
        return this.diferencia;
    }

    public void setDiferencia(BigDecimal diferencia) {
        this.diferencia = diferencia;
    }

    public String getObservaciones() {
        return this.observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Usuario getUsuario() {
        return this.usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CierreCaja)) {
            return false;
        }
        return id != null && id.equals(((CierreCaja) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "CierreCaja{" +
                "id=" + getId() +
                ", fecha='" + getFecha() + "'" +
                ", montoApertura=" + getMontoApertura() +
                ", montoVentasEfectivo=" + getMontoVentasEfectivo() +
                ", montoVentasTarjeta=" + getMontoVentasTarjeta() +
                ", montoVentasTransferencia=" + getMontoVentasTransferencia() +
                ", montoDevoluciones=" + getMontoDevoluciones() +
                ", totalVentasBrutas=" + getTotalVentasBrutas() +
                ", montoEsperado=" + getMontoEsperado() +
                ", montoFisico=" + getMontoFisico() +
                ", montoSiguienteCaja=" + getMontoSiguienteCaja() +
                ", diferencia=" + getDiferencia() +
                ", observaciones='" + getObservaciones() + "'" +
                "}";
    }
}
