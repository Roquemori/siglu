package com.siglu.dto;

public record LoginResponse(
    String token,
    String tipo,
    Long id,
    String nombreUsuario,
    String correo,
    String rol,
    Long expiresIn
) {}
