// @ts-nocheck
import { useFormContext } from '@kne/react-form-antd';
import type { FormItemProps } from './types';

/** children({...openApi, formData})；formData 优先 openApi.getFormData() */
const FormItem = ({ children }: FormItemProps) => {
  const ctx = (useFormContext() || {}) as {
    openApi?: Record<string, unknown> & { getFormData?: () => Record<string, unknown> };
    formData?: Record<string, unknown>;
  };
  const { openApi = {}, formData } = ctx;
  const resolvedFormData =
    typeof openApi.getFormData === 'function' ? openApi.getFormData() : formData;
  return <>{children({ ...openApi, formData: resolvedFormData })}</>;
};

export default FormItem;
