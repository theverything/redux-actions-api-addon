import { createAPIAction } from '../';
import { isFSA } from 'flux-standard-action';

describe('createAPIAction()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE';

    it('returns a valid FSA', () => {
      const actionCreator = createAPIAction(type, 'GET', '/sample', b => b);
      const action = actionCreator();
      expect(isFSA(action)).to.be.true;
    });

    it('uses return value as payload', () => {
      const actionCreator = createAPIAction(type, 'GET', '/sample', b => b, b => b);
      const action = actionCreator();
      expect(action).to.deep.equal({
        type,
        payload: {},
        meta: {
          api: true,
          method: 'GET',
          endpoint: '/sample',
          types: [
            type.concat('_GET_REQUEST'),
            type.concat('_GET_SUCCESS'),
            type.concat('_GET_FAILURE')
          ]
        }
      });
    });

    it('uses identity function if actionCreator is not a function', () => {
      const actionCreator = createAPIAction(type, 'POST', '/sample');
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
        meta: {
          api: true,
          method: 'POST',
          endpoint: '/sample',
          types: [
            type.concat('_POST_REQUEST'),
            type.concat('_POST_SUCCESS'),
            type.concat('_POST_FAILURE')
          ]
        }
      });
      expect(isFSA(action)).to.be.true;
    });

    it('accepts a second parameter for adding meta to object', () => {
      const actionCreator = createAPIAction(type, 'POST', '/sample', null, ({ cid }) => ({ cid }));
      const foobar = { foo: 'bar', cid: 5 };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
        meta: {
          api: true,
          method: 'POST',
          endpoint: '/sample',
          cid: 5,
          types: [
            type.concat('_POST_REQUEST'),
            type.concat('_POST_SUCCESS'),
            type.concat('_POST_FAILURE')
          ]
        }
      });
      expect(isFSA(action)).to.be.true;
    });


    it('sets error to true if payload is an Error object', () => {
      const actionCreator = createAPIAction(type, 'GET', '/sample');
      const errObj = new TypeError('this is an error');

      const errAction = actionCreator(errObj);
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
        meta: {
          api: true,
          method: 'GET',
          endpoint: '/sample',
          types: [
            type.concat('_GET_REQUEST'),
            type.concat('_GET_SUCCESS'),
            type.concat('_GET_FAILURE')
          ]
        }
      });
      expect(isFSA(errAction)).to.be.true;

      const actionCreatorPost = createAPIAction(type, 'POST', '/sample');
      const foobar = { foo: 'bar', cid: 5 };
      const noErrAction = actionCreatorPost(foobar);
      expect(noErrAction).to.deep.equal({
        type,
        payload: foobar,
        meta: {
          api: true,
          method: 'POST',
          endpoint: '/sample',
          types: [
            type.concat('_POST_REQUEST'),
            type.concat('_POST_SUCCESS'),
            type.concat('_POST_FAILURE')
          ]
        }
      });
      expect(isFSA(noErrAction)).to.be.true;
    });


    it('test GET endoint, ALL elements', () => {
      const getItems = createAPIAction(type, 'GET', '/sample', b => b, b => b);
      expect(getItems()).to.deep.equal({
        type,
        payload: {},
        meta: {
          api: true,
          method: 'GET',
          endpoint: '/sample',
          types: [
            type.concat('_GET_REQUEST'),
            type.concat('_GET_SUCCESS'),
            type.concat('_GET_FAILURE')
          ]
        }
      });
    });


    it('test POST Data endpoint', () => {
      const createItems = createAPIAction(type, 'POST', '/sample');
      const postData = { name: 'james' };
      expect(createItems(postData)).to.deep.equal({
        type,
        payload: postData,
        meta: {
          api: true,
          method: 'POST',
          endpoint: '/sample',
          types: [
            type.concat('_POST_REQUEST'),
            type.concat('_POST_SUCCESS'),
            type.concat('_POST_FAILURE')
          ]
        }
      });
    });

    it('test PUT Data endpoint', () => {
      const updateItems = createAPIAction(type, 'PUT', '/sample');
      const postID = 10;
      const postData = { name: 'james' };
      expect(updateItems(postID, postData)).to.deep.equal({
        type,
        payload: postData,
        meta: {
          api: true,
          method: 'PUT',
          endpoint: '/sample/10',
          types: [
            type.concat('_PUT_REQUEST'),
            type.concat('_PUT_SUCCESS'),
            type.concat('_PUT_FAILURE')
          ]
        }
      });
    });

    it('test DELETE Data endpoint', () => {
      const deleteItems = createAPIAction(type, 'DELETE', '/sample');
      const postID = 5;
      expect(deleteItems(postID)).to.deep.equal({
        type,
        payload: {},
        meta: {
          api: true,
          method: 'DELETE',
          endpoint: '/sample/5',
          types: [
            type.concat('_DELETE_REQUEST'),
            type.concat('_DELETE_SUCCESS'),
            type.concat('_DELETE_FAILURE')
          ]
        }
      });
    });

  });

  describe('Testing Custom Endpoints', () => {
    const type = 'TYPE';
    it('test GET with Custom Endpoint', () => {
      const customEndpoint = () => '/tester/mctesterson';
      const getItems = createAPIAction(type, 'GET', customEndpoint);
      expect(getItems()).to.deep.equal({
        type,
        payload: {},
        meta: {
          api: true,
          method: 'GET',
          endpoint: '/tester/mctesterson',
          types: [
            type.concat('_GET_REQUEST'),
            type.concat('_GET_SUCCESS'),
            type.concat('_GET_FAILURE')
          ]
        }
      });
    });

    it('test Get by ID with Custom Endpoint', () => {
      const customEndpoint = (p) => `/tester/${p}/mctesterson`;
      const getItems = createAPIAction(type, 'GET', customEndpoint);
      expect(getItems(10)).to.deep.equal({
        type,
        payload: 10,
        meta: {
          api: true,
          method: 'GET',
          endpoint: '/tester/10/mctesterson',
          types: [
            type.concat('_GET_REQUEST'),
            type.concat('_GET_SUCCESS'),
            type.concat('_GET_FAILURE')
          ]
        }
      });
    });

    it('test POST with Custom Endpoint', () => {
      const customEndpoint = (params) => `/user/${params.id}/ronald/${params.name}`;
      const createItem = createAPIAction(type, 'POST', customEndpoint);
      const payload = { id: 10, name: 'james' };
      expect(createItem(payload)).to.deep.equal({
        type,
        payload,
        meta: {
          api: true,
          method: 'POST',
          endpoint: '/user/10/ronald/james',
          types: [
            type.concat('_POST_REQUEST'),
            type.concat('_POST_SUCCESS'),
            type.concat('_POST_FAILURE')
          ]
        }
      });
    });

    it('test PUT with Custom Endpoint', () => {
      const customEndpoint = (params) => `/user/${params.id}`;
      const updateItem = createAPIAction(type, 'PUT', customEndpoint);
      const payload = { id: 10, name: 'james' };
      expect(updateItem(payload)).to.deep.equal({
        type,
        payload,
        meta: {
          api: true,
          method: 'PUT',
          endpoint: '/user/10',
          types: [
            type.concat('_PUT_REQUEST'),
            type.concat('_PUT_SUCCESS'),
            type.concat('_PUT_FAILURE')
          ]
        }
      });
    });

    it('test DELETE with Custom Endpoint', () => {
      const customEndpoint = ({ id, accountID }) => `/user/${id}/account/${accountID}`;
      const deleteItem = createAPIAction(type, 'DELETE', customEndpoint);
      const payload = { id: 10, accountID: 25 };
      expect(deleteItem(payload)).to.deep.equal({
        type,
        payload,
        meta: {
          api: true,
          method: 'DELETE',
          endpoint: '/user/10/account/25',
          types: [
            type.concat('_DELETE_REQUEST'),
            type.concat('_DELETE_SUCCESS'),
            type.concat('_DELETE_FAILURE')
          ]
        }
      });
    });

  });
});
