package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Moneda;
import com.ferronica.app.repository.MonedaRepository;
import com.ferronica.app.service.MonedaService;
import com.ferronica.app.service.dto.MonedaDTO;
import com.ferronica.app.service.mapper.MonedaMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Moneda}.
 */
@Service
@Transactional
public class MonedaServiceImpl implements MonedaService {

    private static final Logger LOG = LoggerFactory.getLogger(MonedaServiceImpl.class);

    private final MonedaRepository monedaRepository;

    private final MonedaMapper monedaMapper;

    public MonedaServiceImpl(MonedaRepository monedaRepository, MonedaMapper monedaMapper) {
        this.monedaRepository = monedaRepository;
        this.monedaMapper = monedaMapper;
    }

    @Override
    public MonedaDTO save(MonedaDTO monedaDTO) {
        LOG.debug("Request to save Moneda : {}", monedaDTO);
        Moneda moneda = monedaMapper.toEntity(monedaDTO);
        moneda = monedaRepository.save(moneda);
        return monedaMapper.toDto(moneda);
    }

    @Override
    public MonedaDTO update(MonedaDTO monedaDTO) {
        LOG.debug("Request to update Moneda : {}", monedaDTO);
        Moneda moneda = monedaMapper.toEntity(monedaDTO);
        moneda = monedaRepository.save(moneda);
        return monedaMapper.toDto(moneda);
    }

    @Override
    public Optional<MonedaDTO> partialUpdate(MonedaDTO monedaDTO) {
        LOG.debug("Request to partially update Moneda : {}", monedaDTO);

        return monedaRepository
            .findById(monedaDTO.getId())
            .map(existingMoneda -> {
                monedaMapper.partialUpdate(existingMoneda, monedaDTO);

                return existingMoneda;
            })
            .map(monedaRepository::save)
            .map(monedaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonedaDTO> findAll() {
        LOG.debug("Request to get all Monedas");
        return monedaRepository.findAll().stream().map(monedaMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MonedaDTO> findOne(Long id) {
        LOG.debug("Request to get Moneda : {}", id);
        return monedaRepository.findById(id).map(monedaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Moneda : {}", id);
        monedaRepository.deleteById(id);
    }
}
