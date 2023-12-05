package com.appsmith.server.domains;

import com.appsmith.external.models.BaseDomain;
import com.appsmith.external.views.Views;
import com.appsmith.server.constants.Url;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Entity
public class Workspace extends BaseDomain {

    @JsonView(Views.Public.class)
    private String domain;

    @NotBlank(message = "Name is mandatory")
    @JsonView(Views.Public.class)
    private String name;

    @JsonView(Views.Public.class)
    private String website;

    @JsonView(Views.Public.class)
    private String email;

    @ManyToMany
    @JsonView(Views.Public.class)
    @ToString.Exclude
    private Set<WorkspacePlugin> plugins;

    @JsonView(Views.Public.class)
    private String slug;

    @JsonView(Views.Public.class)
    private Boolean isAutoGeneratedWorkspace;

    @OneToMany
    @JsonView(Views.Internal.class)
    @Deprecated
    @ToString.Exclude
    private List<UserRole> userRoles;

    @OneToOne
    @JsonView(Views.Internal.class)
    private Asset logoAsset;

    @JsonView(Views.Public.class)
    private String tenantId;

    @JsonView(Views.Internal.class)
    private Boolean hasEnvironments;

    @OneToMany
    @JsonView(Views.Internal.class)
    @ToString.Exclude
    private Set<PermissionGroup> defaultPermissionGroups;

    public String makeSlug() {
        return toSlug(name);
    }

    public static String toSlug(String text) {
        return text == null ? null : text.replaceAll("[^\\w\\d]+", "-").toLowerCase();
    }

    @JsonView(Views.Public.class)
    public String getLogoUrl() {
        return Url.ASSET_URL + "/" + logoAsset.getId();
    }
}
