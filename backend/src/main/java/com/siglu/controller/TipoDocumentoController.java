package com.siglu.controller;

import com.siglu.dto.ApiResponse;
import com.siglu.dto.TipoDocumentoResponse;
import com.siglu.service.TipoDocumentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-documento")
@RequiredArgsConstructor
public class TipoDocumentoController {
    
    private final TipoDocumentoService tipoDocumentoService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<List<TipoDocumentoResponse>>> getAll() {
        List<TipoDocumentoResponse> response = tipoDocumentoService.getAllTiposDocumento();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/seccion/{seccion}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<List<TipoDocumentoResponse>>> getBySeccion(@PathVariable String seccion) {
        List<TipoDocumentoResponse> response = tipoDocumentoService.getTiposDocumentoBySeccion(seccion);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
