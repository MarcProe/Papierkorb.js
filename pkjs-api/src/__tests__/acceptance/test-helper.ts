import {Entity} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {PkjsApiApplication} from '../..';
import {Doc, Partner, Tag, User} from '../../models';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new PkjsApiApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: PkjsApiApplication;
  client: Client;
}

/**
 * Interface to hold test data for each Controller
 */
export interface TestObject {
  name: string; //name of the controller to test
  endpoint: string; //endpoint to test
  ent: Entity; //entity to test with (POST)
  pent: Entity; //entity to test with (patch)
}

/**
 * Generate static test data for the controllers that are not
 * doing anything more than accessing the mongodb
 *
 * @returns      TestObject array with statically assigned testdata
 */
export function getControllerTestData(): TestObject[] {
  /**
   * User Object to test POST with
   */
  const user = new User({
    name: 'testUserName',
    search: ['searchprase', 'Ying'],
  });
  /**
   * Tag Object to test POST with
   */
  const tag = new Tag({
    name: 'testTagName',
  });
  /**
   * Partner Object to test POST with
   */
  const partner = new Partner({
    name: 'testPartnerName',
  });
  /**
   * Doc Object to test POST with
   */
  const doc = new Doc({file: 'somefilename.pdf', previews: 5});
  /**
   * User Object to test PATCH with
   */
  const puser = new User({
    name: 'patchedTestUserName',
    search: ['findphrase', 'Yang'],
  });
  /**
   * Tag Object to test PATCH with
   */
  const ptag = new Tag({
    name: 'patchedTestTagName',
  });
  /**
   * Partner Object to test PATCH with
   */
  const ppartner = new Partner({
    name: 'patchedTestPartnerName',
  });
  /**
   * Doc Object to test PATCH with
   */
  const pdoc = new Doc({
    docdate: '2018-02-05T00:00:00.000Z',
    file: '2018-02-05T00:01:03.234Z.pdf',
    lang: 'deu',
    partner: 'TestPartner',
    previews: 6,
    plaintext: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
    erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
    rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
    dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
    erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
    rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
    dolor sit amet.`,
    subject: 'Lorem Ipsum',
    tags: ['TestTag1', 'TestTag2'],
    users: ['TestUser1', 'TestUser2'],
  });

  //put the test objects into an array
  const tobjs: TestObject[] = [];

  tobjs.push({
    name: 'UserController',
    endpoint: 'users',
    ent: user,
    pent: puser,
  });
  tobjs.push({name: 'TagController', endpoint: 'tags', ent: tag, pent: ptag});
  tobjs.push({
    name: 'PartnerController',
    endpoint: 'partners',
    ent: partner,
    pent: ppartner,
  });
  tobjs.push({
    name: 'DocController',
    endpoint: 'docs',
    ent: doc,
    pent: pdoc,
  });

  return tobjs;
}
