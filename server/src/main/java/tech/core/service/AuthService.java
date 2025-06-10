package tech.core.service;

import java.util.concurrent.CompletableFuture;

import tech.core.dto.Users.LoginRequest;
import tech.core.dto.Users.LoginResponse;
import tech.core.dto.Users.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);

    CompletableFuture<LoginResponse> login(LoginRequest request);
}
