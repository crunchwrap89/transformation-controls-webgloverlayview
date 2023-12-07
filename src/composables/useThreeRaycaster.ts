import { type Intersection, Matrix4, type Object3D, Raycaster, Vector2 } from 'three';

import type { RaycastOptions } from '~/types';
import {useThreeScene} from "@/composables/useThreeScene";
import {useThreeCameras} from "@/composables/useThreeCameras";

const _projectionMatrixInverse = new Matrix4();
const _raycaster: Raycaster = new Raycaster();
let _currentIntersections: any = [];
let _highlightedObject: any;
let _highlightedDefaultColor: any;
let _highlightedHoverColor: any;
const _mousePos = new Vector2();

export function useThreeRaycaster() {
    const { getScene } = useThreeScene();
    const { getCamera } = useThreeCameras();

    const highlightIntersectedObjects = (map: google.maps.Map, objects: Object3D[]): void => {
        _currentIntersections = raycast(_mousePos, objects, {
            recursive: true,
        });

        if (
            _highlightedObject &&
            _currentIntersections.length > 0 &&
            _currentIntersections[0].object !== _highlightedObject
        ) {
            _highlightedObject.material.color.setHex(_highlightedDefaultColor);
            _highlightedObject = null;
            _highlightedDefaultColor = null;
            _highlightedHoverColor = null;
        }

        if (_currentIntersections.length === 0) {
            map.setOptions({ draggableCursor: null });
            if (_highlightedObject) {
                _highlightedObject.material.color.setHex(_highlightedDefaultColor);
                _highlightedObject = null;
                _highlightedDefaultColor = null;
                _highlightedHoverColor = null;
            }
            return;
        }

        _highlightedObject = _currentIntersections[0].object;
        if (!_highlightedDefaultColor) {
            _highlightedDefaultColor = _highlightedObject.material.color.getHex();
            _highlightedHoverColor = _highlightedDefaultColor + 0x202020;
        }

        _highlightedObject.material.color.setHex(_highlightedHoverColor);
        map.setOptions({ draggableCursor: 'pointer' });
    };

    function raycast(p: Vector2, options?: RaycastOptions): Intersection[];

    function raycast(p: Vector2, objects: Object3D[], options?: RaycastOptions & { recursive: true }): Intersection[];

    function raycast<T extends Object3D>(
        p: Vector2,
        objects: T[],
        options?: Omit<RaycastOptions, 'recursive'> | (RaycastOptions & { recursive: false }),
    ): Intersection<T>[];

    function raycast(
        p: Vector2,
        optionsOrObjects?: Object3D[] | RaycastOptions,
        options: RaycastOptions = {},
    ): Intersection[] {
        const scene = getScene()!;
        const camera = getCamera()!;

        let objects: Object3D[];
        if (Array.isArray(optionsOrObjects)) {
            objects = optionsOrObjects || null;
        } else {
            objects = [scene];
            options = { ...optionsOrObjects, recursive: true };
        }

        const { updateMatrix = true, recursive = false, raycasterParameters } = options;

        if (updateMatrix) _projectionMatrixInverse.copy(camera.projectionMatrix).invert();

        _raycaster.ray.origin.set(p.x, p.y, 0).applyMatrix4(_projectionMatrixInverse);
        _raycaster.ray.direction
            .set(p.x, p.y, 0.5)
            .applyMatrix4(_projectionMatrixInverse)
            .sub(_raycaster.ray.origin)
            .normalize();

        const oldRaycasterParams = _raycaster.params;
        if (raycasterParameters) _raycaster.params = raycasterParameters;

        const results = _raycaster.intersectObjects(objects, recursive);

        _raycaster.params = oldRaycasterParams;

        return results;
    }

    function addRayCastListener(map: google.maps.Map, requestRedraw: () => void) {
        const mapDiv = map.getDiv();
        map.addListener('mousemove', (ev: google.maps.MapMouseEvent) => {
            const domEvent = ev.domEvent as MouseEvent;
            const { left, top, width, height } = mapDiv.getBoundingClientRect();

            const x = domEvent.clientX - left;
            const y = domEvent.clientY - top;

            _mousePos.x = 2 * (x / width) - 1;
            _mousePos.y = 1 - 2 * (y / height);

            requestRedraw();
        });
    }

    function getCurrentIntersections() {
        return _currentIntersections;
    }

    return {
        getCurrentIntersections,
        highlightIntersectedObjects,
        addRayCastListener,
    };
}
