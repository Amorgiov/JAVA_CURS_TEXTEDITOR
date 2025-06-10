package tech.core.dto.Users;

import lombok.Data;
import tech.core.model.Role;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
