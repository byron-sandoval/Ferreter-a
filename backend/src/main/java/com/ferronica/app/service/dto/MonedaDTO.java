package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Moneda} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MonedaDTO implements Serializable {

    private Long id;

    @NotNull
    private String nombre;

    @NotNull
    private String simbolo;

    @NotNull
    private BigDecimal tipoCambio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    public BigDecimal getTipoCambio() {
        return tipoCambio;
    }

    public void setTipoCambio(BigDecimal tipoCambio) {
        this.tipoCambio = tipoCambio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MonedaDTO)) {
            return false;
        }

        MonedaDTO monedaDTO = (MonedaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, monedaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MonedaDTO{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", simbolo='" + getSimbolo() + "'" +
            ", tipoCambio=" + getTipoCambio() +
            "}";
    }
}
