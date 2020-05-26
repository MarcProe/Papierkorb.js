import {DefaultCrudRepository} from '@loopback/repository';
import {Doc, DocRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DocRepository extends DefaultCrudRepository<
  Doc,
  typeof Doc.prototype._id,
  DocRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Doc, dataSource);
  }
}
