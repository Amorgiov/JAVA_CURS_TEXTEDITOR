package tech.core.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import tech.core.model.OperationLog;
import tech.core.model.OperationStatus;
import tech.core.repository.OperationLogRepository;
import tech.core.service.OperationLoggerService;

@Service
@RequiredArgsConstructor
public class OperationLoggerServiceImpl implements OperationLoggerService {

    private final OperationLogRepository logRepository;

    private void log(OperationStatus status, String action, String userEmail, String error) {
        OperationLog log = new OperationLog();

        log.setAction(action);
        log.setUserEmail(userEmail);
        log.setStatus(status);
        log.setErrorMessage(error);

        logRepository.save(log);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void logSuccess(String action, String userEmail) {
        log(OperationStatus.SUCCESS, action, userEmail, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void logFailure(String action, String userEmail, String error) {
        log(OperationStatus.FAILURE, action, userEmail, error);
    }
}
