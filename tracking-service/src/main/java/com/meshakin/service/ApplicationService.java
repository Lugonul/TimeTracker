package com.meshakin.service;

import com.meshakin.entity.ApplicationEntity;
import com.meshakin.entity.ApplicationType;
import com.meshakin.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationEntity findOrCreate (String applicationName){
        Optional<ApplicationEntity> existingApp = applicationRepository
                .findByApplicationName(applicationName);
        if(existingApp.isPresent()) return existingApp.get();

        ApplicationEntity newApplication = ApplicationEntity.builder()
                .applicationName(applicationName)
                .build();

        return applicationRepository.save(newApplication);
    }
}
