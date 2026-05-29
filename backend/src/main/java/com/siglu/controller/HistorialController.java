package com.siglu.controller;

import com.siglu.dto.ApiResponse;
import com.siglu.dto.HistorialCambioResponse;
import com.siglu.dto.PageResponse;
import com.siglu.service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialController {
    
    private final HistorialService historialService;
    
    @GetMapping("/{tabla}/{registroId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<PageResponse<HistorialCambioResponse>>> getHistorial(
            @PathVariable String tabla,
            @PathVariable Long registroId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCambio").descending());
        PageResponse<HistorialCambioResponse> response = historialService
            .getHistorialByTablaAndRegistroId(tabla, registroId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
