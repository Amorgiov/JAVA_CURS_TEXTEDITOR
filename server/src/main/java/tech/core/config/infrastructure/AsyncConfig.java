package tech.core.config.infrastructure;

import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(20);
        executor.setMaxPoolSize(100);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("Async-");
        executor.setTaskDecorator(task -> () -> {
            SecurityContext context = SecurityContextHolder.getContext();
            try {
                SecurityContextHolder.setContext(context);
                System.out.println("Async: Setting SecurityContext in thread: " + Thread.currentThread().getName());
                task.run();
            } finally {
                System.out.println("Async: Clearing SecurityContext in thread: " + Thread.currentThread().getName());
                SecurityContextHolder.clearContext();
            }
        });
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}