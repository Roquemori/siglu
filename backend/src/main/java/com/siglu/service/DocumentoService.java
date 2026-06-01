package com.siglu.service;

import com.siglu.dto.DocumentoResponse;
import com.siglu.dto.PageResponse;
import com.siglu.entity.Colaborador;
import com.siglu.entity.Documento;
import com.siglu.entity.TipoDocumento;
import com.siglu.entity.Usuario;
import com.siglu.exception.ResourceNotFoundException;
import com.siglu.repository.ColaboradorRepository;
import com.siglu.repository.DocumentoRepository;
import com.siglu.repository.TipoDocumentoRepository;
import com.siglu.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentoService {
    
    private final DocumentoRepository documentoRepository;
    private final ColaboradorRepository colaboradorRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final UsuarioRepository usuarioRepository;
    
    @Value("${documentos.upload-dir:/app/uploads}")
    private String uploadDir;
    
    @Transactional
    public DocumentoResponse uploadDocumento(
            MultipartFile file,
            Long colaboradorId,
            Long tipoDocumentoId,
            Long usuarioId) throws IOException {
        
        log.info("Iniciando upload - Colaborador: {}, Tipo: {}", colaboradorId, tipoDocumentoId);
        
        Colaborador colaborador = colaboradorRepository.findById(colaboradorId)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado"));
        
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Directorio creado: {}", uploadPath.toAbsolutePath());
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(fileName);
        
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Archivo guardado: {}", filePath.toAbsolutePath());
        
        Documento documento = new Documento();
        documento.setColaborador(colaborador);
        documento.setTipoDocumento(tipoDocumento);
        documento.setNombreArchivo(originalFilename);
        documento.setRutaArchivo(filePath.toString());
        documento.setTamanoBytes(file.getSize());
        documento.setMimeType(file.getContentType());
        documento.setUsuarioSubida(usuario);
        documento.setActivo(true);
        
        Documento saved = documentoRepository.save(documento);
        log.info("Documento registrado en BD con ID: {}", saved.getId());
        
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public Resource descargarDocumento(Long documentoId) throws IOException {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        
        Path filePath = Paths.get(documento.getRutaArchivo());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists() && !resource.isReadable()) {
            throw new ResourceNotFoundException("Archivo no encontrado en el servidor: " + filePath);
        }
        
        return resource;
    }
    
    @Transactional(readOnly = true)
    public PageResponse<DocumentoResponse> getDocumentosByColaborador(Long colaboradorId, Pageable pageable) {
        Page<Documento> page = documentoRepository.findByColaboradorIdAndActivoTrue(colaboradorId, pageable);
        List<DocumentoResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
    
    @Transactional(readOnly = true)
    public List<DocumentoResponse> getAllDocumentosByColaborador(Long colaboradorId) {
        List<Documento> documentos = documentoRepository.findByColaboradorIdAndActivoTrue(colaboradorId);
        return documentos.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void eliminarDocumento(Long documentoId) {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado"));
        
        documento.setActivo(false);
        documentoRepository.save(documento);
        log.info("Documento eliminado lógicamente: {}", documentoId);
    }
    
    @Transactional(readOnly = true)
    public long countDocumentosByColaborador(Long colaboradorId) {
        return documentoRepository.countByColaboradorIdAndActivoTrue(colaboradorId);
    }
    
    private DocumentoResponse mapToResponse(Documento documento) {
        return new DocumentoResponse(
            documento.getId(),
            documento.getColaborador().getId(),
            documento.getColaborador().getNombres() + " " + documento.getColaborador().getApellidoPaterno(),
            documento.getTipoDocumento().getId(),
            documento.getTipoDocumento().getNombre(),
            documento.getTipoDocumento().getSeccion(),
            documento.getNombreArchivo(),
            documento.getTamanoBytes(),
            documento.getMimeType(),
            documento.getCreatedAt(),
            documento.getUsuarioSubida().getNombreUsuario(),
            documento.getActivo()
        );
    }
}
