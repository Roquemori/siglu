package com.siglu.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ColaboradorResponse(
    Long id,
    String dni,
    String nombres,
    String apellidoPaterno,
    String apellidoMaterno,
    String nombreCompleto,
    LocalDate fechaNacimiento,
    String sexo,
    String estadoCivil,
    String nacionalidad,
    String correoPersonal,
    String telefono,
    String direccion,
    Boolean activo,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
