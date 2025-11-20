package com.meshakin.mapper;

import com.meshakin.dto.TimeTrackerDto;
import com.meshakin.entity.ApplicationEntity;
import com.meshakin.entity.TimeTrackerEntity;
import com.meshakin.service.ApplicationService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class TimeTrackerMapper {

    @Autowired
    private ApplicationService applicationService;


    @Mapping(target = "application", source = "dto", qualifiedByName = "mapApplication")
    public abstract TimeTrackerEntity toEntity(TimeTrackerDto dto);

    @Mapping(target = "applicationName", source = "application.applicationName")
    public abstract TimeTrackerDto toDto(TimeTrackerEntity entity);

    @Named("mapApplication")
    protected ApplicationEntity mapApplication(TimeTrackerDto dto) {
        return applicationService.findOrCreate(
                dto.applicationName()
        );
    }
}

