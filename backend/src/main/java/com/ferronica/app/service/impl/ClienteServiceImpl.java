package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Cliente;
import com.ferronica.app.repository.ClienteRepository;
import com.ferronica.app.service.ClienteService;
import com.ferronica.app.service.dto.ClienteDTO;
import com.ferronica.app.service.mapper.ClienteMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.ferronica.app.domain.Cliente}.
 */
@Service
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private static final Logger LOG = LoggerFactory.getLogger(ClienteServiceImpl.class);

    private final ClienteRepository clienteRepository;

    private final ClienteMapper clienteMapper;

    public ClienteServiceImpl(ClienteRepository clienteRepository, ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
    }

    @Override
    public ClienteDTO save(ClienteDTO clienteDTO) {
        LOG.debug("Request to save Cliente : {}", clienteDTO);
        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente = clienteRepository.save(cliente);
        return clienteMapper.toDto(cliente);
    }

    @Override
    public ClienteDTO update(ClienteDTO clienteDTO) {
        LOG.debug("Request to update Cliente : {}", clienteDTO);
        Cliente cliente = clienteMapper.toEntity(clienteDTO);
        cliente = clienteRepository.save(cliente);
        return clienteMapper.toDto(cliente);
    }

    @Override
    public Optional<ClienteDTO> partialUpdate(ClienteDTO clienteDTO) {
        LOG.debug("Request to partially update Cliente : {}", clienteDTO);

        return clienteRepository
                .findById(clienteDTO.getId())
                .map(existingCliente -> {
                    clienteMapper.partialUpdate(existingCliente, clienteDTO);

                    return existingCliente;
                })
                .map(clienteRepository::save)
                .map(clienteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ClienteDTO> findOne(Long id) {
        LOG.debug("Request to get Cliente : {}", id);
        return clienteRepository.findById(id).map(clienteMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Cliente (Logical) : {}", id);
        clienteRepository.findById(id).ifPresent(cliente -> {
            cliente.setActivo(false);
            clienteRepository.save(cliente);
        });
    }
}
