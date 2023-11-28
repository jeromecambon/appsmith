package com.appsmith.server.repositories;

import com.appsmith.external.models.CreatorContextType;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.ModuleInstance;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Optional;

public interface CustomModuleInstanceRepository extends AppsmithRepository<ModuleInstance> {
    Mono<Long> getModuleInstanceCountByModuleId(String moduleId);

    Flux<ModuleInstance> findAllByContextIdAndContextType(
            String contextId, CreatorContextType contextType, AclPermission permission);

    Mono<ModuleInstance> findByBranchNameAndDefaultModuleInstanceId(
            String branchName, String defaultModuleInstanceId, AclPermission permission);

    Flux<ModuleInstance> findAllByRootModuleInstanceId(String rootModuleInstanceId, Optional<AclPermission> permission);
}
