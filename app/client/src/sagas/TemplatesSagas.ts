import { builderURL } from "@appsmith/RouteBuilder";
import {
  fetchApplication,
  showReconnectDatasourceModal,
} from "@appsmith/actions/applicationActions";
import type {
  ApplicationPayload,
  ReduxAction,
} from "@appsmith/constants/ReduxActionConstants";
import {
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "@appsmith/constants/ReduxActionConstants";
import urlBuilder from "@appsmith/entities/URLRedirect/URLAssembly";
import type { ActionDataState } from "@appsmith/reducers/entityReducers/actionsReducer";
import { updateActionAPICall } from "@appsmith/sagas/ApiCallerSagas";
import { getDefaultPageId } from "@appsmith/sagas/ApplicationSagas";
import { fetchPageDSLSaga } from "@appsmith/sagas/PageSagas";
import {
  getAction,
  getActions,
  getDatasourceStructureById,
} from "@appsmith/selectors/entitiesSelector";
import { getCurrentWorkspaceId } from "@appsmith/selectors/selectedWorkspaceSelectors";
import { isAirgapped } from "@appsmith/utils/airgapHelpers";
import { fetchJSLibraries } from "actions/JSLibraryActions";
import { fetchDatasources } from "actions/datasourceActions";
import { fetchJSCollections } from "actions/jsActionActions";
import { fetchAllPageEntityCompletion, saveLayout } from "actions/pageActions";
import {
  executePageLoadActions,
  fetchActions,
  updateActionSuccess,
} from "actions/pluginActionActions";
import { fetchPluginFormConfigs } from "actions/pluginActions";
import {
  getAllTemplates,
  hideTemplatesModal,
  setTemplateNotificationSeenAction,
  showStarterBuildingBlockDatasourcePrompt,
} from "actions/templateActions";
import type { ApiResponse } from "api/ApiResponses";
import type {
  FetchTemplateResponse,
  ImportTemplateResponse,
  TemplateFiltersResponse,
} from "api/TemplatesApi";
import TemplatesAPI from "api/TemplatesApi";
import { STARTER_BUILDING_BLOCKS } from "constants/TemplatesConstants";
import { toast } from "design-system";
import type { Action } from "entities/Action";
import { APP_MODE } from "entities/App";
import type { DatasourceStructure, DatasourceTable } from "entities/Datasource";
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";
import { getDefaultPageId as selectDefaultPageId } from "sagas/selectors";
import {
  getCurrentApplicationId,
  getCurrentPageId,
  getCurrentPageName,
} from "selectors/editorSelectors";
import history from "utils/history";
import {
  getTemplateNotificationSeen,
  setTemplateNotificationSeen,
} from "utils/storage";
import { validateResponse } from "./ErrorSagas";
import { failFastApiCalls } from "./InitSagas";
import { getAllPageIds } from "./selectors";

const isAirgappedInstance = isAirgapped();

function* getAllTemplatesSaga() {
  try {
    const response: FetchTemplateResponse = yield call(
      TemplatesAPI.getAllTemplates,
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      yield put({
        type: ReduxActionTypes.GET_ALL_TEMPLATES_SUCCESS,
        payload: response.data,
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.GET_ALL_TEMPLATES_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* importTemplateToWorkspaceSaga(
  action: ReduxAction<{ templateId: string; workspaceId: string }>,
) {
  try {
    const response: ImportTemplateResponse = yield call(
      TemplatesAPI.importTemplate,
      action.payload.templateId,
      action.payload.workspaceId,
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      const application: ApplicationPayload = {
        ...response.data.application,
        defaultPageId: getDefaultPageId(
          response.data.application.pages,
        ) as string,
      };
      yield put({
        type: ReduxActionTypes.IMPORT_TEMPLATE_TO_WORKSPACE_SUCCESS,
        payload: response.data.application,
      });

      if (response.data.isPartialImport) {
        yield put(
          showReconnectDatasourceModal({
            application: response.data.application,
            unConfiguredDatasourceList:
              response.data.unConfiguredDatasourceList,
            workspaceId: action.payload.workspaceId,
          }),
        );
      } else {
        const pageURL = builderURL({
          pageId: application.defaultPageId,
        });
        history.push(pageURL);
      }
      yield put(getAllTemplates());
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.IMPORT_TEMPLATE_TO_WORKSPACE_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* getSimilarTemplatesSaga(action: ReduxAction<string>) {
  try {
    const response: FetchTemplateResponse = yield call(
      TemplatesAPI.getSimilarTemplates,
      action.payload,
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      yield put({
        type: ReduxActionTypes.GET_SIMILAR_TEMPLATES_SUCCESS,
        payload: response.data,
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.GET_SIMILAR_TEMPLATES_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* setTemplateNotificationSeenSaga(action: ReduxAction<boolean>) {
  yield setTemplateNotificationSeen(action.payload);
}

function* getTemplateNotificationSeenSaga() {
  const showTemplateNotification: unknown = yield getTemplateNotificationSeen();

  if (showTemplateNotification) {
    yield put(setTemplateNotificationSeenAction(true));
  } else {
    yield put(setTemplateNotificationSeenAction(false));
  }
}

function* getTemplateSaga(action: ReduxAction<string>) {
  try {
    const response: FetchTemplateResponse = yield call(
      TemplatesAPI.getTemplateInformation,
      action.payload,
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      yield put({
        type: ReduxActionTypes.GET_TEMPLATE_SUCCESS,
        payload: response.data,
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.GET_TEMPLATE_ERROR,
      payload: {
        error,
      },
    });
  }
}

export function* postPageAdditionSaga(applicationId: string) {
  const afterActionsFetch: boolean = yield failFastApiCalls(
    [
      fetchActions({ applicationId }, []),
      fetchJSCollections({ applicationId }),
      fetchDatasources(),
      fetchJSLibraries(applicationId),
    ],
    [
      ReduxActionTypes.FETCH_ACTIONS_SUCCESS,
      ReduxActionTypes.FETCH_JS_ACTIONS_SUCCESS,
      ReduxActionTypes.FETCH_DATASOURCES_SUCCESS,
      ReduxActionTypes.FETCH_JS_LIBRARIES_SUCCESS,
    ],
    [
      ReduxActionErrorTypes.FETCH_ACTIONS_ERROR,
      ReduxActionErrorTypes.FETCH_JS_ACTIONS_ERROR,
      ReduxActionErrorTypes.FETCH_DATASOURCES_ERROR,
      ReduxActionErrorTypes.FETCH_JS_LIBRARIES_FAILED,
    ],
  );

  if (!afterActionsFetch) {
    throw new Error("Failed importing template");
  }

  const afterPluginFormsFetch: boolean = yield failFastApiCalls(
    [fetchPluginFormConfigs()],
    [ReduxActionTypes.FETCH_PLUGIN_FORM_CONFIGS_SUCCESS],
    [ReduxActionErrorTypes.FETCH_PLUGIN_FORM_CONFIGS_ERROR],
  );

  if (!afterPluginFormsFetch) {
    throw new Error("Failed importing template");
  }

  yield put(fetchAllPageEntityCompletion([executePageLoadActions()]));
}

function* forkStarterBuildingBlockToApplicationSaga(
  action: ReduxAction<{
    pageNames?: string[];
    templateId: string;
    templateName: string;
  }>,
) {
  try {
    // Get page name and id where the starter template was clicked
    const activePageName: string = yield select(getCurrentPageName);
    const activePageId: string = yield select(getCurrentPageId);
    // Get current default page id
    const defaultPageId: string = yield select(selectDefaultPageId);

    const {
      applicationId,
      isValid,
      templatePageIds,
    }: {
      applicationId: string;
      isValid: boolean;
      prevPageIds: string[];
      templatePageIds: string[];
    } = yield call(apiCallForForkTemplateToApplicaion, action);

    function* deleteExistingEmptyPageInApp(pageId: string) {
      yield put({
        type: ReduxActionTypes.DELETE_PAGE_INIT,
        payload: {
          id: pageId,
        },
      });
    }

    function* renameStarterTemplatePageToDefault(pageId: string) {
      yield put({
        type: ReduxActionTypes.UPDATE_PAGE_INIT,
        payload: {
          id: pageId,
          name: activePageName,
          isHidden: false,
        },
      });
    }
    if (isValid) {
      // If the page where the starter template was clicked is the default page
      if (activePageId === defaultPageId) {
        // 1. Set the template page as home page
        yield put({
          type: ReduxActionTypes.SET_DEFAULT_APPLICATION_PAGE_INIT,
          payload: {
            id: templatePageIds[0],
            applicationId,
          },
        });
        yield race([
          take(ReduxActionTypes.SET_DEFAULT_APPLICATION_PAGE_SUCCESS),
          take(ReduxActionErrorTypes.SET_DEFAULT_APPLICATION_PAGE_ERROR),
        ]);
      }

      // 2. Delete the existing page
      yield fork(deleteExistingEmptyPageInApp, activePageId);

      // 3. Rename the template page to clicked from page
      yield fork(renameStarterTemplatePageToDefault, templatePageIds[0]);

      // 4. Wait for page update and delete to complete
      yield race([
        take(ReduxActionTypes.UPDATE_PAGE_SUCCESS),
        take(ReduxActionErrorTypes.UPDATE_PAGE_ERROR),
      ]);

      // 5. Complete the page addition flow
      yield put({
        type: ReduxActionTypes.IMPORT_STARTER_TEMPLATE_TO_APPLICATION_SUCCESS,
      });

      // Show datasource prompt after 3 seconds
      yield delay(STARTER_BUILDING_BLOCKS.DATASOURCE_PROMPT_DELAY);
      yield put(showStarterBuildingBlockDatasourcePrompt(templatePageIds[0]));
    } else {
      yield put({
        type: ReduxActionErrorTypes.IMPORT_STARTER_BUILDING_BLOCK_TO_APPLICATION_ERROR,
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.IMPORT_STARTER_BUILDING_BLOCK_TO_APPLICATION_ERROR,
    });
  }
}

function* generateBuildingBlockFromDatasourceTable(
  action: ReduxAction<{
    pageNames?: string[];
    templateId: string;
    templateName: string;
    datasourceId: string;
    pluginId: string;
    datasourceName: string;
    tableName: string;
    templateQueryConfig: { name: string; type: string }[];
  }>,
) {
  function generateSelectQuery(tableName: string): string {
    const selectQuery = `SELECT * FROM ${tableName} LIMIT 10;`;
    return selectQuery;
  }
  function generateUpdateQuery(tableStructure: DatasourceTable): string {
    const tableName = tableStructure.name;
    const setClauses = tableStructure.columns
      .filter((column) => !column.isAutogenerated)
      .map((column) => {
        return `"${column.name}" = {{jsf_data.formData.${column.name}}}`;
      })
      .join(",\n    ");

    const primaryKeyColumn =
      tableStructure.keys.find((key) => key.type === "primary key")
        ?.columnNames[0] || "id";

    const updateQuery = `UPDATE ${tableName} SET
      ${setClauses}
    WHERE ${primaryKeyColumn} = {{tbl_data.selectedRow.${primaryKeyColumn}}};`;

    return updateQuery;
  }
  function* handleActionUpdate(
    queryConfig: { name: string; type: string },
    pageId: string,
  ) {
    // Get action(s) that need to be changed
    const appActions: ActionDataState = yield select(getActions);
    const datasourceStructure: DatasourceStructure = yield select(
      getDatasourceStructureById,
      action.payload.datasourceId,
    );

    if (datasourceStructure.tables) {
      const tableStructure = datasourceStructure.tables.find(
        (table) => table.name === action.payload.tableName,
      );
      const getUsersActionData = appActions.filter(
        (a) => a.config.name === queryConfig.name && a.config.pageId === pageId,
      )[0];
      const getUsersAction: Action = yield select(
        getAction,
        getUsersActionData.config.id,
      );
      // create object to update action with new datasource and query
      const updatedGetUsersAction: Action = {
        ...getUsersAction,
        actionConfiguration: {
          ...getUsersAction.actionConfiguration,
          body:
            queryConfig.type === "SELECT"
              ? generateSelectQuery(action.payload.tableName)
              : generateUpdateQuery(tableStructure!),
        },
        datasource: {
          ...getUsersAction.datasource,
          id: action.payload.datasourceId,
          name: action.payload.datasourceName,
          pluginId: action.payload.pluginId,
        },
      };
      // Update the action
      const response: ApiResponse<Action> = yield call(
        updateActionAPICall,
        updatedGetUsersAction,
      );
      const isValidResponse: boolean = yield validateResponse(response);
      if (isValidResponse) {
        yield put(updateActionSuccess({ data: response.data }));
      }
    }
  }
  try {
    const pagesToImport = action.payload.pageNames
      ? action.payload.pageNames
      : undefined;
    const applicationId: string = yield select(getCurrentApplicationId);
    const workspaceId: string = yield select(getCurrentWorkspaceId);
    const prevPageIds: string[] = yield select(getAllPageIds);
    const response: ImportTemplateResponse = yield call(
      TemplatesAPI.importTemplateToApplication,
      action.payload.templateId,
      applicationId,
      workspaceId,
      pagesToImport,
    );
    yield put(
      fetchApplication({
        mode: APP_MODE.EDIT,
        applicationId,
      }),
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      yield call(postPageAdditionSaga, applicationId);
      const pages: string[] = yield select(getAllPageIds);
      const templatePageIds: string[] = pages.filter(
        (pageId) => !prevPageIds.includes(pageId),
      );
      const pageDSLs: unknown = yield all(
        templatePageIds.map((pageId: string) => {
          return call(fetchPageDSLSaga, pageId);
        }),
      );

      yield put({
        type: ReduxActionTypes.FETCH_PAGE_DSLS_SUCCESS,
        payload: pageDSLs,
      });

      yield put({
        type: ReduxActionTypes.UPDATE_PAGE_LIST,
        payload: pageDSLs,
      });

      yield put({
        type: ReduxActionTypes.IMPORT_TEMPLATE_TO_APPLICATION_SUCCESS,
        payload: response.data.application,
      });

      // Get and update the query for each queryConfig in the template
      for (const queryConfig of action.payload.templateQueryConfig) {
        yield* handleActionUpdate(queryConfig, templatePageIds[0]);
      }

      yield delay(3000);

      yield put({
        type: ReduxActionTypes.GENERATE_BUILDING_BLOCK_FROM_DS_TABLE_SUCCESS,
      });

      history.push(
        builderURL({
          pageId: pages[0],
        }),
      );
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.GENERATE_BUILDING_BLOCK_FROM_DS_TABLE_ERROR,
    });
  }
}

// function* generateBuildingBlockFromGsheetTable(
//   action: ReduxAction<{
//     pageNames?: string[];
//     templateId: string;
//     templateName: string;
//     datasourceId: string;
//     pluginId: string;
//     spreadSheetName: string;
//     sheetUrl: string;
//     templateQueryConfig: { name: string; type: string }[];
//   }>,
// ) {
//   try {
//     // const currentPageId: string = yield select(getCurrentPageId);
//     // const actionPayload = {
//     //   actionConfiguration: {
//     //     formData: {
//     //       command: {
//     //         data: "FETCH_MANY",
//     //       },
//     //       entityType: {
//     //         data: "ROWS",
//     //       },
//     //       tableHeaderIndex: {
//     //         data: "1",
//     //       },
//     //       projection: {
//     //         data: [],
//     //       },
//     //       queryFormat: {
//     //         data: "ROWS",
//     //       },
//     //       range: {
//     //         data: "",
//     //       },
//     //       sheetName: {
//     //         data: action.payload.spreadSheetName,
//     //       },
//     //       sheetUrl: {
//     //         data: action.payload.sheetUrl,
//     //       },
//     //       where: {
//     //         data: {
//     //           condition: "AND",
//     //         },
//     //       },
//     //       pagination: {
//     //         data: {
//     //           limit: "20",
//     //           offset: "0",
//     //         },
//     //       },
//     //       smartSubstitution: {
//     //         data: true,
//     //       },
//     //     },
//     //   },
//     //   pluginId: action.payload.pluginId,
//     //   datasource: {
//     //     id: action.payload.datasourceId,
//     //   },
//     //   eventData: {},
//     //   name: "test_gsheet_api",
//     //   pageId: currentPageId,
//     // };

//     // // yield put(createActionInit(actionPayload));

//     // // yield delay(3000);

//     // const appActions: ActionDataState = yield select(getActions);

//     // const getUsersActionData = appActions.filter(
//     //   (a) =>
//     //     a.config.name === actionPayload.name &&
//     //     a.config.pageId === currentPageId,
//     // )[0];
//     // const getUsersAction: Action = yield select(
//     //   getAction,
//     //   getUsersActionData.config.id,
//     // );

//     // // create object to update action with new datasource and query
//     // const updatedGetUsersAction: Action = {
//     //   ...getUsersAction,
//     //   actionConfiguration: {
//     //     ...getUsersAction.actionConfiguration,
//     //     formData: actionPayload.actionConfiguration.formData,
//     //   },
//     // };
//     // console.log("🚀 ~ updatedGetUsersAction:", updatedGetUsersAction);
//     // // Update the action
//     // const response: ApiResponse<Action> = yield call(
//     //   updateActionAPICall,
//     //   updatedGetUsersAction,
//     // );
//     // const isValidResponse: boolean = yield validateResponse(response);
//     // if (isValidResponse) {
//     //   yield put(updateActionSuccess({ data: response.data }));
//     // }

//     // const appActions: ActionDataState = yield select(getActions);
//     // console.log(
//     // console.log("🚀 ~ response:", response);
//     //   "🚀 ~ function*generateBuildingBlockFromGsheetTable ~ appActions:",
//     //   appActions,
//     // );
//   } catch (error) {
//     // console.log(
//     //   "🚀 ~ function*generateBuildingBlockFromGsheetTable ~ error:",
//     //   error,
//     // );
//   }
// }

function* forkTemplateToApplicationSaga(
  action: ReduxAction<{
    pageNames?: string[];
    templateId: string;
    templateName: string;
  }>,
) {
  try {
    const {
      isValid,
    }: {
      isValid: boolean;
    } = yield call(apiCallForForkTemplateToApplicaion, action);
    if (isValid) {
      yield put(hideTemplatesModal());
      yield put(getAllTemplates());

      toast.show(
        `Pages from '${action.payload.templateName}' template added successfully`,
        {
          kind: "success",
        },
      );
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.IMPORT_TEMPLATE_TO_APPLICATION_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* apiCallForForkTemplateToApplicaion(
  action: ReduxAction<{
    templateId: string;
    templateName: string;
    pageNames?: string[] | undefined;
  }>,
) {
  const pagesToImport = action.payload.pageNames
    ? action.payload.pageNames
    : undefined;
  const applicationId: string = yield select(getCurrentApplicationId);
  const workspaceId: string = yield select(getCurrentWorkspaceId);
  const prevPageIds: string[] = yield select(getAllPageIds);
  const response: ImportTemplateResponse = yield call(
    TemplatesAPI.importTemplateToApplication,
    action.payload.templateId,
    applicationId,
    workspaceId,
    pagesToImport,
  );
  // To fetch the new set of pages after merging the template into the existing application
  yield put(
    fetchApplication({
      mode: APP_MODE.EDIT,
      applicationId,
    }),
  );
  const isValid: boolean = yield validateResponse(response);
  if (isValid) {
    yield call(postPageAdditionSaga, applicationId);
    const pages: string[] = yield select(getAllPageIds);
    const templatePageIds: string[] = pages.filter(
      (pageId) => !prevPageIds.includes(pageId),
    );
    const pageDSLs: unknown = yield all(
      templatePageIds.map((pageId: string) => {
        return call(fetchPageDSLSaga, pageId);
      }),
    );

    yield put({
      type: ReduxActionTypes.FETCH_PAGE_DSLS_SUCCESS,
      payload: pageDSLs,
    });

    yield put({
      type: ReduxActionTypes.UPDATE_PAGE_LIST,
      payload: pageDSLs,
    });
    if (response.data.isPartialImport) {
      yield put(
        showReconnectDatasourceModal({
          application: response.data.application,
          unConfiguredDatasourceList: response.data.unConfiguredDatasourceList,
          workspaceId,
          pageId: pages[0],
        }),
      );
    }
    history.push(
      builderURL({
        pageId: pages[0],
      }),
    );
    yield take(ReduxActionTypes.UPDATE_CANVAS_STRUCTURE);
    yield put(saveLayout());
    yield put({
      type: ReduxActionTypes.IMPORT_TEMPLATE_TO_APPLICATION_SUCCESS,
      payload: response.data.application,
    });
    return { isValid, applicationId, templatePageIds, prevPageIds };
  }
  return { isValid };
}

function* getTemplateFiltersSaga() {
  try {
    const response: TemplateFiltersResponse = yield call(
      TemplatesAPI.getTemplateFilters,
    );
    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      yield put({
        type: ReduxActionTypes.GET_TEMPLATE_FILTERS_SUCCESS,
        payload: response.data,
      });
    }
  } catch (e) {
    yield put({
      type: ReduxActionErrorTypes.GET_TEMPLATE_FILTERS_ERROR,
      payload: {
        e,
      },
    });
  }
}

function* forkTemplateToApplicationViaOnboardingFlowSaga(
  action: ReduxAction<{
    pageNames?: string[];
    templateId: string;
    templateName: string;
    applicationId: string;
    workspaceId: string;
  }>,
) {
  try {
    const response: ImportTemplateResponse = yield call(
      TemplatesAPI.importTemplateToApplication,
      action.payload.templateId,
      action.payload.applicationId,
      action.payload.workspaceId,
      action.payload.pageNames,
    );

    const isValid: boolean = yield validateResponse(response);
    if (isValid) {
      const application = response.data.application;
      urlBuilder.updateURLParams(
        {
          applicationSlug: application.slug,
          applicationVersion: application.applicationVersion,
          applicationId: application.id,
        },
        application.pages.map((page) => ({
          pageSlug: page.slug,
          customSlug: page.customSlug,
          pageId: page.id,
        })),
      );
      history.push(
        builderURL({
          pageId: application.pages[0].id,
        }),
      );

      // This is to remove the existing default Page 1 in the new application after template has been imported.
      // 1. Set new page as default
      const importedTemplatePages = application.pages.filter(
        (page) => !page.isDefault,
      );
      yield put({
        type: ReduxActionTypes.SET_DEFAULT_APPLICATION_PAGE_INIT,
        payload: {
          id: importedTemplatePages[0].id,
          applicationId: application.id,
        },
      });

      yield take(ReduxActionTypes.SET_DEFAULT_APPLICATION_PAGE_SUCCESS);

      const defaultPageId = application.pages.filter(
        (page) => page.isDefault,
      )[0].id;

      //2. Delete old default page (Page 1)
      yield put({
        type: ReduxActionTypes.DELETE_PAGE_INIT,
        payload: {
          id: defaultPageId,
        },
      });

      yield put({
        type: ReduxActionTypes.IMPORT_TEMPLATE_TO_APPLICATION_ONBOARDING_FLOW_SUCCESS,
        payload: response.data.application,
      });
      toast.show(
        `Pages from '${action.payload.templateName}' template added successfully`,
        {
          kind: "success",
        },
      );
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.IMPORT_TEMPLATE_TO_APPLICATION_ONBOARDING_FLOW_ERROR,
      payload: {
        error,
      },
    });
  }
}

// TODO: Refactor and handle this airgap check in a better way - posssibly in root sagas (sangeeth)
export default function* watchActionSagas() {
  if (!isAirgappedInstance)
    yield all([
      takeEvery(ReduxActionTypes.GET_ALL_TEMPLATES_INIT, getAllTemplatesSaga),
      takeEvery(ReduxActionTypes.GET_TEMPLATE_INIT, getTemplateSaga),
      takeEvery(
        ReduxActionTypes.GET_SIMILAR_TEMPLATES_INIT,
        getSimilarTemplatesSaga,
      ),
      takeEvery(
        ReduxActionTypes.IMPORT_TEMPLATE_TO_WORKSPACE_INIT,
        importTemplateToWorkspaceSaga,
      ),
      takeEvery(
        ReduxActionTypes.GET_TEMPLATE_NOTIFICATION_SEEN,
        getTemplateNotificationSeenSaga,
      ),
      takeEvery(
        ReduxActionTypes.SET_TEMPLATE_NOTIFICATION_SEEN,
        setTemplateNotificationSeenSaga,
      ),
      takeEvery(
        ReduxActionTypes.IMPORT_TEMPLATE_TO_APPLICATION_INIT,
        forkTemplateToApplicationSaga,
      ),
      takeEvery(
        ReduxActionTypes.GET_TEMPLATE_FILTERS_INIT,
        getTemplateFiltersSaga,
      ),
      takeEvery(
        ReduxActionTypes.IMPORT_STARTER_BUILDING_BLOCK_TO_APPLICATION_INIT,
        forkStarterBuildingBlockToApplicationSaga,
      ),
      takeEvery(
        ReduxActionTypes.IMPORT_TEMPLATE_TO_APPLICATION_ONBOARDING_FLOW,
        forkTemplateToApplicationViaOnboardingFlowSaga,
      ),
      takeEvery(
        ReduxActionTypes.GENERATE_BUILDING_BLOCK_FROM_DS_TABLE_INIT,
        generateBuildingBlockFromDatasourceTable,
      ),
      // takeEvery(
      //   ReduxActionTypes.GENERATE_BUILDING_BLOCK_FROM_GSHEET_TABLE_INIT,
      //   generateBuildingBlockFromGsheetTable,
      // ),
    ]);
}
