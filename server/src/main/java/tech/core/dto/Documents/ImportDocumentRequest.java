package tech.core.dto.Documents;

import lombok.Data;

@Data
public class ImportDocumentRequest {
    private String title;
    private String content;
    private String userId;
}
