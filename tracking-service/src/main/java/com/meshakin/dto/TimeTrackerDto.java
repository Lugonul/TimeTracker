package com.meshakin.dto;

import com.meshakin.entity.ApplicationType;
import com.meshakin.entity.Device;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDateTime;

public record TimeTrackerDto (
        Long id,

        @NotBlank
        String applicationName,

        @NotNull
        ApplicationType applicationType,

        @NotNull
        Device device,

        @NotNull
        @PastOrPresent
        LocalDateTime startTime,

        @NotNull
        @PastOrPresent
        LocalDateTime endTime
){
    @AssertTrue
    private boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) return false;
        return endTime.isAfter(startTime);
    }
}
