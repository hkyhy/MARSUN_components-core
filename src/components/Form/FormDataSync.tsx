import { useFormApi } from './kneReactForm';
import { useEffect } from 'react';

type EmitterLike = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  addListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type OpenApiLike = {
  getFormData: () => Record<string, unknown>;
};

export type FormDataSyncProps = {
  onChange: (data: Record<string, unknown>) => void;
};

/**
 * 将 FormInfo / react-form 字段值变更回写父级（即时 onPatch）。
 * 须作为 Form 子节点渲染。
 *
 * 注意：`form:field:change` 仅表示字段元信息挂载，不代表值变更；
 * 值变更请听 `form:field:set-value`；列表增删听 `form-group:change`。
 */
export default function FormDataSync({ onChange }: FormDataSyncProps) {
  const formApi = useFormApi() as {
    openApi: OpenApiLike;
    emitter: EmitterLike;
  };

  useEffect(() => {
    const { openApi, emitter } = formApi;
    if (!emitter || !openApi?.getFormData) return;

    const sync = () => {
      onChange(openApi.getFormData());
    };

    const subscribe = emitter.on ?? emitter.addListener;
    const unsubscribe = emitter.off ?? emitter.removeListener;
    if (!subscribe || !unsubscribe) return;

    subscribe.call(emitter, 'form:field:set-value', sync);
    subscribe.call(emitter, 'form-group:change', sync);
    return () => {
      unsubscribe.call(emitter, 'form:field:set-value', sync);
      unsubscribe.call(emitter, 'form-group:change', sync);
    };
  }, [formApi, onChange]);

  return null;
}
