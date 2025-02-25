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

import packageJson from '../../../../package.json';
import type { PlainObject } from '@finos/legend-shared';
import V1_SYSTEM_MODELS from './v1/V1_FMT_JSONSchema_SystemModels.json';
import {
  type V1_PureModelContextData,
  PureProtocolProcessorPlugin,
} from '@finos/legend-graph';

export class FMT_JSONSchema_PureProtocolProcessorPlugin extends PureProtocolProcessorPlugin {
  constructor() {
    super(
      packageJson.extensions.pureProtocolProcessorPlugin,
      packageJson.version,
    );
  }

  override V1_getExtraSystemModels(): PlainObject<V1_PureModelContextData>[] {
    return [V1_SYSTEM_MODELS];
  }
}
