import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { SearchVariant } from "design-system-old";
import { SearchInput } from "design-system";
import { useSelector } from "react-redux";
import {
  getShouldFocusPanelPropertySearch,
  getShouldFocusPropertySearch,
} from "selectors/propertyPaneSelectors";
import { isCurrentFocusOnInput } from "utils/editorContextUtils";
import { PROPERTY_SEARCH_INPUT_PLACEHOLDER } from "@appsmith/constants/messages";

const SearchInputWrapper = styled.div`
  position: sticky;
  top: 42px;
  z-index: 3;
  padding: 0 1rem;
  background: var(--ads-v2-color-white);
`;

type PropertyPaneSearchInputProps = {
  onTextChange: (text: string) => void;
  isPanel?: boolean;
};

export function PropertyPaneSearchInput(props: PropertyPaneSearchInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldFocusSearch = useSelector(getShouldFocusPropertySearch);
  const shouldFocusPanelSearch = useSelector(getShouldFocusPanelPropertySearch);
  const isPanel = !!props.isPanel;

  useEffect(() => {
    // Checks if the property pane opened not because of focusing an input inside a widget
    if (
      shouldFocusSearch &&
      // while the panel transition happens, focus will be happening twice. Once on the main pane and then on the panel
      // The following check will make sure that the focus is only done once and prevents the UI jittering
      isPanel === shouldFocusPanelSearch
    ) {
      setTimeout(
        () => {
          //checking for active element
          //inside timeout to have updated active element
          if (!isCurrentFocusOnInput()) {
            wrapperRef.current?.focus();
          }
        },
        // Layered panels like Column Panel's transition takes 300ms.
        // To avoid UI jittering, we are delaying the focus by 300ms.
        isPanel ? 300 : 0,
      );
    }
  }, [shouldFocusSearch, shouldFocusPanelSearch, isPanel]);

  const handleInputKeydown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        wrapperRef.current?.focus();
        break;
    }
  }, []);

  const handleWrapperKeydown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        inputRef.current?.focus();
        break;
    }
  }, []);

  useEffect(() => {
    inputRef.current?.addEventListener("keydown", handleInputKeydown);

    return () => {
      inputRef.current?.removeEventListener("keydown", handleInputKeydown);
    };
  }, []);

  return (
    <SearchInputWrapper
      className="t--property-pane-search-input-wrapper"
      onKeyDown={handleWrapperKeydown}
      ref={wrapperRef}
      tabIndex={0}
    >
      <SearchInput
        className="propertyPaneSearch"
        onChange={props.onTextChange}
        placeholder={PROPERTY_SEARCH_INPUT_PLACEHOLDER}
        // @ts-expect-error: ref not allowed
        ref={inputRef}
        tabIndex={-1}
        variant={SearchVariant.BACKGROUND}
      />
    </SearchInputWrapper>
  );
}
