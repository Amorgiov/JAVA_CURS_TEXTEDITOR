package tech.core.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import tech.core.dto.Documents.CreateDocumentRequest;
import tech.core.dto.Documents.DocumentResponse;
import tech.core.dto.Documents.ExportFileResponse;
import tech.core.dto.Documents.ImportDocumentRequest;
import tech.core.dto.Documents.ShareDocumentRequest;
import tech.core.model.Document;
import tech.core.service.DocumentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/Documents")
public class DocumentsController {
    private final DocumentService documentService;

    @GetMapping("/getDocuments")
    public ResponseEntity<List<DocumentResponse>> getDocuments() {
        List<DocumentResponse> documents = documentService.getAllDocuments();

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/create")
    public ResponseEntity<Document> createDocument(@RequestBody CreateDocumentRequest createDocumentRequest) {
        Document document = documentService.createDocument(createDocumentRequest);
        return ResponseEntity.ok(document);
    }

    @PostMapping("/import")
    public ResponseEntity<DocumentResponse> importDocument(@RequestBody ImportDocumentRequest importDocumentRequest) {
        DocumentResponse document = documentService.importDocument(importDocumentRequest);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/export/{fileId}")
    public ResponseEntity<byte[]> exportDocument(@PathVariable UUID fileId) {
        try {
            ExportFileResponse exportResult = documentService.exportDocument(fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + exportResult.getFileName() + "\"")
                    .body(exportResult.getFileContent());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/ShareDocument")
    public ResponseEntity<Void> shareDocument(@RequestBody ShareDocumentRequest shareDocumentRequest) {
        System.out.println("Received ShareDocumentRequest: userId=" + shareDocumentRequest.getUserId() +
                ", documentId=" + shareDocumentRequest.getDocumentId());

        try {
            documentService.shareDocument(shareDocumentRequest);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            System.err.println("Entity not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid argument: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/delete/{documentId}")
    public ResponseEntity<UUID> deleteDocument(@PathVariable UUID documentId) {

        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(documentId);
    }
}
