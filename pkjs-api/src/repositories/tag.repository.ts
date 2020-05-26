import {DefaultCrudRepository} from '@loopback/repository';
import {Tag, TagRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TagRepository extends DefaultCrudRepository<
  Tag,
  typeof Tag.prototype._id,
  TagRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Tag, dataSource);
  }
}
