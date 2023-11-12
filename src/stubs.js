const stubs = {};

stubs.Cpp = 
`// Use this editor to write, compile and run your C++ code online
#include <iostream>
#include <stdio.h>

using namespace std;

int main() {
  cout<<"Hello World!\\n";
  return 0;
}
`;

stubs.Python = 
`# Write Python 3 code in this online editor and run it.
print("Hello World!")
`;

stubs.JavaScript = 
`// Write, Edit and Run your Javascript code using JS Online Compiler
console.log("Hello World!");
`;

stubs.Java = 
`// Use this editor to write, compile and run your Java code online

class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`;

export default stubs;
