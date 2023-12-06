import { PCFSoftShadowMap, SRGBColorSpace, WebGLRenderer } from 'three';

let _renderer: WebGLRenderer | null;

export function useThreeRenderer() {
    function initRenderer(gl: any) {
        return new Promise<string>(resolve => {
            _renderer = new WebGLRenderer({
                canvas: gl.canvas,
                context: gl,
                ...gl.getContextAttributes(),
            });

            _renderer.autoClear = false;
            _renderer.autoClearDepth = false;
            _renderer.shadowMap.enabled = true;
            _renderer.shadowMap.type = PCFSoftShadowMap;
            _renderer.outputColorSpace = SRGBColorSpace;
            const { width, height } = gl.canvas;

            _renderer.setViewport(0, 0, width, height);
            resolve('renderer initialized');
        });
    }

    function getRenderer() {
        return _renderer;
    }

    function disposeRenderer() {
        if (!_renderer) return;

        _renderer.dispose();
        _renderer = null;
    }

    return {
        initRenderer,
        getRenderer,
        disposeRenderer,
    };
}
