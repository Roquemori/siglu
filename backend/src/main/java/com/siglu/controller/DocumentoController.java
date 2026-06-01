package com.siglu.controller;

import com.siglu.dto.ApiResponse;
import com.siglu.dto.DocumentoResponse;
import com.siglu.dto.PageResponse;
import com.siglu.service.DocumentoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/documentos")
@RequiredArgsConstructor
public class DocumentoController {
    
    private final DocumentoService documentoService;
    
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<DocumentoResponse>> uploadDocumento(
            @RequestParam("file") MultipartFile file,
            @RequestParam("colaboradorId") Long colaboradorId,
            @RequestParam("tipoDocumentoId") Long tipoDocumentoId) throws IOException {
        
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo no puede superar los 10MB", 400));
        }
        
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
            !contentType.equals("image/jpeg") && 
            !contentType.equals("image/png") &&
            !contentType.equals("application/msword") &&
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Tipo de archivo no permitido", 400));
        }
        
        Long usuarioId = 1L;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                usuarioId = 1L;
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener el usuario actual, usando ID=1");
        }
        
        DocumentoResponse response = documentoService.uploadDocumento(file, colaboradorId, tipoDocumentoId, usuarioId);
        return ResponseEntity.ok(ApiResponse.success(response, "Documento subido exitosamente"));
    }
    
    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<Resource> descargarDocumento(@PathVariable Long id) throws IOException {
        Resource resource = documentoService.descargarDocumento(id);
        
        String filename = resource.getFilename();
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
    
    @GetMapping("/colaborador/{colaboradorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<PageResponse<DocumentoResponse>>> getDocumentosByColaborador(
            @PathVariable Long colaboradorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<DocumentoResponse> response = documentoService.getDocumentosByColaborador(colaboradorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/colaborador/{colaboradorId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<List<DocumentoResponse>>> getAllDocumentosByColaborador(
            @PathVariable Long colaboradorId) {
        
        List<DocumentoResponse> response = documentoService.getAllDocumentosByColaborador(colaboradorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarDocumento(@PathVariable Long id) {
        documentoService.eliminarDocumento(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Documento eliminado exitosamente"));
    }
    
    @GetMapping("/colaborador/{colaboradorId}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONSULTA')")
    public ResponseEntity<ApiResponse<Long>> countDocumentosByColaborador(@PathVariable Long colaboradorId) {
        long count = documentoService.countDocumentosByColaborador(colaboradorId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
