package tech.core.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import tech.core.dto.Documents.CreateDocumentRequest;
import tech.core.dto.Documents.DocumentResponse;
import tech.core.dto.Documents.ExportFileResponse;
import tech.core.dto.Documents.ImportDocumentRequest;
import tech.core.dto.Documents.ShareDocumentRequest;
import tech.core.model.ActivityType;
import tech.core.model.Document;
import tech.core.model.DocumentAccess;
import tech.core.model.User;
import tech.core.repository.DocumentAccessRepository;
import tech.core.repository.DocumentRepository;
import tech.core.repository.UserRepository;
import tech.core.security.SecurityUtil;
import tech.core.service.DocumentService;
import tech.core.service.OperationLoggerService;
import tech.core.service.UserActivityLoggerService;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
        private final DocumentRepository documentRepository;
        private final UserRepository userRepository;
        private final DocumentAccessRepository documentAccessRepository;
        private final SecurityUtil securityUtil;
        private final OperationLoggerService operationLoggerService;
        private final UserActivityLoggerService userActivityLog;

        @Transactional
        @Override
        public List<DocumentResponse> getAllDocuments() {

                try {
                        String currentUserEmail = securityUtil.getCurrentUserEmail();
                        User currentUser = userRepository.findByEmail(currentUserEmail)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "User not found with email: " + currentUserEmail));

                        List<Document> ownedDocuments = documentRepository
                                        .findByOwnerIdOrIsPrivateFalse(currentUser.getId());
                        List<Document> accessibleDocuments = documentAccessRepository.findByUserId(currentUser.getId())
                                        .stream()
                                        .map(DocumentAccess::getDocument)
                                        .collect(Collectors.toList());

                        List<Document> allDocuments = Stream.concat(
                                        ownedDocuments.stream(),
                                        accessibleDocuments.stream())
                                        .distinct()
                                        .collect(Collectors.toList());

                        operationLoggerService.logSuccess("DocumentService.getAllDocuments()", currentUserEmail);
                        userActivityLog.log(ActivityType.DOCUMENT_GET_ALL, "User gets all documents", currentUserEmail);
                        return allDocuments.stream()
                                        .map(this::toDTO)
                                        .collect(Collectors.toList());
                } catch (Exception ex) {
                        throw ex;
                }

        }

        private DocumentResponse toDTO(Document document) {
                DocumentResponse dto = new DocumentResponse();
                dto.setId(document.getId());
                dto.setTitle(document.getTitle());
                dto.setPrivate(document.isPrivate());

                return dto;
        }

        @Transactional
        @Override
        public DocumentResponse importDocument(ImportDocumentRequest request) {
                try {
                        Document doc = new Document();

                        String currentEmail = securityUtil.getCurrentUserEmail();
                        User currentUser = userRepository.findByEmail(currentEmail)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "User not found with email: " + currentEmail));

                        doc.setTitle(request.getTitle());
                        doc.setPrivate(true);
                        doc.setContent(request.getContent());
                        doc.setOwner(currentUser);
                        documentRepository.save(doc);
                        operationLoggerService.logSuccess("DocumentService.importDocument(..)", currentEmail);
                        userActivityLog.log(ActivityType.DOCUMENT_IMPORT, "The user has imported a document",
                                        currentEmail);
                        return toDTO(doc);
                } catch (Exception ex) {
                        throw ex;
                }

        }

        @Transactional
        @Override
        public ExportFileResponse exportDocument(UUID fileId) {
                try {
                        Document document = documentRepository.findById(fileId)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Document with ID " + fileId + " not found"));
                        String currentEmail = securityUtil.getCurrentUserEmail();
                        byte[] fileContent = document.getContent() != null
                                        ? document.getContent().getBytes(StandardCharsets.UTF_8)
                                        : new byte[0];
                        String fileName = document.getTitle() + ".txt";

                        ExportFileResponse exportResult = new ExportFileResponse();
                        exportResult.setFileName(fileName);
                        exportResult.setFileContent(fileContent);
                        operationLoggerService.logSuccess("DocumentService.exportDocument(..)", currentEmail);
                        userActivityLog.log(ActivityType.DOCUMENT_EXPORT, "The user has exported a document",
                                        currentEmail);
                        return exportResult;

                } catch (Exception ex) {
                        throw ex;
                }

        }

        @Transactional
        @Override
        public void shareDocument(ShareDocumentRequest shareDocumentRequest) {
                System.out.println("Processing shareDocument: userId=" + shareDocumentRequest.getUserId() +
                                ", documentId=" + shareDocumentRequest.getDocumentId());
                try {
                        if (shareDocumentRequest.getUserId() == null || shareDocumentRequest.getDocumentId() == null) {
                                throw new IllegalArgumentException("UserId or DocumentId cannot be null");
                        }

                        User user = userRepository.findById(shareDocumentRequest.getUserId())
                                        .orElseThrow(() -> new EntityNotFoundException("User not found"));

                        Document document = documentRepository.findById(shareDocumentRequest.getDocumentId())
                                        .orElseThrow(() -> new EntityNotFoundException("Document not found"));

                        DocumentAccess documentAccess = new DocumentAccess();
                        documentAccess.setDocument(document);
                        documentAccess.setUser(user);
                        DocumentAccess savedAccess = documentAccessRepository.save(documentAccess);
                        operationLoggerService.logSuccess("DocumentService.shareDocument(..)", user.getEmail());
                        userActivityLog.log(ActivityType.DOCUMENT_SHARE, "A user shared the document", user.getEmail());

                        System.out.println("DocumentAccess created: id=" + savedAccess.getId() +
                                        ", documentId=" + document.getId() +
                                        ", userId=" + user.getId());
                } catch (Exception ex) {
                        throw ex;
                }

        }

        @Transactional
        @Override
        public Document createDocument(CreateDocumentRequest request) {
                try {
                        String currentEmail = securityUtil.getCurrentUserEmail();
                        User currentUser = userRepository.findByEmail(currentEmail)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "User not found with email: " + currentEmail));

                        Document document = new Document();
                        document.setTitle(request.getTitle());
                        document.setPrivate(request.isPrivate());
                        document.setOwner(null);

                        if (request.isPrivate() == true) {
                                document.setOwner(currentUser);
                        }

                        documentRepository.save(document);
                        operationLoggerService.logSuccess("DocumentService.createDocument(..)", currentEmail);
                        userActivityLog.log(ActivityType.DOCUMENT_CREATE, "A user created the document", currentEmail);

                        return document;
                } catch (Exception ex) {
                        throw ex;
                }

        }

        @Transactional
        @Override
        public void deleteDocument(UUID documentId) {
                try {
                        String currentEmail = securityUtil.getCurrentUserEmail();
                        documentRepository.deleteById(documentId);
                        operationLoggerService.logSuccess("DocumentService.deleteDocument(..)", currentEmail);
                        userActivityLog.log(ActivityType.DOCUMENT_DELETE, "A user deleted the document", currentEmail);
                } catch (Exception ex) {
                        throw ex;
                }

        }
}
