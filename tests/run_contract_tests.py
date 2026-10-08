import sys
import os
import re
import json
import inspect

# Provide mock genlayer environment
class Address(str):
    def __init__(self, val):
        self.val = str(val)
    def __repr__(self):
        return f"Address('{self.val}')"
    def __eq__(self, other):
        return str(self) == str(other)

class u256(int):
    pass

class _Block:
    def __init__(self):
        self.timestamp = 1750000000

class _Message:
    def __init__(self):
        self.sender_address = Address("0x0000000000000000000000000000000000000001")
        self.value = u256(0)

class _Web:
    def render(self, url, mode="text"):
        return "Simulated web page status for " + str(url)

class _Nondet:
    def __init__(self, vm):
        self.vm = vm
        self.web = _Web()

    def exec_prompt(self, prompt, response_format="json"):
        for pattern, resp in self.vm.mocked_prompts:
            if re.search(pattern, prompt, re.DOTALL):
                return resp
        return "{}"

class _EqPrinciple:
    def prompt_comparative(self, fn, validator_prompt):
        return fn()

class _ContractRecipient:
    def __init__(self, addr):
        self.addr = addr
    def emit_transfer(self, value):
        pass

class GenLayerStub:
    def __init__(self, vm=None):
        self.vm = vm
        self.Contract = object
        self.block = _Block()
        self.message = _Message()
        self.nondet = _Nondet(vm) if vm else None
        self.eq_principle = _EqPrinciple()
        
        class _Public:
            class write:
                @staticmethod
                def payable(fn):
                    def wrapper(*args, **kwargs):
                        return fn(*args, **kwargs)
                    return wrapper
                def __call__(self, fn):
                    def wrapper(*args, **kwargs):
                        return fn(*args, **kwargs)
                    return wrapper
            write = write()
            class view:
                def __call__(self, fn):
                    def wrapper(*args, **kwargs):
                        return fn(*args, **kwargs)
                    return wrapper
            view = view()
        self.public = _Public()

    def get_contract_at(self, to):
        return _ContractRecipient(to)

# Register stub in sys.modules
import types
gl_module = types.ModuleType("genlayer")
gl_module.Address = Address
gl_module.u256 = u256
global_gl = GenLayerStub()
gl_module.gl = global_gl
sys.modules["genlayer"] = gl_module

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tests_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)
sys.path.insert(0, tests_dir)

sys.modules["pytest"] = types.ModuleType("pytest")

import nexus_sla
import test_nexus_sla

class DirectVM:
    def __init__(self):
        self.mocked_prompts = []
        self.gl = gl_module.gl
        self.gl.vm = self
        self.gl.nondet = _Nondet(self)
        self.sender = Address("0x0000000000000000000000000000000000000001")

    def mock_llm(self, regex, response):
        self.mocked_prompts.insert(0, (regex, response))

    def prank(self, sender):
        class PrankContext:
            def __init__(self, vm, s):
                self.vm = vm
                self.s = s
                self.prev = vm.gl.message.sender_address
            def __enter__(self):
                self.vm.gl.message.sender_address = Address(self.s)
                return self
            def __exit__(self, exc_type, exc_val, exc_tb):
                self.vm.gl.message.sender_address = self.prev
        return PrankContext(self, sender)

    def expect_revert(self, pattern=None):
        class RevertContext:
            def __init__(self, p):
                self.pattern = p
            def __enter__(self):
                return self
            def __exit__(self, exc_type, exc_val, exc_tb):
                if exc_type is None:
                    raise AssertionError(f"Expected revert with '{self.pattern}', but call succeeded")
                err_msg = str(exc_val)
                if self.pattern and self.pattern not in err_msg:
                    raise AssertionError(f"Expected revert pattern '{self.pattern}', got '{err_msg}'")
                return True # Handled
        return RevertContext(pattern)

def direct_deploy(contract_cls, args=None):
    args = args or []
    # instantiate contract
    instance = contract_cls(*args)
    # attach payable handler
    orig_deposit = instance.deposit_bond
    def deposit_with_val(value=0):
        gl_module.gl.message.value = u256(value)
        try:
            return orig_deposit()
        finally:
            gl_module.gl.message.value = u256(0)
    instance.deposit_bond = deposit_with_val
    return instance

direct_alice = Address("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
direct_bob = Address("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")

def run_all_tests():
    test_functions = [
        getattr(test_nexus_sla, name)
        for name in dir(test_nexus_sla)
        if name.startswith("test_") and callable(getattr(test_nexus_sla, name))
    ]
    print(f"Discovered {len(test_functions)} test cases in test_nexus_sla.py:\n")

    passed = 0
    failed = 0
    for fn in test_functions:
        vm = DirectVM()
        gl_module.gl.block.timestamp = 1750000000
        gl_module.gl.message.sender_address = direct_alice
        gl_module.gl.message.value = u256(0)

        # Inspect parameters of test function
        sig = inspect.signature(fn)
        kwargs = {}
        for param in sig.parameters:
            if param == "direct_vm":
                kwargs["direct_vm"] = vm
            elif param == "direct_deploy":
                kwargs["direct_deploy"] = direct_deploy
            elif param == "direct_alice":
                kwargs["direct_alice"] = direct_alice
            elif param == "direct_bob":
                kwargs["direct_bob"] = direct_bob

        try:
            fn(**kwargs)
            print(f"  [PASS] {fn.__name__}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {fn.__name__}: {e}")
            failed += 1

    print(f"\n==========================================")
    print(f"Total: {len(test_functions)} | Passed: {passed} | Failed: {failed}")
    print(f"==========================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
