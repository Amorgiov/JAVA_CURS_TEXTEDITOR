package tech.core.config.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class DebugAspect {

    @Before("execution(* tech.core.service.impl.AuthServiceImpl.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println(">>> Метод вызывается: " + joinPoint.getSignature());
    }
}
