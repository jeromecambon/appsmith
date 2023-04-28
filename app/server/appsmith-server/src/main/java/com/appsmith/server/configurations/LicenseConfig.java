package com.appsmith.server.configurations;

import com.appsmith.server.services.ConfigService;
import com.appsmith.server.solutions.LicenseValidator;
import com.appsmith.server.solutions.OfflineLicenseValidatorImpl;
import com.appsmith.server.solutions.OnlineLicenseValidatorImpl;
import com.appsmith.server.solutions.ReleaseNotesService;
import com.google.gson.Gson;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@RequiredArgsConstructor
public class LicenseConfig {

    private final Gson gson;

    private final CloudServicesConfig cloudServicesConfig;

    private final ReleaseNotesService releaseNotesService;

    private final ConfigService configService;

    private final AirgapInstanceConfig airgapInstanceConfig;

    @Value("${appsmith.license.key}")
    private String licenseKey;

    // Ed25519 128-bit Verify Key from License service provider
    @Value("${keygen.license.verify.key:}")
    private String publicVerificationKey;

    @Bean
    public LicenseValidator licenseValidatorInstance() {
        return airgapInstanceConfig.isAirgapEnabled()
                ? new OfflineLicenseValidatorImpl(releaseNotesService, configService, this, gson)
                : new OnlineLicenseValidatorImpl(releaseNotesService, configService, cloudServicesConfig);
    }
}
