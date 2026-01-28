package com.ferronica.app.service.impl;

import com.ferronica.app.domain.NumeracionFactura;
import com.ferronica.app.repository.NumeracionFacturaRepository;
import com.ferronica.app.service.NumeracionFacturaService;
import com.ferronica.app.service.dto.NumeracionFacturaDTO;
import com.ferronica.app.service.mapper.NumeracionFacturaMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.NumeracionFactura}.
 */
@Service
@Transactional
public class NumeracionFacturaServiceImpl implements NumeracionFacturaService {

    private static final Logger LOG = LoggerFactory.getLogger(NumeracionFacturaServiceImpl.class);

    private final NumeracionFacturaRepository numeracionFacturaRepository;

    private final NumeracionFacturaMapper numeracionFacturaMapper;

    public NumeracionFacturaServiceImpl(
        NumeracionFacturaRepository numeracionFacturaRepository,
        NumeracionFacturaMapper numeracionFacturaMapper
    ) {
        this.numeracionFacturaRepository = numeracionFacturaRepository;
        this.numeracionFacturaMapper = numeracionFacturaMapper;
    }

    @Override
    public NumeracionFacturaDTO save(NumeracionFacturaDTO numeracionFacturaDTO) {
        LOG.debug("Request to save NumeracionFactura : {}", numeracionFacturaDTO);
        NumeracionFactura numeracionFactura = numeracionFacturaMapper.toEntity(numeracionFacturaDTO);
        numeracionFactura = numeracionFacturaRepository.save(numeracionFactura);
        return numeracionFacturaMapper.toDto(numeracionFactura);
    }

    @Override
    public NumeracionFacturaDTO update(NumeracionFacturaDTO numeracionFacturaDTO) {
        LOG.debug("Request to update NumeracionFactura : {}", numeracionFacturaDTO);
        NumeracionFactura numeracionFactura = numeracionFacturaMapper.toEntity(numeracionFacturaDTO);
        numeracionFactura = numeracionFacturaRepository.save(numeracionFactura);
        return numeracionFacturaMapper.toDto(numeracionFactura);
    }

    @Override
    public Optional<NumeracionFacturaDTO> partialUpdate(NumeracionFacturaDTO numeracionFacturaDTO) {
        LOG.debug("Request to partially update NumeracionFactura : {}", numeracionFacturaDTO);

        return numeracionFacturaRepository
            .findById(numeracionFacturaDTO.getId())
            .map(existingNumeracionFactura -> {
                numeracionFacturaMapper.partialUpdate(existingNumeracionFactura, numeracionFacturaDTO);

                return existingNumeracionFactura;
            })
            .map(numeracionFacturaRepository::save)
            .map(numeracionFacturaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NumeracionFacturaDTO> findAll() {
        LOG.debug("Request to get all NumeracionFacturas");
        return numeracionFacturaRepository
            .findAll()
            .stream()
            .map(numeracionFacturaMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NumeracionFacturaDTO> findOne(Long id) {
        LOG.debug("Request to get NumeracionFactura : {}", id);
        return numeracionFacturaRepository.findById(id).map(numeracionFacturaMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete NumeracionFactura : {}", id);
        numeracionFacturaRepository.deleteById(id);
    }
}
