define(function(require, exports, module) {

var oop = require("pilot/oop");
var JavaScriptMode = require("ace/mode/javascript").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var ScalaHighlightRules = require("ace/mode/scala_highlight_rules").ScalaHighlightRules;
var MatchingBraceOutdent = require("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("ace/mode/behaviour/cstyle").CstyleBehaviour;
var WorkerClient = require("ace/worker/worker_client").WorkerClient;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new ScalaHighlightRules().getRules());
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        var doc = session.getDocument();
        //var worker = new WorkerClient(["ace", "pilot"], "worker-javascript.js", "ace/mode/javascript_worker", "JavaScriptWorker");
        var worker = new WorkerClient(["ace", "pilot"], "", "ace/mode/scala_worker", "ScalaWorker");
        worker.call("setValue", [doc.getValue()]);
        
        doc.on("change", function(e) {
            e.range = {
                start: e.data.range.start,
                end: e.data.range.end
            };
            worker.emit("change", e);
        });
        
        worker.on("scalaparse", function(e) {
            session.setAnnotations(e.data);
        });
        
        worker.on("terminate", function() {
            session.clearAnnotations();
        });
        
        return worker;
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});
