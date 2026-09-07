import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyActionParams,
  canExecuteAction,
  collectDefaultParams,
  mergeBlinkParams,
} from './params.ts';
import type { BlinkLinkedAction } from '../../types/blink.ts';

const flipAction: BlinkLinkedAction = {
  type: 'transaction',
  label: 'Flip',
  href: '/api/actions/backend?amount={amount}&choice={choice}',
  parameters: [
    {
      type: 'select',
      name: 'amount',
      required: true,
      options: [
        { label: '1K SEND', value: '1000', selected: true },
        { label: '5K SEND', value: '5000' },
      ],
    },
    {
      type: 'radio',
      name: 'choice',
      required: true,
      options: [
        { label: 'Heads', value: 'heads', selected: true },
        { label: 'Tails', value: 'tails' },
      ],
    },
  ],
};

describe('collectDefaultParams', () => {
  it('uses selected options so coinflip can run handsfree', () => {
    assert.deepEqual(collectDefaultParams(flipAction), {
      amount: '1000',
      choice: 'heads',
    });
  });
});

describe('applyActionParams', () => {
  it('substitutes query templates instead of appending duplicates', () => {
    const applied = applyActionParams(
      'https://flip.sendarcade.fun/api/actions/website',
      flipAction.href,
      { amount: '5000', choice: 'tails' }
    );
    assert.equal(
      applied.href,
      'https://flip.sendarcade.fun/api/actions/backend?amount=5000&choice=tails'
    );
    assert.deepEqual(applied.data, {});
  });

  it('substitutes path templates', () => {
    const applied = applyActionParams(
      'https://actions.alice.com/donate',
      '/api/donate/{amount}',
      { amount: '2' }
    );
    assert.equal(applied.href, 'https://actions.alice.com/api/donate/2');
  });

  it('puts leftover params in the POST data body', () => {
    const applied = applyActionParams(
      'https://actions.alice.com/stake',
      '/api/stake?amount={amount}',
      { amount: '1', memo: 'hello' }
    );
    assert.equal(applied.href, 'https://actions.alice.com/api/stake?amount=1');
    assert.deepEqual(applied.data, { memo: 'hello' });
  });

  it('throws when a template value is missing', () => {
    assert.throws(
      () =>
        applyActionParams(
          'https://flip.sendarcade.fun/api/actions/website',
          flipAction.href,
          {}
        ),
      /Missing Blink parameter/
    );
  });

  it('throws when the action href is missing', () => {
    assert.throws(
      () => applyActionParams('https://actions.alice.com/donate', '', {}),
      /missing a URL/
    );
  });
});

describe('canExecuteAction', () => {
  it('is true after merging selected defaults', () => {
    const params = mergeBlinkParams(flipAction, {});
    assert.equal(canExecuteAction(flipAction, params), true);
  });

  it('is false when a required template is missing', () => {
    assert.equal(canExecuteAction(flipAction, {}), false);
  });

  it('is false when the action href is missing', () => {
    assert.equal(
      canExecuteAction({ label: 'Flip', href: '' }, { amount: '1' }),
      false
    );
  });
});
