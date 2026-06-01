package com.siglu.service;

import com.siglu.dto.TipoDocumentoResponse;
import com.siglu.entity.TipoDocumento;
import com.siglu.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoDocumentoService {
    
    private final TipoDocumentoRepository tipoDocumentoRepository;
    
    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> getAllTiposDocumento() {
        return tipoDocumentoRepository.findByOrderBySeccionAscOrdenAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> getTiposDocumentoBySeccion(String seccion) {
        return tipoDocumentoRepository.findBySeccionOrderByOrdenAsc(seccion)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    private TipoDocumentoResponse mapToResponse(TipoDocumento tipo) {
        return new TipoDocumentoResponse(
            tipo.getId(),
            tipo.getNombre(),
            tipo.getCodigo(),
            tipo.getSeccion(),
            tipo.getOrden()
        );
    }
}
