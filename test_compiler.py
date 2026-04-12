import unittest
from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer
from ir import IRGenerator
from codegen import CodeGenerator

class TestMiniCompiler(unittest.TestCase):
    
    def compile_code(self, code):
        """Helper function to compile code and return any errors"""
        # 1. Lexical Analysis
        lexer = Lexer(code)
        tokens, lex_errors = lexer.tokenize()
        if lex_errors: return False, f"Lexical Errors: {lex_errors}"
            
        # 2. Syntax Analysis
        parser = Parser(tokens)
        ast, parse_errors = parser.parse()
        if parse_errors: return False, f"Syntax Errors: {parse_errors}"
        
        # 3. Semantic Analysis
        semantic = SemanticAnalyzer(ast)
        semantic_errors = semantic.analyze()
        if semantic_errors: return False, f"Semantic Errors: {semantic_errors}"
            
        # 4. Intermediate Representation
        ir_gen = IRGenerator(ast)
        ir_code = ir_gen.generate()
        
        # 5. Code Generation
        codegen = CodeGenerator(ir_code)
        asm_code = codegen.generate()
        
        return True, "Success"

    def test_example_1_simple_arithmetic(self):
        code = '''
a = 5 + 3
b = 10 - 2
c = a * b
d = c / 4
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_2_variables(self):
        code = '''
x = 7
y = x + 5
z = y * x
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_3_operator_precedence(self):
        code = '''
result = 5 + 3 * 2
value = (5 + 3) * 2
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_4_simple_if(self):
        code = '''
x = 10

if x > 5:
    y = x + 1
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_5_if_else(self):
        code = '''
x = 4

if x > 5:
    y = x * 2
else:
    y = x + 10
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_6_complex_if(self):
        code = '''
a = 3
b = 7

if a + b > 10:
    c = a * b
else:
    c = a + b
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_7_nested_if(self):
        code = '''
x = 10
y = 5

if x > 5:
    if y < 10:
        z = x + y
    else:
        z = x - y
else:
    z = 0
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_8_long_expressions(self):
        code = '''
a = 1
b = 2
c = 3
d = a + b + c + 10 * 2
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_9_semantic_error(self):
        code = '''
x = 5
y = x + z
        '''
        # We EXPECT this to fail specifically with a Semantic Error (z is not defined)
        success, message = self.compile_code(code)
        self.assertFalse(success, "Should have failed due to undefined variable 'z'")
        self.assertIn("Semantic", message)

    def test_example_10_real_program_invoice(self):
        code = '''
price = 100
discount = 20

final = price - discount

if final > 50:
    tax = final * 2
else:
    tax = final + 5

total = final + tax
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

    def test_example_11_large_demo(self):
        code = '''
a = 5
b = 10
c = a + b * 2

if c > 20:
    d = c - 5
    if d > 10:
        e = d * 2
    else:
        e = d + 3
else:
    d = c + 5
    e = d - 2

result = e + a
        '''
        success, message = self.compile_code(code)
        self.assertTrue(success, message)

if __name__ == '__main__':
    unittest.main()
