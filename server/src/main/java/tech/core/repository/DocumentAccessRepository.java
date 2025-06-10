package tech.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tech.core.model.DocumentAccess;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentAccessRepository extends JpaRepository<DocumentAccess, UUID> {
    List<DocumentAccess> findByUserId(UUID userId);
}
