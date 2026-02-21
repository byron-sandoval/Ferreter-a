package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.CierreCaja} entity.
 */
public class CierreCajaDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant fecha;

    @NotNull
    private BigDecimal montoApertura;

    @NotNull
    private BigDecimal montoVentasEfectivo;

    @NotNull
    private BigDecimal montoVentasTarjeta;

    @NotNull
    private BigDecimal montoVentasTransferencia;

    @NotNull
    private BigDecimal montoDevoluciones;

    @NotNull
    private BigDecimal totalVentasBrutas;

    @NotNull
    private BigDecimal montoEsperado;

    @NotNull
    private BigDecimal montoFisico;

    @NotNull
    private BigDecimal montoSiguienteCaja;

    @NotNull
    private BigDecimal diferencia;

    private String observaciones;

    private UsuarioDTO usuario;

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

    public BigDecimal getMontoApertura() {
        return montoApertura;
    }

    public void setMontoApertura(BigDecimal montoApertura) {
        this.montoApertura = montoApertura;
    }

    public BigDecimal getMontoVentasEfectivo() {
        return montoVentasEfectivo;
    }

    public void setMontoVentasEfectivo(BigDecimal montoVentasEfectivo) {
        this.montoVentasEfectivo = montoVentasEfectivo;
    }

    public BigDecimal getMontoVentasTarjeta() {
        return montoVentasTarjeta;
    }

    public void setMontoVentasTarjeta(BigDecimal montoVentasTarjeta) {
        this.montoVentasTarjeta = montoVentasTarjeta;
    }

    public BigDecimal getMontoVentasTransferencia() {
        return montoVentasTransferencia;
    }

    public void setMontoVentasTransferencia(BigDecimal montoVentasTransferencia) {
        this.montoVentasTransferencia = montoVentasTransferencia;
    }

    public BigDecimal getMontoDevoluciones() {
        return montoDevoluciones;
    }

    public void setMontoDevoluciones(BigDecimal montoDevoluciones) {
        this.montoDevoluciones = montoDevoluciones;
    }

    public BigDecimal getTotalVentasBrutas() {
        return totalVentasBrutas;
    }

    public void setTotalVentasBrutas(BigDecimal totalVentasBrutas) {
        this.totalVentasBrutas = totalVentasBrutas;
    }

    public BigDecimal getMontoEsperado() {
        return montoEsperado;
    }

    public void setMontoEsperado(BigDecimal montoEsperado) {
        this.montoEsperado = montoEsperado;
    }

    public BigDecimal getMontoFisico() {
        return montoFisico;
    }

    public void setMontoFisico(BigDecimal montoFisico) {
        this.montoFisico = montoFisico;
    }

    public BigDecimal getMontoSiguienteCaja() {
        return montoSiguienteCaja;
    }

    public void setMontoSiguienteCaja(BigDecimal montoSiguienteCaja) {
        this.montoSiguienteCaja = montoSiguienteCaja;
    }

    public BigDecimal getDiferencia() {
        return diferencia;
    }

    public void setDiferencia(BigDecimal diferencia) {
        this.diferencia = diferencia;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public UsuarioDTO getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioDTO usuario) {
        this.usuario = usuario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CierreCajaDTO)) {
            return false;
        }

        CierreCajaDTO cierreCajaDTO = (CierreCajaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, cierreCajaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    @Override
    public String toString() {
        return "CierreCajaDTO{" +
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
                ", usuario=" + getUsuario() +
                "}";
    }
}
