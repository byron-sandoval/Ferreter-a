package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Vendedor;
import com.ferronica.app.repository.VendedorRepository;
import com.ferronica.app.service.VendedorService;
import com.ferronica.app.service.dto.VendedorDTO;
import com.ferronica.app.service.mapper.VendedorMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.Vendedor}.
 */
@Service
@Transactional
public class VendedorServiceImpl implements VendedorService {

    private static final Logger LOG = LoggerFactory.getLogger(VendedorServiceImpl.class);

    private final VendedorRepository vendedorRepository;

    private final VendedorMapper vendedorMapper;

    public VendedorServiceImpl(VendedorRepository vendedorRepository, VendedorMapper vendedorMapper) {
        this.vendedorRepository = vendedorRepository;
        this.vendedorMapper = vendedorMapper;
    }

    @Override
    public VendedorDTO save(VendedorDTO vendedorDTO) {
        LOG.debug("Request to save Vendedor : {}", vendedorDTO);
        Vendedor vendedor = vendedorMapper.toEntity(vendedorDTO);
        vendedor = vendedorRepository.save(vendedor);
        return vendedorMapper.toDto(vendedor);
    }

    @Override
    public VendedorDTO update(VendedorDTO vendedorDTO) {
        LOG.debug("Request to update Vendedor : {}", vendedorDTO);
        Vendedor vendedor = vendedorMapper.toEntity(vendedorDTO);
        vendedor = vendedorRepository.save(vendedor);
        return vendedorMapper.toDto(vendedor);
    }

    @Override
    public Optional<VendedorDTO> partialUpdate(VendedorDTO vendedorDTO) {
        LOG.debug("Request to partially update Vendedor : {}", vendedorDTO);

        return vendedorRepository
                .findById(vendedorDTO.getId())
                .map(existingVendedor -> {
                    vendedorMapper.partialUpdate(existingVendedor, vendedorDTO);

                    return existingVendedor;
                })
                .map(vendedorRepository::save)
                .map(vendedorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VendedorDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Vendedors");
        return vendedorRepository.findAll(pageable).map(vendedorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<VendedorDTO> findOne(Long id) {
        LOG.debug("Request to get Vendedor : {}", id);
        return vendedorRepository.findById(id).map(vendedorMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Vendedor (Logical) : {}", id);
        vendedorRepository.findById(id).ifPresent(vendedor -> {
            vendedor.setActivo(false);
            vendedorRepository.save(vendedor);
        });
    }
}
