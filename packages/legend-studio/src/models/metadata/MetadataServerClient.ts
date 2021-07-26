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

import { AbstractServerClient } from '@finos/legend-studio-network';
import type { PlainObject } from '@finos/legend-studio-shared';
import type { Entity } from '../../models/sdlc/models/entity/Entity';
import type { ProjectMetadata } from './models/ProjectMetadata';
import type {
  ProjectVersion,
  ProjectVersionEntities,
} from './models/ProjectVersionEntities';

interface MetadataServerClientConfig {
  serverUrl: string;
}

export class MetadataServerClient extends AbstractServerClient {
  constructor(config: MetadataServerClientConfig) {
    super({
      baseUrl: config.serverUrl,
    });
  }

  // ------------------------------------------- Project -------------------------------------------

  private _projects = (): string => `${this.networkClient.baseUrl}/projects`;
  private _project = (projectId: string): string =>
    `${this._projects()}/${encodeURIComponent(projectId)}`;

  // TODO: use Metadata model
  getProjects = (): Promise<PlainObject<ProjectMetadata>[]> =>
    this.get(this._projects());

  // ------------------------------------------- Version -------------------------------------------

  private _versions = (projectId: string): string =>
    `${this._project(projectId)}/versions`;
  private _version = (projectId: string, versionId: string): string =>
    `${this._project(projectId)}/versions/${encodeURIComponent(versionId)}`;

  getVersionEntities = (
    projectId: string,
    versionId: string,
  ): Promise<PlainObject<Entity>[]> =>
    this.get(this._version(projectId, versionId));

  // ------------------------------------------- Dependencies -------------------------------------------

  getDependencyEntities = (
    /**
     * List of (direct) dependencies.
     */
    dependencies: PlainObject<ProjectVersion>[],
    /**
     * Flag indicating if transitive dependencies should be returned.
     */
    transitive: boolean,
    /**
     * Flag indicating whether to return the root of the dependency tree.
     */
    includeOrigin: boolean,
  ): Promise<PlainObject<ProjectVersionEntities>[]> =>
    this.post(
      `${this._projects()}/versions/dependencies`,
      dependencies,
      undefined,
      undefined,
      {
        transitive,
        includeOrigin,
        versioned: false, // we don't need to add version prefix to entity path
      },
    );
}
