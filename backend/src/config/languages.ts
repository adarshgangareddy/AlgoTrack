// backend/src/config/languages.ts
// Centralized Language Configuration with Judge0 CE Language IDs

export interface LanguageConfig {
  id: string;
  label: string;
  monacoLang: string;
  judge0Id: number;
  extension: string;
  defaultTemplate: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  python: {
    id: 'python',
    label: 'Python 3',
    monacoLang: 'python',
    judge0Id: 71, // Python (3.8.1)
    extension: '.py',
    defaultTemplate: `class Solution:
    def solve(self, *args):
        # Write your code here
        pass

# Example execution with standard input
import sys

def main():
    input_data = sys.stdin.read().split()
    if input_data:
        # Example: reading space-separated integers
        print(f"Received input: {input_data}")
    else:
        print("Hello from AlgoTrack Python 3!")

if __name__ == '__main__':
    main()
`,
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node.js)',
    monacoLang: 'javascript',
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
    extension: '.js',
    defaultTemplate: `/**
 * @param {any} input
 * @return {any}
 */
function solve(...args) {
    // Write your code here
}

// Standard I/O handler for Node.js
const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {
        console.log(\`Received input: \${input}\`);
    } else {
        console.log("Hello from AlgoTrack JavaScript!");
    }
}

main();
`,
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    monacoLang: 'typescript',
    judge0Id: 74, // TypeScript (3.7.4)
    extension: '.ts',
    defaultTemplate: `function solve(...args: any[]): any {
    // Write your code here
}

// Standard I/O handler for TypeScript
import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {
        console.log(\`Received input: \${input}\`);
    } else {
        console.log("Hello from AlgoTrack TypeScript!");
    }
}

main();
`,
  },
  java: {
    id: 'java',
    label: 'Java (OpenJDK)',
    monacoLang: 'java',
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    extension: '.java',
    defaultTemplate: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNext()) {
            String input = scanner.nextLine();
            System.out.println("Received input: " + input);
        } else {
            System.out.println("Hello from AlgoTrack Java!");
        }
        scanner.close();
    }
}
`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (GCC)',
    monacoLang: 'cpp',
    judge0Id: 54, // C++ (GCC 9.2.0)
    extension: '.cpp',
    defaultTemplate: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string input;
    if (getline(cin, input) && !input.empty()) {
        cout << "Received input: " << input << "\\n";
    } else {
        cout << "Hello from AlgoTrack C++!\\n";
    }

    return 0;
}
`,
  },
};

export function getLanguageConfig(langKey: string): LanguageConfig {
  const normalized = (langKey || 'python').toLowerCase().trim();
  if (SUPPORTED_LANGUAGES[normalized]) {
    return SUPPORTED_LANGUAGES[normalized];
  }
  // Aliases
  if (normalized === 'py') return SUPPORTED_LANGUAGES.python;
  if (normalized === 'js') return SUPPORTED_LANGUAGES.javascript;
  if (normalized === 'ts') return SUPPORTED_LANGUAGES.typescript;
  if (normalized === 'c++') return SUPPORTED_LANGUAGES.cpp;
  return SUPPORTED_LANGUAGES.python;
}

