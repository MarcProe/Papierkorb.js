// Uncomment these imports to begin using these cool features!

//import {inject} from '@loopback/context';
import {get} from '@loopback/rest';

export class TestController {
  constructor() {}

  @get('/test')
  async shit() {
    //if (limit > 100) limit = 100; // your logic
    //return this.repository.find({limit}); // a CRUD method from our repository
    return {Hello: 'World'};
  }
}
