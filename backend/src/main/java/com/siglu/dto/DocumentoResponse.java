package com.siglu.dto;

import java.time.LocalDateTime;

public record DocumentoResponse(
    Long id,
    Long colaboradorId,
    String colaboradorNombre,
    Long tipoDocumentoId,
    String tipoDocumentoNombre,
    String tipoDocumentoSeccion,
    String nombreArchivo,
    Long tamanoBytes,
    String mimeType,
    LocalDateTime fechaSubida,
    String usuarioSubida,
    Boolean activo
) {}
