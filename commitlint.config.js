module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+):\s(:\w+:)\s(.+)$/,
      headerCorrespondence: ['type', 'gitmoji', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'patch',
        'deps',
      ],
    ],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'header-match-team-pattern': [2, 'always'],
    'subject-case': [0, 'always'],
    'header-max-length': [2, 'always', 100],
  },
  plugins: [
    {
      rules: {
        'header-match-team-pattern': ({ header }) => {
          const pattern = /^(\w+):\s(:\w+:)\s(.+)$/;
          return [
            pattern.test(header),
            'Commit message must match format: <type>: :gitmoji: <message>',
          ];
        },
      },
    },
  ],
};
