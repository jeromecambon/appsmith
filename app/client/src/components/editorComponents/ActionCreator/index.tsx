import React, { useCallback, useEffect, useRef, useState } from "react";
import { getActionBlocks } from "@shared/ast";
import type { ActionCreatorProps } from "./types";
import { getCodeFromMoustache, isEmptyBlock } from "./utils";
import { diff } from "deep-diff";
import RootAction from "./viewComponents/ActionV2/RootActionV2";
import { Icon } from "design-system-old";
import clsx from "clsx";

function uuidv4() {
  return String(1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

export const ActionCreatorContext = React.createContext<{
  label: string;
  selectBlock: (id: string) => void;
  selectedBlockId?: string;
}>({
  label: "",
  selectBlock: () => {
    return;
  },
  selectedBlockId: "",
});

const ActionCreator = React.forwardRef(
  (props: ActionCreatorProps, ref: any) => {
    const [actions, setActions] = useState<Record<string, string>>(() => {
      const blocks = getActionBlocks(
        getCodeFromMoustache(props.value),
        window.evaluationVersion,
      );

      const res = blocks.reduce(
        (acc: Record<string, string>, value: string) => ({
          ...acc,
          [uuidv4()]: value,
        }),
        {},
      );

      return res;
    });

    const updatedIdRef = useRef<string>("");
    const previousBlocks = useRef<string[]>([]);

    useEffect(() => {
      setActions((prev) => {
        const newActions: Record<string, string> = {};
        const newBlocks: string[] = getActionBlocks(
          getCodeFromMoustache(props.value),
          self.evaluationVersion,
        );

        let prevIdValuePairs = Object.entries(prev);

        // We make sure that code blocks from previous render retain the same id
        // We are sure that the order of the blocks will be the same
        newBlocks.forEach((block) => {
          const prevIdValuePair = prevIdValuePairs.find(
            ([, value]) => value === block,
          );
          if (prevIdValuePair) {
            newActions[prevIdValuePair[0]] = block;

            // Filter out the id value pair so that it's not used again
            prevIdValuePairs = prevIdValuePairs.filter(
              ([id]) => id !== prevIdValuePair[0],
            );
          } else if (childUpdate.current && updatedIdRef?.current) {
            // Child updates come with the id of the block that was updated
            newActions[updatedIdRef.current] = block;
            prevIdValuePairs = prevIdValuePairs.filter(
              ([id]) => id !== updatedIdRef.current,
            );
            updatedIdRef.current = "";
            childUpdate.current = false;
          } else {
            // If the block is not present in the previous blocks, it's a new block
            // We need to check if the block is a result of an edit
            // If it is, we need to retain the id of the previous block
            // This is to ensure that the undo/redo stack is not broken
            const differences = diff(previousBlocks.current, newBlocks);
            if (differences?.length === 1 && differences[0].kind === "E") {
              const edit = differences[0];
              //@ts-expect-error fix later
              const prevBlock = edit.lhs as string;
              const prevIdValuePair = prevIdValuePairs.find(
                ([, value]) => value === prevBlock,
              );
              if (prevIdValuePair) {
                newActions[prevIdValuePair[0]] = block;
                prevIdValuePairs = prevIdValuePairs.filter(
                  ([id]) => id !== prevIdValuePair[0],
                );
                return;
              }
            }
            newActions[uuidv4()] = block;
          }
        });
        previousBlocks.current = [...newBlocks];
        updatedIdRef.current = "";
        childUpdate.current = false;
        return newActions;
      });
    }, [props.value]);

    const save = useCallback(
      (newActions) => {
        props.onValueChange(
          Object.values(newActions).length > 0
            ? `{{${Object.values(newActions).filter(Boolean).join("\n")}}}`
            : "",
          false,
        );
      },
      [props.onValueChange],
    );

    /** This variable will be set for all changes that happen from the Action blocks
     * It will be unset for all the changes that happen from the parent components (Undo/Redo)
     */
    const childUpdate = React.useRef(false);

    const handleActionChange = (id: string) => (value: string) => {
      const newValueWithoutMoustache = getCodeFromMoustache(value);
      const newActions = { ...actions };
      updatedIdRef.current = id;
      childUpdate.current = true;
      if (newValueWithoutMoustache) {
        newActions[id] = newValueWithoutMoustache;
      } else {
        delete newActions[id];
      }
      save(newActions);
    };

    // We need a unique id for each action when it's mapped
    // We can't use index for obvious reasons
    // We can't use the action value itself because it's not unique and changes on action change
    const [selectedBlockId, selectBlock] = useState<string | undefined>(
      undefined,
    );

    const id = useRef<string>("");

    useEffect(() => {
      if (!id.current) return;
      const children = ref.current?.children || [];
      const lastChildElement = children[children.length - 1];
      lastChildElement?.scrollIntoView({ block: "nearest" });
      selectBlock(id.current);
      id.current = "";
    }, [actions]);

    const addBlock = useCallback(() => {
      const hasAnEmptyBlock = Object.entries(actions).find(([, action]) =>
        isEmptyBlock(action),
      );
      if (hasAnEmptyBlock) {
        selectBlock(hasAnEmptyBlock[0]);
        return;
      }
      const newActions = { ...actions };
      id.current = uuidv4();
      newActions[id.current] = "";
      setActions(newActions);
    }, [actions, save]);

    return (
      <div className="relative pt-1">
        <button
          className={clsx(
            "add-action flex items-center justify-center text-center h-5 w-5",
            false && "disabled",
            "absolute right-0 top-[-22px]",
          )}
          disabled={false}
          onClick={addBlock}
        >
          <Icon fillColor="#575757" name="plus" size="extraExtraLarge" />
        </button>
        <ActionCreatorContext.Provider
          value={{ label: props.action, selectedBlockId, selectBlock }}
        >
          <div className="flex flex-col gap-[2px]" ref={ref}>
            {Object.entries(actions).map(([id, value]) => (
              <RootAction
                code={value}
                id={id}
                key={id}
                onChange={handleActionChange(id)}
              />
            ))}
          </div>
        </ActionCreatorContext.Provider>
      </div>
    );
  },
);

ActionCreator.displayName = "ActionCreator";

export default ActionCreator;
