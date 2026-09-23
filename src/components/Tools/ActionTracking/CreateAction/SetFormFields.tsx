import { useEffect } from 'react';
import { useFormApi } from '../../../Form';

type FormApiEmitter = {
  emit: (event: string, payload?: unknown) => void;
};

/** 异步下拉就绪后写入默认值，避免 FormModal key 递增导致整表 remount 闪烁 */
export function SetFormFields({ patch }: { patch: Record<string, string> }) {
  const formApi = useFormApi() as unknown as { emitter: FormApiEmitter };
  const payloadKey = Object.entries(patch)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  useEffect(() => {
    if (!payloadKey) return;
    const data = Object.entries(patch)
      .filter(([, v]) => v)
      .map(([name, value]) => ({ name, value }));
    formApi.emitter.emit('form:set-fields', { data, runValidate: false });
    // patch 仅随 payloadKey 变化；避免对象引用导致重复 emit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formApi.emitter, payloadKey]);

  return null;
}
