import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

test('ErrorBoundary derives error state from thrown errors', () => {
  const nextState = ErrorBoundary.getDerivedStateFromError();
  assert.deepEqual(nextState, { hasError: true });
});

test('ErrorBoundary renders children while healthy', () => {
  const boundary = new ErrorBoundary({ children: null });
  Object.assign(boundary as unknown as { props: { children: React.ReactNode } }, {
    props: { children: React.createElement('div', null, 'content') },
  });

  const rendered = boundary.render();
  assert.equal(React.isValidElement(rendered), true);
  if (React.isValidElement(rendered)) {
    assert.equal(rendered.type, 'div');
  }
});

test('ErrorBoundary renders fallback shell when in error state', () => {
  const boundary = new ErrorBoundary({ children: null });
  Object.assign(boundary as unknown as { props: { children: React.ReactNode } }, {
    props: { children: React.createElement('div', null, 'content') },
  });

  boundary.state = { hasError: true };
  const rendered = boundary.render();

  assert.equal(React.isValidElement(rendered), true);
  if (React.isValidElement(rendered)) {
    const fallback = rendered as React.ReactElement<{ className: string }>;
    assert.equal(fallback.props.className.includes('bg-zinc-950'), true);
  }
});
