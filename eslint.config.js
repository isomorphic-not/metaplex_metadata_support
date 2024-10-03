import globals from 'globals';

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      semi: ['error', 'always'], 
      quotes: ['error', 'single'],  
      indent: ['error', 2],  
      'no-unused-vars': 'warn',
      'no-multiple-empty-lines': [       // Enforce no multiple empty lines
        'error', 
        { max: 1, maxEOF: 0 }           // Allow a maximum of 1 empty line between code and no empty lines at EOF
      ],
    }
  }
];
