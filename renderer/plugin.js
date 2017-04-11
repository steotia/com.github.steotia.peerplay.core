!function(){var t={VERSION:"2.4.0",Result:{SUCCEEDED:1,NOTRANSITION:2,CANCELLED:3,PENDING:4},Error:{INVALID_TRANSITION:100,PENDING_TRANSITION:200,INVALID_CALLBACK:300},WILDCARD:"*",ASYNC:"async",create:function(e,n){var r="string"==typeof e.initial?{state:e.initial}:e.initial,i=e.terminal||e.final,a=n||e.target||{},o=e.events||[],u=e.callbacks||{},s={},c={},f=function(e){var n=Array.isArray(e.from)?e.from:e.from?[e.from]:[t.WILDCARD];s[e.name]=s[e.name]||{};for(var r=0;r<n.length;r++)c[n[r]]=c[n[r]]||[],c[n[r]].push(e.name),s[e.name][n[r]]=e.to||n[r];e.to&&(c[e.to]=c[e.to]||[])};r&&(r.event=r.event||"startup",f({name:r.event,from:"none",to:r.state}));for(var l=0;l<o.length;l++)f(o[l]);for(var v in s)s.hasOwnProperty(v)&&(a[v]=t.buildEvent(v,s[v]));for(var v in u)u.hasOwnProperty(v)&&(a[v]=u[v]);return a.current="none",a.is=function(t){return Array.isArray(t)?t.indexOf(this.current)>=0:this.current===t},a.can=function(e){return!this.transition&&void 0!==s[e]&&(s[e].hasOwnProperty(this.current)||s[e].hasOwnProperty(t.WILDCARD))},a.cannot=function(t){return!this.can(t)},a.transitions=function(){return(c[this.current]||[]).concat(c[t.WILDCARD]||[])},a.isFinished=function(){return this.is(i)},a.error=e.error||function(t,e,n,r,i,a,o){throw o||a},a.states=function(){return Object.keys(c).sort()},r&&!r.defer&&a[r.event](),a},doCallback:function(e,n,r,i,a,o){if(n)try{return n.apply(e,[r,i,a].concat(o))}catch(n){return e.error(r,i,a,o,t.Error.INVALID_CALLBACK,"an exception occurred in a caller-provided callback function",n)}},beforeAnyEvent:function(e,n,r,i,a){return t.doCallback(e,e.onbeforeevent,n,r,i,a)},afterAnyEvent:function(e,n,r,i,a){return t.doCallback(e,e.onafterevent||e.onevent,n,r,i,a)},leaveAnyState:function(e,n,r,i,a){return t.doCallback(e,e.onleavestate,n,r,i,a)},enterAnyState:function(e,n,r,i,a){return t.doCallback(e,e.onenterstate||e.onstate,n,r,i,a)},changeState:function(e,n,r,i,a){return t.doCallback(e,e.onchangestate,n,r,i,a)},beforeThisEvent:function(e,n,r,i,a){return t.doCallback(e,e["onbefore"+n],n,r,i,a)},afterThisEvent:function(e,n,r,i,a){return t.doCallback(e,e["onafter"+n]||e["on"+n],n,r,i,a)},leaveThisState:function(e,n,r,i,a){return t.doCallback(e,e["onleave"+r],n,r,i,a)},enterThisState:function(e,n,r,i,a){return t.doCallback(e,e["onenter"+i]||e["on"+i],n,r,i,a)},beforeEvent:function(e,n,r,i,a){if(!1===t.beforeThisEvent(e,n,r,i,a)||!1===t.beforeAnyEvent(e,n,r,i,a))return!1},afterEvent:function(e,n,r,i,a){t.afterThisEvent(e,n,r,i,a),t.afterAnyEvent(e,n,r,i,a)},leaveState:function(e,n,r,i,a){var o=t.leaveThisState(e,n,r,i,a),u=t.leaveAnyState(e,n,r,i,a);return!1!==o&&!1!==u&&(t.ASYNC===o||t.ASYNC===u?t.ASYNC:void 0)},enterState:function(e,n,r,i,a){t.enterThisState(e,n,r,i,a),t.enterAnyState(e,n,r,i,a)},buildEvent:function(e,n){return function(){var r=this.current,i=n[r]||(n[t.WILDCARD]!=t.WILDCARD?n[t.WILDCARD]:r)||r,a=Array.prototype.slice.call(arguments);if(this.transition)return this.error(e,r,i,a,t.Error.PENDING_TRANSITION,"event "+e+" inappropriate because previous transition did not complete");if(this.cannot(e))return this.error(e,r,i,a,t.Error.INVALID_TRANSITION,"event "+e+" inappropriate in current state "+this.current);if(!1===t.beforeEvent(this,e,r,i,a))return t.Result.CANCELLED;if(r===i)return t.afterEvent(this,e,r,i,a),t.Result.NOTRANSITION;var o=this;this.transition=function(){return o.transition=null,o.current=i,t.enterState(o,e,r,i,a),t.changeState(o,e,r,i,a),t.afterEvent(o,e,r,i,a),t.Result.SUCCEEDED},this.transition.cancel=function(){o.transition=null,t.afterEvent(o,e,r,i,a)};var u=t.leaveState(this,e,r,i,a);return!1===u?(this.transition=null,t.Result.CANCELLED):t.ASYNC===u?t.Result.PENDING:this.transition?this.transition():void 0}}};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=t),exports.StateMachine=t):"function"==typeof define&&define.amd?define(function(e){return t}):"undefined"!=typeof window?window.StateMachine=t:"undefined"!=typeof self&&(self.StateMachine=t)}();

Plugin.extend({
  _type: 'com.github.steotia.peerplay.core',
  _isContainer: true,
  _render: false,
  _server: undefined,
  _client: undefined,
  _clients: [],
  _serverState: { scores: {} },
  _serviceName: '_my-service._tcp.',
  _hostName: 'my host',
  _registered: false,
  log: function(msg){
    console.log(this._type+": "+msg);
  },
  notify: function(eventName){
    EkstepRendererAPI.dispatchEvent(this._type+'.'+eventName);
  },
  getServiceName: function(){
    return this._serviceName;
  },
  getHostName: function(){
    return this._hostName;
  },
  setServiceName: function(name){
    this._serviceName = name;
  },
  setHostName: function(name){
    this._hostName = name;
  },
  initPlugin: function(data) {
    var instance = this;
    instance._server = StateMachine.create({
      initial: { state: 'stopped', event: 'init' },
      events: [
        { name: 'start',  from: 'stopped',  to: 'started' },
        { name: 'play',  from: 'started',  to: 'playing' },
        { name: 'end',  from: 'playing',  to: 'ended' },
        { name: 'stop',  from: 'ended',  to: 'stopped' }
      ],
      callbacks: {
        oninit: instance.initServer(),
        onstart: instance.startServer(),
        onstarted: instance.notifyStarted(),
        onplay: instance.startPlaying()
      }
    });
    instance._client = StateMachine.create({
      initial: { state: 'disconnected', event: 'init'},
      events: [
        { name: 'connect', from: 'disconnected', to: 'connected'},
        { name: 'disconnect', from: 'connected', to: 'disconnected'}
      ],
      callbacks: {
        oninit: instance.initClient(),
        onconnect: instance.connectClient(),
        ondisconnect: instance.disconnectClient(),
        onconnected: instance.notifyConnected()
      }
    });
    instance.startWatching();
  },
  initServer: function(){
    var instance = this;
    instance._clients = [];
    instance._serverState.scores = {};
    instance._registered = false;
    instance._server.start();
  },
  notifyStarted: function(){
    if(this._registered){
      this.notify('wsserver.start');
      return true;
    } else
      return false;
  },
  notifyConnected: function(){
    EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.self.connect',instance._connection);
  },
  startPlaying: function(){
    instance._clients.map(function(conn){
      wsserver.send(conn, JSON.stringify({
        type: "start"
      }));
    });
  },
  stopPlaying: function(){
    instance.cleanup();
  },
  cleanup: function(){
    var instance = this;
    wsserver.stop(function onStop(addr, port) {
      instance.log('STOP: on %s:%d', addr, port);
    });
    zeroconf.unwatch(this.getServiceName(), 'local.');
    zeroconf.unregister(this.getServiceName(), 'local.', this.getHostName());
  },
  startServer: function(){
    var instance = this;
    instance.log('WS: Going to start server');
    // Specify 0 as the port number, so that a random free port is used
    if(typeof wsserver == 'undefined'){
      instance.log('WS: UNDEFINED');
    } else {
      wsserver.start(0, {
        'onFailure' :  function(addr, port, reason) {
          instance.log('WS: FAILED '+ reason);
        },
        // WebSocket Connection handlers
        'onOpen' : function(conn) {
          if(instance._clients.length<=2){
            instance.log('WS: OPEN '+conn.remoteAddr);
            instance.log('WS: SENDING WELCOME to: '+conn.uuid);
            wsserver.send(conn, JSON.stringify({
              type: "hello",
              data: {
                uuid: conn.uuid
              }
            }));
            instance._serverState.scores[conn.uuid]={};
            wsserver.send(conn, JSON.stringify({
              type: "state",
              data: instance._serverState
            }));
            instance.log('WS: SENT WELCOME KIT');
            instance._clients.push(conn);
          } else {
            instance.log('WS: BYE');
            wsserver.close(conn, 4000, 'only 2 max clients!');
          }
          if(instance._clients.length===2){
            instance._server.play();
          }
        },
        'onMessage' : function(conn, msg) {
          instance.log('WS: MSG '+ msg);
          var payload;
          var _score,score;
          var uuidScores;
          var _event = JSON.parse(msg);
          if (typeof _event.type != 'undefined'){
            if(_event.type=="score"){
              instance.log('WS: CLIENT '+ conn.uuid);
              instance.log('WS: SCORE RECD.'+ _event.score);
              instance._serverState.scores[conn.uuid][_event.qid]=_event.score;
              uuidScores = {};
              var uuid;
              for (uuid in instance._serverState.scores) {
                score=0;
                var qid;
                for(qid in instance._serverState.scores[uuid]){
                  score+=instance._serverState.scores[uuid][qid];
                }
                uuidScores[uuid]=score;
              }
              for (uuid in instance._serverState.scores) {
                payload = {
                  type: "scores",
                  scores: uuidScores
                };
                wsserver.send(
                  {uuid: uuid},
                  JSON.stringify(payload)
                );
                instance.log('WS: SCORES SENT TO: '+ uuid);
              }
            }
          }

        },
        'onClose' : function(conn, code, reason) {
          instance.log('WS: DISCONNECT ' + JSON.stringify(conn) + code + reason);
          instance._clients=instance._clients.filter(function(el){
            return el.uuid!=conn.uuid;
          });
          if(instance._clients.length===0){
            instance._server.stop();
          }
        }
      },
      function onStart(addr, port) {
        instance._registered = false;
          instance.log('WS: Started addr: '+addr+'port: '+port);
          var
            interface,
            ip_addresses
          ;
          interface = 'wlan0';
          ip_addresses = 'ipv4Addresses';
          try{
            wsserver.getInterfaces(function(result) {
              instance.log('WS: interfaces'+JSON.stringify(result));
              if(typeof result[interface] == 'undefined'){
                instance.log('WS: NO WIFI');
              } else {
                zeroconf.register(instance.getServiceName(), 'local.', instance.getHostName(), port, {
                  server_ip: result[interface][ip_addresses][0]
                }, function (result) {
                  instance._registered = true;
                  instance.log('WS: REGISTERED');
                });
              }
            });
          } catch(e){
            instance.log('WS: ERROR '+JSON.stringify(e));
          } finally {
            instance.log('WS: TRANSITIONING');
            instance._server.transition();
          }
        },
      function onDidNotStart(reason) {
        instance.log('WS: Failed '+JSON.stringify(reason));
        instamce._server.transition();
      }
      );
    }
    return StateMachine.ASYNC;
  },
  initClient: function(){
    instance._connection = undefined;
  },
  disconnectClient: function(){
    var instance = this;
    instance._connection.onclose = function() {
      instance.log('CLIENT: closing connection');
      instance._client.transition();
    };
    instance._connection.close();
    instance.initClient();
    return StateMachine.ASYNC;
  },
  connectClient: function(url){
    var instance = this;
    instance.log('CLIENT: url ' + url);
    if (typeof instance._connection == 'undefined'){
        instance._connection = new WebSocket(url);
    }
    instance._connection.onopen = function() {
      instance.log('CLIENT: connected', url);
      instance._connection.send(JSON.stringify({
          type: "hello",
          msg: "greetings from client"
      }));
      instance.log('CLIENT: welcome sent ' + url);
      instance._client.transition();
    };
    instance._connection.onmessage = function (event) {
      instance.log('CLIENT: got message >'+JSON.stringify(event.data)+'<');
      var _event = JSON.parse(event.data);
      if (typeof _event.type != 'undefined'){
          if(_event.type=="scores"){
              instance.log('CLIENT: scores >'+JSON.stringify(_event)+'<');
              notify('state.update',instance,_event);
          } else if(_event.type=="hello"){
              instance.log('CLIENT: hello '+JSON.stringify(_event));
              notify('state.hello',instance,_event);
          } else if(_event.type=="start") {
              instance.log('CLIENT: start '+JSON.stringify(_event));
              notify('state.start',instance,_event);
          }
      }
    };
    return StateMachine.ASYNC;
  },
  startWatching: function(){
    var instance = this;
    if(typeof zeroconf == 'undefined'){
      instance.log(' ZC: undefined '+typeof(instance));
    } else {
      zeroconf.unwatch(instance.getServiceName(), 'local.');
      zeroconf.watch(instance.getServiceName(), 'local.', function (result) {
      var
          service = result.service,
          hostname,
          url
      ;
      if (result.action === 'added') {
        hostname = service.hostname.replace(/[.]+$/g, '');
        url = ['ws://', hostname, ':', service.port, '/'].join('');
        instance._client.connect();
      }
    });
    }
  }
});
//# sourceURL=com.github.steotia.peerplay.core.js

