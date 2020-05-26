import {Client, expect} from '@loopback/testlab';
import {PkjsApiApplication} from '../..';
import {
  getControllerTestData,
  setupApplication,
  TestObject,
} from './test-helper';

//test users, tags and partners as they are plain database objects

/**
 * Array to hold all test objects
 */
const tobjs: TestObject[] = getControllerTestData();

describe('All Plain Controllers', () => {
  let app: PkjsApiApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  for (const key in tobjs) {
    const name = tobjs[key].name;
    const ep = tobjs[key].endpoint;
    const obj = tobjs[key].ent;
    const pobj = tobjs[key].pent;

    let retId: string;

    describe(name, () => {
      it(`invokes GET /${ep}/count and checks for 0`, async () => {
        await client
          .get(`/${ep}/count`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            expect(res.body).to.containEql({count: 0});
          });
      });

      it(`invokes POST /${ep} and creates test object`, async () => {
        await client
          .post(`/${ep}`)
          .send(obj)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            retId = res.body._id;
          });
      });

      it(`invokes GET /${ep}/count, checks for 1`, async () => {
        await client
          .get(`/${ep}/count`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            expect(res.body).to.containEql({count: 1});
          });
      });

      it(`invokes GET /${ep}/{id} and checks the object`, async () => {
        await client
          .get(`/${ep}/${retId}`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            delete res.body._id; //retval does not have id
            expect(res.body).to.containEql(obj.toJSON());
          });
      });

      it(`invokes PATCH /${ep}/{id} and patches test object`, async () => {
        await client.patch(`/${ep}/${retId}`).send(pobj).expect(204);
      });

      it(`invokes GET /${ep}/ and checks the 1st object to be patched`, async () => {
        await client
          .get(`/${ep}/`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            expect(res.body.length).to.equal(1);
            delete res.body[0]._id; //retval does not have id
            expect(res.body[0]).to.containEql(pobj.toJSON());
          });
      });

      it(`invokes DELETE /${ep}/{id} and deletes the object`, async () => {
        await client.del(`/${ep}/${retId}`).expect(204);
      });

      it(`invokes GET /${ep}/count and checks for 0 again`, async () => {
        await client
          .get(`/${ep}/count`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(res => {
            expect(res.body).to.containEql({count: 0});
          });
      });
    });
  }
});
