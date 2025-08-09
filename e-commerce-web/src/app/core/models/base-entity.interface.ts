import { EntityType } from './entity-type.enum';
import { KeyValuePair } from './key-value-pair.interface';

export interface BaseEntity<T extends string | number> extends KeyValuePair<T> {
  type: EntityType;
  metadata?: Record<string, any>;
}
