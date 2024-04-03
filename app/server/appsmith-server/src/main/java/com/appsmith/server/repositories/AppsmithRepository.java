package com.appsmith.server.repositories;

import com.appsmith.external.models.BaseDomain;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.repositories.ce.params.QueryAllParams;
import org.springframework.data.mongodb.core.query.UpdateDefinition;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface AppsmithRepository<T extends BaseDomain> {

    Mono<T> findById(String id, AclPermission permission);

    Mono<T> findById(String id, Optional<AclPermission> permission);

    Mono<T> updateById(String id, T resource, AclPermission permission);

    QueryAllParams<T> queryBuilder();

    Mono<T> setUserPermissionsInObject(T obj, Set<String> permissionGroups);

    Mono<T> setUserPermissionsInObject(T obj);

    Mono<T> updateAndReturn(String id, UpdateDefinition updateObj, Optional<AclPermission> permission);

    /**
     * This method uses the mongodb bulk operation to save a list of new actions. When calling this method, please note
     * the following points:
     * 1. All of them will be written to database in a single DB operation.
     * 2. If you pass a domain without ID, the ID will be generated by the database.
     * 3. All the auto generated fields e.g. createdAt, updatedAt should be set by the caller.
     *    They'll not be generated in the bulk write.
     * 4. No constraint validation will be performed on the new actions.
     * @param domainList List of domains that'll be saved in bulk
     * @return List of actions that were passed in the method
     */
    Mono<Void> bulkInsert(List<T> domainList);

    Mono<Void> bulkUpdate(List<T> domainList);
}
