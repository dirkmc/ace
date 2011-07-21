define(function(require, exports, module) {
    
var oop = require("pilot/oop");
var Mirror = require("ace/worker/mirror").Mirror;
var ajax = require("pilot/ajax").ajax;

var ScalaWorker = exports.ScalaWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);
};

oop.inherits(ScalaWorker, Mirror);

(function() {
    
    this.onUpdate = function() {
        var value = this.doc.getValue();
        var sender = this.sender;
        
        ajax({
            url: 'http://localhost:9000/parse.json',
            success: function(data) {
                var messages = JSON.parse(data);
                var msgs = [];
                for(var i = 0; i < messages.length; i++) {
                    msgs.push({
                        row: messages[i].row - 1,
                        column: messages[i].column,
                        text: messages[i].text,
                        type: (messages[i].type == "Error" ? "error" : messages[i].type)
                    });
                }
                if(msgs.length > 0) {
                    sender.emit("scalaparse", msgs);
                }
            },
            error: function(req) {
                console.log(req.status + ' (' + req.statusText + '): ' + req.responseText.substring(0, 100));
            }
        });
    }
    
}).call(ScalaWorker.prototype);

});