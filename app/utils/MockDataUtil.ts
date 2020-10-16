/**
 * Copyright 2020 Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DATE_TIME_FORMAT, DATE_FORMAT } from 'Const';
import { PRIMITIVE_TYPE } from 'MetaModelConst';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import { PrimitiveType } from 'MM/model/packageableElements/domain/PrimitiveType';
import { Enumeration } from 'MM/model/packageableElements/domain/Enumeration';
import { Enum } from 'MM/model/packageableElements/domain/Enum';
import { Class, CLASS_PROPERTY_TYPE, getClassPropertyType } from 'MM/model/packageableElements/domain/Class';
import { MappingElementSource } from 'MM/model/packageableElements/mapping/Mapping';

export const getRandomInt = (max: number): number => Math.floor(Math.random() * Math.floor(max));
export const getRandomItemInCollection = <T>(collection: T[]): T => collection[getRandomInt(collection.length)];
export const randomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
export const createMockPrimitiveProperty = (primitiveType: PrimitiveType, propertyName: string): string | number | boolean => {
  switch (primitiveType.name) {
    case PRIMITIVE_TYPE.BOOLEAN: return getRandomItemInCollection<boolean>([true, false]);
    case PRIMITIVE_TYPE.FLOAT:
    case PRIMITIVE_TYPE.DECIMAL: return Math.round(Math.random() * 10000) / 100;
    case PRIMITIVE_TYPE.NUMBER:
    case PRIMITIVE_TYPE.INTEGER: return getRandomInt(100);
    // NOTE that `Date` is the umbrella type that comprises `StrictDate` and `DateTime`, but for simplicity, we will generate `Date` as `StrictDate`
    case PRIMITIVE_TYPE.DATE:
    case PRIMITIVE_TYPE.STRICTDATE: return format(randomDate(new Date(Date.now()), addDays(Date.now(), 100)), DATE_FORMAT);
    case PRIMITIVE_TYPE.DATETIME: return format(randomDate(new Date(Date.now()), addDays(Date.now(), 100)), DATE_TIME_FORMAT);
    case PRIMITIVE_TYPE.STRING:
    default: return `${propertyName} ${getRandomInt(100)}`;
  }
};
export const createMockEnumerationProperty = (enumeration: Enumeration): string => getRandomItemInCollection<Enum>(enumeration.values).name;

export const createMockClassInstance = (_class: Class, traverseNonRequiredProperties = false, depth = 0): Record<PropertyKey, unknown> => {
  const properties = traverseNonRequiredProperties ? _class.getAllProperties() : _class.getAllProperties().filter(p => p.multiplicity.lowerBound);
  const mockData: Record<string, object | string | number | boolean> = {};
  properties.forEach(property => {
    const propertyType = property.genericType.value.rawType;
    let propertyMockData: Record<PropertyKey, unknown> | string | number | boolean | undefined;
    switch (getClassPropertyType(propertyType)) {
      case CLASS_PROPERTY_TYPE.PRIMITIVE: propertyMockData = createMockPrimitiveProperty(propertyType as PrimitiveType, property.name); break;
      case CLASS_PROPERTY_TYPE.ENUMERATION: propertyMockData = createMockEnumerationProperty(propertyType as Enumeration); break;
      case CLASS_PROPERTY_TYPE.CLASS: if (depth > 0) { propertyMockData = createMockClassInstance(propertyType as Class, traverseNonRequiredProperties, depth - 1) } break;
      default: break;
    }
    if (propertyMockData) {
      mockData[property.name] = property.multiplicity.upperBound === undefined || property.multiplicity.upperBound >= 2
        ? [propertyMockData]
        : propertyMockData;
    }
  });
  return mockData;
};

export const classHasCycle = (_class: Class, traverseNonRequiredProperties: boolean, classesIndex: Set<string>): boolean => {
  if (classesIndex.has(_class.path)) { return true }
  const properties = (traverseNonRequiredProperties ? _class.getAllProperties() : _class.getAllProperties().filter(p => p.multiplicity.lowerBound));
  const complexProperties = properties.map(property => property.genericType.value.rawType).filter(c => getClassPropertyType(c) === CLASS_PROPERTY_TYPE.CLASS);
  if (complexProperties.length > 0) {
    // we only count classes with complex properties in the cycle. Example an address class with all primitive should not tigger a class to be cycled
    classesIndex.add(_class.path);
  }
  // we only check unique complex property classes; 2 same property classes on the same level do not count as a cycle
  return Boolean(Array.from(new Set(complexProperties)).find(c => classHasCycle(c as Class, traverseNonRequiredProperties, classesIndex)));
};

export const createMockDataForClass = (element: Class, maxDepth = 100, depthForCycle = 3): Record<PropertyKey, unknown> => {
  const depth = classHasCycle(element, true, new Set<string>()) ? Math.max(depthForCycle, 0) : Math.max(maxDepth, 0);
  return createMockClassInstance(element, true, depth);
};

export const createMockDataForMappingElementSource = (srcElement: MappingElementSource): string => {
  if (srcElement instanceof Class) {
    return JSON.stringify(createMockDataForClass(srcElement), null, 2);
  }
  return '';
};
