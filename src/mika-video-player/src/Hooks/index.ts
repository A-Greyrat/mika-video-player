import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from 'mika-store';

export const usePanel = (style?: React.CSSProperties, render?: (e: HTMLDivElement) => void) => {
  const [{ containerElement }] = useStore<any>('mika-video-extra-data');
  const [showPanel, setShowPanel] = useState(false);
  const panelElement = useRef<HTMLDivElement | null>(null);

  const createPanel = useCallback(() => {
    if (!containerElement) {
      return;
    }

    panelElement.current = document.createElement('div');
    const e = panelElement.current;

    // 默认样式
    e.style.position = 'absolute';
    e.style.zIndex = '3333';
    e.style.left = '50%';
    e.style.top = '50%';
    e.style.transform = 'translate(-50%, -50%)';
    e.style.width = '50%';
    e.style.height = '50%';

    for (let i = 0, keys = Object.keys(style || {}); i < keys.length; i++) {
      const key = keys[i];
      e.style[key as any] = style?.[key as keyof React.CSSProperties] as string;
    }

    render && render(e);
  }, [containerElement, render, style]);

  const destroyPanel = useCallback(() => {
    panelElement.current && panelElement.current.remove();
    panelElement.current = null;
  }, []);

  useEffect(() => {
    panelElement.current && destroyPanel();
    createPanel();

    return () => {
      destroyPanel();
    };
  }, [containerElement, render, destroyPanel, style]);

  useEffect(() => {
    if (showPanel) {
      panelElement.current?.remove();
    } else {
      panelElement.current && containerElement?.insertAdjacentElement('beforeend', panelElement.current);
    }
  }, [showPanel]);

  return [showPanel, setShowPanel] as const;
};
