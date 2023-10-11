import {
  FETCHING_TEMPLATE_LIST,
  FORKING_TEMPLATE,
  createMessage,
} from "@appsmith/constants/messages";
import type { Template } from "api/TemplatesApi";
import React from "react";
import { useSelector } from "react-redux";
import {
  isFetchingTemplatesSelector,
  isImportingTemplateToAppSelector,
} from "selectors/templatesSelectors";
import styled from "styled-components";
import { TemplatesContent } from "..";
import Filters from "../Filters";
import LoadingScreen from "./LoadingScreen";

const Wrapper = styled.div`
  display: flex;
  height: 85vh;
  overflow-y: hidden;

  .templates-search {
    background-color: var(--ads-v2-color-bg);
  }
`;

const FilterWrapper = styled.div`
  .filter-wrapper {
    width: 200px;
  }
`;

const ListWrapper = styled.div`
  height: 79vh;
  overflow: auto;
  width: 100%;
`;

interface TemplateListProps {
  onTemplateClick: (id: string) => void;
  onClose: () => void;
}

function TemplateList(props: TemplateListProps) {
  const onForkTemplateClick = (template: Template) => {
    props.onTemplateClick(template.id);
  };
  const isImportingTemplateToApp = useSelector(
    isImportingTemplateToAppSelector,
  );
  const isFetchingTemplates = useSelector(isFetchingTemplatesSelector);

  if (isFetchingTemplates) {
    return <LoadingScreen text={createMessage(FETCHING_TEMPLATE_LIST)} />;
  }

  if (isImportingTemplateToApp) {
    return <LoadingScreen text={createMessage(FORKING_TEMPLATE)} />;
  }

  return (
    <Wrapper className="flex flex-col">
      <div className="flex">
        <FilterWrapper>
          <Filters />
        </FilterWrapper>
        <ListWrapper>
          <TemplatesContent
            filterWithAllowPageImport
            isForkingEnabled={false}
            onForkTemplateClick={onForkTemplateClick}
            onTemplateClick={props.onTemplateClick}
            stickySearchBar
          />
        </ListWrapper>
      </div>
    </Wrapper>
  );
}

export default TemplateList;
