import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { Mesh, Object3D } from 'three';
import {useThreeScene} from "@/composables/useThreeScene";
import {useThreeRenderer} from "@/composables/useThreeRenderer";
import {useThreeCameras} from "@/composables/useThreeCameras";

let _controls: TransformControls | null;

export const useThreeTransformControls = () => {
    const { getScene } = useThreeScene();
    const { getRenderer } = useThreeRenderer();
    const { getVirtualCamera } = useThreeCameras();

    function addTransformControls(target: Object3D | Mesh) {
        const scene = getScene();
        if (!scene) return;
        if (_controls) {
            _controls.detach();
            scene.remove(_controls);
            _controls = null;
        }

        const camera = getVirtualCamera();
        _controls = new TransformControls(camera, getRenderer()!.domElement);

        _controls.attach(target);
        scene.add(_controls);
        bindKeyboardEvents(_controls);
        _controls.setSize(0.1);
    }

    function bindKeyboardEvents(controls: TransformControls) {
        window.addEventListener('keypress', ev => {
            if (ev.key !== 'c') return;

            controls.enabled = !controls.enabled;
            controls.visible = controls.enabled;
        });
        window.addEventListener('keydown', ev => {
            if (ev.key === 'r') controls.setMode('rotate');
        });
        window.addEventListener('keyup', ev => {
            if (ev.key === 't') controls.setMode('translate');
        });
    }

    return {
        addTransformControls,
    };
};
