package tech.core.dto.Documents;

import lombok.Data;

@Data
public class ExportFileResponse {
    private byte[] FileContent;
    private String FileName;
}