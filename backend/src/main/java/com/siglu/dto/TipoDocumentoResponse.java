package com.siglu.dto;

public record TipoDocumentoResponse(
    Long id,
    String nombre,
    String codigo,
    String seccion,
    Short orden
) {}
