import {Entity, model, property} from '@loopback/repository';

@model()
export class Doc extends Entity {
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
  file: string;

  @property({
    type: 'number',
    required: true,
  })
  previews: number;

  @property({
    type: 'string',
  })
  plaintext?: string;

  @property({
    type: 'date',
  })
  docdate?: string;

  @property({
    type: 'string',
  })
  partner?: string;

  @property({
    type: 'string',
  })
  subject?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  tags?: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  users?: string[];

  @property({
    type: 'string',
  })
  lang?: string;

  constructor(data?: Partial<Doc>) {
    super(data);
  }
}

export interface DocRelations {
  // describe navigational properties here
}

export type DocWithRelations = Doc & DocRelations;
