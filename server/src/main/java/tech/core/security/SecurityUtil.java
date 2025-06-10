package tech.core.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public String getCurrentUserEmail() {
        System.out.println("SecurityUtil: Thread=" + Thread.currentThread().getName());
        SecurityContext context = SecurityContextHolder.getContext();
        System.out.println("SecurityUtil: Context=" + context);
        Authentication auth = context.getAuthentication();
        System.out.println("SecurityUtil: Authentication=" + auth);
        if (auth == null) {
            throw new IllegalStateException("No authentication found in SecurityContext");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        throw new IllegalStateException("No authenticated user found");
    }
}