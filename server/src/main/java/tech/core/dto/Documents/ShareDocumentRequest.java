package tech.core.dto.Documents;

import java.util.UUID;

import lombok.Data;

@Data
public class ShareDocumentRequest {
    private UUID userId;
    private UUID documentId;
}
