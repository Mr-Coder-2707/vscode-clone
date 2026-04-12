import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from ir import IRGenerator
from codegen import CodeGenerator

app = Flask(__name__, static_url_path='/images', static_folder='images')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compile', methods=['POST'])
def compile_code():
    code = request.json.get('code', '')
    
    # 1. Lexical Analysis
    lexer = Lexer(code)
    tokens, lex_errors = lexer.tokenize()
    tokens_out = [{"type": t.type, "value": t.value, "line": t.line} for t in tokens if t.type != 'EOF']
    
    if lex_errors:
        return jsonify({"error": "Lexical Errors", "details": lex_errors})
        
    # 2. Syntax Analysis
    parser = Parser(tokens)
    ast, parse_errors = parser.parse()
    
    if parse_errors:
        return jsonify({"error": "Syntax Errors", "details": parse_errors})
        
    ast_dict = ast.to_dict()
    
    # 3. Semantic Analysis
    semantic = SemanticAnalyzer(ast)
    semantic_errors = semantic.analyze()
    
    if semantic_errors:
        return jsonify({"error": "Semantic Errors", "details": semantic_errors})
        
    # 4. Intermediate Representation
    ir_gen = IRGenerator(ast)
    ir_code = ir_gen.generate()
    
    # 5. Code Generation
    codegen = CodeGenerator(ir_code)
    asm_code = codegen.generate()
    
    return jsonify({
        "tokens": tokens_out,
        "ast": ast_dict,
        "semantic": "Success! No semantic errors found.",
        "ir": ir_code,
        "assembly": asm_code
    })

@app.route('/sw.js')
def serve_sw():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'sw.js', mimetype='application/javascript')

@app.route('/manifest.json')
def serve_manifest():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'manifest.json', mimetype='application/manifest+json')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
