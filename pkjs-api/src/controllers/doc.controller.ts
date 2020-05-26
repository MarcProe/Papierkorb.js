import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Doc} from '../models';
import {DocRepository} from '../repositories';

export class DocController {
  constructor(
    @repository(DocRepository)
    public docRepository: DocRepository,
  ) {}

  @post('/docs', {
    responses: {
      '200': {
        description: 'Doc model instance',
        content: {'application/json': {schema: getModelSchemaRef(Doc)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doc, {
            title: 'NewDoc',
            exclude: ['_id'],
          }),
        },
      },
    })
    doc: Omit<Doc, '_id'>,
  ): Promise<Doc> {
    return this.docRepository.create(doc);
  }

  @get('/docs/count', {
    responses: {
      '200': {
        description: 'Doc model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Doc) where?: Where<Doc>): Promise<Count> {
    return this.docRepository.count(where);
  }

  @get('/docs', {
    responses: {
      '200': {
        description: 'Array of Doc model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Doc, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Doc) filter?: Filter<Doc>): Promise<Doc[]> {
    return this.docRepository.find(filter);
  }

  @patch('/docs', {
    responses: {
      '200': {
        description: 'Doc PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doc, {partial: true}),
        },
      },
    })
    doc: Doc,
    @param.where(Doc) where?: Where<Doc>,
  ): Promise<Count> {
    return this.docRepository.updateAll(doc, where);
  }

  @get('/docs/{id}', {
    responses: {
      '200': {
        description: 'Doc model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doc, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Doc, {exclude: 'where'}) filter?: FilterExcludingWhere<Doc>,
  ): Promise<Doc> {
    return this.docRepository.findById(id, filter);
  }

  @patch('/docs/{id}', {
    responses: {
      '204': {
        description: 'Doc PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doc, {partial: true}),
        },
      },
    })
    doc: Doc,
  ): Promise<void> {
    await this.docRepository.updateById(id, doc);
  }

  @put('/docs/{id}', {
    responses: {
      '204': {
        description: 'Doc PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() doc: Doc,
  ): Promise<void> {
    await this.docRepository.replaceById(id, doc);
  }

  @del('/docs/{id}', {
    responses: {
      '204': {
        description: 'Doc DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.docRepository.deleteById(id);
  }
}
