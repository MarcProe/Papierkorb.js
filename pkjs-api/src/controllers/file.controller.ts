import {inject} from '@loopback/context';
import {Count, CountSchema} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  oas,
  param,
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import config from 'config';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import sanitize from 'sanitize-filename';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {File} from '../models/';
import {FileUploadHandler} from '../types';

export class FileController {
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) {}

  @get('/files/{filename}')
  @oas.response.file()
  downloadFile(
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const file = FileController.validateFileName(fileName);
    response.download(file, fileName);
    return response;
  }

  @get('/files', {
    responses: {
      '200': {
        description: 'Array of File model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(File, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async getFilesList() {
    return FileController.getGlobFileList().map(e => {
      const stats = fs.statSync(e);
      const ret = new File({
        name: path.basename(e),
        size: stats.size,
        atime: stats.atime.toISOString(),
        mtime: stats.mtime.toISOString(),
      });
      return ret;
    });
  }

  @get('/files/count', {
    responses: {
      '200': {
        description: 'File model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(): Promise<Count> {
    //return this.fileRepository.count(where);
    const files = FileController.getGlobFileList();
    return {count: files.length};
  }

  @del('/files/{filename}', {
    responses: {
      '204': {
        description: 'File DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('filename') id: string): Promise<void> {
    //await this.fileRepository.deleteById(id);

    if (id !== sanitize(id))
      throw new HttpErrors[422](`invalid filename: ${id}`);
    const file = path.join(
      __dirname + '/../',
      config.get('conf.controller.file.path') + '/' + sanitize(id),
    );
    try {
      fs.unlinkSync(file);
    } catch (e) {
      if (e.code) {
        const code: string = e.code;
        if (code === 'ENOENT')
          throw new HttpErrors[404](`file not found: ${sanitize(id)}`);
        else throw new HttpErrors[500](e);
      } else throw new HttpErrors[500](e);
    }
  }

  @post('/files', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
          resolve(FileController.getFilesAndFields(request));
        }
      });
    });
  }

  /**
   * Validate file names to prevent them goes beyond the designated directory
   * @param fileName - File name
   */
  private static validateFileName(fileName: string) {
    const dirpath = path.join(
      __dirname + '/../',
      config.get('conf.controller.file.path'),
    );

    const resolved = path.resolve(dirpath, fileName);
    if (resolved.startsWith(dirpath)) return resolved;
    // The resolved file is outside sandbox
    throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
  }

  private static getGlobFileList() {
    const globpath = path.join(
      __dirname + '/../',
      config.get('conf.controller.file.path') + '/*',
    );
    const globres = glob.sync(globpath);
    return globres;
  }

  /**
   * Get files and fields for the request
   * @param request - Http request
   */
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: object[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }
}
