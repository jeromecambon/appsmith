package com.appsmith.server.repositories;

import com.appsmith.external.models.CreatorContextType;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.constants.ResourceModes;
import com.appsmith.server.domains.ActionCollection;
import com.appsmith.server.domains.QActionCollection;
import com.appsmith.server.domains.QNewAction;
import com.appsmith.server.repositories.ce.CustomActionCollectionRepositoryCEImpl;
import com.mongodb.client.result.UpdateResult;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Component
public class CustomActionCollectionRepositoryImpl extends CustomActionCollectionRepositoryCEImpl
        implements CustomActionCollectionRepository {

    public CustomActionCollectionRepositoryImpl(
            ReactiveMongoOperations mongoOperations,
            MongoConverter mongoConverter,
            CacheableRepositoryHelper cacheableRepositoryHelper) {
        super(mongoOperations, mongoConverter, cacheableRepositoryHelper);
    }

    @Override
    public Flux<ActionCollection> findAllByModuleIds(List<String> moduleIds, Optional<AclPermission> permission) {
        Criteria moduleIdCriteria = Criteria.where(
                        completeFieldName(QActionCollection.actionCollection.unpublishedCollection.moduleId))
                .in(moduleIds);
        return queryAll(List.of(moduleIdCriteria), permission);
    }

    @Override
    public Flux<ActionCollection> findAllByRootModuleInstanceIds(
            List<String> moduleInstanceIds, Optional<AclPermission> permission) {
        Criteria rootModuleInstanceIdCriterion = Criteria.where(
                        fieldName(QActionCollection.actionCollection.rootModuleInstanceId))
                .in(moduleInstanceIds);
        return queryAll(List.of(rootModuleInstanceIdCriterion), permission);
    }

    @Override
    public Flux<ActionCollection> findByApplicationIdAndViewMode(
            String applicationId, boolean viewMode, AclPermission aclPermission) {

        List<Criteria> criteria = super.getCriteriaForFindByApplicationIdAndViewMode(applicationId, viewMode);

        Criteria nonModuleInstanceCollectionCriterion = getModuleInstanceNonExistenceCriterion();
        criteria.add(nonModuleInstanceCollectionCriterion);

        return queryAll(criteria, aclPermission);
    }

    @Override
    public Flux<ActionCollection> findAllActionCollectionsByNameDefaultPageIdsViewModeAndBranch(
            String name,
            List<String> pageIds,
            boolean viewMode,
            String branchName,
            AclPermission aclPermission,
            Sort sort) {
        List<Criteria> criteria = super.getCriteriaForFindAllActionCollectionsByNameDefaultPageIdsViewModeAndBranch(
                branchName, viewMode, name, pageIds);
        criteria.add(getModuleInstanceNonExistenceCriterion());

        return queryAll(criteria, aclPermission, sort);
    }

    @Override
    public Flux<ActionCollection> findByPageIds(List<String> pageIds, Optional<AclPermission> permission) {
        Criteria pageIdCriteria = where(
                        completeFieldName(QActionCollection.actionCollection.unpublishedCollection.pageId))
                .in(pageIds);

        Criteria notAModuleInstancePrivateEntity = new Criteria();

        notAModuleInstancePrivateEntity.orOperator(
                where(completeFieldName(QActionCollection.actionCollection.rootModuleInstanceId))
                        .exists(false),
                where(completeFieldName(QActionCollection.actionCollection.isPublic))
                        .exists(true));

        return queryAll(List.of(pageIdCriteria, notAModuleInstancePrivateEntity), permission);
    }

    private Criteria getModuleInstanceNonExistenceCriterion() {
        Criteria nonModuleInstanceCollectionCriterion = where(
                        fieldName(QActionCollection.actionCollection.rootModuleInstanceId))
                .exists(false);
        return nonModuleInstanceCollectionCriterion;
    }

    private Criteria getModuleInstanceExistenceCriterion() {
        Criteria moduleInstanceCollectionCriterion = where(
                        fieldName(QActionCollection.actionCollection.rootModuleInstanceId))
                .exists(true);
        return moduleInstanceCollectionCriterion;
    }

    @Override
    public Flux<ActionCollection> findByWorkflowId(
            String workflowId, Optional<AclPermission> aclPermission, Optional<List<String>> includeFields) {
        return this.findByWorkflowIds(List.of(workflowId), aclPermission, includeFields);
    }

    @Override
    public Flux<ActionCollection> findByWorkflowIds(
            List<String> workflowIds, Optional<AclPermission> aclPermission, Optional<List<String>> includeFields) {
        Criteria workflowCriteria =
                Criteria.where(fieldName(QNewAction.newAction.workflowId)).in(workflowIds);
        return queryAll(List.of(workflowCriteria), includeFields, aclPermission, Optional.empty());
    }

    @Override
    public Flux<ActionCollection> findAllUnpublishedActionCollectionsByContextIdAndContextType(
            String contextId, CreatorContextType contextType, AclPermission permission) {
        if (Objects.isNull(contextType) || CreatorContextType.PAGE.equals(contextType)) {
            return super.findAllUnpublishedActionCollectionsByContextIdAndContextType(
                    contextId, contextType, permission);
        }
        String contextIdPath;
        switch (contextType) {
            case WORKFLOW -> contextIdPath = completeFieldName(QActionCollection.actionCollection.workflowId);
            case MODULE -> contextIdPath =
                    completeFieldName(QActionCollection.actionCollection.unpublishedCollection.moduleId);
            default -> contextIdPath =
                    completeFieldName(QActionCollection.actionCollection.unpublishedCollection.pageId);
        }
        String contextTypePath =
                completeFieldName(QActionCollection.actionCollection.unpublishedCollection.contextType);
        Criteria contextIdAndContextTypeCriteria =
                where(contextIdPath).is(contextId).and(contextTypePath).is(contextType);
        // In case an action has been deleted in edit mode, but still exists in deployed mode, ActionCollection object
        // would exist. To handle this, only fetch non-deleted actions
        Criteria deletedCriterion = where(fieldName(QActionCollection.actionCollection.unpublishedCollection) + "."
                        + fieldName(QActionCollection.actionCollection.unpublishedCollection.deletedAt))
                .is(null);
        List<Criteria> criteriaList = List.of(contextIdAndContextTypeCriteria, deletedCriterion);
        return queryAll(criteriaList, Optional.of(permission));
    }

    @Override
    public Flux<ActionCollection> findAllPublishedActionCollectionsByContextIdAndContextType(
            String contextId, CreatorContextType contextType, AclPermission permission) {
        if (Objects.isNull(contextType) || CreatorContextType.PAGE.equals(contextType)) {
            return super.findAllPublishedActionCollectionsByContextIdAndContextType(contextId, contextType, permission);
        }
        String contextIdPath;
        switch (contextType) {
            case WORKFLOW -> contextIdPath = completeFieldName(QActionCollection.actionCollection.workflowId);
            case MODULE -> contextIdPath =
                    completeFieldName(QActionCollection.actionCollection.publishedCollection.moduleId);
            default -> contextIdPath = completeFieldName(QActionCollection.actionCollection.publishedCollection.pageId);
        }
        String contextTypePath = completeFieldName(QActionCollection.actionCollection.publishedCollection.contextType);
        Criteria contextIdAndContextTypeCriteria =
                where(contextIdPath).is(contextId).and(contextTypePath).is(contextType);
        return queryAll(List.of(contextIdAndContextTypeCriteria), Optional.of(permission));
    }

    @Override
    public Mono<UpdateResult> archiveDeletedUnpublishedActionsCollectionsForWorkflows(
            String workflowId, AclPermission aclPermission) {
        Criteria workflowIdCriteria =
                where(fieldName(QActionCollection.actionCollection.workflowId)).is(workflowId);
        String unpublishedDeletedAtFieldName = String.format(
                "%s.%s",
                fieldName(QActionCollection.actionCollection.unpublishedCollection),
                fieldName(QActionCollection.actionCollection.unpublishedCollection.deletedAt));
        Criteria deletedFromUnpublishedCriteria =
                where(unpublishedDeletedAtFieldName).ne(null);

        Update update = new Update();
        update.set(FieldName.DELETED, true);
        update.set(FieldName.DELETED_AT, Instant.now());
        return updateByCriteria(List.of(workflowIdCriteria, deletedFromUnpublishedCriteria), update, aclPermission);
    }

    @Override
    public Flux<ActionCollection> findAllModuleInstanceEntitiesByContextAndViewMode(
            String contextId,
            CreatorContextType contextType,
            Optional<AclPermission> optionalPermission,
            boolean viewMode) {
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(getModuleInstanceExistenceCriterion());
        String contextIdPath;
        String contextTypePath;
        if (viewMode) {
            contextTypePath = completeFieldName(QActionCollection.actionCollection.publishedCollection.contextType);
            switch (contextType) {
                case MODULE -> contextIdPath =
                        completeFieldName(QActionCollection.actionCollection.publishedCollection.moduleId);
                default -> contextIdPath =
                        completeFieldName(QActionCollection.actionCollection.publishedCollection.pageId);
            }
        } else {
            contextTypePath = completeFieldName(QActionCollection.actionCollection.unpublishedCollection.contextType);
            switch (contextType) {
                case MODULE -> contextIdPath =
                        completeFieldName(QActionCollection.actionCollection.unpublishedCollection.moduleId);
                default -> contextIdPath =
                        completeFieldName(QActionCollection.actionCollection.unpublishedCollection.pageId);
            }
        }
        Criteria contextIdAndContextTypeCriterion =
                where(contextIdPath).is(contextId).and(contextTypePath).is(contextType);
        criteria.add(contextIdAndContextTypeCriterion);

        Criteria deletedCriterion = where(
                        completeFieldName(QActionCollection.actionCollection.unpublishedCollection.deletedAt))
                .is(null);
        criteria.add(deletedCriterion);

        return queryAll(criteria, optionalPermission);
    }

    @Override
    public Mono<ActionCollection> findPublicActionCollectionByModuleId(String moduleId, ResourceModes resourceMode) {
        List<Criteria> criteria = new ArrayList<>();

        String moduleIdPath;
        if (resourceMode == ResourceModes.EDIT) {
            moduleIdPath = completeFieldName(QActionCollection.actionCollection.unpublishedCollection.moduleId);
        } else {
            moduleIdPath = completeFieldName(QActionCollection.actionCollection.publishedCollection.moduleId);
        }
        Criteria moduleIdCriteria = Criteria.where(moduleIdPath).is(moduleId);

        Criteria isPublicCriteria =
                where(fieldName(QActionCollection.actionCollection.isPublic)).is(Boolean.TRUE);

        criteria.add(moduleIdCriteria);
        criteria.add(isPublicCriteria);
        return queryOne(criteria);
    }
}
