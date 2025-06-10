package tech.core.dto.Documents;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CreateDocumentRequest {
    private String title;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
}
