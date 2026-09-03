// @ts-nocheck
import { useFormContext } from '@kne/react-form-antd';
import { Button } from 'antd';
import { useState } from 'react';
import type { FormApiButtonProps } from './types';

/**
 * antd Button + loading；onClick(formContext, e)。
 * 不绑上游 LoadingButton。
 */
const FormApiButton = ({ onClick, ...props }: FormApiButtonProps) => {
  const context = (useFormContext() || {}) as Record<string, unknown>;
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      loading={props.loading ?? loading}
      onClick={async (e) => {
        if (!onClick) return;
        setLoading(true);
        try {
          await onClick(context, e);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
};

export default FormApiButton;
