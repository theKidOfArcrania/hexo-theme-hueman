(function(gb) {
  var opened = false;
  var encData = gb.encData;
  var subtle = gb.crypto.subtle;
  delete gb.encData;

  function fromHex(h) {
    if (h.length & 1 != 0) {
      throw new RangeError("Odd-length hex string!");
    }

    var buff = new Uint8Buffer(h.length / 2)
    for (var i = 0; i < h.length; i += 2) {
      buff[i >> 1] = parseInt(h.substr(i, 2), 16);
    }
    return buff.buffer;
  }

  function hex(buffer) {
    var hexCodes = [];
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
      var value = view.getUint32(i);
      var stringValue = value.toString(16);
      var padding = '00000000';
      var paddedValue = (padding + stringValue).slice(-padding.length);
      hexCodes.push(paddedValue);
    }

    return hexCodes.join("");
  }

  function hash(msg) {
    return subtle.digest('SHA-512', msg);
  }

  function decrypt(pwd, iv, msg) {
    return hash(new TextEncoder("utf-8").encode(pwd)).then(function(secret) {
      return subtle.importKey("raw", secret.slice(0, 32), 
          {name: "AES-CBC", length: 256}, false, "decrypt");
    }).then(function(key) {
      return subtle.decrypt({name: "AES-CBC", iv: fromHex(iv)}, key, 
          new TextEncoder("utf-8").encode(msg));
    });
  }

  function tryDecryptPost(pwd) {
    if (!subtle) {
      return Promise.reject('');
    }

    return decrypt(pwd, encData.iv, encData.msg).then(function(msg) {
      var str = new TextDecoder("utf-8").decode(msg);
      return Promise.all(str, hash(msg));
    }).then(function(vals) {
      if (encData.hash != hex(vals[1])) {
        return Promise.reject('');
      }

      opened = true;
      $(".article-locker").remove();
      $(".article-decrypted").html(vals[0]);
    });
  }

  $(".article-locker .submit").click(function() {
    if (opened)
      return;

    var pwd = $(".article-locker .pwd").text();
    var remember = $(".article-locker .remember")[0].checked;

    if (!subtle) {
      $(".article-locker .error").text("You may need to connect via https to unlock!"); 
      return;
    }

    tryDecryptPost(pwd).then(function() {
      //Save password
      if (remember && gb.localStorage) {
        if (gb.localStorage.pwds) {
          gb.localStorage.pwds += "\0" + pwd;
        } else {
          gb.localStorage.pwds = pwd;
        }
      }
    }, function(err) {
      $(".article-locker .error-msg").text("Invalid password!"); 
    });
  });

  $(document).ready(async function() {
    $(".removing").remove();
    if (gb.localStorage && gb.localStorage.pwds) {
      for (var pwd of gb.localStorage.pwds.split("\0")) {
        try {
          await tryDecryptPost(pwd);
        } catch (e) { /* Do nothing */ }
      }
    }
  });

})(window);
