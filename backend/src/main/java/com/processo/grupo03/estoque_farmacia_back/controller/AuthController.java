package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.dtos.LoginRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.dtos.LoginResponseDTO;
import com.processo.grupo03.estoque_farmacia_back.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.realizarLogin(loginRequest);
        return ResponseEntity.ok(response);
    }
}