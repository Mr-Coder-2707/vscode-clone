import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from ir import IRGenerator
from codegen import CodeGenerator

app = Flask(__name__)

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.root_path, 'images'), filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/editor')
def editor():
    return render_template('editor.html')

@app.route('/compile', methods=['POST'])
def compile_code():
    if not request.is_json:
        return jsonify({"error": "Bad Request", "details": "Expected JSON payload with 'code'."}), 400
    
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
    ir_instructions = ir_gen.generate()
    
    # Format IR for display
    ir_code = []
    for inst in ir_instructions:
        if inst[0] == "ASSIGN":
            ir_code.append(f"{inst[1]} = {inst[2]}")
        elif inst[0] == "BINOP":
            ir_code.append(f"{inst[1]} = {inst[2]} {inst[3]} {inst[4]}")
        elif inst[0] == "IF_GOTO":
            ir_code.append(f"IF {inst[1]} GOTO {inst[2]}")
        elif inst[0] == "PRINT":
            ir_code.append(f"PRINT {inst[1]}")
        elif inst[0] == "GOTO":
            ir_code.append(f"GOTO {inst[1]}")
        elif inst[0] == "LABEL":
            ir_code.append(f"{inst[1]}:")
    
    # 5. Code Generation
    codegen = CodeGenerator(ir_instructions)
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
