import {BoxGeometry, Euler, MathUtils, Mesh, MeshBasicMaterial, Quaternion, Vector3} from 'three';
import type { LatLngTypes } from '@/utils/pointUtils';
import { latLngToVector3Relative, toLatLngAltitudeLiteral } from '@/utils/pointUtils';
import {useThreeRenderer} from "@/composables/useThreeRenderer";
import {useThreeScene} from "@/composables/useThreeScene";
import {useThreeCameras} from "@/composables/useThreeCameras";
import {useThreeRaycaster} from "@/composables/useThreeRaycaster";

let _overlay: google.maps.WebGLOverlayView;
let _anchor = { lat: 52, lng: 11, altitude: 0 };
const _rotationArray = new Float32Array(3);
const _rotationInverse: Quaternion = new Quaternion();

export function useWebGlOverlayView() {
    const { initRenderer, getRenderer, disposeRenderer } = useThreeRenderer();
    const { getScene, cleanUpScene, getObjectsInScene } = useThreeScene();
    const { getCamera, updateVCam } = useThreeCameras();
    const { highlightIntersectedObjects, addRayCastListener } = useThreeRaycaster();
    function initWebGLOverlay(map: google.maps.Map, anchor: LatLngTypes) {
        return new Promise<string>(async resolve => {
            if (_overlay) {
                setMap(map);
                setAnchor(anchor);
                resolve('initialized');
            } else {
                setAnchor(anchor);
                setUpAxis('Y');

                _overlay = new google.maps.WebGLOverlayView();
                _overlay.onAdd = onAdd_;
                _overlay.onContextLost = onContextLost_;
                _overlay.onContextRestored = onContextRestored_;
                _overlay.onDraw = onDraw_;
                _overlay.onRemove = onRemove_;

                addRayCastListener(map, requestRedraw);

                setMap(map);
                resolve('initialized');
            }
        });
    }

    function setMap(map: google.maps.Map | null) {
        return _overlay.setMap(map);
    }

    function getMap() {
        return _overlay!.getMap();
    }

    function requestRedraw() {
        _overlay.requestRedraw();
    }

    async function onContextRestored_({ gl }: any) {
        await initRenderer(gl);
    }

    function onContextLost_() {
        disposeRenderer();
    }

    function onDraw_({ gl, transformer }: google.maps.WebGLDrawOptions) {
        const renderer = getRenderer();
        const camera = getCamera();
        const scene = getScene();
        if (!renderer || !camera || !scene) return;

        camera.projectionMatrix.fromArray(transformer.fromLatLngAltitude(_anchor, _rotationArray));

        gl.disable(gl.SCISSOR_TEST);

        onBeforeDraw();

        updateVCam(scene, camera);

        renderer.render(scene, camera);
        renderer.resetState();

        requestRedraw();
    }

    function onRemove_() {
        cleanUpScene();
    }

    const onAdd_ = () => {
        //create a box mesh and place it on latLng 51, 11
        const box = new Mesh();
        box.geometry = new BoxGeometry(100, 100, 100);
        box.material = new MeshBasicMaterial({ color: 0xff0000 });
        box.position.copy(latLngAltitudeToVector3({ lat: 51, lng: 11, altitude: 0 }));

        const scene = getScene()!;
        scene.add(box);
    };

    const onBeforeDraw = (): void => {
        const map = getMap()!;
        const objects = getObjectsInScene();
        highlightIntersectedObjects(map, objects);
    };

    function setAnchor(anchor: LatLngTypes) {
        _anchor = toLatLngAltitudeLiteral(anchor);
    }

    function setUpAxis(axis: 'Y' | 'Z' | Vector3): void {
        const upVector = new Vector3(0, 0, 1);
        if (typeof axis !== 'string') upVector.copy(axis);
        else if (axis.toLowerCase() === 'y') upVector.set(0, 1, 0);

        upVector.normalize();

        const q = new Quaternion();
        q.setFromUnitVectors(upVector, new Vector3(0, 0, 1));

        _rotationInverse.copy(q).invert();

        const euler = new Euler().setFromQuaternion(q, 'XYZ');
        _rotationArray[0] = MathUtils.radToDeg(euler.x);
        _rotationArray[1] = MathUtils.radToDeg(euler.y);
        _rotationArray[2] = MathUtils.radToDeg(euler.z);
    }

    function latLngAltitudeToVector3(position: LatLngTypes, target = new Vector3()) {
        latLngToVector3Relative(toLatLngAltitudeLiteral(position), _anchor, target);
        target.applyQuaternion(_rotationInverse);

        return target;
    }

    return {
        initWebGLOverlay,
        requestRedraw,
        getMap,
        setMap,
    };
}
