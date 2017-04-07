Plugin.extend({
    _type: 'com.github.steotia.peerplay.core',
    _isContainer: true,
    _render: true,
    _connection: undefined,
    _serverState: { scores: {} },
    _clientState: {},
    _uuid: undefined,
    _serviceName: '_my-service._tcp.',
    _hostName: 'my host',
    _clients: [],
    getUUID: function(){
        return this.uuid;
    },
    getServiceName: function(){
        return this._serviceName;
    },
    getHostName: function(){
        return this._hostName;
    },
    cleanup: function(){
        wsserver.stop(function onStop(addr, port) {
            console.log('com.github.steotia.peerplay.core STOP: on %s:%d', addr, port);
        });
        zeroconf.unwatch(this.getServiceName(), 'local.');
        zeroconf.unregister(this.getServiceName(), 'local.', this.getHostName());
        // # TODO Make sure registration is complete
    },
    initPlugin: function(data) {
        var dims = this.relativeDims();
        var container;
        container = new createjs.Container();
        this._self = container;

            // zeroconf.stop();
            console.log('org.ekstep.plugin.peerplay DATA:', data);
            var instance = this;
            function startWebSocketWithZeroConf(){
                console.log('org.ekstep.plugin.peerplay WS: Going to start server');
                // Specify 0 as the port number, so that a random free port is used
                if(typeof wsserver == 'undefined'){
                    console.log('org.ekstep.plugin.peerplay WS: FAIL as wsserver is not available');
                    EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.wsserver.undefined');
                }else{
                    wsserver.start(0, {
                        'onFailure' :  function(addr, port, reason) {
                            EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.wsserver.fail', addr, port, reason);
                            console.log('org.ekstep.plugin.peerplay WS: failed '+ reason);
                        },
                        // WebSocket Connection handlers
                        'onOpen' : function(conn) {
                            if(instance._clients.length<=2){
                                console.log('org.ekstep.plugin.peerplay WS: CONNECT '+conn.remoteAddr);
                                console.log('org.ekstep.plugin.peerplay WS: SENDING WELCOME to: '+conn.uuid);
                                instance.uuid = conn.uuid;
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
                                console.log('org.ekstep.plugin.peerplay WS: SENT WELCOME KIT');
                                instance._clients.push(conn);
                            } else {
                                wsserver.close(conn, 4000, 'only 2 max clients!');
                            }
                            if(instance._clients.length===2){
                                instance._clients.map(function(conn){
                                    wsserver.send(conn, JSON.stringify({
                                        type: "start"
                                    }));
                                });
                            }
                        },
                        'onMessage' : function(conn, msg) {
                            console.log('org.ekstep.plugin.peerplay WS: MSG '+ msg);
                            var payload;
                            var _score,score;
                            var uuidScores;
                            var _event = JSON.parse(msg);
                            if (typeof _event.type != 'undefined'){
                                if(_event.type=="score"){
                                    console.log('org.ekstep.plugin.peerplay WS: CLIENT '+ conn.uuid);
                                    console.log('org.ekstep.plugin.peerplay WS: SCORE '+ _event.score);
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
                                        console.log('org.ekstep.plugin.peerplay WS: SCORES SENT '+ uuid);
                                    }
                                }
                            }

                        },
                        'onClose' : function(conn, code, reason) {
                            EventBus.dispatch('PEERPLAY_SERVER_ONCLOSE',instance,conn,code,reason);
                            console.log('org.ekstep.plugin.peerplay WS: DISCONNECT ' + JSON.stringify(conn) + code + reason);
                            instance._clients=instance._clients.filter(function(el){
                                return el.uuid!=conn.uuid;
                            });
                            if(instance._clients.length===0){
                                instance.cleanup();
                            }
                        }
                    },
                    function onStart(addr, port) {
                            console.log('org.ekstep.plugin.peerplay WS: Started addr: '+addr+'port: '+port);
                            var
                                interface,
                                ip_addresses
                            ;
                            console.log('org.ekstep.plugin.peerplay WS: Detecting platform');
                            if (cordova.platformId === 'android') {
                                // On Android the WiFi interface name is wlan0
                                interface = 'wlan0';
                            } else if (cordova.platformId === 'ios') {
                                // On iOS the WiFi interface name is en0
                                interface = 'en0';
                            }
                            console.log('org.ekstep.plugin.peerplay WS: interface'+interface);
                            console.log('org.ekstep.plugin.peerplay WS: Detecting IP type');
                            // Check whether we are listening on IPv4 or IPv6
                            if (/^[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}$/.test(addr)) {
                                ip_addresses = 'ipv4Addresses';
                            } else {
                                ip_addresses = 'ipv6Addresses';
                            }
                            ip_addresses = 'ipv4Addresses';
                            console.log('org.ekstep.plugin.peerplay WS: ip_addresses'+ip_addresses);
                            // Call getInterfaces in order to know the IP addresses of each network interface
                            try{
                                wsserver.getInterfaces(function(result) {
                                    console.log('org.ekstep.plugin.peerplay WS: interfaces'+JSON.stringify(result));
                                    if(typeof result[interface] == 'undefined'){
                                        console.log('org.ekstep.plugin.peerplay WS: NO WIFI');
                                    } else {
                                        zeroconf.register(instance.getServiceName(), 'local.', instance.getHostName(), port, {
                                            // Publish the correct IP address on the TXT record
                                            server_ip: result[interface][ip_addresses][0]
                                        }, function (result) {
                                            // Here we have successfully advertised the service
                                            EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.wsserver.start');
                                            // EventBus.dispatch('PEERPLAY_SERVER_REGISTERED',this,result);
                                            console.log('org.ekstep.plugin.peerplay REGISTERED: ',result);
                                        });
                                    }
                                });
                            } catch(e){
                                console.log('org.ekstep.plugin.peerplay ERROR: wsserver '+JSON.stringify(e));
                            }
                        },
                    function onDidNotStart(reason) {
                        console.log('org.ekstep.plugin.peerplay WS: Failed',reason);
                        EventBus.dispatch('PEERPLAY_SERVER_FAIL',instance,reason);
                    }
                    );
                }
            }
            function connectToWsWithZeroConf(i){
                if(typeof zeroconf == 'undefined'){
                    EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.zeroconf.undefined');
                    console.log('org.ekstep.plugin.peerplay ZC: undefined '+typeof(instance));
                } else {
                    zeroconf.unwatch(instance.getServiceName(), 'local.');
                    zeroconf.watch(instance.getServiceName(), 'local.', function (result) {
                        var
                            service = result.service,
                            hostname,
                            url
                        ;

                        if (result.action === 'added') {

                            if (cordova.platformId === 'android') {
                                // On Android use the IP address published on the TXT record
                                hostname = service.txtRecord.server_ip;
                            } else {
                                // Remove any trailing dots from the hostname
                                hostname = service.hostname.replace(/[.]+$/g, '');
                            }
                            url = ['ws://', hostname, ':', service.port, '/'].join('');
                            console.log('org.ekstep.plugin.peerplay CLIENT: url ' + url);
                            if (typeof instance._connection == 'undefined'){
                                instance._connection = new WebSocket(url);
                            }
                            instance._connection.onopen = function() {
                                console.log('org.ekstep.plugin.peerplay CLIENT: connected', url);
                                instance._connection.send(JSON.stringify({
                                    type: "hello",
                                    msg: "greetings from client"
                                }));
                                EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.self.connect',instance._connection);
                                console.log('org.ekstep.plugin.peerplay CLIENT: welcome sent ' + url);
                            };
                            instance._connection.onmessage = function (event) {
                                console.log('org.ekstep.plugin.peerplay CLIENT: got message >'+JSON.stringify(event.data)+'<');
                                var _event = JSON.parse(event.data);
                                if (typeof _event.type != 'undefined'){
                                    if(_event.type=="scores"){
                                        console.log('org.ekstep.plugin.peerplay CLIENT: set scores >'+JSON.stringify(_event.scores)+'<');
                                        EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.state.update',instance,_event);
                                    } else if(_event.type=="hello"){
                                        console.log('org.ekstep.plugin.peerplay CLIENT: get uuid '+JSON.stringify(_event));
                                        EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.state.hello',instance,_event);
                                    } else if(_event.type=="start") {
                                        console.log('org.ekstep.plugin.peerplay CLIENT: start '+JSON.stringify(_event));
                                        EkstepRendererAPI.dispatchEvent('com.github.steotia.peerplay.core.state.start',instance,_event);
                                    }
                                }
                            };
                        }
                    });
                }
            }

            var containerStart = new createjs.Container();
            function notifyServer(event,data){
                var payload;
                // var _data = JSON.stringify(data);
                if (typeof data != 'undefined'){
                    if(data.name=="OE_ASSESS"){
                        console.log('org.ekstep.plugin.peerplay NOTIFY: OE_ASSESS ' + data);
                        payload = {
                            type: 'score',
                            qid: data.event.edata.eks.qid,
                            score: data.event.edata.eks.score
                        };
                        if((typeof instance._connection != 'undefined')){
                            instance._connection.send(JSON.stringify(payload));
                            console.log('org.ekstep.plugin.peerplay SCORE: SENT');
                        }
                        else
                            console.log('org.ekstep.plugin.peerplay SCORE: NO CONNECTION');
                    }
                }
            }

            EventBus.addEventListener("com.github.steotia.peerplay.core.player.host", startWebSocketWithZeroConf);
            EventBus.addEventListener("com.github.steotia.peerplay.core.player.search", connectToWsWithZeroConf);
            EventBus.addEventListener('TELEMETRY_FLUSH', notifyServer, instance._theme);
            EventBus.dispatch('PEERPLAY_ONLOAD');

            function join(){
                console.log('org.ekstep.plugin.peerplay READY');
                instance._connection.send(JSON.stringify({
                    type: 'ready'
                }));
            }
            EventBus.addEventListener("com.github.steotia.peerplay.core.player.join", join);

            EventBus.addEventListener('com.github.steotia.peerplay.core.cleanup', function(){
                instance.cleanup();
            }, instance._theme);

            EventBus.addEventListener('com.github.steotia.peerplay.core.state.stop',function(){
                instance._connection.close();
            });
        }

});
//# sourceURL=peerplay-renderer.js

