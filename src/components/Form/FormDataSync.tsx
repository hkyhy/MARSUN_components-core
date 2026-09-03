import { useFormApi } from './kneReactForm';
import { useEffect, useRef } from 'react';

type EmitterSubscription = { remove: () => void };

type EmitterLike = {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  addListener?: (
    event: string,
    handler: (...args: unknown[]) => void,
  ) => EmitterSubscription | void;
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
 *
 * kne `@kne/use-event` 基于 fbemitter：仅有 `addListener`（返回 `{ remove }`），
 * **无** `on` / `off`。旧实现因 `!unsubscribe` 直接 return，导致联动永不触发。
 */
export default function FormDataSync({ onChange }: FormDataSyncProps) {
  const formApi = useFormApi() as {
    openApi: OpenApiLike;
    emitter: EmitterLike;
  };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const { openApi, emitter } = formApi;
    if (!emitter || !openApi?.getFormData) return;

    const sync = () => {
      onChangeRef.current(openApi.getFormData());
    };

    const tokens: EmitterSubscription[] = [];

    const bind = (event: string) => {
      if (typeof emitter.addListener === 'function') {
        const sub = emitter.addListener(event, sync);
        if (sub && typeof sub.remove === 'function') {
          tokens.push(sub);
          return;
        }
      }
      if (typeof emitter.on === 'function') {
        emitter.on(event, sync);
        tokens.push({
          remove: () => {
            emitter.off?.(event, sync);
            emitter.removeListener?.(event, sync);
          },
        });
      }
    };

    bind('form:field:set-value');
    bind('form-group:change');

    if (!tokens.length) return;

    return () => {
      tokens.forEach((t) => t.remove());
    };
  }, [formApi]);

  return null;
}
