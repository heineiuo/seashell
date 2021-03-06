import {findTargetLocation, pickLocation} from '../examples/http-proxy/pickLocation'
import Url from 'url'

const locations = [
  {pathname: '/api/account'},
  {pathname: '/api/gateway'}
];


test('find target location', () => {

  const url = Url.parse('https://local.youkuohao.com/api/gateway');

  const result = findTargetLocation(locations, url);
  expect(result).toEqual({pathname: '/api/gateway'});

});

it('pick location', async () => {

  const result2 = await pickLocation(locations, 'https://local.youkuohao.com/api2/gateway');
  expect(result2).toMatchObject({
    location: {pathname: '*'}
  })

});