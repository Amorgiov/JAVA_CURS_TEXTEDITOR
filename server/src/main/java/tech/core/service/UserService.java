package tech.core.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import tech.core.dto.Users.LoginRequest;
import tech.core.dto.Users.LoginResponse;
import tech.core.dto.Users.UpdateUserDTO;
import tech.core.dto.Users.UserResponse;

public interface UserService {
    List<UserResponse> getUsers();

    CompletableFuture<LoginResponse> updateUser(UpdateUserDTO updateUserDTO);
}
