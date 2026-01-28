package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.UnidadMedida} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UnidadMedidaDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String nombre;

    @Size(max = 10)
    private String simbolo;

    private Boolean activo;

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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UnidadMedidaDTO)) {
            return false;
        }

        UnidadMedidaDTO unidadMedidaDTO = (UnidadMedidaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, unidadMedidaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UnidadMedidaDTO{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", simbolo='" + getSimbolo() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
