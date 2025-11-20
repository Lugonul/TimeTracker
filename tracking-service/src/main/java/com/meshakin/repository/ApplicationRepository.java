package com.meshakin.repository;

import com.meshakin.entity.ApplicationEntity;
import com.meshakin.entity.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {

    Optional<ApplicationEntity> findByApplicationName(
            String applicationName
    );
}
