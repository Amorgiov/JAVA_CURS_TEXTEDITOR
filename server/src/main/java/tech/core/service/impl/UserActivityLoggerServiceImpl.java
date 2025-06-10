package tech.core.service.impl;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import tech.core.model.ActivityType;
import tech.core.model.User;
import tech.core.model.UserActivityLog;
import tech.core.repository.UserActiviryLogRepository;
import tech.core.repository.UserRepository;
import tech.core.service.UserActivityLoggerService;

@Service
@RequiredArgsConstructor
public class UserActivityLoggerServiceImpl implements UserActivityLoggerService {
    private final UserActiviryLogRepository userActiviryLogRepository;
    private final UserRepository userRepository;

    @Override
    public void log(ActivityType activityType, String details, String email) {
        UserActivityLog userActivityLog = new UserActivityLog();

        User currentUser = userRepository.findByEmail(
                email)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with email: " + email));

        System.out.println(activityType + "||" + details + "||" + email);
        userActivityLog.setUser(currentUser);
        userActivityLog.setActivityType(activityType);
        userActivityLog.setDetails(details);

        userActiviryLogRepository.save(userActivityLog);
    }
}
