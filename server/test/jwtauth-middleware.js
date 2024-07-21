const expect = require('chai').expect;

const authMiddleware = require('../middleware/jwtauth')

describe('Auth middleware', function() {
    it('should throw an error if no authorization header is present', function(){
      const req = {
        headers: []
      }
      expect(authMiddleware.httpJWT.bind(this, req, {} , () => {})).to.throw('Not authenticated')
    })
  }
)