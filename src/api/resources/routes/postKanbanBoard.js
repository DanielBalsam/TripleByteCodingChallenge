const fs = require('fs');

module.exports = {
  method: 'POST',
  path: '/api/kanban',
  config: {
    handler: (req, res) => {
      let payload = JSON.stringify(req.payload);

      fs.writeFileSync('src/assets/kanban/kanban.json', payload, {encoding: 'utf8'});

      res(req.payload);
    }
  }
}
