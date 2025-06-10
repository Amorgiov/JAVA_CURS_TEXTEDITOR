package tech.core.config.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import tech.core.service.OperationLoggerService;

@Aspect
@Component
@RequiredArgsConstructor
public class TransactionErrorLoggerAspect {

    private final OperationLoggerService loggerService;

    @AfterThrowing(pointcut = "@annotation(org.springframework.transaction.annotation.Transactional)", throwing = "ex")
    public void logTransactionException(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().toShortString();
        String userEmail = extractUserEmailSafely();

        loggerService.logFailure(methodName, userEmail, ex.getMessage());
    }

    private String extractUserEmailSafely() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "anonymous";
        } catch (Exception e) {
            return "unknown";
        }
    }
}
