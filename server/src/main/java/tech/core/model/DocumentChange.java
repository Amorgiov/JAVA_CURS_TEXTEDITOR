package tech.core.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "document_changes")
public class DocumentChange {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    private String documentName;

    @ManyToOne
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    private String editorEmail;

    @Column(name = "change_date", nullable = false)
    private LocalDateTime changeDate;

    private String changeData;

    @PrePersist
    public void prePersist() {
        changeDate = LocalDateTime.now();
    }
}
