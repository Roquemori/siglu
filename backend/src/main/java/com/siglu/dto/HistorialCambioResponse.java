package com.siglu.dto;

import java.time.LocalDateTime;

public record HistorialCambioResponse(
    Long id,
    String tablaAfectada,
    Long registroId,
    Long usuarioId,
    String nombreUsuario,
    String accion,
    String valorAnterior,
    String valorNuevo,
    LocalDateTime fechaCambio,
    String ipOrigen
) {}
