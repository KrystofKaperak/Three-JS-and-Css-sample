// A modified version of HTML5 sessionStorage by Andrea Giammarchi

/**
 *  example usuage of sessionStorage API
 *
 *  sessionStorage.key(int)
 *  ===========================
 *   this method accepts an integer less than this.length
 *   in order to obtain associated key for that length
 *   please note order is browser dependent but there is
 *   consistency for the related key as specs say
 *  
 *   @example
 *   if(sessionStorage.length > 0)
 *   alert(
 *      sessionStorage.getItem(sessionStorage.key(0));
 *      // it should alert the most old value set in sessionStorage
 *   );
 *  
 *  sessionStorage.getItem(key)
 *  =============================
 *   this method gives back a string, or will return null
 *   if used key has never been set
 *   @example
 *   if(sessionStorage.getItem("myStuff") === null)
 *       sessionStorage.setItem("myStuff", "toldya it's my stuff!");
 *   alert(sessionStorage.getItem("myStuff"));
 *   // toldya it's my stuff!
 *  
 *  sessionStorage.setItem(key, data)
 *  ==================================
 *   this method save in the sessionStorage a generic key/value pair
 *   please remember that specs say both key and value
 *   should be strings, otherwise these are converted into strings
 *   @example
 *   sessionStorage.setItem("myObj", {a:"b"});
 *   alert(sessionStorage.getItem("myObj"));
 *   // [object Object] but it will be exactly the string "[object Object]"
 *   // and NOT the original object
 *  
 *  sessionStorage.removeItem(key)
 *  ==================================
 *   this method remove from the sessionStorage
 *   a generic key/value pair, and only if it is present.
 *   @example
 *   sessionStorage.setItem("myName", "Test");
 *   sessionStorage.getItem("myName");
 *   // Test
 *   sessionStorage.removeItem("myName");
 *   sessionStorage.getItem("myName");
 *   // null
 *
 *  sessionStorage.clear()
 *  ==================================
 *   this method clear everything has been stored in this object.
 *   @example
 *   sessionStorage.clear();
 */

(function(window){

if(typeof sessionStorage !== "undefined") {
  try {
    random = '@@' + Math.random();
    sessionStorage.setItem(random, random);
    sessionStorage.removeItem(random);
    return;
  } catch(o_O) {

  }
}

var // the top pointer is used in any case to point to the top context level
    top = window,
    random
;
try {
    while(top !== top.top)
        top = top.top;
} catch(e) {
};

var RC4 = (function(String, fromCharCode, random){
    return {

        decode:function(key, data){
            return this.encode(key, data);
        },

        encode:function(key, data){
            for(var
                length = key.length, len = data.length,
                decode = [], a = [],
                i = 0, j = 0, k = 0, l = 0, $;
                i < 256; ++i
            )   a[i] = i;
            for(i = 0; i < 256; ++i){
                j = (j + ($ = a[i]) + key.charCodeAt(i % length)) % 256;
                a[i] = a[j];
                a[j] = $;
            };
            for(j = 0; k < len; ++k){
                i = k % 256;
                j = (j + ($ = a[i])) % 256;
                length = a[i] = a[j];
                a[j] = $;
                decode[l++] = data.charCodeAt(k) ^ a[(length + $) % 256];
            };
            return fromCharCode.apply(String, decode);
        },

        key:function(length){
            for(var i = 0, key = []; i < length; ++i)
                key[i] = 1 + ((random() * 255) << 0)
            ;
            return fromCharCode.apply(String, key);
        }
    }

})(window.String, window.String.fromCharCode, window.Math.random);

var LSS = (function(window){

    function LSS(_storage, _key, _data){
        this._i = (this._data = _data || "").length;
        if(this._key = _key)
            this._storage = _storage;
        else {
            this._storage = {_key:_storage || ""};
            this._key = "_key";
        };
    };

    LSS.prototype.c = String.fromCharCode(1);

    LSS.prototype._c = ".";

    LSS.prototype.clear = function(){
        this._storage[this._key] = this._data;
    };

    LSS.prototype.del = function(key){
        var data = this.get(key);
        if(data !== null)
            this._storage[this._key] = this._storage[this._key].replace(escape.call(this, key, data), "");
    };

    LSS.prototype.escape   = window.escape;

    LSS.prototype.get = function(key){
        var _storage = this._storage[this._key],
            c = this.c,
            i = _storage.indexOf(key = c.concat(this._c, this.escape(key), c, c), this._i),
            data = null
        ;
        if(-1 < i){
            i = _storage.indexOf(c, i + key.length - 1) + 1;
            data = _storage.substring(i, i = _storage.indexOf(c, i));
            data = this.unescape(_storage.substr(++i, data));
        };
        return data;
    };

    LSS.prototype.key = function(){
        var _storage = this._storage[this._key],
            c = this.c,
            _c = c + this._c,
            i = this._i,
            data = [],
            length = 0,
            l = 0
        ;
        while(-1 < (i = _storage.indexOf(_c, i))){
            data[l++] = this.unescape(_storage.substring(i += 2, length = _storage.indexOf(c, i)));
            i = _storage.indexOf(c, length) + 2;
            length = _storage.indexOf(c, i);
            i = 1 + length + 1 * _storage.substring(i, length);
        };
        return data;
    };

    LSS.prototype.set = function(key, data){
        this.del(key);
        this._storage[this._key] += escape.call(this, key, data);
    };

    LSS.prototype.unescape = window.unescape;

    function escape(key, data){
        var c = this.c;
        return c.concat(this._c, this.escape(key), c, c, (data = this.escape(data)).length, c, data);
    };

    return LSS;

})(window);

if(Object.prototype.toString.call(window.opera) === "[object Opera]"){

    history.navigationMode="compatible";

    LSS.prototype.escape = window.encodeURIComponent;
    LSS.prototype.unescape = window.decodeURIComponent;
};

function sessionStorage(){

    function clear(){
        document.cookie = [
            "sessionStorage=" + window.encodeURIComponent($key = RC4.key(128))
        ].join(';');
        domain = RC4.encode($key, domain);
        LSS = new LSS(top, "name", top.name);
    };
    var name = top.name,
        document = top.document,
        cookie = /\bsessionStorage\b=([^;]+)(;|$)/,
        data = cookie.exec(document.cookie),
        i;
    if(data){
        $key = window.decodeURIComponent(data[1]);
        domain = RC4.encode($key, domain);
        LSS = new LSS(top, "name");

        for(var key = LSS.key(), i = 0, length = key.length, $cache = {}; i < length; ++i){
            if((data = key[i]).indexOf(domain) === 0){
                cache.push(data);
                $cache[data] = LSS.get(data);
                LSS.del(data);
            };
        };

        LSS = new LSS.constructor(top, "name", top.name);
        if(0 < (this.length = cache.length)){
            for(i = 0, length = cache.length, c = LSS.c, data = []; i < length; ++i)
                data[i] = c.concat(LSS._c, LSS.escape(key = cache[i]), c, c, (key = LSS.escape($cache[key])).length, c, key);
            top.name += data.join("");
        };
    } else {
        clear();
        if(!cookie.exec(document.cookie))
            cache = null;
    };
};

// sessionStorage Singleton prototype
sessionStorage.prototype = {

    length:0,

    key:function(index){
        if(typeof index !== "number" || index < 0 || cache.length <= index)
            throw "Invalid argument";
        return cache[index];
    },

    getItem:function(key){
        key = domain + key;
        if(hasOwnProperty.call($cache, key))
            return $cache[key];
        var data = LSS.get(key);
        if(data !== null)
            data = $cache[key] = RC4.decode($key, data);
        return data;
    },

    setItem:function(key, data){
        this.removeItem(key);
        key = domain + key;
        LSS.set(key, RC4.encode($key, $cache[key] = "" + data));
        this.length = cache.push(key);
    },

    removeItem:function(key){
        var data = LSS.get(key = domain + key);
        if(data !== null){
            delete $cache[key];
            LSS.del(key);
            this.length = cache.remove(key);
        };
    },

    clear:function(){
        LSS.clear();
        $cache = {};
        cache.length = 0;
    }
};

var domain = top.document.domain,
    cache = [],
    $cache = {}, 
    hasOwnProperty = $cache.hasOwnProperty,
    $key;

cache.remove = function(data){
    var i = this.indexOf(data);
    if(-1 < i)
        this.splice(i, 1);
    return this.length;
};

if(!cache.indexOf) cache.indexOf = function(data){
    for(var i = 0, length = this.length; i < length; ++i){
        if(this[i] === data)
            return i;
    };
    return -1;
};

if(top.sessionStorage && (
  !/native/.test(top.sessionStorage.clear)
)){
    sessionStorage = function(){};
    sessionStorage.prototype = top.sessionStorage;
};

sessionStorage = new sessionStorage;


if(cache !== null)

    window.sessionStorage = sessionStorage;

})(window);