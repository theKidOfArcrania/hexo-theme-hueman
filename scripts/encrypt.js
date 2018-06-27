
hexo.extend.renderer.register('enc', 'html', function (data) {
  json = JSON.stringify(JSON.parse(data.text));
  return '<p>This post has been encrypted. Please enter a password to unlock ' +
    'this post.</p> <p><label>Password: <input type="password"></label>' + 
    '<input value="submit" type="button" onclick="decryptPost()"></p>' +
    '<script><!--\n window.encData = ' + json  + ';\n--></script>';
});
