package com.meshakin.unit.service;

import com.meshakin.dto.TimeTrackerDto;
import com.meshakin.entity.ApplicationEntity;
import com.meshakin.entity.ApplicationType;
import com.meshakin.entity.Device;
import com.meshakin.entity.TimeTrackerEntity;
import com.meshakin.mapper.TimeTrackerMapper;
import com.meshakin.mapper.TimeTrackerMapperImpl;
import com.meshakin.repository.ApplicationRepository;
import com.meshakin.repository.TimeTrackerRepository;
import com.meshakin.service.ApplicationService;
import com.meshakin.service.TimeTrackerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


@SpringBootTest(classes = {
        TimeTrackerService.class,
        TimeTrackerMapperImpl.class,
        ApplicationService.class,
})
public class TimeTrackerServiceUnitTest {
    @MockitoBean
    private TimeTrackerRepository timeTrackerRepository;

    @MockitoBean
    private ApplicationRepository applicationRepository;

    @Autowired
    private TimeTrackerMapper timeTrackerMapper;

    @Autowired
    private TimeTrackerService timeTrackerService;

    private ApplicationEntity appWithId = ApplicationEntity.builder()
            .id(1L)
            .applicationName("exampleName")
            .build();

    private ApplicationEntity appWithoutId = ApplicationEntity.builder()
            .id(null)
            .applicationName("exampleName")
            .build();

    private TimeTrackerEntity entity = new TimeTrackerEntity(
            null,
            ApplicationEntity.builder()
                    .applicationName("exampleName")
                    .build(),
            ApplicationType.BROWSER,
            Device.COMPUTER,
            LocalDateTime.of(2025, 6, 2, 22, 10),
            LocalDateTime.now()
    );

    private TimeTrackerEntity savedEntity = new TimeTrackerEntity(
            1L,
            ApplicationEntity.builder()
                    .id(1L)
                    .applicationName("exampleName")
                    .build(),
            ApplicationType.BROWSER,
            Device.COMPUTER,
            LocalDateTime.of(2025, 6, 2, 22, 10),
            LocalDateTime.now()
    );

    @Test
    public void createTimeTrackerTest() {
        when(timeTrackerRepository.save(any())).thenReturn(savedEntity);
        when(applicationRepository
                .findByApplicationName(appWithoutId.getApplicationName()))
                .thenReturn(Optional.of(appWithId));

        TimeTrackerDto timeTrackerDto = timeTrackerService.create(timeTrackerMapper.toDto(entity));

        assertThat(timeTrackerDto).isEqualTo(timeTrackerMapper.toDto(savedEntity));
    }

    @Test
    public void readTimeTrackerTestShouldReturnExistingTimeTracker() {
        when(timeTrackerRepository.findById(savedEntity.getId())).thenReturn(Optional.of(savedEntity));

        TimeTrackerDto readDto = timeTrackerService.readById(savedEntity.getId());
        assertThat(readDto).isEqualTo(timeTrackerMapper.toDto(savedEntity));
    }

    @Test
    public void readTimeTrackerTestShouldReturnNullWhenNotFound() {
        when(timeTrackerRepository.findById(any())).thenReturn(Optional.empty());
        TimeTrackerDto readDto = timeTrackerService.readById(1L);
        assertThat(readDto).isNull();
    }

    @Test
    public void readAllTimeTrackerTest() {
        List<TimeTrackerEntity> list = new ArrayList<>();
        list.add(savedEntity);
        list.add(savedEntity);
        list.add(savedEntity);
        when(timeTrackerRepository.findAll()).thenReturn(list);

        List<TimeTrackerDto> readDto = timeTrackerService.readAll();

        assertAll(
                () -> assertThat(readDto.size()).isEqualTo(list.size()),
                () -> assertThat(readDto.get(1)).isEqualTo(timeTrackerMapper.toDto(savedEntity))
        );
    }
}
