package com.appsmith.external.plugins;

import com.appsmith.util.SerializationUtils;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;

public abstract class BasePlugin extends Plugin {

    protected static final ObjectMapper objectMapper =
            SerializationUtils.getBasicObjectMapper(null).setSerializationInclusion(JsonInclude.Include.USE_DEFAULTS);

    public BasePlugin(PluginWrapper wrapper) {
        super(wrapper);
    }
}
