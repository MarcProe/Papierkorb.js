import {DefaultCrudRepository} from '@loopback/repository';
import {Partner, PartnerRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PartnerRepository extends DefaultCrudRepository<
  Partner,
  typeof Partner.prototype._id,
  PartnerRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Partner, dataSource);
  }
}
