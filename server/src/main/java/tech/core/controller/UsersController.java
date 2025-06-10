package tech.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import tech.core.dto.Users.UserResponse;
import tech.core.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/Users")
public class UsersController {

    private final UserService userService;

    @GetMapping("/GetUsers")
    public ResponseEntity<List<UserResponse>> getUsers() {
        try {
            List<UserResponse> users = userService.getUsers();
            return ResponseEntity.ok(users);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).body(null);
        }
    }
}
