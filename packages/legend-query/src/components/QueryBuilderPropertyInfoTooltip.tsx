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

import type { TooltipProps } from '@material-ui/core';
import { Tooltip } from '@material-ui/core';
import { StubTransition } from '@finos/legend-art';
import type { AbstractProperty } from '@finos/legend-graph';
import { DerivedProperty } from '@finos/legend-graph';
import { getMultiplicityDescription } from './shared/QueryBuilderUtils';

export const QueryBuilderPropertyInfoTooltip: React.FC<{
  property: AbstractProperty;
  path: string;
  isMapped: boolean;
  children: React.ReactElement;
  placement: NonNullable<TooltipProps['placement']>;
}> = (props) => {
  const { property, path, isMapped, children, placement } = props;
  return (
    <Tooltip
      arrow={true}
      placement={placement}
      classes={{
        tooltip: 'query-builder__tooltip',
        arrow: 'query-builder__tooltip__arrow',
        tooltipPlacementRight: 'query-builder__tooltip--right',
      }}
      TransitionComponent={StubTransition}
      title={
        <div className="query-builder__tooltip__content">
          <div className="query-builder__tooltip__item">
            <div className="query-builder__tooltip__item__label">Type</div>
            <div className="query-builder__tooltip__item__value">
              {property.genericType.value.rawType.path}
            </div>
          </div>
          <div className="query-builder__tooltip__item">
            <div className="query-builder__tooltip__item__label">Path</div>
            <div className="query-builder__tooltip__item__value">{path}</div>
          </div>
          <div className="query-builder__tooltip__item">
            <div className="query-builder__tooltip__item__label">
              Multiplicity
            </div>
            <div className="query-builder__tooltip__item__value">
              {getMultiplicityDescription(property.multiplicity)}
            </div>
          </div>
          <div className="query-builder__tooltip__item">
            <div className="query-builder__tooltip__item__label">
              Derived Property
            </div>
            <div className="query-builder__tooltip__item__value">
              {property instanceof DerivedProperty ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="query-builder__tooltip__item">
            <div className="query-builder__tooltip__item__label">Mapped</div>
            <div className="query-builder__tooltip__item__value">
              {isMapped ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};