class CodeGenerator:
    def __init__(self, ir_instructions):
        self.ir_instructions = ir_instructions
        self.asm = []

    def generate(self):
        self.asm.append("SECTION .text")
        self.asm.append("GLOBAL _start")
        self.asm.append("_start:")
        
        for inst in self.ir_instructions:
            parts = inst.split()
            if len(parts) == 3 and parts[1] == '=':
                # Assignment
                self.asm.append(f"    MOV [{parts[0]}], {parts[2]}")
            elif len(parts) == 5 and parts[1] == '=':
                # BinOp
                dest = parts[0]
                left = parts[2]
                op = parts[3]
                right = parts[4]
                self.asm.append(f"    MOV EAX, {left}")
                if op == '+':
                    self.asm.append(f"    ADD EAX, {right}")
                elif op == '-':
                    self.asm.append(f"    SUB EAX, {right}")
                elif op == '*':
                    self.asm.append(f"    IMUL EAX, {right}")
                elif op == '/':
                    self.asm.append(f"    MOV EBX, {right}")
                    self.asm.append(f"    CDQ")
                    self.asm.append(f"    IDIV EBX")
                self.asm.append(f"    MOV [{dest}], EAX")
            elif inst.startswith("IF "):
                # IF t1 GOTO L1
                cond = parts[1] # usually a temp holding 0 or 1, or comparison
                label = parts[3]
                self.asm.append(f"    CMP {cond}, 1")
                self.asm.append(f"    JE {label}")
            elif inst.startswith("PRINT "):
                val = parts[1]
                self.asm.append(f"    ; PRINT {val}")
                self.asm.append(f"    PUSH {val}")
                self.asm.append(f"    CALL print_func")
                self.asm.append(f"    ADD ESP, 4")
            elif inst.startswith("GOTO "):
                self.asm.append(f"    JMP {parts[1]}")
            elif inst.endswith(":"):
                self.asm.append(inst)

        self.asm.append("    ; Exit program")
        self.asm.append("    MOV EAX, 1")
        self.asm.append("    XOR EBX, EBX")
        self.asm.append("    INT 0x80")
        
        return "\n".join(self.asm)
