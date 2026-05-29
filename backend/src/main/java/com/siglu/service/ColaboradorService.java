package com.siglu.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siglu.dto.ColaboradorRequest;
import com.siglu.dto.ColaboradorResponse;
import com.siglu.dto.PageResponse;
import com.siglu.entity.Colaborador;
import com.siglu.entity.HistorialCambio;
import com.siglu.exception.ResourceAlreadyExistsException;
import com.siglu.exception.ResourceNotFoundException;
import com.siglu.repository.ColaboradorRepository;
import com.siglu.repository.HistorialCambioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ColaboradorService {
    
    private final ColaboradorRepository colaboradorRepository;
    private final HistorialCambioRepository historialCambioRepository;
    private final ObjectMapper objectMapper;
    
    @Transactional
    public ColaboradorResponse create(ColaboradorRequest request) {
        log.debug("Creando colaborador: {}", request);
        
        if (colaboradorRepository.existsByDni(request.dni())) {
            throw new ResourceAlreadyExistsException("Ya existe un colaborador con DNI: " + request.dni());
        }
        
        Colaborador colaborador = mapToEntity(request);
        colaborador.setActivo(true);
        
        Colaborador saved = colaboradorRepository.save(colaborador);
        log.debug("Colaborador guardado con ID: {}", saved.getId());
        
        registrarHistorial("colaborador", null, saved, "INSERT");
        
        return mapToResponse(saved);
    }
    
    @Transactional
    public ColaboradorResponse update(Long id, ColaboradorRequest request) {
        Colaborador existing = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado con ID: " + id));
        
        Colaborador oldState = copyColaborador(existing);
        
        existing.setDni(request.dni());
        existing.setNombres(request.nombres());
        existing.setApellidoPaterno(request.apellidoPaterno());
        existing.setApellidoMaterno(request.apellidoMaterno());
        existing.setFechaNacimiento(request.fechaNacimiento());
        existing.setSexo(request.sexo());
        existing.setEstadoCivil(request.estadoCivil());
        existing.setNacionalidad(request.nacionalidad() != null ? request.nacionalidad() : "PERUANA");
        existing.setCorreoPersonal(request.correoPersonal());
        existing.setTelefono(request.telefono());
        existing.setDireccion(request.direccion());
        
        Colaborador updated = colaboradorRepository.save(existing);
        
        registrarHistorial("colaborador", oldState, updated, "UPDATE");
        
        return mapToResponse(updated);
    }
    
    @Transactional
    public void softDelete(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado con ID: " + id));
        
        if (!colaborador.getActivo()) {
            throw new IllegalStateException("El colaborador ya está inactivo");
        }
        
        Colaborador oldState = copyColaborador(colaborador);
        colaborador.setActivo(false);
        
        Colaborador updated = colaboradorRepository.save(colaborador);
        
        registrarHistorial("colaborador", oldState, updated, "SOFT_DELETE");
    }
    
    @Transactional
    public void reactivar(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado con ID: " + id));
        
        if (colaborador.getActivo()) {
            throw new IllegalStateException("El colaborador ya está activo");
        }
        
        Colaborador oldState = copyColaborador(colaborador);
        colaborador.setActivo(true);
        
        Colaborador updated = colaboradorRepository.save(colaborador);
        
        registrarHistorial("colaborador", oldState, updated, "REACTIVATE");
    }
    
    @Transactional(readOnly = true)
    public PageResponse<ColaboradorResponse> findAll(Pageable pageable) {
        Page<Colaborador> page = colaboradorRepository.findByActivoTrue(pageable);
        return mapToPageResponse(page);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<ColaboradorResponse> findAllWithFilters(String search, Boolean activo, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            Page<Colaborador> page = colaboradorRepository.searchWithFilters(search, activo, pageable);
            return mapToPageResponse(page);
        } else if (activo != null) {
            Page<Colaborador> page = activo ? 
                colaboradorRepository.findByActivoTrue(pageable) : 
                colaboradorRepository.findByActivoFalse(pageable);
            return mapToPageResponse(page);
        } else {
            Page<Colaborador> page = colaboradorRepository.findAll(pageable);
            return mapToPageResponse(page);
        }
    }
    
    @Transactional(readOnly = true)
    public ColaboradorResponse findById(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado con ID: " + id));
        return mapToResponse(colaborador);
    }
    
    @Transactional(readOnly = true)
    public ColaboradorResponse findByDni(String dni) {
        Colaborador colaborador = colaboradorRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Colaborador no encontrado con DNI: " + dni));
        return mapToResponse(colaborador);
    }
    
    private Colaborador mapToEntity(ColaboradorRequest request) {
        Colaborador colaborador = new Colaborador();
        colaborador.setDni(request.dni());
        colaborador.setNombres(request.nombres());
        colaborador.setApellidoPaterno(request.apellidoPaterno());
        colaborador.setApellidoMaterno(request.apellidoMaterno());
        colaborador.setFechaNacimiento(request.fechaNacimiento());
        colaborador.setSexo(request.sexo());
        colaborador.setEstadoCivil(request.estadoCivil());
        colaborador.setNacionalidad(request.nacionalidad() != null ? request.nacionalidad() : "PERUANA");
        colaborador.setCorreoPersonal(request.correoPersonal());
        colaborador.setTelefono(request.telefono());
        colaborador.setDireccion(request.direccion());
        return colaborador;
    }
    
    private Colaborador copyColaborador(Colaborador original) {
        Colaborador copy = new Colaborador();
        copy.setId(original.getId());
        copy.setDni(original.getDni());
        copy.setNombres(original.getNombres());
        copy.setApellidoPaterno(original.getApellidoPaterno());
        copy.setApellidoMaterno(original.getApellidoMaterno());
        copy.setFechaNacimiento(original.getFechaNacimiento());
        copy.setSexo(original.getSexo());
        copy.setEstadoCivil(original.getEstadoCivil());
        copy.setNacionalidad(original.getNacionalidad());
        copy.setCorreoPersonal(original.getCorreoPersonal());
        copy.setTelefono(original.getTelefono());
        copy.setDireccion(original.getDireccion());
        copy.setActivo(original.getActivo());
        return copy;
    }
    
    private ColaboradorResponse mapToResponse(Colaborador entity) {
        String nombreCompleto = entity.getNombres() + " " + entity.getApellidoPaterno();
        if (entity.getApellidoMaterno() != null && !entity.getApellidoMaterno().isEmpty()) {
            nombreCompleto += " " + entity.getApellidoMaterno();
        }
        
        return new ColaboradorResponse(
            entity.getId(),
            entity.getDni(),
            entity.getNombres(),
            entity.getApellidoPaterno(),
            entity.getApellidoMaterno(),
            nombreCompleto,
            entity.getFechaNacimiento(),
            entity.getSexo(),
            entity.getEstadoCivil(),
            entity.getNacionalidad(),
            entity.getCorreoPersonal(),
            entity.getTelefono(),
            entity.getDireccion(),
            entity.getActivo(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
    
    private PageResponse<ColaboradorResponse> mapToPageResponse(Page<Colaborador> page) {
        return new PageResponse<>(
            page.getContent().stream().map(this::mapToResponse).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
    
    private void registrarHistorial(String tabla, Colaborador anterior, Colaborador nuevo, String accion) {
        try {
            HistorialCambio historial = new HistorialCambio();
            historial.setTablaAfectada(tabla);
            historial.setRegistroId(nuevo != null ? nuevo.getId() : anterior.getId());
            historial.setAccion(accion);
            historial.setFechaCambio(LocalDateTime.now());
            historial.setIpOrigen("127.0.0.1"); // IP por defecto
            
            if (anterior != null) {
                historial.setValorAnterior(objectMapper.writeValueAsString(mapToResponse(anterior)));
            }
            if (nuevo != null) {
                historial.setValorNuevo(objectMapper.writeValueAsString(mapToResponse(nuevo)));
            }
            
            // Obtener usuario actual
            Long usuarioId = 1L; // Default
            try {
                Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                if (principal instanceof UserDetails) {
                    usuarioId = 1L;
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener el usuario actual, usando ID=1");
            }
            historial.setUsuarioId(usuarioId);
            
            historialCambioRepository.save(historial);
            log.debug("Historial registrado - Tabla: {}, Acción: {}, ID: {}", tabla, accion, historial.getRegistroId());
        } catch (Exception e) {
            log.error("Error al registrar historial: {}", e.getMessage(), e);
        }
    }
}
