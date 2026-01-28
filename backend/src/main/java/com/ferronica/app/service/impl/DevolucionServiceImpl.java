package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Devolucion;
import com.ferronica.app.repository.DevolucionRepository;
import com.ferronica.app.service.DevolucionService;
import com.ferronica.app.service.dto.DevolucionDTO;
import com.ferronica.app.service.mapper.DevolucionMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Devolucion}.
 */
@Service
@Transactional
public class DevolucionServiceImpl implements DevolucionService {

    private static final Logger LOG = LoggerFactory.getLogger(DevolucionServiceImpl.class);

    private final DevolucionRepository devolucionRepository;

    private final DevolucionMapper devolucionMapper;

    public DevolucionServiceImpl(DevolucionRepository devolucionRepository, DevolucionMapper devolucionMapper) {
        this.devolucionRepository = devolucionRepository;
        this.devolucionMapper = devolucionMapper;
    }

    @Override
    public DevolucionDTO save(DevolucionDTO devolucionDTO) {
        LOG.debug("Request to save Devolucion : {}", devolucionDTO);
        Devolucion devolucion = devolucionMapper.toEntity(devolucionDTO);
        devolucion = devolucionRepository.save(devolucion);
        return devolucionMapper.toDto(devolucion);
    }

    @Override
    public DevolucionDTO update(DevolucionDTO devolucionDTO) {
        LOG.debug("Request to update Devolucion : {}", devolucionDTO);
        Devolucion devolucion = devolucionMapper.toEntity(devolucionDTO);
        devolucion = devolucionRepository.save(devolucion);
        return devolucionMapper.toDto(devolucion);
    }

    @Override
    public Optional<DevolucionDTO> partialUpdate(DevolucionDTO devolucionDTO) {
        LOG.debug("Request to partially update Devolucion : {}", devolucionDTO);

        return devolucionRepository
            .findById(devolucionDTO.getId())
            .map(existingDevolucion -> {
                devolucionMapper.partialUpdate(existingDevolucion, devolucionDTO);

                return existingDevolucion;
            })
            .map(devolucionRepository::save)
            .map(devolucionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevolucionDTO> findAll() {
        LOG.debug("Request to get all Devolucions");
        return devolucionRepository.findAll().stream().map(devolucionMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DevolucionDTO> findOne(Long id) {
        LOG.debug("Request to get Devolucion : {}", id);
        return devolucionRepository.findById(id).map(devolucionMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Devolucion : {}", id);
        devolucionRepository.deleteById(id);
    }
}
