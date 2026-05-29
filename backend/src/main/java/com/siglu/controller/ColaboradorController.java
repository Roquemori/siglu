package com.siglu.controller;

import com.siglu.dto.ApiResponse;
import com.siglu.dto.ColaboradorRequest;
import com.siglu.dto.ColaboradorResponse;
import com.siglu.dto.PageResponse;
import com.siglu.service.ColaboradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/colaboradores")
@RequiredArgsConstructor
public class ColaboradorController {
    
    private final ColaboradorService colaboradorService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<ColaboradorResponse>> create(@Valid @RequestBody ColaboradorRequest request) {
        ColaboradorResponse response = colaboradorService.create(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Colaborador registrado exitosamente"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<ColaboradorResponse>> update(
            @PathVariable Long id, 
            @Valid @RequestBody ColaboradorRequest request) {
        ColaboradorResponse response = colaboradorService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Colaborador actualizado exitosamente"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        colaboradorService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Colaborador desactivado exitosamente"));
    }
    
    @PatchMapping("/{id}/reactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<ColaboradorResponse>> reactivar(@PathVariable Long id) {
        colaboradorService.reactivar(id);
        ColaboradorResponse response = colaboradorService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Colaborador reactivado exitosamente"));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<PageResponse<ColaboradorResponse>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean activo) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        PageResponse<ColaboradorResponse> response = colaboradorService.findAllWithFilters(search, activo, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<ColaboradorResponse>> findById(@PathVariable Long id) {
        ColaboradorResponse response = colaboradorService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<ColaboradorResponse>> findByDni(@PathVariable String dni) {
        ColaboradorResponse response = colaboradorService.findByDni(dni);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
