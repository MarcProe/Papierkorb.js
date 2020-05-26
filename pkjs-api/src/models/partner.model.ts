import {Entity, model, property} from '@loopback/repository';

@model()
export class Partner extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  constructor(data?: Partial<Partner>) {
    super(data);
  }
}

export interface PartnerRelations {
  // describe navigational properties here
}

export type PartnerWithRelations = Partner & PartnerRelations;
