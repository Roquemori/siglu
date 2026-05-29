package com.siglu.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    String nombreUsuario,
    
    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {}
