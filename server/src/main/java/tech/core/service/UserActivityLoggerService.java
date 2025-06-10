package tech.core.service;

import tech.core.model.ActivityType;

public interface UserActivityLoggerService {

    void log(ActivityType activityType, String details, String email);

}