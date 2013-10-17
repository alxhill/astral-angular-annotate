// annotate coffeescript class definitions

var deepApply = require('../lib/deep-apply');

var classAnnotatorPass = module.exports = {};
classAnnotatorPass.name = 'angular:annotator:class';
classAnnotatorPass.prereqs = [
  'angular:annotator:mark'
];

classAnnotatorPass.run = function (ast, info) {
  var className;
  deepApply(ast, [{
    "type": "CallExpression",
    "callee": {
      "type": "MemberExpression",
      "object": {
        "ngModule": true
      },
      "property": {
      "type": "Identifier",
      "name": /^(controller|service|factory)$/
      }
    }
  }], function (classChunk) {
    deepApply(classChunk, [{
      "type": "AssignmentExpression",
      "operator": "=",
      "left": {
        "type": "Identifier"
      },
      "right": {
        "type": "CallExpression",
        "callee": {
          "type": "FunctionExpression",
          "params": []
        }
      }
    }], function (assignChunk) {

      className = assignChunk.left.name;

      deepApply(assignChunk, [{
        "type": "FunctionDeclaration",
        "id": {
          "type": "Identifier",
          "name": className
        }
      }], function (funcChunk) {

        if (funcChunk.params && funcChunk.params.length > 0)
        {
          var newParam = {
            type: 'ArrayExpression',
            elements: []
          };

          funcChunk.params.forEach(function (param) {
            newParam.elements.push({
              "type": "Literal",
              "value": param.name
            });
          });

          newParam.elements.push(assignChunk);

          classChunk.arguments[1] = newParam;

        }
      });
    });
  });
};
