package tech.core.dto.Documents;

import java.util.UUID;

import lombok.Data;

@Data
public class DocumentResponse {
    private UUID id;
    private String title;
    private boolean isPrivate;
}