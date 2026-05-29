package com.siglu.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_cambio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialCambio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tabla_afectada", length = 100, nullable = false)
    private String tablaAfectada;
    
    @Column(name = "registro_id", nullable = false)
    private Long registroId;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(length = 10, nullable = false)
    private String accion;
    
    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;
    
    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;
    
    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;
    
    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;
    
    @PrePersist
    protected void onCreate() {
        fechaCambio = LocalDateTime.now();
    }
}
