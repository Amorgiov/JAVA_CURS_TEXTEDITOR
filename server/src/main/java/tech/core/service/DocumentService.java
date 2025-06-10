package tech.core.service;

import java.util.List;
import java.util.UUID;

import tech.core.dto.Documents.CreateDocumentRequest;
import tech.core.dto.Documents.DocumentResponse;
import tech.core.dto.Documents.ExportFileResponse;
import tech.core.dto.Documents.ImportDocumentRequest;
import tech.core.dto.Documents.ShareDocumentRequest;
import tech.core.model.Document;

public interface DocumentService {

    List<DocumentResponse> getAllDocuments();

    DocumentResponse importDocument(ImportDocumentRequest request);

    ExportFileResponse exportDocument(UUID fileId);

    void shareDocument(ShareDocumentRequest shareDocumentRequest);

    Document createDocument(CreateDocumentRequest request);

    void deleteDocument(UUID documentId);
}