const ejs = require('ejs');
const assign = require('object-assign');

hexo.extend.renderer.register('enc', 'html', function (data, locals) {
  json = JSON.stringify(JSON.parse(data.text));
  view = hexo.theme.getView('encrypt-inner');
  return view.render(assign({'json': json}, locals));
});
