import {Client, expect} from '@loopback/testlab';
import {PkjsApiApplication} from '../..';
import {setupApplication} from './test-helper';

const filepath = 'src/__tests__/assets/';
const filename = 'test.nld.pdf';

describe('File Upload', () => {
  let app: PkjsApiApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /files/count and checks that there are 0', async () => {
    await client
      .get('/files/count')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(res => {
        expect(res.body).to.containEql({count: 0});
      });
  });

  it('invokes POST /files and uploads a file', async () => {
    await client
      .post('/files')
      .attach('file', filepath + filename)
      .expect('Content-Type', /application\/json/)
      .expect(200);
  }).timeout(60000);

  it('invokes GET /files/count and checks that there is 1', async () => {
    await client
      .get('/files/count')
      .expect('Content-Type', /application\/json/)
      .expect(res => expect(res.body).to.containEql({count: 1}))
      .expect(200);
  });

  it('invokes GET /files and checks that there is one file in the repository', async () => {
    await client
      .get('/files')
      .expect('content-type', /application\/json/)
      .expect(res => expect(res.body.length).to.equal(1))
      .expect(res => expect(res.body[0].name).to.equal(filename))
      .expect(res => expect(res.body[0].size).to.equal(184637))
      .expect(200);
  });

  it('invokes GET /files/{filename} and checks that a file was downloaded', async () => {
    await client
      .get('/files/' + filename)
      .expect('content-type', /application\/pdf/)
      .expect('content-length', '184637')
      .expect(res =>
        expect(res.body.toString('utf-8', 0, 8)).to.equal('%PDF-1.6'),
      )
      .expect(200);
  });

  it('invokes DELETE /files/{id} and deletes the testfile', async () => {
    await client.del('/files/' + filename).expect(204);
  });

  it('invokes GET /files/count and checks that there are 0 again', async () => {
    await client
      .get('/files/count')
      .expect('Content-Type', /application\/json/)
      .expect(res => expect(res.body).to.containEql({count: 0}))
      .expect(200);
  });

  it('invokes GET /files/doesnotexist.txt and checks for 404', async () => {
    await client.get('/files/doesnotexist.txt').expect(404);
  });

  it('invokes GET /files/..%2Fpackage.json and checks for 400', async () => {
    await client.get('/files/..%2Fpackage.json').expect(400);
  });
});
