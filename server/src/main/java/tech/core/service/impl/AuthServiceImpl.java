package tech.core.service.impl;

import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tech.core.dto.Users.LoginRequest;
import tech.core.dto.Users.LoginResponse;
import tech.core.dto.Users.RegisterRequest;
import tech.core.model.ActivityType;
import tech.core.model.User;
import tech.core.repository.UserRepository;
import tech.core.security.JwtUtil;
import tech.core.service.AuthService;
import tech.core.service.OperationLoggerService;
import tech.core.service.UserActivityLoggerService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OperationLoggerService operationLoggerService;
    private final UserActivityLoggerService userActivityLog;

    @Transactional
    @Async
    @Override
    public void register(RegisterRequest request) {

        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("User already exists");
            }

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());

            userRepository.save(user);
            operationLoggerService.logSuccess("AuthService.register(..)", request.getEmail());
            userActivityLog.log(ActivityType.REGISTER, "User registered", request.getEmail());
        } catch (Exception ex) {
            throw ex;
        }

    }

    @Transactional
    @Async
    @Override
    public CompletableFuture<LoginResponse> login(LoginRequest request) {

        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            String jwtToken = jwtUtil.generateToken(user.getName(), request.getEmail(), user.getRole().name());

            operationLoggerService.logSuccess("AuthService.login(..)", request.getEmail());
            userActivityLog.log(ActivityType.LOGIN, "User logged", request.getEmail());
            return CompletableFuture.completedFuture(new LoginResponse(jwtToken));
        } catch (Exception ex) {
            throw ex;
        }

    }

}
