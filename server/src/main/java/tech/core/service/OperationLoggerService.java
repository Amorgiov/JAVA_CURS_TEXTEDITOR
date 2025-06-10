package tech.core.service;

public interface OperationLoggerService {

    void logSuccess(String action, String user);

    void logFailure(String action, String user, String errorMessage);

}