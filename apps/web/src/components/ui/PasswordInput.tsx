'use client';
import { useState, forwardRef, InputHTMLAttributes } from 'react';

/**
 * Password field with a show/hide toggle (👁 / 🙈).
 * Forwards the ref so it works seamlessly with react-hook-form's register().
 *
 * Usage: <PasswordInput {...register('password', {...})} placeholder="••••••••" />
 */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          style={{ ...props.style, paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            color: 'var(--faint)',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
    );
  }
);
