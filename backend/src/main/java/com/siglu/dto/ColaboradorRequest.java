package com.siglu.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ColaboradorRequest(
    @NotBlank(message = "DNI es obligatorio")
    @Size(min = 8, max = 8, message = "DNI debe tener 8 caracteres")
    @Pattern(regexp = "\\d{8}", message = "DNI solo debe contener números")
    String dni,
    
    @NotBlank(message = "Nombres es obligatorio")
    @Size(max = 100, message = "Nombres no puede exceder 100 caracteres")
    String nombres,
    
    @NotBlank(message = "Apellido paterno es obligatorio")
    @Size(max = 100, message = "Apellido paterno no puede exceder 100 caracteres")
    String apellidoPaterno,
    
    @Size(max = 100, message = "Apellido materno no puede exceder 100 caracteres")
    String apellidoMaterno,
    
    @Past(message = "Fecha de nacimiento debe ser pasada")
    LocalDate fechaNacimiento,
    
    @Pattern(regexp = "^[MF]$", message = "Sexo debe ser M o F")
    String sexo,
    
    String estadoCivil,
    
    String nacionalidad,
    
    @Email(message = "Email debe ser válido")
    String correoPersonal,
    
    String telefono,
    
    String direccion
) {}
