package tech.core.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tech.core.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @SuppressWarnings("null")
    Optional<User> findById(UUID id);

    boolean existsByEmail(String email);

    List<User> findByEmailNot(String email);
}
