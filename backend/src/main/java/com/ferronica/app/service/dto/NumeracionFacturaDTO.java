package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.NumeracionFactura} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class NumeracionFacturaDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 10)
    private String serie;

    @NotNull
    private Long correlativoActual;

    private Boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public Long getCorrelativoActual() {
        return correlativoActual;
    }

    public void setCorrelativoActual(Long correlativoActual) {
        this.correlativoActual = correlativoActual;
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
        if (!(o instanceof NumeracionFacturaDTO)) {
            return false;
        }

        NumeracionFacturaDTO numeracionFacturaDTO = (NumeracionFacturaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, numeracionFacturaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NumeracionFacturaDTO{" +
            "id=" + getId() +
            ", serie='" + getSerie() + "'" +
            ", correlativoActual=" + getCorrelativoActual() +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}
