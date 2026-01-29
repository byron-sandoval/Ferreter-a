package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Proveedor;
import com.ferronica.app.repository.ProveedorRepository;
import com.ferronica.app.service.ProveedorService;
import com.ferronica.app.service.dto.ProveedorDTO;
import com.ferronica.app.service.mapper.ProveedorMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.Proveedor}.
 */
@Service
@Transactional
public class ProveedorServiceImpl implements ProveedorService {

    private static final Logger LOG = LoggerFactory.getLogger(ProveedorServiceImpl.class);

    private final ProveedorRepository proveedorRepository;

    private final ProveedorMapper proveedorMapper;

    public ProveedorServiceImpl(ProveedorRepository proveedorRepository, ProveedorMapper proveedorMapper) {
        this.proveedorRepository = proveedorRepository;
        this.proveedorMapper = proveedorMapper;
    }

    @Override
    public ProveedorDTO save(ProveedorDTO proveedorDTO) {
        LOG.debug("Request to save Proveedor : {}", proveedorDTO);
        Proveedor proveedor = proveedorMapper.toEntity(proveedorDTO);
        proveedor = proveedorRepository.save(proveedor);
        return proveedorMapper.toDto(proveedor);
    }

    @Override
    public ProveedorDTO update(ProveedorDTO proveedorDTO) {
        LOG.debug("Request to update Proveedor : {}", proveedorDTO);
        Proveedor proveedor = proveedorMapper.toEntity(proveedorDTO);
        proveedor = proveedorRepository.save(proveedor);
        return proveedorMapper.toDto(proveedor);
    }

    @Override
    public Optional<ProveedorDTO> partialUpdate(ProveedorDTO proveedorDTO) {
        LOG.debug("Request to partially update Proveedor : {}", proveedorDTO);

        return proveedorRepository
                .findById(proveedorDTO.getId())
                .map(existingProveedor -> {
                    proveedorMapper.partialUpdate(existingProveedor, proveedorDTO);

                    return existingProveedor;
                })
                .map(proveedorRepository::save)
                .map(proveedorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProveedorDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Proveedors");
        return proveedorRepository.findAll(pageable).map(proveedorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProveedorDTO> findOne(Long id) {
        LOG.debug("Request to get Proveedor : {}", id);
        return proveedorRepository.findById(id).map(proveedorMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Proveedor (Logical) : {}", id);
        proveedorRepository.findById(id).ifPresent(proveedor -> {
            proveedor.setActivo(false);
            proveedorRepository.save(proveedor);
        });
    }
}
