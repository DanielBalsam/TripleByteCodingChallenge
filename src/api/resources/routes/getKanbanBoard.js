const fs = require('fs');

module.exports = {
  method: 'GET',
  path: '/api/kanban',
  config: {
    handler: (req, res) => {
      const file = fs.readFileSync('src/assets/kanban/kanban.json', 'utf8');

      if (file) {
        let json = JSON.parse(file);
        res(json);
      }
    }
  }
}
