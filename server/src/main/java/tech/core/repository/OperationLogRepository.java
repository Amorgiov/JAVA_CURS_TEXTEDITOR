package tech.core.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.core.model.OperationLog;

@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, UUID> {
}
