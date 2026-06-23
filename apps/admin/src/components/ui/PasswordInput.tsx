'use client';
import { useState, forwardRef, InputHTMLAttributes } from 'react';

/**
 * Password field with a plain-text "Show password" / "Hide password" toggle.
 * Forwards the ref so it works seamlessly with react-hook-form's register().
 *
 * Usage: <PasswordInput {...register('password', {...})} placeholder="••••••••" />
 */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          style={{ ...props.style, paddingRight: '90px', width: '100%', boxSizing: 'border-box' }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--gold3)',
            padding: '4px 2px',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            fontFamily: 'Raleway, sans-serif',
          }}
        >
          {visible ? 'Hide password' : 'Show password'}
        </button>
      </div>
    );
  }
);
