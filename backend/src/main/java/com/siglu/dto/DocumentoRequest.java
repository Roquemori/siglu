package com.siglu.dto;

import jakarta.validation.constraints.NotNull;

public record DocumentoRequest(
    @NotNull(message = "El ID del colaborador es obligatorio")
    Long colaboradorId,
    
    @NotNull(message = "El ID del tipo de documento es obligatorio")
    Long tipoDocumentoId
) {}
