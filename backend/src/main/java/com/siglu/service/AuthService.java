package com.siglu.service;

import com.siglu.dto.LoginRequest;
import com.siglu.dto.LoginResponse;
import com.siglu.entity.Usuario;
import com.siglu.repository.UsuarioRepository;
import com.siglu.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.nombreUsuario(), request.password())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        
        Usuario usuario = usuarioRepository.findByNombreUsuario(request.nombreUsuario()).orElseThrow();
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        return new LoginResponse(
            token,
            "Bearer",
            usuario.getId(),
            usuario.getNombreUsuario(),
            usuario.getCorreo(),
            usuario.getRol().getNombre(),
            jwtUtil.extractExpiration(token).getTime()
        );
    }
}
