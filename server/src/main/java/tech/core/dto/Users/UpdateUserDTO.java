package tech.core.dto.Users;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UpdateUserDTO {
    @JsonProperty("name")
    private String name;
    @JsonProperty("email")
    private String email;
}
