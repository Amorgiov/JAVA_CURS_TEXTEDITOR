package tech.core.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tech.core.model.DocumentChange;

@Repository
public interface DocumentChangeRepository extends JpaRepository<DocumentChange, UUID> {
    List<DocumentChange> findByDocumentIdOrderByChangeDateDesc(UUID documentId);
}
