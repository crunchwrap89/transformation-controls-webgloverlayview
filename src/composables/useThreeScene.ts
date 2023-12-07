import {AmbientLight, BoxGeometry, DirectionalLight, Mesh, MeshBasicMaterial, type Object3D, Scene} from 'three';
import { disposeObject } from '@/utils/disposeUtils';
import type { GLTFObject } from '@/types';
import {useThreeCameras} from "@/composables/useThreeCameras";

let _scene: Scene | null;

export function useThreeScene() {
    const { initCameras } = useThreeCameras();
    function initScene(allModels: Map<string, GLTFObject>) {
        return new Promise<string>(resolve => {
            _scene = new Scene();
            const { vCamera } = initCameras();

            const ambientLight = new AmbientLight(0xffffff, 4);
            ambientLight.position.set(0, 1, -0.2).normalize();

            const light1 = new DirectionalLight(0xffffff, 2);
            light1.position.set(0, 1, 0);

            const light2 = new DirectionalLight(0xffffff, 2);
            light2.position.set(0, -1, 0);

            const light3 = new DirectionalLight(0xffffff, 2);
            light3.position.set(1, 0, 0);

            const light4 = new DirectionalLight(0xffffff, 2);
            light4.position.set(-1, 0, 0);

            const light5 = new DirectionalLight(0xffffff, 2);
            light5.position.set(0, 0, 1);

            const light6 = new DirectionalLight(0xffffff, 2);
            light6.position.set(0, 0, -1);


            _scene.add(ambientLight, light1, light2, light3, light4, light5, light6, vCamera);

            if (allModels) {
                allModels.forEach(o => {
                    _scene!.add(o.Model);
                });
            }

            resolve('initSceneComplete');
        });
    }

    function getScene() {
        return _scene;
    }

    function getObjectsInScene() {
        const allObjects = [];
        const scene = getScene();
        for (let i = scene!.children.length - 1; i >= 0; i--) {
            const obj = scene!.children[i];
            if (obj.type === 'Mesh') allObjects.push(obj);
        }
        return allObjects;
    }

    function getModelByPlayerId(id: string): Object3D | undefined {
        const allObjects = [];
        const scene = getScene();
        for (let i = scene!.children.length - 1; i >= 0; i--) {
            const obj = scene!.children[i];
            if (obj.type === 'Group' && obj.userData.playerId === id) allObjects.push(obj);
        }
        return allObjects[0];
    }

    function removeObjectFromScene(uuid: string) {
        const scene = getScene();
        if (!scene) return;

        const obj = scene.getObjectByProperty('uuid', uuid);
        if (!obj) return;

        scene.remove(obj);
        disposeObject(obj);
    }

    function cleanUpScene() {
        const scene = getScene();
        if (!scene) return;

        for (let i = scene.children.length - 1; i >= 0; i--) {
            const obj = scene.children[i];
            if (obj.type === 'Group' || obj.type === 'Mesh') {
                disposeObject(obj);
                scene.remove(obj);
            }
        }
        disposeObject(scene);
        _scene = null;
    }

    return {
        initScene,
        getScene,
        cleanUpScene,
        getModelByPlayerId,
        getObjectsInScene,
        removeObjectFromScene,
    };
}
