package tech.core.dto.Users;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
