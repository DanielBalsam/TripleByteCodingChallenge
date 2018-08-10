const fs = require('fs');

const en = fs.readFileSync('src/assets/i18n/en.json', 'utf8');

module.exports = {
  method: 'GET',
  path: '/api/i18n',
  config: {
    handler: (req, res) => {
      var json;
      if (!req.params.locale || req.params.locale === 'en') {
        json = JSON.parse(en);
      }
      res(json);
    }
  }
}
