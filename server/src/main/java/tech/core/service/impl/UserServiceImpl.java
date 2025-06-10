package tech.core.service.impl;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import tech.core.dto.Users.LoginRequest;
import tech.core.dto.Users.LoginResponse;
import tech.core.dto.Users.UpdateUserDTO;
import tech.core.dto.Users.UserResponse;
import tech.core.model.ActivityType;
import tech.core.model.User;
import tech.core.repository.UserRepository;
import tech.core.security.SecurityUtil;
import tech.core.service.AuthService;
import tech.core.service.OperationLoggerService;
import tech.core.service.UserActivityLoggerService;
import tech.core.service.UserService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final AuthService authService;
    private final OperationLoggerService operationLoggerService;
    private final UserActivityLoggerService userActivityLog;

    @Transactional
    @Override
    public List<UserResponse> getUsers() {
        try {
            String currentEmail = securityUtil.getCurrentUserEmail();

            operationLoggerService.logSuccess("UserService.getUsers()", currentEmail);
            userActivityLog.log(ActivityType.USER_GET_ALL, "All users received", currentEmail);
            return userRepository.findByEmailNot(currentEmail).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            throw ex;
        }

    }

    private UserResponse toDTO(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());

        return dto;
    }

    @Transactional
    @Override
    public CompletableFuture<LoginResponse> updateUser(UpdateUserDTO updateUserDTO) {
        try {
            String currentEmail = securityUtil.getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentEmail)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + currentEmail));

            if (currentEmail == updateUserDTO.getEmail() && currentUser.getName() == updateUserDTO.getName()) {
                return null;
            }

            currentUser.setEmail(updateUserDTO.getEmail());
            currentUser.setName(updateUserDTO.getName());

            userRepository.save(currentUser);

            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(updateUserDTO.getEmail());
            loginRequest.setPassword(currentUser.getPasswordHash());
            CompletableFuture<LoginResponse> token = authService.login(loginRequest);
            System.out.println(loginRequest.getPassword());
            operationLoggerService.logSuccess("UserService.updateUser()", currentEmail);
            userActivityLog.log(ActivityType.USER_UPDATE, "The user has been updated", currentEmail);
            return token;
        } catch (Exception ex) {
            throw ex;
        }

    }
}
