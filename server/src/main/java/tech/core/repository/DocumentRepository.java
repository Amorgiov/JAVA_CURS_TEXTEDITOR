package tech.core.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tech.core.model.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    @SuppressWarnings("null")
    Optional<Document> findById(UUID id);

    List<Document> findByOwnerIdOrIsPrivateFalse(UUID ownerId);

    Optional<Document> findByTitle(String title);

    @SuppressWarnings("null")
    void deleteById(UUID id);
}
