package com.ferronica.app.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Articulo} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ArticuloDTO implements Serializable {

    private Long id;

    @NotNull
    private String codigo;

    @NotNull
    @Size(max = 50)
    private String nombre;

    @Size(max = 150)
    private String descripcion;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal existencia;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal existenciaMinima;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal precio;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal costo;

    @Lob
    private byte[] imagen;

    private String imagenContentType;

    private Boolean activo;

    private CategoriaDTO categoria;

    private UnidadMedidaDTO unidadMedida;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getExistencia() {
        return existencia;
    }

    public void setExistencia(BigDecimal existencia) {
        this.existencia = existencia;
    }

    public BigDecimal getExistenciaMinima() {
        return existenciaMinima;
    }

    public void setExistenciaMinima(BigDecimal existenciaMinima) {
        this.existenciaMinima = existenciaMinima;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public byte[] getImagen() {
        return imagen;
    }

    public void setImagen(byte[] imagen) {
        this.imagen = imagen;
    }

    public String getImagenContentType() {
        return imagenContentType;
    }

    public void setImagenContentType(String imagenContentType) {
        this.imagenContentType = imagenContentType;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public CategoriaDTO getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaDTO categoria) {
        this.categoria = categoria;
    }

    public UnidadMedidaDTO getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(UnidadMedidaDTO unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ArticuloDTO)) {
            return false;
        }

        ArticuloDTO articuloDTO = (ArticuloDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, articuloDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ArticuloDTO{" +
            "id=" + getId() +
            ", codigo='" + getCodigo() + "'" +
            ", nombre='" + getNombre() + "'" +
            ", descripcion='" + getDescripcion() + "'" +
            ", existencia=" + getExistencia() +
            ", existenciaMinima=" + getExistenciaMinima() +
            ", precio=" + getPrecio() +
            ", costo=" + getCosto() +
            ", imagen='" + getImagen() + "'" +
            ", activo='" + getActivo() + "'" +
            ", categoria=" + getCategoria() +
            ", unidadMedida=" + getUnidadMedida() +
            "}";
    }
}
