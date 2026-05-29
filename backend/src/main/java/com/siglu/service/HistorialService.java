package com.siglu.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siglu.dto.HistorialCambioResponse;
import com.siglu.dto.PageResponse;
import com.siglu.entity.HistorialCambio;
import com.siglu.repository.HistorialCambioRepository;
import com.siglu.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HistorialService {
    
    private final HistorialCambioRepository historialCambioRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;
    
    @Transactional(readOnly = true)
    public PageResponse<HistorialCambioResponse> getHistorialByTablaAndRegistroId(
            String tabla, Long registroId, Pageable pageable) {
        
        Page<HistorialCambio> page = historialCambioRepository
            .findByTablaAfectadaAndRegistroIdOrderByFechaCambioDesc(tabla, registroId, pageable);
        
        return mapToPageResponse(page);
    }
    
    private HistorialCambioResponse mapToResponse(HistorialCambio entity) {
        String nombreUsuario = usuarioRepository.findById(entity.getUsuarioId())
            .map(u -> u.getNombreUsuario())
            .orElse("Sistema");
        
        return new HistorialCambioResponse(
            entity.getId(),
            entity.getTablaAfectada(),
            entity.getRegistroId(),
            entity.getUsuarioId(),
            nombreUsuario,
            entity.getAccion(),
            entity.getValorAnterior(),
            entity.getValorNuevo(),
            entity.getFechaCambio(),
            entity.getIpOrigen()
        );
    }
    
    private PageResponse<HistorialCambioResponse> mapToPageResponse(Page<HistorialCambio> page) {
        return new PageResponse<>(
            page.getContent().stream().map(this::mapToResponse).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}
