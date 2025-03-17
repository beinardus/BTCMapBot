import jsonata from "jsonata";
import { dispatchJsonataError, JsonataError } from "./error-dispatcher.js";

const typeMap = {
  "n": "number",
  "s": "string",
  "b": "boolean"
};

function decodeSignature(signature) {
  // todo: introduce more types / constructs when nescessary
  const re = /^<(?<args>[nsb]*)(:(?<ret>[nsb]*))?>$/;
  const {args, ret} = re.exec(signature).groups;

  return {
    args: args.split("").map(t => typeMap[t]),
    ret: typeMap[ret]
  };
}

function checkSignature(expected, node) {
  const expectedSignature = decodeSignature(expected);
  const actualArgs = node.arguments;

  const expectedLength = expectedSignature.args.length;
  const actualLength = actualArgs.length;  

  if (expectedLength != actualLength)
    throw new JsonataError(`Function "${node.value}" expects ${expectedLength} arguments.`);

  // Validate that arguments are literal values
  node.arguments.forEach((arg, index) => {
    const expectedType = expectedSignature.args[index];
    const actualType = arg.type;

    if (expectedType != actualType) 
      throw new JsonataError(
        `Argument ${index + 1} of function "${node.value}" should be of type "${expectedType}".`
      );
  });
}

function validateAST(ast, bindings) {
  const lookup = bindings.reduce((a,c) => {
    a[c.name] = c; return a;
  }, {});

  // Traverse the AST
  function traverse(node) {
    // Check for `=` operator with array RHS
    if (node.type === "binary" && node.value === "=") {
      const rhs = node.rhs;

      // Check if the RHS is an array
      if (rhs.type === "unary" && rhs.value === "[") 
        throw new JsonataError(
          "The `=` operator is disabled for array comparisons. Use the `in` operator instead."
        );
    }

    // Check for custom function calls
    if (node.type === "function") {
      const customFunction = lookup[node.procedure.value];
      if (customFunction) 
        checkSignature(customFunction.signature, node);
    }

    // Recursively traverse child nodes
    if (node.lhs)
      traverse(node.lhs); // Traverse left-hand side of binary operator

    if (node.rhs)
      traverse(node.rhs); // Traverse right-hand side of binary operator

    if (node.arguments)
      node.arguments.forEach(traverse);

    if (node.expressions) 
      node.expressions.forEach(traverse);
  }

  traverse(ast); // Start traversal  
}

function createJsonata(filter, bindings = []) {
  try {
    let node = jsonata(filter);
    for (const {name, fn, signature} of bindings)
      node.registerFunction(name, fn, signature);

    validateAST(node.ast(), bindings);

    return node;
  }
  catch (err) {
    if (err instanceof JsonataError)
      throw err;

    dispatchJsonataError(err);
  }
}

export { createJsonata }