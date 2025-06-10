package tech.core.websocket;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import tech.core.dto.WebSocketMessage;
import tech.core.model.Document;
import tech.core.model.DocumentChange;
import tech.core.model.User;
import tech.core.repository.DocumentChangeRepository;
import tech.core.repository.DocumentRepository;
import tech.core.repository.UserRepository;

@Controller
@RequiredArgsConstructor
public class DocumentWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentChangeRepository changeRepository;

    private final Map<String, String> editingLocks = new ConcurrentHashMap<>();

    @MessageMapping("/join")
    public void handleJoin(@Payload WebSocketMessage message, Principal principal) {
        String document = message.getDocumentName();
        String username = principal.getName();

        // Попытка заблокировать документ
        if (editingLocks.putIfAbsent(document, username) == null) {
            // Уведомляем всех о входе
            messagingTemplate.convertAndSend("/topic/document/" + document,
                    new WebSocketMessage(username, document, null, "joined"));

            // Отправляем контент только вошедшему пользователю
            documentRepository.findByTitle(document).ifPresent(doc -> {
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/queue/document/" + document,
                        new WebSocketMessage("System", document, doc.getContent(), "init"));
            });
        } else {
            // Документ заблокирован
            documentRepository.findByTitle(document).ifPresent(doc -> {
                messagingTemplate.convertAndSendToUser(
                        username,
                        "/queue/errors",
                        new WebSocketMessage("System", document, doc.getContent(), "locked"));
            });
        }
    }

    @MessageMapping("/update")
    public void handleUpdate(@Payload WebSocketMessage message) {
        // Просто пересылаем содержимое всем пользователям в комнате
        messagingTemplate.convertAndSend("/topic/document/" + message.getDocumentName(), message);
    }

    @Transactional
    @MessageMapping("/save")
    public void handleSave(@Payload WebSocketMessage message, Principal principal) {
        String userEmail = principal.getName();
        Document doc = documentRepository.findByTitle(message.getDocumentName())
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Только если пользователь владеет редактированием
        if (!userEmail.equals(editingLocks.get(doc.getTitle()))) {
            throw new RuntimeException("You are not editing this document");
        }

        doc.setContent(message.getContent());
        documentRepository.save(doc);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentChange change = new DocumentChange();
        change.setDocument(doc);
        change.setChangedBy(user);

        change.setDocumentName(doc.getTitle());
        change.setEditorEmail(user.getEmail());
        change.setChangeData(message.getContent());
        changeRepository.save(change);

        messagingTemplate.convertAndSend("/topic/document/" + doc.getTitle(),
                new WebSocketMessage(userEmail, doc.getTitle(), doc.getContent(), "saved"));
    }

    @MessageMapping("/leave")
    public void handleLeave(@Payload WebSocketMessage message, Principal principal) {
        String docName = message.getDocumentName();
        String userEmail = principal.getName();

        if (docName != null && userEmail != null) {
            editingLocks.remove(docName, userEmail);
            documentRepository.findByTitle(docName).ifPresent(doc -> {
                messagingTemplate.convertAndSend("/topic/document/" + docName,
                        new WebSocketMessage(userEmail, docName, doc.getContent(), "left"));
            });

        } else {
            System.err.println("handleLeave called with null docName or userEmail");
        }
    }
}