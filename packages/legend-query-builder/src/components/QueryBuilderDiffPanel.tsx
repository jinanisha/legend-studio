/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DEFAULT_TAB_SIZE } from '@finos/legend-application';
import { clsx, Dialog, Button } from '@finos/legend-art';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import {
  type QueryBuilderDiffViewState,
  QueryBuilderDiffViewMode,
} from '../stores/QueryBuilderChangeDetectionState.js';
import { pruneSourceInformation } from '@finos/legend-graph';
import {
  CODE_EDITOR_LANGUAGE,
  CodeDiffView,
  JSONDiffView,
} from '@finos/legend-lego/code-editor';

export const QueryBuilderDiffViewPanel = observer(
  (props: { diffViewState: QueryBuilderDiffViewState }) => {
    const { diffViewState } = props;
    const fromGrammarText = diffViewState.initialQueryGrammarText;
    const toGrammarText = diffViewState.currentQueryGrammarText;

    // actions
    const onChangeMode =
      (mode: QueryBuilderDiffViewMode): (() => void) =>
      (): void => {
        diffViewState.setMode(mode);
      };
    const close = (): void =>
      diffViewState.changeDetectionState.hideDiffViewPanel();

    useEffect(() => {
      diffViewState.generateGrammarDiff();
    }, [diffViewState]);

    return (
      <Dialog
        open={Boolean(diffViewState)}
        onClose={close}
        classes={{
          root: 'editor-modal__root-container',
          container: 'editor-modal__container',
          paper: 'editor-modal__content',
        }}
      >
        <div
          className={clsx(
            'modal modal--dark editor-modal query-builder-text-mode__modal',
          )}
        >
          <div className="query-builder__diff-panel">
            <div className="query-builder__diff-panel__header">
              {Object.values(QueryBuilderDiffViewMode).map((mode) => (
                <button
                  onClick={onChangeMode(mode)}
                  className={clsx('query-builder__diff-panel__mode', {
                    'query-builder__diff-panel__mode--selected':
                      mode === diffViewState.mode,
                  })}
                  key={mode}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="query-builder__diff-panel__content">
              {diffViewState.mode === QueryBuilderDiffViewMode.GRAMMAR && (
                <CodeDiffView
                  language={CODE_EDITOR_LANGUAGE.PURE}
                  from={fromGrammarText}
                  to={toGrammarText}
                />
              )}
              {diffViewState.mode === QueryBuilderDiffViewMode.JSON && (
                <JSONDiffView
                  from={JSON.stringify(
                    {
                      parameters: diffViewState.initialQuery.parameters
                        ? pruneSourceInformation(
                            diffViewState.initialQuery.parameters,
                          )
                        : undefined,
                      body: diffViewState.initialQuery.body
                        ? pruneSourceInformation(
                            diffViewState.initialQuery.body,
                          )
                        : undefined,
                    },
                    null,
                    DEFAULT_TAB_SIZE,
                  )}
                  to={JSON.stringify(
                    {
                      parameters: diffViewState.currentQuery.parameters
                        ? pruneSourceInformation(
                            diffViewState.currentQuery.parameters,
                          )
                        : undefined,
                      body: diffViewState.currentQuery.body
                        ? pruneSourceInformation(
                            diffViewState.currentQuery.body,
                          )
                        : undefined,
                    },
                    null,
                    DEFAULT_TAB_SIZE,
                  )}
                />
              )}
            </div>
            <div className="query-builder__diff-panel__actions">
              <Button text="close" onClick={close} />
            </div>
          </div>
        </div>
      </Dialog>
    );
  },
);
